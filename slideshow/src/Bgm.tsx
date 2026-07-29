import React from 'react';
import {Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';

// BGM: secret base(前半)→ たしかなこと(後半)をクロスフェード。
// 「たしかなこと」は曲の自然な終わりがムービーの終わりと一致するよう
// 曲の途中から再生する(オフセットは総尺から自動計算)。
const SONG_A = 'audio/secret-base.m4a';
const SONG_B = 'audio/tashikanakoto.m4a';
// たしかなこと はファイル実尺 301.56秒だが、末尾3.52秒は無音(音楽は298.05秒で終わる)。
// ファイル終端ではなく「音楽が鳴り終わる位置」をムービーの終わりに合わせる。
// (ffmpeg silencedetect=noise=-50dB で実測: silence_start 298.05 → 301.56)
const SONG_B_MUSIC_END_SEC = 298.05;

export const CROSSFADE_AT_SEC = 128; // このムービー時刻で曲Aが消える
export const CROSSFADE_SEC = 3;
const FADE_IN_SEC = 1.5;

export const Bgm: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const aEnd = Math.round(CROSSFADE_AT_SEC * fps);
  const bStart = aEnd - Math.round(CROSSFADE_SEC * fps);
  const bFrames = durationInFrames - bStart;
  const bOffset = Math.max(0, Math.round(SONG_B_MUSIC_END_SEC * fps) - bFrames);

  return (
    <>
      <Sequence from={0} durationInFrames={aEnd}>
        <Audio
          src={staticFile(SONG_A)}
          volume={(f) =>
            interpolate(
              f,
              [0, FADE_IN_SEC * fps, aEnd - CROSSFADE_SEC * fps, aEnd],
              [0, 1, 1, 0],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
            )
          }
        />
      </Sequence>
      <Sequence from={bStart}>
        <Audio
          src={staticFile(SONG_B)}
          startFrom={bOffset}
          volume={(f) =>
            interpolate(f, [0, CROSSFADE_SEC * fps], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      </Sequence>
    </>
  );
};
