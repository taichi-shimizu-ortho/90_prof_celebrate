// scenes.csv / scenes.xlsx の変更を反映し、計算列などを書き戻すクロスプラットフォーム対応スクリプト。
// Mac / Windows の両方で動作します。
// 使い方: node scripts/update.mjs
import { existsSync, openSync, closeSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// 1. マスター表(scenes.xlsx/scenes.csv) → scenes.ts へ反映
const res = spawnSync('node', [join(root, 'scripts', 'csv_to_scenes.mjs')], { stdio: 'inherit' });
if (res.status !== 0) {
  process.exit(res.status ?? 1);
}

// 2. マスター表がExcelやNumbers等で開かれているかチェック (上書き事故・ロックエラー防止)
const xlsxPath = join(root, 'scenes.xlsx');
const lockPath = join(root, '~$scenes.xlsx'); // Excelが作成するロックファイル

let isOpen = false;
if (existsSync(lockPath)) {
  isOpen = true;
} else if (existsSync(xlsxPath)) {
  try {
    const fd = openSync(xlsxPath, 'r+');
    closeSync(fd);
  } catch (err) {
    if (err.code === 'EBUSY' || err.code === 'EPERM') {
      isOpen = true;
    }
  }
}

if (isOpen) {
  console.log("\n⚠️  マスター表がExcel/Numbers等で開かれているため、書き戻しをスキップしました。");
  console.log("   （scenes.ts への反映は完了しています）");
  console.log("   行を追加して数式を貼り直したい場合は、Excelを閉じてもう一度実行してください。");
} else {
  const resExport = spawnSync('node', [join(root, 'scripts', 'export_scenes_csv.mjs')], { stdio: 'inherit' });
  if (resExport.status !== 0) {
    process.exit(resExport.status ?? 1);
  }
}
