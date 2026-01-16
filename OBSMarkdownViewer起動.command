#!/bin/bash
cd "$(dirname "$0")"

echo "=============================="
echo "OBS Markdown Topic Viewer 起動"
echo "=============================="
echo ""

docker compose build --no-cache
docker compose up
