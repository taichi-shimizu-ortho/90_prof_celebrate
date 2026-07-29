// scenes.ts 自動生成: 各カテゴリから指定枚数を均等サンプリングして
// ムービー全体の構成データを書き出す。再実行すると上書きされるので
// 手動調整後は実行しないこと(調整は scenes.ts を直接編集)。
import {readdirSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'slideshow');
import {assetsDir as assets} from './media_config.mjs';

const listJpg = (cat) =>
  readdirSync(join(assets, cat))
    .filter((f) => f.toLowerCase().endsWith('.jpg'))
    .sort();

// n枚を均等間隔で抽出
const pick = (cat, n) => {
  const files = listJpg(cat);
  if (files.length <= n) return files.map((f) => `assets/${cat}/${f}`);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(files[Math.floor((i * files.length) / n)]);
  }
  return out.map((f) => `assets/${cat}/${f}`);
};

const slide = (name, dur) => ({kind: 'slide', src: `assets/slides/${name}.jpg`, dur});
const photos = (cat, n, opts = {}) =>
  pick(cat, n).map((src) => ({kind: 'photo', src, dur: 5.2, ...opts}));

// エンディング用: 集合写真から SMILE 付きを優先して1枚
const groupFiles = listJpg('group');
const endingFile =
  groupFiles.find((f) => f.includes('SMILE')) ?? groupFiles[groupFiles.length - 1];

const scenes = [
  // 0. オープニング
  slide('01-title', 6),
  ...photos('bridge', 3),
  ...photos('exterior', 1),
  // 1. 沿革(セピア調)
  slide('02-enkaku', 8),
  ...photos('history', 7, {sepia: true}),
  // 2. チーム誕生
  slide('03-kaiin-toji', 8),
  slide('04-kono-hi-kara', 5),
  // 3. 我々の学び舎
  slide('05-manabiya-title', 4),
  ...photos('ikyoku', 3),
  ...photos('conference', 3),
  ...photos('or', 5),
  ...photos('gairai', 2),
  ...photos('rehab', 2),
  ...photos('byoto', 1),
  ...photos('running', 2),
  // 4. 世界とつながる
  slide('07-isakos', 6),
  ...photos('fellows-intl', 8),
  ...photos('fellows-jp', 3),
  ...photos('ryugaku', 1),
  // 5. 酒井院長
  slide('12-sakai', 6),
  ...photos('sakai', 2),
  // 6. レガシー
  slide('06-manabiya-message', 6),
  slide('08-nihon-sekai', 5),
  ...photos('group', 10).filter((p) => !p.src.endsWith(endingFile)),
  slide('09-legacy', 6),
  {kind: 'photo', src: `assets/group/${endingFile}`, dur: 6},
  // 7. エンディング
  slide('10-mirai', 6),
];

const header = `// 自動生成: scripts/generate_scenes.mjs (${new Date().toISOString().slice(0, 10)})
// 写真の差し替え・尺調整はこのファイルを直接編集する。
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

const footer = `;

export const TRANSITION_FRAMES = Math.round(TRANSITION_SEC * FPS);
export const sceneFrames = (s: Scene) => Math.round(s.dur * FPS);
export const totalDurationInFrames =
  scenes.reduce((sum, s) => sum + sceneFrames(s), 0) -
  TRANSITION_FRAMES * (scenes.length - 1);
`;

writeFileSync(
  join(root, 'src', 'scenes.ts'),
  header + JSON.stringify(scenes, null, 2) + footer
);

const total =
  scenes.reduce((a, s) => a + s.dur, 0) - 0.7 * (scenes.length - 1);
console.log(
  `scenes: ${scenes.length} (photos: ${scenes.filter((s) => s.kind === 'photo').length}, ` +
    `slides: ${scenes.filter((s) => s.kind === 'slide').length}), ` +
    `total ≈ ${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, '0')}`
);
