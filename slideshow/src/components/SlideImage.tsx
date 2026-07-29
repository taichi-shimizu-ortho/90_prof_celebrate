import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

// PPT由来のタイトル・メッセージスライドを静止表示する
export const SlideImage: React.FC<{src: string}> = ({src}) => {
  return (
    <AbsoluteFill style={{backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}}>
      <Img
        src={staticFile(src)}
        style={{width: '100%', height: '100%', objectFit: 'contain'}}
      />
    </AbsoluteFill>
  );
};
