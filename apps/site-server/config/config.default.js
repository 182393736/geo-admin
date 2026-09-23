'use strict';

/** 读取 apps/site-server/.env（由 pnpm env:* 生成），不覆盖已有 process.env */
;(function loadDotEnv() {
  try {
    const fs = require('fs');
    const path = require('path');
    const file = path.join(__dirname, '../.env');
    if (!fs.existsSync(file)) return;
    for (const line of fs.readFileSync(file, 'utf8').split(/\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m || m[1].startsWith('#')) continue;
      if (process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  } catch { /* ignore */ }
})();

/**
 * @param {Egg.EggAppInfo} appInfo
 */
module.exports = appInfo => {
  const config = (exports = {});

  config.keys = appInfo.name + '_site_manage_secret_key';

  config.middleware = [ 'errorHandler' ];

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  config.mongoose = {
    client: {
      url: process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/site_manage',
      options: {},
    },
  };

  config.cluster = {
    listen: {
      port: 5001,
      hostname: '0.0.0.0',
    },
  };

  return config;
};
