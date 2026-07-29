import React from 'react';
import {Audio, interpolate, staticFile, useVideoConfig} from 'remotion';
import {BGM_MUSIC_END_SEC} from './scenes';

// BGM: 合成音声の1曲のみ(教授就任パーティ_BGM_改訂版)。
// ムービーの総尺を曲のファイル尺に固定しているので(scenes.ts の BGM_DURATION_SEC)、
// 曲の切り替えや再生オフセットは不要で、頭から最後までそのまま流す。
const SONG = 'audio/party-bgm.m4a';
const FADE_IN_SEC = 1.5;

export const Bgm: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();

  return (
    <Audio
      src={staticFile(SONG)}
      volume={(f) =>
        interpolate(
          f,
          [0, FADE_IN_SEC * fps, Math.round(BGM_MUSIC_END_SEC * fps), durationInFrames],
          [0, 1, 1, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        )
      }
    />
  );
};
