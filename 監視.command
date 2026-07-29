#!/bin/bash
# Finderからダブルクリックで起動する監視スクリプト。
# scenes.csv を保存するたびに、自動でムービー(scenes.ts)へ反映する。
# 止めるには Ctrl+C、またはこのウインドウを閉じる。
cd "$(dirname "$0")"
node scripts/watch.mjs
