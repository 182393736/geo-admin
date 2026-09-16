# 域名约定（hanyuai.com）

主域：`hanyuai.com`。测试子域格式：`test-<应用文件夹名>.hanyuai.com`，与 `apps/` 下目录一一对应，方便识别。业务逻辑不变，换环境只改各应用 `.env` 里的域名。

| 用途 | 域名 | 应用 | Docker |
|------|------|------|--------|
| 官网 / 首登 | `https://test-gen-user-site.hanyuai.com` | gen-user-site | 独立 compose |
| 用户后台 | `https://test-gen-user-dash.hanyuai.com` | gen-user-dash | 独立 compose |
| 共用 API | `https://test-gen-api.hanyuai.com` | gen-api | 独立 compose |
| 管理后台 | `https://test-gen-admin.hanyuai.com` | gen-admin | 本地 `pnpm dev:admin`（暂未单独 Docker） |

- 官网与用户后台 **分域名**，共用 **同一个** API。
- 稿件接口与主 API 同域。
- **采集**（gen-caiji）本机运行：`GEN_API_BASE=https://test-gen-api.hanyuai.com`。

## 部署命令（三端各自一套，无 test/prod 分支）

```bash
# API
cd apps/gen-api && cp .env.example .env && docker compose up -d --build

# 用户后台
cd apps/gen-user-dash && cp .env.example .env && docker compose up -d --build

# 官网
cd apps/gen-user-site && cp .env.example .env && docker compose up -d --build
```

详见各目录 `DOCKER.md`。
