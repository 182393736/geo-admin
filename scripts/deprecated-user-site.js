#!/usr/bin/env node
/**
 * geo-admin 用户官网（geo-user-site / geo-user-site-v2）已废弃。
 * 对外用户网页端请使用本仓 apps/site-web。
 */
const name = process.env.npm_package_name || 'geo-user-site'
console.error(`
╔════════════════════════════════════════════════════════════╗
║  DEPRECATED — ${name.padEnd(42)}║
║  本应用已标记为过期/无效，禁止再作为用户网页端使用。       ║
║                                                            ║
║  请改用：apps/site-web（CMS：site-admin / site-server）    ║
║  命令：pnpm dev:site  或  pnpm dev:site-web                ║
╚════════════════════════════════════════════════════════════╝
`)
process.exit(1)
