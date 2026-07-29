// タイムライン表(scenes.xlsx / なければ scenes.csv)を読んで
// slideshow/src/scenes.ts を再生成する。
// 使い方: node scripts/csv_to_scenes.mjs
//   - 「順番」列の数値順にシーンを並べる(行の物理的な並びは無関係)
//   - 順番が空欄の行はスキップ(=そのシーンを外す)
//   - ファイルの存在チェックを行い、見つからない場合はエラーで中断
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as fs from 'node:fs';
import * as XLSX from 'xlsx';

XLSX.set_fs(fs); // ESM版はfsを明示的に渡さないと readFile/writeFile が使えない

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
import {assetsDir as assets} from './media_config.mjs';

// --- 最小限のCSVパーサ(引用符・改行・CRLF・BOM対応) ---
const parseCsv = (text) => {
  const rows = [];
  let row = [], field = '', inQ = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQ) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((f) => f !== '')) rows.push(row); }
  return rows;
};

// --- マスター表の読み込み(scenes.xlsx 優先、なければ scenes.csv) ---
const xlsxPath = join(root, 'scenes.xlsx');
const csvPath = join(root, 'scenes.csv');
const SHEET_NAME = 'timeline';

const readXlsx = () => {
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets[SHEET_NAME] ?? wb.Sheets[wb.SheetNames[0]];
  if (!ws) {
    console.error(`scenes.xlsx にシートがありません`);
    process.exit(1);
  }
  // 数式セルは計算結果(Excelが保存したキャッシュ値)が入る。全セルを文字列に揃える。
  return XLSX.utils
    .sheet_to_json(ws, {header: 1, blankrows: false, defval: ''})
    .map((r) => r.map((c) => String(c ?? '').trim()))
    .filter((r) => r.some((c) => c !== ''));
};

const useXlsx = existsSync(xlsxPath);
const rows = useXlsx ? readXlsx() : parseCsv(readFileSync(csvPath, 'utf8'));
const header = rows.shift();
const col = (name) => {
  const i = header.indexOf(name);
  if (i === -1) { console.error(`列「${name}」が見つかりません`); process.exit(1); }
  return i;
};
const cOrder = col('順番'), cKind = col('種別'), cFolder = col('フォルダ'),
      cFile = col('ファイル名'), cDur = col('秒数'), cSepia = col('セピア'),
      cCaption = col('キャプション');

const cell = (r, i) => String(r[i] ?? '').trim(); // 行が短い場合も安全に読む

const entries = rows
  .filter((r) => cell(r, cOrder) !== '' && cell(r, cFolder) !== '' && cell(r, cFile) !== '')
  .map((r) => ({order: Number(cell(r, cOrder)), r}))
  .sort((a, b) => a.order - b.order);

const errors = [];
const scenes = entries.map(({order, r}) => {
  const folder = cell(r, cFolder), file = cell(r, cFile);
  if (!existsSync(join(assets, folder, file))) {
    errors.push(`順番${order}: ファイルが見つかりません → assets/${folder}/${file}`);
  }
  const dur = Number(cell(r, cDur));
  if (!(dur > 0)) errors.push(`順番${order}: 秒数が不正です → "${cell(r, cDur)}"`);
  const s = {kind: cell(r, cKind) === 'slide' ? 'slide' : 'photo', src: `assets/${folder}/${file}`, dur};
  if (cell(r, cSepia)) s.sepia = true;
  if (cell(r, cCaption)) s.caption = cell(r, cCaption);
  return s;
});

