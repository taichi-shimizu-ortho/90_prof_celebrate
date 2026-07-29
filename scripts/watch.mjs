// マスター表(scenes.xlsx / なければ scenes.csv)を監視して、
// 保存された瞬間に scenes.ts へ反映する。
//   使い方: node scripts/watch.mjs  (または「監視.command」をダブルクリック)
//   止めるには Ctrl+C
//
// このスクリプトはマスター表を一切書き換えないので、Excelは開いたままでよい。
// (開始秒・開始フレーム列はExcel側の数式で自動再計算されるため書き戻し不要)
//
// Excelの保存は「一時ファイルを作って差し替える」動作をするため、fs.watch では
// 監視対象を見失うことがある。確実に拾うため mtime のポーリングで検知する。
import {existsSync, statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join, dirname, basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const xlsx = join(root, 'scenes.xlsx');
const master = existsSync(xlsx) ? xlsx : join(root, 'scenes.csv');
const INTERVAL_MS = 700;

const mtime = () => {
  try {
    return statSync(master).mtimeMs;
  } catch {
    return null; // 差し替えの瞬間は存在しないことがある
  }
};

const run = () => {
  const t = new Date().toLocaleTimeString('ja-JP');
  console.log(`\n──── ${t} ${basename(master)} の変更を検知 ────`);
  const r = spawnSync('node', [join(root, 'scripts', 'csv_to_scenes.mjs')], {stdio: 'inherit'});
  if (r.status !== 0) {
    console.log('※ エラーのため scenes.ts は更新していません。CSVを直して保存し直してください。');
  }
};

let last = mtime();
console.log(`${basename(master)} を監視中です。Excelで保存するたびに自動でムービーへ反映します。`);
console.log('（このウインドウは開いたままにしてください。止めるには Ctrl+C）');
run();

setInterval(() => {
  const m = mtime();
  if (m !== null && m !== last) {
    last = m;
    // 書き込み途中を読まないよう少し待つ
    setTimeout(run, 250);
  }
}, INTERVAL_MS);
