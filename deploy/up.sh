#!/usr/bin/env bash
# 同时启动 server + web
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
bash "$ROOT/up-server.sh"
bash "$ROOT/up-web.sh"
