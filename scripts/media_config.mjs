// メディアフォルダの場所は slideshow/media-dir.cjs で一元管理している
// (remotion.config.ts / scripts/render.mjs と共通。Windows / macOS 両対応)。
import {createRequire} from 'node:module';
import {join} from 'node:path';

const {mediaDir} = createRequire(import.meta.url)('../slideshow/media-dir.cjs');

export const publicDir = mediaDir;
export const assetsDir = join(publicDir, 'assets');
export const audioDir = join(publicDir, 'audio');
