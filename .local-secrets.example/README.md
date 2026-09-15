# 本地密钥（示例）

1. 复制整个目录到仓库根：`cp -R .local-secrets.example .local-secrets`
2. 编辑 `.local-secrets/keys.json`，填入真实 key
3. `.local-secrets/` 已在 `.gitignore`，不会提交

优先级：显式入参 > 环境变量 > `.local-secrets/keys.json` > `packages/geo-agent/src/dev-keys.js` 内置值
