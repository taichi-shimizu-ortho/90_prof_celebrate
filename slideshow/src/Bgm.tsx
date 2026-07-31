import React from 'react';
import {Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {SONG1_END_SEC, SONG2_START_OFFSET_SEC, SONG2_DURATION_SEC, BGM_DURATION_SEC} from './scenes';

const SONG1 = 'audio/bokura-mata.m4a';
const SONG2 = 'audio/tashikanakoto.m4a';
const FADE_IN_SEC = 1.5;
const FADE_OUT_SEC = 3.0; // 2曲目のフェードアウト用

export const Bgm: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();

  const song1Frames = Math.round(SONG1_END_SEC * fps);
  // Song 2 will play until the end of the video
  const song2Frames = durationInFrames - song1Frames;

  return (
    <>
      <Sequence from={0} durationInFrames={song1Frames}>
        <Audio
          src={staticFile(SONG1)}
          startFrom={0}
          endAt={song1Frames}
          volume={(f) =>
            interpolate(
              f,
              [0, FADE_IN_SEC * fps, song1Frames - FADE_OUT_SEC * fps, song1Frames],
              [0, 1, 1, 0],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
            )
          }
        />
      </Sequence>
      <Sequence from={song1Frames} durationInFrames={song2Frames}>
        <Audio
          src={staticFile(SONG2)}
          startFrom={Math.round(SONG2_START_OFFSET_SEC * fps)}
          endAt={Math.round((SONG2_START_OFFSET_SEC + SONG2_DURATION_SEC) * fps)}
          volume={(f) =>
            interpolate(
              f,
              [0, FADE_IN_SEC * fps, song2Frames - FADE_OUT_SEC * fps, song2Frames],
              [0, 1, 1, 0],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
            )
          }
        />
      </Sequence>
    </>
  );
};
