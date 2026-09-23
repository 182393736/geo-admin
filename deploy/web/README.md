# 官网 + 用户后台（Docker）

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
# 按需改域名后：
docker compose up -d --build
```

## 常用

```bash
docker compose ps
docker compose logs -f
docker compose down
```

端口默认：官网 `5003`，后台 `5180`。宿主机 Nginx 反代：

| 域名 | 端口 |
|------|------|
| `geo.hanyuai.com` | 5003 |
| `geo-user-dash.hanyuai.com` | 5180 |
