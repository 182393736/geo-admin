# 域名与环境配置

改 **一个文件** 即可：[`config/environments.json`](../config/environments.json)  
然后执行：

```bash
pnpm env:local   # 本地（默认）
pnpm env:test    # 测试服
pnpm env:prod    # 生产
```

脚本会自动写出各应用 `.env` / `.env.development`，一般**不用再手写环境变量**。

## 两套 API（不要混用）

| 角色 | 仓库 | local | test | prod |
|------|------|-------|------|------|
| **业务后台 API**（登录、品牌、采集、套餐） | geo-admin `geo-api` | `http://127.0.0.1:6001` | `https://test-geo-api.hanyuai.com` | `https://geo-api.hanyuai.com` |
| **网站页面 CMS API**（站点/页面 SSR） | `apps/site-server` | `http://127.0.0.1:5001` | `https://test-geo-site-api.hanyuai.com` | `https://geo-site-api.hanyuai.com` |

官网前端会同时用到两者：CMS 拉页面内容，`/geo-api` 代理到业务 API。

## 三环境地址一览

| 用途 | local | test | prod |
|------|-------|------|------|
| 用户官网 | `http://localhost:5003` | `https://test-geo.hanyuai.com` | `https://geo.hanyuai.com` |
| 用户后台 | `http://127.0.0.1:5180` | `https://test-geo-user-dash.hanyuai.com` | `https://geo-user-dash.hanyuai.com` |
| 业务 API | `http://127.0.0.1:6001` | `https://test-geo-api.hanyuai.com` | `https://geo-api.hanyuai.com` |
| 业务管理总后台 | `http://localhost:6004` | `https://test-geo-admin.hanyuai.com` | `https://geo-admin.hanyuai.com` |
| CMS API | `http://127.0.0.1:5001` | `https://test-geo-site-api.hanyuai.com` | `https://geo-site-api.hanyuai.com` |
| CMS 管理端 | `http://localhost:5002` | `https://test-geo-site-admin.hanyuai.com` | `https://geo-site-admin.hanyuai.com` |

> local 下前端 `VITE_API_BASE` 为空，走 Vite 代理到本机 6001。  
> `geo-user-site*` 已废弃；官网请用 `apps/site-web`。

## DNS 解析清单（生产 / 测试）

| 主机名 | 反代到 |
|--------|--------|
| `geo.hanyuai.com` | site-web `:5003` |
| `geo-user-dash.hanyuai.com` | dash-v2 `:5180` |
| `geo-api.hanyuai.com` | geo-api `:6001` |
| `geo-admin.hanyuai.com` | geo-admin `:6004` |
| `geo-site-api.hanyuai.com` | site-server `:5001` |
| `geo-site-admin.hanyuai.com` | site-admin `:5002` |
| `test-geo.hanyuai.com` | 测试官网 |
| `test-geo-user-dash.hanyuai.com` | 测试后台 |
| `test-geo-api.hanyuai.com` | 测试业务 API |
| `test-geo-admin.hanyuai.com` | 测试管理端 |
| `test-geo-site-api.hanyuai.com` / `test-geo-site-admin.hanyuai.com` | 测试 CMS |

## 常用命令

```bash
pnpm env:local && pnpm dev:all     # api + dash-v2 + geo-test + admin
pnpm env:local && pnpm dev:site    # 官网 CMS 三端（site-web / site-server / site-admin）

pnpm build:test    # 切测试域名后构建后台
pnpm build:prod    # 切生产域名后构建后台

# 官网 + 用户后台：bash deploy/up-web.sh
# API 服务：bash deploy/up-server.sh
# 详见 deploy/README.md
```

生产域名若与上表不符，只改 `config/environments.json` 的对应字段，再 `pnpm env:*`。
