# 采集应用（gen-caiji）

Electron + Element Plus 桌面应用：首页是 IP 列表，每个 IP 可打开一个**独立浏览器会话**（Playwright `launchPersistentContext`，用户数据目录按 IP 命名），会话内可打开 5 个 AI 平台的标签页。

> 本轮只搭骨架：拉取 IP 列表 + 打开浏览器会话 + 打开平台标签页。采集的拉取/提交功能后续再加。

## 目录结构

```
apps/gen-caiji/
├── src/
│   ├── main/main.cjs          Electron 主进程（IP 列表拉取 + 浏览器会话管理 + 平台 tab）
│   ├── main/preload.cjs       contextBridge 暴露 electronAPI
│   ├── renderer/              Vue 3 + Element Plus 渲染层
│   │   ├── main.js
│   │   └── App.vue            首页：IP 列表 + 平台按钮列 + 操作列
│   └── shared/platforms.cjs   5 平台地址（主/渲染共用）
├── vite.config.js             渲染层构建（端口 5190）
└── index.html
```

## 运行

```bash
# 1. 安装依赖（根目录执行；会一并下载 electron 二进制与 playwright chromium）
pnpm install

# 2.（可选）若 playwright chromium 未自动下载，手动装：
pnpm --filter @geo-admin/gen-caiji install:browsers

# 3. 启动（vite 渲染层 + electron 主进程一起拉起）
pnpm --filter @geo-admin/gen-caiji dev
# 或根目录：
pnpm dev:caiji
```

## 功能说明

| 功能 | 说明 |
|---|---|
| IP 列表 | 启动后通过公开 POST `http://api.tupianseo.com/daili/daili_list` 拉取（主进程 Node fetch，规避渲染层 CORS），渲染 `ip` 字段为一列（附 `port`） |
| 打开本地 chrome 浏览器 | 每行「打开本地 chrome 浏览器」按钮 → 主进程以该行 IP 作文件夹名 `launchPersistentContext` 打开独立会话（`userData/profiles/<ip>`），行与行之间会话隔离 |
| 平台列 | 5 个按钮（豆包 / DeepSeek / 文心一言 / 通义千问 / 腾讯元宝），点击在该 IP 的浏览器会话内打开对应平台标签页（浏览器未开则自动先开） |

## 会话数据位置

- 每个 IP 的浏览器用户数据目录：`app.getPath('userData')/profiles/<ip>`
  - Windows：`%APPDATA%/gen-caiji/profiles/<ip>`
  - macOS：`~/Library/Application Support/gen-caiji/profiles/<ip>`
  - Linux：`~/.config/gen-caiji/profiles/<ip>`

## 后续扩展点（代码中已留注释）

- 代理注入：`main.cjs` 的 `launchPersistentContext` 处注入 `proxy: { server: \`http://${ip}:${port}\` }`
- 采集拉取/提交：对接 gen-api 的 `/collector/slots/pull`、`/collector/slots/:slot_id/submit`
