// 自動生成: scripts/csv_to_scenes.mjs (2026-07-29)
// 並び替え・差し替えは scenes.csv を編集して node scripts/csv_to_scenes.mjs を実行。
// 切り替えの種類。シェーダー系(dissolve/film-burn/ripple 等)は HTML-in-Canvas API が
// 必要で実行時に落ちるため、ここには含めていない。
export type TransitionName =
  | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
  | 'wipe-left' | 'wipe-right' | 'wipe-up' | 'wipe-down'
  | 'flip' | 'clock' | 'iris' | 'none';

export type Scene = {
  kind: 'slide' | 'photo';
  src: string;
  dur: number; // 秒
  sepia?: boolean;
  caption?: string;
  transition?: TransitionName; // このシーンに入るときの切り替え(未指定はフェード)
};

export const FPS = 30;
export const TRANSITION_SEC = 0.7;

export const scenes: Scene[] = [
  {
    "kind": "slide",
    "src": "assets/slides/01-title.jpg",
    "dur": 8
  },
  {
    "kind": "photo",
    "src": "assets/addition2/IMG_6266.jpg",
    "dur": 5
  },
  {
    "kind": "slide",
    "src": "assets/slides/02-enkaku.jpg",
    "dur": 8
  },
  {
    "kind": "photo",
    "src": "assets/collage/16.jpg",
    "dur": 5
  },
  {
    "kind": "slide",
    "src": "assets/add/3開院.jpg",
    "dur": 5
  },
  {
    "kind": "slide",
    "src": "assets/slides/04-kono-hi-kara.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/add/2015三月.jpg",
    "dur": 5,
    "sepia": true
  },
  {
    "kind": "slide",
    "src": "assets/slides/03-kaiin-toji.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/add/2015年前期.jpg",
    "dur": 5
  },
  {
    "kind": "slide",
    "src": "assets/add/5first_surgery.jpg",
    "dur": 8
  },
  {
    "kind": "photo",
    "src": "assets/history/9be842d9.jpg",
    "dur": 5,
    "sepia": true
  },
  {
    "kind": "photo",
    "src": "assets/add/IMG_2374.jpg",
    "dur": 5
  },
  {
    "kind": "slide",
    "src": "assets/slides/05-manabiya-title.jpg",
    "dur": 5,
    "transition": "iris"
  },
  {
    "kind": "photo",
    "src": "assets/collage/01.jpg",
    "dur": 5
  },
  {
    "kind": "slide",
    "src": "assets/add/スクリーンショット_2026-07-26_10.26.38.jpg",
    "dur": 6
  },
  {
    "kind": "photo",
    "src": "assets/collage/03.jpg",
    "dur": 5
  },
  {
    "kind": "slide",
    "src": "assets/addition2/スクリーンショット_2026-07-28_16.14.39.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/collage/15.jpg",
    "dur": 5
  },
  {
    "kind": "slide",
    "src": "assets/add/スクリーンショット_2026-07-26_10.27.08.jpg",
    "dur": 6
  },
  {
    "kind": "photo",
    "src": "assets/or/cache_Messagep8464.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/bridge/IMG_0305.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/or/IMG_2953.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/or/IMG_8659.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/or/IMG_9883.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/gairai/IMG_0403.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/gairai/IMG_3154.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/byoto/IMG_9875.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/ikyoku/IMG_0108.jpg",
    "dur": 3.42
  },
  {
    "kind": "photo",
    "src": "assets/collage/04.jpg",
    "dur": 5
  },
  {
    "kind": "slide",
    "src": "assets/slides/12-sakai.jpg",
    "dur": 7,
    "transition": "wipe-right"
  },
  {
    "kind": "photo",
    "src": "assets/sakai/IMG_2675.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/running/IMG_0015.jpg",
    "dur": 6
  },
  {
    "kind": "slide",
    "src": "assets/add/スクリーンショット_2026-07-26_14.48.03.jpg",
    "dur": 6
  },
  {
    "kind": "photo",
    "src": "assets/fellows-intl/295b2717-e99e-4b5a-9a0f-f8de1ca5e74e.jpg",
    "dur": 4.8
  },
  {
    "kind": "photo",
    "src": "assets/collage/09.jpg",
    "dur": 6
  },
  {
    "kind": "slide",
    "src": "assets/add/スクリーンショット_2026-07-26_14.48.17.jpg",
    "dur": 6
  },
  {
    "kind": "photo",
    "src": "assets/collage/08.jpg",
    "dur": 5.6
  },
  {
    "kind": "photo",
    "src": "assets/fellows-intl/IMG_4707.jpg",
    "dur": 4.6
  },
  {
    "kind": "photo",
    "src": "assets/collage/13.jpg",
    "dur": 4.6
  },
  {
    "kind": "photo",
    "src": "assets/fellows-intl/IMG_5714.jpg",
    "dur": 4.6
  },
  {
    "kind": "photo",
    "src": "assets/fellows-intl/IMG_9625.jpg",
    "dur": 4.6
  },
  {
    "kind": "photo",
    "src": "assets/collage/12.jpg",
    "dur": 4.6
  },
  {
    "kind": "slide",
    "src": "assets/addition2/スクリーンショット_2026-07-28_16.17.49.jpg",
    "dur": 6
  },
  {
    "kind": "photo",
    "src": "assets/fellows-jp/IMG_0088.jpg",
    "dur": 4.6
  },
  {
    "kind": "photo",
    "src": "assets/fellows-jp/IMG_2623.jpg",
    "dur": 4.6
  },
  {
    "kind": "photo",
    "src": "assets/add/2013年前期後期から斎藤登場.jpg",
    "dur": 4.6
  },
  {
    "kind": "slide",
    "src": "assets/slides/08-nihon-sekai.jpg",
    "dur": 5.4,
    "transition": "slide-left"
  },
  {
    "kind": "photo",
    "src": "assets/collage/02.jpg",
    "dur": 5.4
  },
  {
    "kind": "photo",
    "src": "assets/collage/05.jpg",
    "dur": 5.4
  },
  {
    "kind": "photo",
    "src": "assets/collage/06.jpg",
    "dur": 5.4
  },
  {
    "kind": "photo",
    "src": "assets/collage/07.jpg",
    "dur": 5.4
  },
  {
    "kind": "photo",
    "src": "assets/collage/10.jpg",
    "dur": 5.4
  },
  {
    "kind": "photo",
    "src": "assets/collage/11.jpg",
    "dur": 5.4
  },
  {
    "kind": "photo",
    "src": "assets/collage/14.jpg",
    "dur": 5.4
  },
  {
    "kind": "photo",
    "src": "assets/group/05755B0B-0A5B-49CD-BF06-8D1AF26BDFCB.jpg",
    "dur": 5.2
  },
  {
    "kind": "photo",
    "src": "assets/group/EDE4935B-45DB-4485-ACC1-455FE3959347.jpg",
    "dur": 5.2
  },
  {
    "kind": "photo",
    "src": "assets/bridge/120167_b19cd8fb0ec04df0aba8215e1acad532~mv2.jpg.jpg",
    "dur": 5.2
  },
  {
    "kind": "photo",
    "src": "assets/group/IMG_1252.jpg",
    "dur": 5.2
  },
  {
    "kind": "photo",
    "src": "assets/group/IMG_3668.jpg",
    "dur": 5.2
  },
  {
    "kind": "photo",
    "src": "assets/group/IMG_5027.jpg",
    "dur": 5.2
  },
  {
    "kind": "photo",
    "src": "assets/group/IMG_9912.jpg",
    "dur": 5.2
  },
  {
    "kind": "slide",
    "src": "assets/slides/09-legacy.jpg",
    "dur": 6,
    "transition": "clock"
  },
  {
    "kind": "photo",
    "src": "assets/bridge/3FD3ABAF-3155-478F-88B2-BBE76A39CDBA.jpg",
    "dur": 6
  },
  {
    "kind": "slide",
    "src": "assets/slides/10-mirai.jpg",
    "dur": 6,
    "transition": "flip"
  },
  {
    "kind": "photo",
    "src": "assets/addition2/IMG_9982.jpg",
    "dur": 5
  },
  {
    "kind": "photo",
    "src": "assets/bridge/67021D6A-E5CC-4C5B-8908-07663F03DD2E.jpg",
    "dur": 6
  }
];

export const TRANSITION_FRAMES = Math.round(TRANSITION_SEC * FPS);
export const sceneFrames = (s: Scene) => Math.round(s.dur * FPS);

// BGM(audio/party-bgm.m4a)の実測値。
// ffmpeg -af silencedetect=noise=-50dB で計測:
//   ファイル尺 306.72秒 / 音楽が鳴り終わるのは 302.47秒(以降は無音)
export const BGM_DURATION_SEC = 306.72;
export const BGM_MUSIC_END_SEC = 302.47;

// ムービーの総尺は曲の長さに固定する。写真を足し引きしても尺は変わらない。
export const totalDurationInFrames = Math.round(BGM_DURATION_SEC * FPS);

// 写真を並べた実際の長さ。totalDurationInFrames とズレていると
// 末尾が黒くなる(短い)か切れる(長い)ので、update 実行時に警告する。
export const scenesDurationInFrames =
  scenes.reduce((sum, s) => sum + sceneFrames(s), 0) -
  TRANSITION_FRAMES * (scenes.length - 1);
