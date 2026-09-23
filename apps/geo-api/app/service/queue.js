'use strict';
/**
 * 队列服务（开发期内存实现；生产替换为 Bull/Redis 或 RocketMQ）
 * 约定：push(topic, payload) → worker 订阅消费
 */
const { Service } = require('egg');

class QueueService extends Service {
  constructor(ctx) {
    super(ctx);
    this._handlers = new Map();
  }
  /** 注册消费者 */
  subscribe(topic, handler) { this._handlers.set(topic, handler); }
  /** 投递任务（dev：仅记录日志 + 挂起标记到内存） */
  async push(topic, payload) {
    const { ctx, app } = this;
    app.coreLogger.info('[queue:dev] pushed %s %j', topic, payload);
    app.__queueBacklog = app.__queueBacklog || [];
    app.__queueBacklog.push({ topic, payload, ts: Date.now() });
    return true;
  }
}
module.exports = QueueService;
