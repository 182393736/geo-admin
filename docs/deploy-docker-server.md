# API Docker 部署

```bash
cd ~/geo-admin
git pull
bash deploy/up-server.sh
```

仅起业务 API（`:6001`）+ CMS API（`:5001`）。  
容器为 `network_mode: host`，Mongo 走 `127.0.0.1:27017`（兼容宿主机只绑回环）。  
官网用 `bash deploy/up-web.sh`。详见 [`deploy/README.md`](../deploy/README.md)。
