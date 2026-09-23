'use strict';
/**
 * 本仓库本地开发端口约定（600x，避免与常见 3xxx/5xxx/7xxx 项目冲突）
 *
 *   6001  geo-api
 *   6002  geo-user-dash v1（旧）
 *   5180  geo-user-dash-v2（用户后台第二版，测试程序默认）
 *   5003  site-manage apps/web（用户前台；仓库外）
 *   6004  geo-admin（管理总后台）
 *   6005  geo-test
 *   6006  geo-caiji（Vite 渲染层）
 *   6007  MongoDB 内存实例（dev:all / dev-mongo-fixed）
 */
module.exports = {
  api: 6001,
  dash: 6002,       // geo-user-dash v1（旧）
  dashV2: 5180,     // geo-user-dash-v2（测试程序默认）
  site: 5003,       // site-manage apps/web（用户前台）
  admin: 6004,
  test: 6005,
  caiji: 6006,
  mongo: 6007,
};
