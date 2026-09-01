'use strict';
/**
 * 启动钩子：数据库就绪后灌注默认账号（account: 123456 / password: 123456）
 * - 幂等：仅当 account 不存在时插入
 * - 生产上线前请删除或改为从环境变量读取
 */
module.exports = app => {
  app.beforeStart(async () => {
    const log = (lvl, ...args) => {
      const lg = app && app.logger;
      if (lg && typeof lg[lvl] === 'function') lg[lvl](...args);
      else console.log('[seed]', lvl, ...args);
    };
    try {
      const bcrypt = require('bcryptjs');
      const doc = { account: '123456', name: '管理员', is_superuser: true };
      const existed = await app.model.User.findOne({ account: doc.account });
      if (!existed) {
        await app.model.User.create({ ...doc, password_hash: bcrypt.hashSync('123456', 10) });
        log('info', '[seed] 默认账户已创建 account=123456 password=123456');
      } else {
        log('info', '[seed] 默认账户已存在，跳过');
      }
    } catch (e) {
      // Mongo 未连通时不致命，但要显著提示
      log('error', '[seed] 默认账户初始化失败: %s', (e && e.stack) || String(e));
    }
  });
};
