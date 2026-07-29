#!/bin/bash
# scenes.csv の編集をムービー(slideshow/src/scenes.ts)に反映する。
#   使い方: ./scripts/update.sh   または プロジェクト直下の「更新.command」をダブルクリック
#
# 1) マスター表(scenes.xlsx) → scenes.ts (総尺・曲の入り・空き秒数を表示)
# 2) マスター表とCSVバックアップを作り直す(数式・行番号の貼り直し)
#    ※ Excelで開いたままだと 2) はスキップする(上書き事故を防ぐため)
set -e
cd "$(dirname "$0")/.."

node scripts/update.mjs
