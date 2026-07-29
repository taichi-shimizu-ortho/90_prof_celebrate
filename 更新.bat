@echo off
cd /d "%~dp0"
node scripts/update.mjs
echo.
echo 完了しました。何かキーを押すとこのウインドウを閉じます...
pause >nul
