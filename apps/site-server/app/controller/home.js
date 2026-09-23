'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = {
      code: 0,
      message: 'ok',
      data: {
        name: 'site-manage-server',
        version: '1.0.0',
      },
    };
  }
}

module.exports = HomeController;