if (errors.length) {
  console.error('エラーがあるため scenes.ts は更新しませんでした:');
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

const headerTs = `// 自動生成: scripts/csv_to_scenes.mjs (${new Date().toISOString().slice(0, 10)})
// 並び替え・差し替えは scenes.csv を編集して node scripts/csv_to_scenes.mjs を実行。
export type Scene = {
  kind: 'slide' | 'photo';
  src: string;
  dur: number; // 秒
  sepia?: boolean;
  caption?: string;
};

export const FPS = 30;
export const TRANSITION_SEC = 0.7;

export const scenes: Scene[] = `;

const footerTs = `;

export const TRANSITION_FRAMES = Math.round(TRANSITION_SEC * FPS);
export const sceneFrames = (s: Scene) => Math.round(s.dur * FPS);
export const totalDurationInFrames =
  scenes.reduce((sum, s) => sum + sceneFrames(s), 0) -
  TRANSITION_FRAMES * (scenes.length - 1);
`;

writeFileSync(
  join(root, 'slideshow', 'src', 'scenes.ts'),
  headerTs + JSON.stringify(scenes, null, 2) + footerTs
);

// --- 総尺と「たしかなこと」の入りをチェック ---
// 曲Bは自然な終わりがムービーの終わりに揃うよう途中から再生するので、
// 総尺が変わると曲Bの入り位置がそのぶんズレる(総尺 = 曲B開始 + 残りの曲尺)。
// 「曲の1:39.0から入る」を目標にする。
const FPS = 30; // scenes.ts の FPS と同じ値
const TRANSITION_SEC = 0.7; // クロスフェード(scenes.ts と同じ値)
const BSTART_SEC = 125; // Bgm.tsx: CROSSFADE_AT_SEC(128) - CROSSFADE_SEC(3)
// 曲Bはファイル実尺301.56秒のうち末尾3.52秒が無音。音楽が鳴り終わる298.05秒を
// ムービーの終わりに合わせているので、こちらを基準に計算する(Bgm.tsx と同じ値)。
const SONG_B_MUSIC_END_SEC = 298.05;
const TARGET_ENTRY_SEC = 99.0; // たしかなこと の入り(目標 1:39.0)
const TARGET_TOTAL_SEC = BSTART_SEC + (SONG_B_MUSIC_END_SEC - TARGET_ENTRY_SEC); // = 324.05

const frames = scenes.reduce((a, s) => a + Math.round(s.dur * FPS), 0) -
  Math.round(TRANSITION_SEC * FPS) * (scenes.length - 1);
const total = frames / FPS;
const entry = SONG_B_MUSIC_END_SEC - (total - BSTART_SEC);
const mmss = (t) => {
  const d = Math.round(t * 10);
  return `${Math.floor(d / 600)}:${String(Math.floor(d / 10) % 60).padStart(2, '0')}.${d % 10}`;
};

console.log(
  `[${useXlsx ? 'scenes.xlsx' : 'scenes.csv'}] → ` +
    `scenes.ts 更新完了: ${scenes.length}シーン ` +
    `(photo ${scenes.filter((s) => s.kind === 'photo').length} / slide ${scenes.filter((s) => s.kind === 'slide').length}), ` +
    `総尺 ${mmss(total)} (${total.toFixed(2)}s / ${frames}フレーム)`
);
console.log(`たしかなことの入り: 曲の ${mmss(entry)}  (目標 ${mmss(TARGET_ENTRY_SEC)})`);

const diff = total - TARGET_TOTAL_SEC;
if (Math.abs(diff) < 0.05) {
  console.log(`✅ 目標総尺 ${mmss(TARGET_TOTAL_SEC)} ぴったりです`);
} else if (diff > 0) {
  console.log(`⚠️  目標より ${diff.toFixed(2)}秒 長い → 秒数を詰めるか写真を減らす`);
} else {
  const room = -diff;
  console.log(`📷 あと ${room.toFixed(2)}秒ぶん空いています → 写真を追加できます`);
  for (const d of [3.7, 4.6, 5.3]) {
    console.log(`     1枚 ${d}秒(間隔${(d - TRANSITION_SEC).toFixed(2)}s)なら ${(room / (d - TRANSITION_SEC)).toFixed(1)}枚ぶん`);
  }
}
