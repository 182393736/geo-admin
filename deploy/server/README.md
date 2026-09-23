# 业务 API + CMS API（Docker）

## 日常发版

```bash
cd /opt/geo-admin
git pull
cd deploy/server
docker compose up -d --build
```

## 首次

```bash
cd /opt/geo-admin/deploy/server
cp .env.example .env
# 改 JWT_SECRET、Mongo、LLM 密钥
docker compose up -d --build
```

## 常用

```bash
docker compose ps
docker compose logs -f
docker compose down
```

| 容器 | 端口 | Nginx 反代 |
|------|------|------------|
| geo-api | 6001 | geo-api.hanyuai.com |
| site-server | 5001 | geo-site-api.hanyuai.com |

Mongo 默认连宿主机：`host.docker.internal:27017`。
