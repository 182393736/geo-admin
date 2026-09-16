# gen-user-dash Docker 一键部署

```bash
cd apps/gen-user-dash
cp .env.example .env   # 填写 API / 官网公网地址
docker compose up -d --build
```

改域名只需改 `.env` 后重新 `docker compose up -d --build`，无第二套命令。
