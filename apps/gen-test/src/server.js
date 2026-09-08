'use strict';
/**
 * gen-test 服务：测试任务列表 + 添加任务 + 执行（Playwright）+ 删除任务数据。
 * 端口 PORT（默认 8787），网页在 /（public/index.html），API 前缀 /api。
 */
const express = require('express');
const path = require('node:path');
const { listTasks, getTask, createTask, connect } = require('./db');
const { tryStartTask, isRunning, checkDeps, ARTIFACTS } = require('./runner');
const { deleteTask } = require('./cleanup');

const app = express();
const PORT = Number(process.env.PORT || 8787);

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// —— 任务 CRUD ——
app.get('/api/tasks', wrap(async (req, res) => {
  res.json({ code: 200, data: await listTasks() });
}));

app.post('/api/tasks', wrap(async (req, res) => {
  const { account, password, brandInput, screenshot } = req.body || {};
  if (!account || !password || !brandInput) {
    return res.status(400).json({ code: 400, msg: '账号、密码、品牌输入均必填' });
  }
  const t = await createTask({ account, password, brandInput, screenshot });
  res.json({ code: 200, data: t });
}));

app.get('/api/tasks/:id', wrap(async (req, res) => {
  const t = await getTask(req.params.id);
  if (!t) return res.status(404).json({ code: 404, msg: '任务不存在' });
  res.json({ code: 200, data: t });
}));

// —— 执行（异步）：立即返回，前端轮询 /api/tasks/:id 看进度 ——
app.post('/api/tasks/:id/run', wrap(async (req, res) => {
  const t = await getTask(req.params.id);
  if (!t) return res.status(404).json({ code: 404, msg: '任务不存在' });
  try {
    const r = tryStartTask(req.params.id);
    res.json({ code: 200, msg: '已开始执行', data: r });
  } catch (e) {
    res.status(e.status || 500).json({ code: e.status || 500, msg: e.message });
  }
}));

// —— 删除任务 + 清理其业务数据 ——
app.delete('/api/tasks/:id', wrap(async (req, res) => {
  if (isRunning()) {
    const cur = await getTask(req.params.id);
    if (cur && cur.status === 'running') {
      return res.status(409).json({ code: 409, msg: '任务正在执行中，请等待完成后再删除' });
    }
  }
  const result = await deleteTask(req.params.id);
  res.json({ code: 200, msg: '已删除任务及其业务数据', data: result });
}));

// —— 截图产物 ——
app.get('/api/tasks/:id/artifacts/:file', wrap(async (req, res) => {
  const { id, file } = req.params;
  if (!/^step-\d+\.png$/.test(file)) return res.status(400).json({ code: 400, msg: '文件名不合法' });
  res.sendFile(path.join(ARTIFACTS, id, file));
}));

// —— 依赖服务状态（前端展示） ——
app.get('/api/deps', wrap(async (req, res) => {
  res.json({ code: 200, data: await checkDeps() });
}));

// —— 404 / 错误处理 ——
app.use((req, res) => res.status(404).json({ code: 404, msg: 'not found' }));
app.use((err, req, res, next) => {
  console.error('[gen-test]', err);
  res.status(500).json({ code: 500, msg: String((err && err.message) || err).slice(0, 300) });
});

connect().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[gen-test] 测试程序已启动: http://0.0.0.0:${PORT}（Mongo: ${require('./db').MONGO_URL}）`);
  });
}).catch(e => {
  console.error('[gen-test] MongoDB 连接失败:', e.message);
  process.exit(1);
});
