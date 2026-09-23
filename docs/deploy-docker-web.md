# 官网 + 用户后台 Docker 部署

进入目录后用标准 docker compose 命令即可（会自动读同目录 `.env`）。

## 日常发版

```bash
cd /opt/geo-admin
git pull
cd deploy/web
docker compose up -d --build
```

## 首次

```bash
cd /opt/geo-admin/deploy/web
cp .env.example .env
docker compose up -d --build
```

## 常用

```bash
docker compose ps
docker compose logs -f site-web
docker compose logs -f dash-v2
docker compose down
```

| 容器 | 宿主机端口 | Nginx 反代 |
|------|------------|------------|
| site-web | 5003 | geo.hanyuai.com |
| dash-v2 | 5180 | geo-user-dash.hanyuai.com |

业务 API / CMS API 仍跑在宿主机；`.env` 里填公网 HTTPS 地址（不要用 `127.0.0.1`）。
