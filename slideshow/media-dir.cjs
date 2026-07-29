// メディアフォルダ(publicDir)の解決処理。
// remotion.config.ts と scripts/render.mjs の両方から使うため .cjs で共有する。
// Windows / macOS 両対応。ユーザー名やドライブに依存しないよう os.homedir() を基準にする。
const {existsSync} = require('node:fs');
const {homedir} = require('node:os');
const {resolve} = require('node:path');

const FOLDER_NAME = '教授就任パーティー用動画';

// 優先順位順の候補
const candidatePaths = [
  // 環境変数での明示指定（上記以外の場所に置いた場合の逃げ道）
  process.env.KYOJU_MEDIA_DIR,
  // Win: C:\Users\<user>\Dropbox\..., macOS: /Users/<user>/Dropbox/... の両方を1行でカバー
  resolve(homedir(), 'Dropbox', FOLDER_NAME),
  // Dropbox を使わずリポジトリの4階層上に置いている場合
  resolve(__dirname, '../../../..', FOLDER_NAME),
  // 最終フォールバック
  resolve(__dirname, 'public'),
].filter(Boolean);

const mediaDir = candidatePaths.find((p) => existsSync(p)) || resolve(__dirname, 'public');

const outputDir = resolve(mediaDir, 'output');

module.exports = {FOLDER_NAME, candidatePaths, mediaDir, outputDir};
