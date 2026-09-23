# Docker 部署（分项目启动）

配置已写在 `docker-compose.yml` 默认值里，**无需手改**。

## 分开启动（推荐）

```bash
cd ~/geo-admin
git pull

bash deploy/up-server.sh   # 业务 API + CMS API（6001 / 5001）
bash deploy/up-web.sh      # 官网 + 用户后台（5003 / 5180）
bash deploy/up-admin.sh    # 管理总后台（6004）
```

## 全部一起起（可选）

```bash
bash deploy/up.sh
```

## 停止

```bash
cd ~/geo-admin/deploy/server && docker compose down
cd ~/geo-admin/deploy/web    && docker compose down
cd ~/geo-admin/deploy/admin  && docker compose down
```

## 端口 / 域名

| 项目 | 命令 | 端口 | 域名 |
|------|------|------|------|
| server | `bash deploy/up-server.sh` | 6001 / 5001 | geo-api / geo-site-api |
| web | `bash deploy/up-web.sh` | 5003 / 5180 | geo / geo-user-dash |
| admin | `bash deploy/up-admin.sh` | 6004 | geo-admin |

前提：本机 Mongo `:27017`；Nginx 已反代。
