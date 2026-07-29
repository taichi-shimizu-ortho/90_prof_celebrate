#!/bin/bash
# Finderからダブルクリックで実行できる更新スクリプト。
# scenes.csv の編集をムービーに反映し、計算列を書き戻す。
cd "$(dirname "$0")"
./scripts/update.sh
echo ""
read -n 1 -s -r -p "完了しました。何かキーを押すとこのウインドウを閉じます..."
echo ""
