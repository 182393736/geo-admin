'use strict';
const Service = require('egg').Service;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * 认证 service：密码校验 / 签发与校验 JWT / 登出黑名单
 * 黑名单目前内存实现（worker 重启即失效）；生产替换 Redis SET key 即一行的事。
 */
class AuthService extends Service {
  get blacklist() {
    const { app } = this;
    if (!app._tokenBlacklist) app._tokenBlacklist = new Set();
    return app._tokenBlacklist;
  }

  async verify(account, password) {
    const user = await this.ctx.model.User.findOne({ account }).select('+password_hash');
    if (!user) return null;
    if (user.status === 'disabled') return null;
    const ok = user.password_hash && bcrypt.compareSync(password, user.password_hash);
    return ok ? user : null;
  }

  sign(user) {
    const { jwt: jwtCfg } = this.app.config;
    return jwt.sign(
      { sub: user._id, jti: uuidv4(), name: user.account },
      jwtCfg.secret,
      { expiresIn: jwtCfg.expiresIn }, // '7d'，对齐线上 7 天
    );
  }

  revoke(jti) {
    if (jti) this.blacklist.add(jti);
  }

  isRevoked(jti) {
    return this.blacklist.has(jti);
  }
}

module.exports = AuthService;
