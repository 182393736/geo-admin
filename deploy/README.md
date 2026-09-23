# Docker 一键部署（无需手改配置）

生产 `.env` 已提交在 `deploy/server/.env`、`deploy/web/.env`。

## 服务器

```bash
cd ~/geo-admin    # 或 /opt/geo-admin
git pull
bash deploy/up.sh
```

首次若还没有仓库：

```bash
git clone git@github.com:182393736/geo-admin.git
cd geo-admin
bash deploy/up.sh
```

## 端口

| 服务 | 端口 | 域名 |
|------|------|------|
| geo-api | 6001 | geo-api.hanyuai.com |
| site-server | 5001 | geo-site-api.hanyuai.com |
| site-web | 5003 | geo.hanyuai.com |
| dash-v2 | 5180 | geo-user-dash.hanyuai.com |

前提：本机 Mongo 已启动（`27017`），Nginx 已按上表反代。
