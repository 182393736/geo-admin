'use strict';
const dayjs = require('dayjs');
// 挂载 ctx.app.dayjs()（Egg 不内置，pipeline 与 schedule 都依赖）
module.exports = { dayjs };
