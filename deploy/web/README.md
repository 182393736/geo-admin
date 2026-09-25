# 官网 + 用户后台

同域路径分流见 [`../nginx/README.md`](../nginx/README.md)。

```bash
# 推荐
bash deploy/up-web.sh

# 或本目录
cd deploy/web && docker compose up -d --build
```

停止：`docker compose down`
