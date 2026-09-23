# geo-api Docker 一键部署

```bash
cd apps/geo-api
cp .env.example .env   # 改密钥 / MONGO_URL
docker compose up -d --build
```

- 默认端口：`6001`（`API_PORT` 可改）
- 采集本机对接：`GEO_API_BASE=https://你的API域名`
- 停止：`docker compose down`
