# 官网 / 用户后台 / CMS 管理端 Docker 部署

```bash
cd ~/geo-admin
git pull
bash deploy/up-web.sh
```

起官网（`:5003`）+ 用户后台（`:5180`）+ CMS 管理端（`:5002` → `geo-site-admin.hanyuai.com`）。  
API 用 `bash deploy/up-server.sh`（需先有 site-server `:5001`）。详见 [`deploy/README.md`](../deploy/README.md)。
