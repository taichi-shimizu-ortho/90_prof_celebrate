import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

// メディアファイルの格納場所候補（優先順位順）
// Dropbox側の「教授就任パーティー用動画」をメディアフォルダ(publicDir)として利用
const candidatePaths = [
  'C:/Users/a2189/Dropbox/教授就任パーティー用動画',
  resolve(__dirname, '../../../../教授就任パーティー用動画'),
  resolve(__dirname, 'public'),
];
const publicDir = candidatePaths.find((p) => existsSync(p)) || resolve(__dirname, 'public');
Config.setPublicDir(publicDir);


Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
// zoomrec.py (NVENC vbr cq30) 相当の品質指定エンコード。
// スライドショーは静止画主体であり、CRF 23 は標準的な高品質でおよそ100MB前後になる
Config.setCrf(23);
// RTX 3060 等のGPU (NVENC) ハードウェアアクセラレーションを有効化して高速エンコード
Config.setHardwareAcceleration('if-possible');
// Chrome側の描画エンジンでもGPU (ANGLE/OpenGL) を強制有効化してレンダリングを高速化
Config.setChromiumOpenGlRenderer('angle');
// Studioのタイムライン表示上限(既定90)。シーン64本+トランジション63本+音声で
// 130本以上になり後半が省略されるため引き上げる。表示だけの設定で書き出しには影響しない。
Config.setMaxTimelineTracks(200);
// 誤操作でプレビュー上の要素をドラッグすると Movie.tsx に style が書き戻される。
// これを防ぐには Studio ツールバーの「Hide outlines」をオフにする(設定は保存される)。
// Config.setInteractivityEnabled(false) でも防げるが、タイムラインのクリック移動も
// 無効になってしまうので使わない。
