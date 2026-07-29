import {linearTiming, springTiming} from '@remotion/transitions';
import type {TransitionPresentation} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {flip} from '@remotion/transitions/flip';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {iris} from '@remotion/transitions/iris';
import {none} from '@remotion/transitions/none';
import type {TransitionName} from './scenes';

// 使える切り替えは「シェーダーを使わないもの」に限定している。
// film-burn / ripple / dissolve / zoom-blur / book-flip などは HTML-in-Canvas API
// (chrome://flags/#canvas-draw-element) が必要で、無効だと実行時に例外になる。

// 切り替えの尺。既定(TRANSITION_FRAMES = 0.7秒)より長くしたいものだけ倍率を持たせる。
// タイムライン全体の秒計算は 0.7秒固定を前提にしているので、ここは見た目の調整に留める。
export const transitionTiming = (name: TransitionName | undefined, defaultFrames: number) => {
  switch (name) {
    // めくり・時計・アイリスは動きが大きいので、少しゆっくり見せたほうが破綻しない
    case 'flip':
      return springTiming({config: {damping: 200}, durationInFrames: defaultFrames});
    case 'clock':
    case 'iris':
      return linearTiming({durationInFrames: defaultFrames});
    default:
      return linearTiming({durationInFrames: defaultFrames});
  }
};

export const getPresentation = (
  name: TransitionName | undefined,
  width: number,
  height: number
): TransitionPresentation<Record<string, unknown>> => {
  switch (name) {
    case 'slide-left':
      return slide({direction: 'from-left'}) as never;
    case 'slide-right':
      return slide({direction: 'from-right'}) as never;
    case 'slide-up':
      return slide({direction: 'from-bottom'}) as never;
    case 'slide-down':
      return slide({direction: 'from-top'}) as never;
    case 'wipe-left':
      return wipe({direction: 'from-left'}) as never;
    case 'wipe-right':
      return wipe({direction: 'from-right'}) as never;
    case 'wipe-up':
      return wipe({direction: 'from-bottom'}) as never;
    case 'wipe-down':
      return wipe({direction: 'from-top'}) as never;
    case 'flip':
      return flip({direction: 'from-right'}) as never;
    case 'clock':
      return clockWipe({width, height}) as never;
    case 'iris':
      return iris({width, height}) as never;
    case 'none':
      return none() as never;
    default:
      return fade() as never;
  }
};
