import {existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// メディアファイルの格納場所候補（優先順位順）
// 1. Dropboxのメディア専用フォルダ（Windows環境）
// 2. プロジェクトの相対位置にあるDropboxフォルダ（Mac等・他環境対応）
// 3. 従来のローカル slideshow/public （フォールバック）
const candidatePaths = [
  'C:/Users/a2189/Dropbox/教授就任パーティー用動画',
  join(projectRoot, '../../../教授就任パーティー用動画'),
  join(projectRoot, 'slideshow', 'public'),
];

export const publicDir = candidatePaths.find((p) => existsSync(p)) || join(projectRoot, 'slideshow', 'public');
export const assetsDir = join(publicDir, 'assets');
export const audioDir = join(publicDir, 'audio');
