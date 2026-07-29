// 書き出し用ラッパー。出力先を OS 非依存で解決し、
// LINE 用の再エンコードでは環境に応じた H.264 エンコーダを選ぶ。
//   node scripts/render.mjs movie   -> wakamatsu_movie.mp4
//   node scripts/render.mjs hq      -> wakamatsu_movie_CRF23.mp4
//   node scripts/render.mjs line    -> wakamatsu_movie_LINE.mp4 (hq の出力を1280幅に縮小)
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {platform} from 'node:os';
import {join} from 'node:path';

const {outputDir} = createRequire(import.meta.url)('../media-dir.cjs');

const target = process.argv[2];
const out = (name) => join(outputDir, name);

// Windows では npm/npx がバッチファイルなので shell 経由で起動する必要がある
const isWindows = platform() === 'win32';
const run = (cmd, args) => {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const {status, error} = spawnSync(cmd, args, {stdio: 'inherit', shell: isWindows});
  if (error) {
    console.error(`${cmd} を起動できませんでした: ${error.message}`);
    process.exit(1);
  }
  if (status !== 0) {
    process.exit(status ?? 1);
  }
};

// LINE 用縮小エンコードのエンコーダ。品質指定は各エンコーダの流儀に合わせる。
const lineEncoderArgs = () => {
  switch (platform()) {
    // RTX 3060 等の NVENC (Windows)
    case 'win32':
      return ['-c:v', 'h264_nvenc', '-rc', 'vbr', '-cq', '30', '-b:v', '0'];
    // Apple Silicon / Intel Mac のハードウェアエンコーダ
    case 'darwin':
      return ['-c:v', 'h264_videotoolbox', '-q:v', '55'];
    default:
      return ['-c:v', 'libx264', '-crf', '30', '-preset', 'medium'];
  }
};

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, {recursive: true});
}

switch (target) {
  case 'movie':
    // 画質設定 (CRF 23) とハードウェアアクセラレーションは remotion.config.ts 側で指定済み
    run('npx', ['remotion', 'render', 'Movie', out('wakamatsu_movie.mp4'), '--codec', 'h264']);
    break;
  case 'hq':
    run('npx', [
      'remotion',
      'render',
      'Movie',
      out('wakamatsu_movie_CRF23.mp4'),
      '--codec',
      'h264',
      '--crf',
      '23',
    ]);
    break;
  case 'line': {
    const source = out('wakamatsu_movie_CRF23.mp4');
    if (!existsSync(source)) {
      console.error(`${source} がありません。先に npm run render:hq を実行してください。`);
      process.exit(1);
    }
    run('ffmpeg', [
      '-y',
      '-i',
      source,
      '-vf',
      'scale=1280:-2',
      ...lineEncoderArgs(),
      '-c:a',
      'copy',
      out('wakamatsu_movie_LINE.mp4'),
    ]);
    break;
  }
  default:
    console.error(`不明な書き出し対象: ${target ?? '(なし)'} — movie / hq / line のいずれかを指定してください`);
    process.exit(1);
}
