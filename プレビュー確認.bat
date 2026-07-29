@echo off
cd /d "%~dp0slideshow"
echo ====================================================================
echo Remotion Studio を起動しています...
echo.
echo ※ 380枚の画像素材とタイムラインを読み込んでバンドルを作成するため、
echo   画面が「remotion studio」や「Building...」のまま 10?20秒ほど
echo   止まって見える場合がありますが、そのままお待ちください。
echo.
echo 準備が完了すると、自動的にブラウザでプレビュー画面が開きます。
echo (開かない場合はブラウザで http://localhost:3000 を開いてください)
echo ====================================================================
echo.
npm run studio
pause >nul
