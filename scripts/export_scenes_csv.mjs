// 現在の scenes.ts と全素材を CSV に書き出す。
//   scenes.csv          … ムービーのタイムライン(この順番で再生される)
//   photo_inventory.csv … 全素材写真の一覧(使用中の写真には使用順が入る)
// Excel/Numbersで編集しやすいよう UTF-8 BOM 付きで出力する。
import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import sizeOf from 'image-size';
import exifr from 'exifr';
import * as fs from 'node:fs';
import * as XLSX from 'xlsx';

XLSX.set_fs(fs); // ESM版はfsを明示的に渡さないと readFile/writeFile が使えない

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
import {assetsDir as assets} from './media_config.mjs';

// --- scenes.ts からシーン配列を取り出す(JSON部分を抽出) ---
const ts = readFileSync(join(root, 'slideshow', 'src', 'scenes.ts'), 'utf8');
const m = ts.match(/export const scenes: Scene\[\] = (\[[\s\S]*?\]);/);
if (!m) {
  console.error('scenes.ts からシーン配列を抽出できませんでした');
  process.exit(1);
}
const scenes = JSON.parse(m[1]);

// --- 全素材のメタデータ(EXIF撮影日時・縦横px)を sips でまとめて取得 ---
const folders = readdirSync(assets, {withFileTypes: true})
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const allFiles = []; // {folder, file, path}
for (const folder of folders) {
  for (const file of readdirSync(join(assets, folder)).sort()) {
    if (file.toLowerCase().endsWith('.jpg')) {
      allFiles.push({folder, file, path: join(assets, folder, file)});
    }
  }
}

const meta = new Map(); // path -> {creation, w, h}
await Promise.all(
  allFiles.map(async (f) => {
    let w = '', h = '', creation = '';
    try {
      const dim = sizeOf(readFileSync(f.path));
      if (dim) {
        w = String(dim.width ?? '');
        h = String(dim.height ?? '');
      }
    } catch {
      // ignore
    }
    try {
      const exif = await exifr.parse(f.path, {pick: ['CreateDate', 'DateTimeOriginal'], reviveValues: false});
      const dt = exif?.DateTimeOriginal ?? exif?.CreateDate;
      if (dt && dt !== '<nil>') creation = String(dt);
    } catch {
      // ignore
    }
    meta.set(f.path, {creation, w, h});
  })
);

// 数式セルは {f: 数式, v: 計算済みの値} で表す。CSV(バックアップ)には値だけを書く。
const csvEscape = (v) => {
  const s = String((v !== null && typeof v === 'object' ? v.v : v) ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const writeCsv = (file, rows) =>
  writeFileSync(file, '﻿' + rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n');

// --- scenes.csv ---
// 「開始秒」「開始フレーム」はExcelの数式として出力する。秒数を打ち替えた瞬間に
// Excel側で再計算されるので、保存すれば常に正しい値が入る(csv_to_scenes は読まない)。
// クロスフェード0.7秒ぶん重なるので、各シーンの開始は (秒数 - 0.7) ずつ進む。
// 数式内にカンマを使うと引用符の扱いが面倒なので、四捨五入は INT(x+0.5) で書く。
const TRANSITION_SEC = 0.7;
const FPS = 30;
const CROSSFADE_AT_SEC = 128; // Bgm.tsx と合わせる

const sceneRows = [
  ['順番', '種別', 'フォルダ', 'ファイル名', '秒数', 'セピア', 'キャプション', '撮影日時', '開始秒', '開始フレーム', '曲'],
];
const usedOrder = new Map(); // "folder/file" -> 順番
let at = 0;
scenes.forEach((s, i) => {
  const [, folder, file] = s.src.match(/^assets\/([^/]+)\/(.+)$/);
  const info = meta.get(join(assets, folder, file)) ?? {creation: ''};
  usedOrder.set(`${folder}/${file}`, i + 1);
  const row = i + 2; // ヘッダーが1行目
  sceneRows.push([
    i + 1,
    s.kind,
    folder,
    file,
    s.dur,
    s.sepia ? 1 : '',
    s.caption ?? '',
    info.creation,
    i === 0 ? 0 : {f: `I${row - 1}+E${row - 1}-${TRANSITION_SEC}`, v: Math.round(at * 100) / 100},
    {f: `INT(I${row}*${FPS}+0.5)`, v: Math.round(at * FPS)},
    at < CROSSFADE_AT_SEC - 3 ? 'secret base' : at < CROSSFADE_AT_SEC ? '切替中' : 'たしかなこと',
  ]);
  at += s.dur - TRANSITION_SEC;
});
writeCsv(join(root, 'scenes.csv'), sceneRows);

// --- photo_inventory.csv (slides以外の全写真) ---
const invRows = [['使用順', 'フォルダ', 'ファイル名', '撮影日時', '横px', '縦px', '向き']];
for (const f of allFiles) {
  if (f.folder === 'slides') continue;
  const info = meta.get(f.path) ?? {creation: '', w: '', h: ''};
  invRows.push([
    usedOrder.get(`${f.folder}/${f.file}`) ?? '',
    f.folder,
    f.file,
    info.creation,
    info.w,
    info.h,
    Number(info.w) >= Number(info.h) ? '横' : '縦',
  ]);
}
writeCsv(join(root, 'photo_inventory.csv'), invRows);

// --- scenes.xlsx (マスター) ---
// timelineシート: 編集用。開始秒・開始フレームは数式なのでExcel上で即再計算される。
// photosシート : 素材一覧(参照用)。VLOOKUPで撮影日時などを引ける。
// CSV2種は同内容のバックアップとして併せて残す。
const isFormula = (v) => v !== null && typeof v === 'object';
const toSheet = (rows) => {
  // aoa_to_sheet はオブジェクトのセルを受け付けないので、いったん値だけ置いて
  // あとから数式付きセルに差し替える(計算済みの値も持たせるので開いた直後から読める)。
  const ws = XLSX.utils.aoa_to_sheet(rows.map((r) => r.map((v) => (isFormula(v) ? v.v : v))));
  rows.forEach((r, ri) =>
    r.forEach((v, ci) => {
      if (isFormula(v)) {
        ws[XLSX.utils.encode_cell({r: ri, c: ci})] = {t: 'n', v: v.v, f: v.f};
      }
    })
  );
  ws['!cols'] = rows[0].map((h) => ({wch: h === 'ファイル名' ? 46 : String(h).length <= 3 ? 8 : 12}));
  return ws;
};
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, toSheet(sceneRows), 'timeline');
XLSX.utils.book_append_sheet(wb, toSheet(invRows), 'photos');
XLSX.writeFile(wb, join(root, 'scenes.xlsx'));

console.log(`scenes.xlsx: timeline ${sceneRows.length - 1}行 / photos ${invRows.length - 1}行 (マスター)`);
console.log(`scenes.csv, photo_inventory.csv: 同内容のバックアップ`);
