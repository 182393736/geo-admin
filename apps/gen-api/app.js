'use strict';
/**
 * 启动钩子：灌注默认账号 / 套餐 / 渠道库（详见 ./seed.js）
 */
module.exports = app => {
  app.beforeStart(async () => {
    await require('./seed')(app);
  });
};
