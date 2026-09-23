#!/usr/bin/env bash
# 启动管理总后台（geo-admin.hanyuai.com → :6004）
set -euo pipefail
cd "$(dirname "$0")/admin"
docker compose up -d --build
docker compose ps
echo "OK  geo-admin:6004  -> geo-admin.hanyuai.com"
