# 管理总后台 Docker 部署

```bash
cd ~/geo-admin
git pull
bash deploy/up-admin.sh
```

端口 `6004` → `geo-admin.hanyuai.com`（Nginx 需反代到本机 6004）。  
API 用 `bash deploy/up-server.sh`。详见 [`deploy/README.md`](../deploy/README.md)。
