@echo off
cd /d %~dp0

echo ================================
echo OBS Markdown Topic Viewer 起動
echo ================================
echo.

docker compose build --no-cache
docker compose up

echo.
echo --------------------------------
echo 停止する場合はこのウィンドウを閉じず
echo 「停止.bat」をダブルクリックしてください
echo --------------------------------
pause
