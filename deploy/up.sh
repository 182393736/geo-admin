#!/usr/bin/env bash
# 一键启动生产：API + CMS + 官网 + 用户后台（无需手改配置）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> deploy/server (geo-api + site-server)"
cd "$ROOT/server"
docker compose up -d --build

echo "==> deploy/web (site-web + dash-v2)"
cd "$ROOT/web"
docker compose up -d --build

echo "==> status"
cd "$ROOT/server" && docker compose ps
cd "$ROOT/web" && docker compose ps

echo ""
echo "OK"
echo "  geo-api      :6001  -> geo-api.hanyuai.com"
echo "  site-server  :5001  -> geo-site-api.hanyuai.com"
echo "  site-web     :5003  -> geo.hanyuai.com"
echo "  dash-v2      :5180  -> geo-user-dash.hanyuai.com"
