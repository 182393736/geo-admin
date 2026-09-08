# @geo-admin/contracts

GEO 平台共享契约**单一事实源**：枚举 / 常量 / 实体数据结构 / zod schema / 接口契约 / JWT 载荷。

- 消费方（现状）：`gen-api`（Node CJS）、`gen-user-dash`（Vite ESM）、`gen-user-site`（Nuxt ESM）
- 消费方（未来）：采集程序应用、管理员总后台、测试程序应用
- 零业务逻辑、零 UI、零密钥 —— 只有「定义」。

## 结构

```
src/
├── index.ts       统一导出
├── enums.ts       全平台枚举（as const 数组 + 联合类型，不用 TS enum）
├── constants.ts   平台列表 / 位次权重 / 套餐目录 / 阈值锚点
├── entities.ts    实体数据结构（对齐 apps/gen-api/app/model/*.js 字段）
├── schemas.ts     核心实体 zod schema（z.infer 反推类型；契约测试用）
├── api.ts         接口请求/响应类型（对齐线上实测契约）
└── jwt.ts         JWT 载荷 { sub, jti, name } + 解码助手
```

## 约定

1. **枚举**：一律 `as const` 数组 + `typeof[number]`，不用 TS `enum`（跨 CJS/ESM 安全、可 tree-shake）。
   运行时消费方拿数组，类型消费方拿字面量联合。
2. **双格式**：`tsup` 构建出 `dist/index.cjs`（Node require）+ `dist/index.mjs`（前端 import）+ `index.d.ts`。
   `dist/` 不提交（.gitignore），由根 `postinstall`（`pnpm --filter @geo-admin/contracts build`）在每次 `pnpm install` 后自动生成。
3. **zod**：核心共享实体提供 schema；`z.infer` 与 `entities.ts` 字段一致。测试程序直接 import schema 做契约断言。
4. **已知漂移已显式记录**（收口时二选一）：
   - `COLLECT_PLATFORMS` 含 `kimi`，`ENGINE_KEYS`（监控）不含；
   - 免费套餐 `billing_cycle='permanent'`，但 `plan.js` enum 只有 monthly/quarterly/yearly（见 `PlanBillingCycle` 注释）。

## 命令

```bash
pnpm --filter @geo-admin/contracts build       # tsup → dist/
pnpm --filter @geo-admin/contracts typecheck   # tsc --noEmit
pnpm --filter @geo-admin/contracts test        # CJS + ESM 冒烟
```

## 迁移状态

- ✅ 已接入：`gen-user-dash/src/api/types.ts` → `export * from '@geo-admin/contracts'`
- ⏳ 待接入（Phase 2）：gen-api model 的 enum 引用本包常量；官网 useAuth 改用 `decodeJwtPayload`
