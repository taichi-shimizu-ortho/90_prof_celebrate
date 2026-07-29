#!/bin/bash
# 素材前処理: HEIC/heif/tif/avif/png/jpg → JPEG(最大辺1920px)に変換して
# メディアフォルダの assets/ 以下へカテゴリ別(ASCIIスラッグ)に出力する。
# 再実行可能(変換済みファイルはスキップ)。sips を使うので macOS 専用。
set -u

# メディアフォルダの場所は slideshow/media-dir.cjs で一元管理している
SRC="$(node -p "require('$(cd "$(dirname "$0")/.." && pwd)/slideshow/media-dir.cjs').mediaDir")"
DEST="$SRC/assets"
MAXPX=1920
QUALITY=85

mkdir -p "$DEST"

convert_one() { # $1=input $2=outdir
  local in="$1" outdir="$2"
  local base name out
  base="$(basename "$in")"
  name="${base%.*}"
  name="${name// /_}" # 空白入りのファイル名は staticFile のURLで扱いにくいので _ に置換
  out="$outdir/$name.jpg"
  # 同名異拡張子の衝突回避
  if [ -e "$out" ] && [ -n "$(find "$outdir" -name "$name.jpg" -newer "$in" 2>/dev/null)" ]; then
    return 0 # 変換済み
  fi
  [ -e "$out" ] && out="$outdir/${name}_2.jpg"
  [ -e "$out" ] && return 0
  if ! sips -s format jpeg -s formatOptions $QUALITY \
       --resampleHeightWidthMax $MAXPX "$in" --out "$out" >/dev/null 2>&1; then
    # sipsが読めない形式(avif等)はffmpegでフォールバック
    ffmpeg -y -loglevel error -i "$in" \
      -vf "scale='min($MAXPX,iw)':'min($MAXPX,ih)':force_original_aspect_ratio=decrease" \
      -q:v 3 "$out" || echo "SKIP(変換失敗): $in"
  fi
}

convert_dir() { # $1=srcdir $2=slug
  local srcdir="$SRC/$1" slug="$2" outdir="$DEST/$2" n=0
  mkdir -p "$outdir"
  while IFS= read -r -d '' f; do
    case "$(echo "${f##*.}" | tr '[:upper:]' '[:lower:]')" in
      jpg|jpeg|png|heic|heif|tif|tiff|avif) convert_one "$f" "$outdir"; n=$((n+1)) ;;
      *) ;; # MP4等はスキップ(静止画のみ使用)
    esac
  done < <(find "$srcdir" -maxdepth 1 -type f -print0 | sort -z)
  echo "$slug: $n files processed"
}

# --- 写真カテゴリ ---
convert_dir "若松病院写真/開院当初"       "history"
convert_dir "若松病院写真/病院外観"       "exterior"
convert_dir "若松病院写真/若戸大橋"       "bridge"
convert_dir "若松病院写真/医局"           "ikyoku"
convert_dir "若松病院写真/カンファ室"     "conference"
convert_dir "若松病院写真/手術室"         "or"
convert_dir "若松病院写真/外来"           "gairai"
convert_dir "若松病院写真/リハ室"         "rehab"
convert_dir "若松病院写真/病棟"           "byoto"
convert_dir "若松病院写真/ランニング"     "running"
convert_dir "若松病院写真/国内フェロー"   "fellows-jp"
convert_dir "若松病院写真/海外フェロー"   "fellows-intl"
convert_dir "若松病院写真/留学"           "ryugaku"
convert_dir "若松病院写真/酒井院長"       "sakai"
convert_dir "若松病院写真/集合写真"       "group"
convert_dir "若松病院写真/顔写真"         "faces"
convert_dir "若松病院写真/その他"                              "misc"
convert_dir "若松病院写真/その他/内田先生教授就任パーティー用" "uchida-party"
convert_dir "若松病院写真/その他/Photos-1-001 (6)"             "misc6"
convert_dir "若松病院写真/その他/Photos-1-001 (8)"             "misc8"

# --- 後から追加した素材 ---
convert_dir "addition2" "addition2"

# --- PPTスライド(意味のある名前にリネームして変換) ---
PPT="$SRC/PPTからの画像"
SLIDES="$DEST/slides"
mkdir -p "$SLIDES"
slide() { # $1=timestamp部分 $2=出力名
  local in="$PPT/スクリーンショット 2026-07-24 $1.png" out="$SLIDES/$2.jpg"
  [ -e "$out" ] && return 0
  sips -s format jpeg -s formatOptions 92 --resampleHeightWidthMax $MAXPX \
    "$in" --out "$out" >/dev/null 2>&1 || echo "SKIP: $in"
}
slide "5.22.48" "01-title"
slide "5.23.46" "02-enkaku"
slide "5.24.51" "03-kaiin-toji"
slide "5.26.06" "04-kono-hi-kara"
slide "5.26.44" "05-manabiya-title"
slide "5.27.18" "06-manabiya-message"
slide "5.28.00" "07-isakos"
slide "5.28.22" "08-nihon-sekai"
slide "5.28.47" "09-legacy"
slide "5.29.16" "10-mirai"
slide "5.29.21" "11-black"
slide "5.39.08" "12-sakai"
echo "slides: done"

# --- 音源 ---
AUD="$DEST/../audio"
mkdir -p "$AUD"
cp -n "$SRC/音源/01 secret base ～君がくれたもの～.m4a" "$AUD/secret-base.m4a" 2>/dev/null
cp -n "$SRC/音源/07 たしかなこと.m4a" "$AUD/tashikanakoto.m4a" 2>/dev/null
echo "audio: done"
