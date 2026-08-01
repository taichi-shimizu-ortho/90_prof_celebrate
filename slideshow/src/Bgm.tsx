import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';

const BGM = 'audio/combined_audio.m4a';

export const Bgm: React.FC = () => {
  const {durationInFrames} = useVideoConfig();

  return (
    <Sequence from={0} durationInFrames={durationInFrames}>
      <Audio
        src={staticFile(BGM)}
        startFrom={0}
        endAt={durationInFrames}
      />
    </Sequence>
  );
};
