# API 服务 Docker 部署（geo-api + site-server）

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
# 修改 JWT_SECRET、MONGO_URL、MONGODB_URL、LLM 等
docker compose up -d --build
```

## 常用

```bash
docker compose ps
docker compose logs -f geo-api
docker compose logs -f site-server
docker compose down
```

| 容器 | 宿主机端口 | Nginx |
|------|------------|-------|
| geo-api | 6001 | geo-api.hanyuai.com |
| site-server | 5001 | geo-site-api.hanyuai.com |

`.env` 里 Mongo 默认 `host.docker.internal:27017`（连宿主机 Mongo）。官网/后台见 `deploy/web`。
