'use strict';
/**
 * 本仓库本地开发端口约定（600x，避免与常见 3xxx/5xxx/7xxx 项目冲突）
 *
 *   6001  gen-api
 *   6002  gen-user-dash（用户后台）
 *   6003  gen-user-site（官网 /trial）
 *   6004  gen-admin（管理总后台）
 *   6005  gen-test
 *   6006  gen-caiji（Vite 渲染层）
 *   6007  MongoDB 内存实例（dev:all / dev-mongo-fixed）
 */
module.exports = {
  api: 6001,
  dash: 6002,
  site: 6003,
  admin: 6004,
  test: 6005,
  caiji: 6006,
  mongo: 6007,
};
