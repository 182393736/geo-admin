# 官网 / 用户后台 Docker 部署

```bash
cd ~/geo-admin
git pull
bash deploy/up-web.sh
```

仅起官网（`:5003`）+ 用户后台（`:5180`）。  
API 用 `bash deploy/up-server.sh`。详见 [`deploy/README.md`](../deploy/README.md)。
