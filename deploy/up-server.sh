#!/usr/bin/env bash
# 启动业务 API + CMS API
set -euo pipefail
cd "$(dirname "$0")/server"
docker compose up -d --build
docker compose ps
echo "OK  geo-api:6001  site-server:5001"
