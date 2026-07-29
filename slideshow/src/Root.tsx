import React from 'react';
import {Composition} from 'remotion';
import {Movie} from './Movie';
import {FPS, totalDurationInFrames} from './scenes';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Movie"
      component={Movie}
      durationInFrames={totalDurationInFrames}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
