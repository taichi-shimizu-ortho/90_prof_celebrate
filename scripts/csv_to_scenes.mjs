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

// 結合済みの新しい音源を使用 (4分45秒 = 285秒)
const BGM_DURATION_SEC = 285.0;
const BGM_MUSIC_END_SEC = 285.0 - 3.0;

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
// 「切り替え」列は後から足したので、無い表でも動くよう任意扱いにする
const cTransition = header.indexOf('切り替え');

// 「切り替え」列に書ける値。空欄はフェード(既定)。
// シェーダーを使う効果(dissolve/film-burn/ripple など)は HTML-in-Canvas API が必要で
// 実行時に落ちるため、あえて選べないようにしている。
const TRANSITIONS = {
  'スライド左': 'slide-left',
  'スライド右': 'slide-right',
  'スライド上': 'slide-up',
  'スライド下': 'slide-down',
  'ワイプ左': 'wipe-left',
  'ワイプ右': 'wipe-right',
  'ワイプ上': 'wipe-up',
  'ワイプ下': 'wipe-down',
  'めくり': 'flip',
  '時計': 'clock',
  'アイリス': 'iris',
  'なし': 'none',
  'フェード': '', // 既定と同じ。明示したい場合用
};

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
  const tr = cTransition === -1 ? '' : cell(r, cTransition);
  if (tr) {
    if (!(tr in TRANSITIONS)) {
      errors.push(
        `順番${order}: 切り替え「${tr}」は使えません → ${Object.keys(TRANSITIONS).join(' / ')} のどれか(空欄はフェード)`
      );
    } else if (TRANSITIONS[tr]) {
      s.transition = TRANSITIONS[tr];
    }
  }
  return s;
});

if (errors.length) {
  console.error('エラーがあるため scenes.ts は更新しませんでした:');
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

const headerTs = `// 自動生成: scripts/csv_to_scenes.mjs (${new Date().toISOString().slice(0, 10)})
// 並び替え・差し替えは scenes.csv を編集して node scripts/csv_to_scenes.mjs を実行。
// 切り替えの種類。シェーダー系(dissolve/film-burn/ripple 等)は HTML-in-Canvas API が
// 必要で実行時に落ちるため、ここには含めていない。
export type TransitionName =
  | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
  | 'wipe-left' | 'wipe-right' | 'wipe-up' | 'wipe-down'
  | 'flip' | 'clock' | 'iris' | 'none';

export type Scene = {
  kind: 'slide' | 'photo';
  src: string;
  dur: number; // 秒
  sepia?: boolean;
  caption?: string;
  transition?: TransitionName; // このシーンに入るときの切り替え(未指定はフェード)
};

export const FPS = 30;
export const TRANSITION_SEC = 0.7;

export const scenes: Scene[] = `;

const footerTs = `;

export const TRANSITION_FRAMES = Math.round(TRANSITION_SEC * FPS);
export const sceneFrames = (s: Scene) => Math.round(s.dur * FPS);

// 新しい音源（4分45秒 = 285秒）
export const BGM_DURATION_SEC = ${BGM_DURATION_SEC};
export const BGM_MUSIC_END_SEC = ${BGM_MUSIC_END_SEC};

// ムービーの総尺は曲の長さに固定する。写真を足し引きしても尺は変わらない。
export const totalDurationInFrames = Math.round(BGM_DURATION_SEC * FPS);

// 写真を並べた実際の長さ。totalDurationInFrames とズレていると
// 末尾が黒くなる(短い)か切れる(長い)ので、update 実行時に警告する。
export const scenesDurationInFrames =
  scenes.reduce((sum, s) => sum + sceneFrames(s), 0) -
  TRANSITION_FRAMES * (scenes.length - 1);
`;

writeFileSync(
  join(root, 'slideshow', 'src', 'scenes.ts'),
  headerTs + JSON.stringify(scenes, null, 2) + footerTs
);

// --- 写真の合計尺が曲の長さに合っているかチェック ---
// ムービーの総尺は曲(audio/party-bgm.m4a)の長さに固定してあるので、
// 写真の合計がこれとズレると末尾が黒くなる(短い)か切れる(長い)。
const FPS = 30; // scenes.ts の FPS と同じ値
const TRANSITION_SEC = 0.7; // クロスフェード(scenes.ts と同じ値)
const TARGET_TOTAL_SEC = BGM_DURATION_SEC;

const frames = scenes.reduce((a, s) => a + Math.round(s.dur * FPS), 0) -
  Math.round(TRANSITION_SEC * FPS) * (scenes.length - 1);
const total = frames / FPS;
const mmss = (t) => {
  const d = Math.round(t * 10);
  return `${Math.floor(d / 600)}:${String(Math.floor(d / 10) % 60).padStart(2, '0')}.${d % 10}`;
};

console.log(
  `[${useXlsx ? 'scenes.xlsx' : 'scenes.csv'}] → ` +
    `scenes.ts 更新完了: ${scenes.length}シーン ` +
    `(photo ${scenes.filter((s) => s.kind === 'photo').length} / slide ${scenes.filter((s) => s.kind === 'slide').length}), ` +
    `写真の合計 ${mmss(total)} (${total.toFixed(2)}s / ${frames}フレーム)`
);
console.log(`ムービー総尺は曲の長さ ${mmss(TARGET_TOTAL_SEC)} に固定`);

const diff = total - TARGET_TOTAL_SEC;
if (Math.abs(diff) < 0.05) {
  console.log(`✅ 曲の長さ ${mmss(TARGET_TOTAL_SEC)} ぴったりです`);
} else if (diff > 0) {
  console.log(`⚠️  曲より ${diff.toFixed(2)}秒 長い → 末尾が切れます。秒数を詰めるか写真を減らす`);
} else {
  const room = -diff;
  console.log(`📷 あと ${room.toFixed(2)}秒ぶん空いています → 写真を追加できます`);
  for (const d of [3.7, 4.6, 5.3]) {
    console.log(`     1枚 ${d}秒(間隔${(d - TRANSITION_SEC).toFixed(2)}s)なら ${(room / (d - TRANSITION_SEC)).toFixed(1)}枚ぶん`);
  }
}
