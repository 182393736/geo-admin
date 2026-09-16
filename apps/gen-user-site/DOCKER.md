# gen-user-site Docker 一键部署

```bash
cd apps/gen-user-site
cp .env.example .env   # 填写 API / 用户后台公网地址
docker compose up -d --build
```

改域名只需改 `.env` 后重新 build，无第二套命令。
