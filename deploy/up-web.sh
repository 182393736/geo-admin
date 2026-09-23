#!/usr/bin/env bash
# 启动官网 + 用户后台 + CMS 管理端
set -euo pipefail
cd "$(dirname "$0")/web"
docker compose up -d --build
docker compose ps
echo "OK  site-web:5003  dash-v2:5180  site-admin:5002"
