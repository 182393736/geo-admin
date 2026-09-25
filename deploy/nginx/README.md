# 官网与用户后台同域（Nginx）

方案①：同一 Host，路径分流。

| 路径 | 上游 |
|------|------|
| `/dashboard` `/trial` `/login` `/assets/` | dash-v2 `:5180` |
| 其余 | site-web `:5003` |

## 文件

| 文件 | 用途 |
|------|------|
| `geo-same-origin.conf` | 生产 `geo.hanyuai.com` |
| `test-geo-same-origin.conf` | 测试 `test-geo.hanyuai.com` |

## 上线步骤（生产）

1. 仓库已把 `config/environments.json` 的 prod `geoDash` 改成 `https://geo.hanyuai.com`。
2. 重建 web（让官网 `NUXT_PUBLIC_CONSOLE_URL` 指向同域）：

```bash
cd /root/geo-admin
git pull
# 若用 compose 环境文件，确认 NUXT_PUBLIC_CONSOLE_URL=https://geo.hanyuai.com
bash deploy/up-web.sh
```

3. 安装 Nginx 片段（补全 SSL 路径后）：

```bash
cp deploy/nginx/geo-same-origin.conf /etc/nginx/conf.d/geo-same-origin.conf
nginx -t && systemctl reload nginx
```

4. 验收：

- `https://geo.hanyuai.com/` → 官网  
- `https://geo.hanyuai.com/dashboard/overview` → 工作台（需登录）  
- `https://geo.hanyuai.com/login` → 后台登录页  
- 官网弹窗登录后应跳到同域 `/dashboard/...` 或 `/trial`  
- `https://geo-user-dash.hanyuai.com/dashboard/overview` → 301 到同域  

## 注意

- **必须**反代 `/assets/`，否则 Vite 静态资源 404、后台白屏。  
- 官网 Nuxt 资源在 `/_nuxt/`，与 `/assets/` 不冲突。  
- local 开发仍用 `localhost:5003` + `127.0.0.1:5180`，不必套本 Nginx。
