# Docker 部署（分项目启动）

配置已写在 `docker-compose.yml` 默认值里，**无需手改**。

管理总后台（geo-admin）仅本地开发使用：`pnpm dev:admin`，不走 Docker。

## 分开启动（推荐）

```bash
cd ~/geo-admin
git pull

bash deploy/up-server.sh   # 业务 API + CMS API（6001 / 5001）
bash deploy/up-web.sh      # 官网 + 用户后台 + CMS 管理端（5003 / 5180 / 5002）
```

## 全部一起起（可选）

```bash
bash deploy/up.sh
```

## 停止

```bash
cd ~/geo-admin/deploy/server && docker compose down
cd ~/geo-admin/deploy/web    && docker compose down
```

## 端口 / 域名（宿主机端口 = 容器内端口）

| 项目 | 命令 | 端口 | 域名 |
|------|------|------|------|
| server | `bash deploy/up-server.sh` | `6001:6001` / `5001:5001` | geo-api / geo-site-api |
| web | `bash deploy/up-web.sh` | `5003:5003` / `5180:5180` / `5002:5002` | geo / geo-user-dash / geo-site-admin |

前提：本机 Mongo `:27017`（可只绑 `127.0.0.1`）；Nginx 已反代。

> **server 栈**使用 `network_mode: host`，容器内直连 `127.0.0.1:27017`，
> 无需改 mongod `bindIp`。端口即本机 `6001` / `5001`。
