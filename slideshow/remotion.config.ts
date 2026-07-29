import {Config} from '@remotion/cli/config';

// Dropbox側の「教授就任パーティー用動画」をメディアフォルダ(publicDir)として利用。
// 解決ロジックは render スクリプトと共有する（media-dir.cjs 参照）。
const {mediaDir} = require('./media-dir.cjs') as typeof import('./media-dir.cjs');
Config.setPublicDir(mediaDir);


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
// 注: 任意のChromiumフラグを渡すAPI (Config.setChromiumFlags) はRemotionに存在しない。
// GPUラスタライズ等のフラグは setChromiumOpenGlRenderer の指定に応じてRemotion内部で付与される。
// Studioのタイムライン表示上限(既定90)。シーン64本+トランジション63本+音声で
// 130本以上になり後半が省略されるため引き上げる。表示だけの設定で書き出しには影響しない。
Config.setMaxTimelineTracks(200);
// 誤操作でプレビュー上の要素をドラッグすると Movie.tsx に style が書き戻される。
// これを防ぐには Studio ツールバーの「Hide outlines」をオフにする(設定は保存される)。
// Config.setInteractivityEnabled(false) でも防げるが、タイムラインのクリック移動も
// 無効になってしまうので使わない。
