# Site apps（从 site-manage-monorepo 迁入）

| 目录 | 包名 | 端口 | 职责 |
|------|------|------|------|
| `apps/site-web` | `@site-manage/web` | 5003 | 用户官网 Nuxt SSR |
| `apps/site-admin` | `@site-manage/admin` | 5002 | CMS 管理端 |
| `apps/site-server` | `@site-manage/server` | 5001 | CMS API（页面/站点） |
| `packages/site-shared` | `@site-manage/shared` | — | 共享类型 |

与业务侧分离：

- **业务 API** = `apps/geo-api`（`:6001` / `*-geo-api`）
- **CMS API** = `apps/site-server`（`:5001` / `*-site-api`）

## 命令

```bash
pnpm env:local
pnpm dev:site              # 三端并行
pnpm seed:cms              # 演示数据
pnpm seed:cms-flagship     # 旗舰页
```

域名见根目录 `config/environments.json` 与 `docs/domains.md`。
