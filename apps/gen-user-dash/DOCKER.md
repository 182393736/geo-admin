# gen-user-dash Docker 一键部署

```bash
cd apps/gen-user-dash
cp .env.example .env   # 填写 API / 官网公网地址
docker compose up -d --build
```

- 宿主机端口：**6002**（与本地一致，容器内 nginx 仍监听 80）
- 改域名只需改 `.env` 后重新 `docker compose up -d --build`，无第二套命令。
