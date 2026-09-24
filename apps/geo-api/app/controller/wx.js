/**
 * 微信公众号回调（消息推送）
 *  - GET  /user/wx/callback  服务器 URL 验证（echostr）
 *  - POST /user/wx/callback  接收关注/扫码等事件（后续接登录；本期先回 success）
 *
 * 配置：WX_MP_TOKEN（与公众号后台「服务器配置 · Token」一致）
 * AppID/Secret 用于后续拉码与 access_token，本回调验签仅用 Token。
 */
'use strict';

const crypto = require('crypto');
const Controller = require('egg').Controller;

class WxController extends Controller {
  /** GET：微信保存服务器配置时的校验 */
  async callback() {
    const { ctx } = this;
    if (ctx.method === 'POST') {
      await this._onMessage();
      return;
    }

    const q = ctx.query || {};
    const signature = String(q.signature || '');
    const timestamp = String(q.timestamp || '');
    const nonce = String(q.nonce || '');
    const echostr = String(q.echostr || '');
    const token = String((ctx.app.config.wechatMp && ctx.app.config.wechatMp.token) || '').trim();

    if (!token) {
      ctx.status = 503;
      ctx.body = 'wechat token not configured';
      return;
    }
    if (!signature || !timestamp || !nonce || !echostr) {
      ctx.status = 400;
      ctx.body = 'missing query';
      return;
    }

    const calc = this._sign(token, timestamp, nonce);
    if (calc !== signature) {
      ctx.logger.warn('[wx] callback GET signature mismatch');
      ctx.status = 401;
      ctx.body = 'invalid signature';
      return;
    }

    // 必须原样返回 echostr 纯文本
    ctx.set('Content-Type', 'text/plain; charset=utf-8');
    ctx.body = echostr;
  }

  /** POST：明文消息/事件（本期不验签，先应答 success，后续再解析登录） */
  async _onMessage() {
    const { ctx } = this;
    ctx.set('Content-Type', 'text/plain; charset=utf-8');
    ctx.body = 'success';
  }

  _sign(token, timestamp, nonce) {
    return crypto
      .createHash('sha1')
      .update([ token, timestamp, nonce ].sort().join(''))
      .digest('hex');
  }
}

module.exports = WxController;
