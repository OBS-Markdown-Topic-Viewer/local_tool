#!/bin/bash
cd "$(dirname "$0")"

echo "=============================="
echo "OBS Markdown Topic Viewer 停止"
echo "=============================="
echo ""

docker compose down
