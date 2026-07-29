import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {scenes, sceneFrames, TRANSITION_FRAMES} from './scenes';
import {KenBurnsImage} from './components/KenBurnsImage';
import {SlideImage} from './components/SlideImage';
import {Bgm} from './Bgm';

// 冒頭フェードイン・ラストフェードアウト(黒)
const FADE_EDGE_SEC = 1.5;

export const Movie: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const FADE_EDGE_FRAMES = Math.round(FADE_EDGE_SEC * fps);

  const edgeOverlayOpacity = Math.max(
    interpolate(frame, [0, FADE_EDGE_FRAMES], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    interpolate(
      frame,
      [durationInFrames - FADE_EDGE_FRAMES, durationInFrames],
      [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
    )
  );

  const items: React.ReactNode[] = [];
  scenes.forEach((s, i) => {
    if (i > 0) {
      items.push(
        <TransitionSeries.Transition
          key={`t${i}`}
          presentation={fade()}
          timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
        />
      );
    }
    items.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={sceneFrames(s)}>
        {s.kind === 'slide' ? (
          <SlideImage src={s.src} />
        ) : (
          <KenBurnsImage
            src={s.src}
            durationInFrames={sceneFrames(s)}
            index={i}
            sepia={s.sepia}
            caption={s.caption}
          />
        )}
      </TransitionSeries.Sequence>
    );
  });

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <TransitionSeries>{items}</TransitionSeries>
      <Bgm />
      <AbsoluteFill
        style={{backgroundColor: 'black', opacity: edgeOverlayOpacity, pointerEvents: 'none'}}
      />
    </AbsoluteFill>
  );
};
