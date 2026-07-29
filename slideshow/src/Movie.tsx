import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries} from '@remotion/transitions';
import {scenes, sceneFrames, TRANSITION_FRAMES, BGM_MUSIC_END_SEC} from './scenes';
import {getPresentation, transitionTiming} from './transitions';
import {KenBurnsImage} from './components/KenBurnsImage';
import {SlideImage} from './components/SlideImage';
import {Bgm} from './Bgm';

// 冒頭フェードイン(黒)
const FADE_IN_SEC = 1.5;

export const Movie: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps, width, height} = useVideoConfig();

  // ラストのフェードアウトは、曲が鳴り終わる位置から始めてムービー終端で黒になる。
  // 曲末尾の無音(約4.3秒)がそのまま暗転にあたるので、無音のまま写真が残らない。
  const edgeOverlayOpacity = Math.max(
    interpolate(frame, [0, Math.round(FADE_IN_SEC * fps)], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    interpolate(
      frame,
      [Math.round(BGM_MUSIC_END_SEC * fps), durationInFrames],
      [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
    )
  );

  const items: React.ReactNode[] = [];
  scenes.forEach((s, i) => {
    if (i > 0) {
      // 切り替えは「このシーンに入るときの効果」。Excelの「切り替え」列で指定する。
      items.push(
        <TransitionSeries.Transition
          key={`t${i}`}
          presentation={getPresentation(s.transition, width, height)}
          timing={transitionTiming(s.transition, TRANSITION_FRAMES)}
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
