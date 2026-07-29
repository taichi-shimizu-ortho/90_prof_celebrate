import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

// 写真1枚をKen Burns(ゆっくりズーム)+ぼかし背景で表示する。
// 縦写真でも黒帯にならないよう、背景に同じ画像を拡大ぼかしで敷く。
export const KenBurnsImage: React.FC<{
  src: string;
  durationInFrames: number;
  index: number; // 偶奇でズーム方向を交互に
  sepia?: boolean;
  caption?: string;
}> = ({src, durationInFrames, index, sepia, caption}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const zoomIn = index % 2 === 0;
  const scale = interpolate(progress, [0, 1], zoomIn ? [1.04, 1.16] : [1.16, 1.04]);
  const drift = interpolate(progress, [0, 1], zoomIn ? [-8, 8] : [8, -8]);
  const filter = sepia ? 'sepia(0.8) contrast(1.05) brightness(0.95)' : undefined;
  const url = staticFile(src);

  return (
    <AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
      <Img
        src={url}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scale(1.25)',
          filter: `blur(36px) brightness(0.45)${sepia ? ' sepia(0.8)' : ''}`,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${scale}) translateX(${drift}px)`,
        }}
      >
        <Img
          src={url}
          style={{
            maxWidth: '92%',
            maxHeight: '92%',
            objectFit: 'contain',
            filter,
            boxShadow: '0 0 60px rgba(0,0,0,0.6)',
            translate: "-0.1px 0px"
          }}
        />
      </AbsoluteFill>
      {caption ? (
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            width: '100%',
            textAlign: 'center',
            color: 'white',
            fontSize: 44,
            fontFamily: '"Hiragino Mincho ProN", serif',
            textShadow: '0 2px 12px rgba(0,0,0,0.9)',
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
