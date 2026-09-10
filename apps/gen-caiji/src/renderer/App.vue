<template>
  <div class="page">
    <header class="hd">
      <div>
        <h1 class="title">采集应用</h1>
        <p class="sub">IP 代理列表 · 每个 IP 一个独立浏览器会话 · 4 平台标签页 · 测试拉取对接 gen-api</p>
      </div>
      <div class="hd-actions">
        <span v-if="total > 0" class="count">共 {{ total }} 个 IP</span>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </div>
    </header>

    <el-alert
      v-if="!isElectron"
      type="warning"
      show-icon
      :closable="false"
      title="当前不在 Electron 环境"
      description="请通过 Electron 启动本应用（pnpm --filter @geo-admin/gen-caiji dev）。浏览器预览仅作样式参考，无法打开本地浏览器会话、也无法拉取 IP 列表。"
      class="mb"
    />

    <el-table :data="rows" v-loading="loading" border stripe size="default" style="width: 100%">
      <el-table-column label="IP" min-width="170">
        <template #default="{ row }">
          <span class="ip">{{ row.ip }}</span>
          <span v-if="row.port" class="port">:{{ row.port }}</span>
        </template>
      </el-table-column>

      <el-table-column label="平台" width="230">
        <template #default="{ row }">
          <div class="col">
            <div v-for="p in platforms" :key="p.key" class="plat-row">
              <el-button
                size="small"
                class="plat-btn"
                :type="platBtnType(row.ip, p.key)"
                :plain="isPlatformOpen(row.ip, p.key)"
                :title="platBtnTitle(row.ip, p.key)"
                @click="togglePlatform(row, p)"
              >{{ p.name }}</el-button>
              <span class="auth-text" :class="authTextClass(row.ip, p.key)" :title="authTitle(row.ip, p.key)">{{ authText(row.ip, p) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="测试" min-width="320">
        <template #default="{ row }">
          <div class="col">
            <div v-for="p in platforms" :key="p.key" class="test-row">
              <el-input
                v-model="testInputs[`${row.ip}:${p.key}`]"
                size="small"
                placeholder="测试问题"
                clearable
                :disabled="isRunning(row.ip, p.key)"
              />
              <el-button
                size="small"
                class="test-btn"
                :loading="isRunning(row.ip, p.key)"
                @click="doTest(row, p)"
              >{{ isRunning(row.ip, p.key) ? '对话中…' : '测试' + p.name }}</el-button>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="预览" width="150">
        <template #default="{ row }">
          <div class="col">
            <div v-for="p in platforms" :key="p.key" class="preview-row">
              <el-button
                size="small"
                class="preview-btn"
                :disabled="!hasResult(row.ip, p.key)"
                @click="doPreview(row, p)"
              >预览{{ p.name }}</el-button>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="JSON" width="150">
        <template #default="{ row }">
          <div class="col">
            <div v-for="p in platforms" :key="p.key" class="preview-row">
              <el-button
                size="small"
                class="preview-btn"
                :disabled="!hasResult(row.ip, p.key)"
                @click="doPreviewJson(row, p)"
              >JSON{{ p.name }}</el-button>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="拉取" width="150">
        <template #default="{ row }">
          <div class="col">
            <div v-for="p in platforms" :key="p.key" class="preview-row">
              <el-button
                size="small"
                class="preview-btn"
                type="warning"
                plain
                :loading="isPulling(row.ip, p.key)"
                :disabled="isPulling(row.ip, p.key) || isRunning(row.ip, p.key)"
                @click="doPull(row, p)"
              >{{ isPulling(row.ip, p.key) ? '拉取中…' : '拉取' + p.name }}</el-button>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button
            :type="isBrowserOpen(row.ip) ? 'success' : 'primary'"
            size="small"
            :plain="isBrowserOpen(row.ip)"
            :loading="opening === row.ip"
            @click="toggleBrowser(row)"
          >{{ isBrowserOpen(row.ip) ? '浏览器已打开' : '打开本地 chrome 浏览器' }}</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty description="暂无数据" :image-size="80" />
      </template>
    </el-table>

    <p class="hint">提示：平台按钮打开/关闭标签页（绿色=已登录、黄色=未登录）；测试列输入问题后点「测试+平台名」在对应 tab 执行对话；「拉取+平台名」只领该平台一条真实槽位并采集提交（无任务会提示）；浏览器按钮打开/关闭整个会话。</p>

    <div class="log-panel">
      <div class="log-hd">
        <span class="log-title">执行日志</span>
        <span class="log-actions">
          <el-button size="small" text @click="logCollapsed = !logCollapsed">{{ logCollapsed ? '展开' : '收起' }}</el-button>
          <el-button size="small" text @click="clearLogs">清空</el-button>
        </span>
      </div>
      <div v-show="!logCollapsed" ref="logBox" class="log-box">
        <div v-for="(l, i) in logs" :key="i" class="log-line" :class="'lv-' + l.level">
          <span class="log-time">{{ fmtTime(l.time) }}</span>
          <span class="log-tag">{{ platformName(l.platform) }}@{{ l.ip }}</span>
          <span class="log-msg">{{ l.message }}</span>
        </div>
        <div v-if="!logs.length" class="log-empty">暂无日志</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import platforms from '../shared/platforms.json';

const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
const rows = ref([]);
const total = ref(0);
const loading = ref(false);
const opening = ref('');                 // 正在打开浏览器的 ip
const openedBrowsers = ref({});          // ip -> true（该 IP 的浏览器会话已打开）
const openedPlatforms = ref({});         // `${ip}:${platform}` -> true
const testInputs = reactive({});         // `${ip}:${platform}` -> 测试输入内容
const authStates = reactive({});         // `${ip}:${platform}` -> { loggedIn, username }
const running = reactive({});            // `${ip}:${platform}` -> true（对话进行中）
const pulling = reactive({});            // `${ip}:${platform}` -> true（该平台测试拉取中）
const results = reactive({});            // `${ip}:${platform}` -> true（已有对话结果可预览）
const logs = ref([]);                    // 页面底部日志区
const logBox = ref(null);
const logCollapsed = ref(false);        // 日志面板收起/展开（悬浮于底部）

const isBrowserOpen = ip => !!openedBrowsers.value[ip];
const isPlatformOpen = (ip, platform) => !!openedPlatforms.value[`${ip}:${platform}`];
const authOf = (ip, platform) => authStates[`${ip}:${platform}`];
const isRunning = (ip, platform) => !!running[`${ip}:${platform}`];
const isPulling = (ip, platform) => !!pulling[`${ip}:${platform}`];
const hasResult = (ip, platform) => !!results[`${ip}:${platform}`];

function platformName(key) {
  if (key === 'collector') return '拉取';
  const p = platforms.find(x => x.key === key);
  return p ? p.name : key;
}
function fmtTime(ts) {
  const d = new Date(ts || Date.now());
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function pushLog(entry) {
  logs.value.push(entry);
  if (logs.value.length > 500) logs.value.splice(0, logs.value.length - 500);
  nextTick(() => {
    if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight;
  });
}
function clearLogs() {
  logs.value = [];
}

// 平台按钮三态：未打开=灰 / 已登录=绿 / 未登录=黄
function platBtnType(ip, platform) {
  if (!isPlatformOpen(ip, platform)) return 'default';
  const a = authOf(ip, platform);
  return a && a.loggedIn ? 'success' : 'warning';
}
function platBtnTitle(ip, platform) {
  if (!isPlatformOpen(ip, platform)) return `打开`;
  const a = authOf(ip, platform);
  if (a && a.loggedIn) return `${a.username || '已登录'}（点击关闭）`;
  return '未登录（点击关闭）';
}
// 按钮右侧的账号文字：未打开=空；已登录=账号；未登录=「未登录」
function authText(ip, p) {
  if (!isPlatformOpen(ip, p.key)) return '';
  const a = authOf(ip, p.key);
  return a && a.loggedIn ? (a.username || '已登录') : '未登录';
}
function authTextClass(ip, platform) {
  if (!isPlatformOpen(ip, platform)) return 'muted';
  const a = authOf(ip, platform);
  return a && a.loggedIn ? 'ok' : 'warn';
}
function authTitle(ip, platform) {
  const a = authOf(ip, platform);
  return a && a.loggedIn ? a.username || '' : '';
}

async function load() {
  if (!isElectron) return;
  loading.value = true;
  try {
    const r = await window.electronAPI.fetchIpList();
    if (r && r.ok) {
      rows.value = r.list || [];
      total.value = r.count != null ? r.count : rows.value.length;
    } else {
      throw new Error((r && r.error) || '拉取失败');
    }
  } catch (e) {
    ElMessage.error('拉取 IP 列表失败：' + (e && e.message ? e.message : e));
  } finally {
    loading.value = false;
  }
}

async function toggleBrowser(row) {
  if (!isElectron) return;
  if (isBrowserOpen(row.ip)) {
    try {
      await ElMessageBox.confirm(`确定关闭 ${row.ip} 的浏览器会话？（会话数据保留在磁盘，可再次打开）`, '关闭浏览器', {
        type: 'warning', confirmButtonText: '关闭', cancelButtonText: '取消',
      });
    } catch { return; }
    try {
      const r = await window.electronAPI.closeBrowser(row.ip);
      if (r && r.ok) {
        openedBrowsers.value[row.ip] = false;
        for (const k of Object.keys(openedPlatforms.value)) {
          if (k.startsWith(`${row.ip}:`)) delete openedPlatforms.value[k];
        }
        for (const k of Object.keys(authStates)) {
          if (k.startsWith(`${row.ip}:`)) delete authStates[k];
        }
        ElMessage.success(`已关闭 ${row.ip} 的浏览器会话`);
      } else {
        ElMessage.error('关闭失败：' + ((r && r.error) || '未知错误'));
      }
    } catch (e) {
      ElMessage.error('关闭失败：' + (e && e.message ? e.message : e));
    }
    return;
  }
  opening.value = row.ip;
  try {
    const r = await window.electronAPI.openBrowser(row.ip);
    if (r && r.ok) {
      openedBrowsers.value[row.ip] = true;
      ElMessage.success(`已打开 ${row.ip} 的独立浏览器会话`);
    } else {
      ElMessage.error('打开失败：' + ((r && r.error) || '未知错误'));
    }
  } catch (e) {
    ElMessage.error('打开失败：' + (e && e.message ? e.message : e));
  } finally {
    opening.value = '';
  }
}

async function togglePlatform(row, p) {
  if (!isElectron) return;
  const key = `${row.ip}:${p.key}`;
  if (isPlatformOpen(row.ip, p.key)) {
    try {
      const r = await window.electronAPI.closePlatform(row.ip, p.key);
      if (r && r.ok) {
        openedPlatforms.value[key] = false;
        delete authStates[key];
        ElMessage.info(`已关闭 ${row.ip} · ${p.name}`);
      } else {
        ElMessage.error('关闭失败：' + ((r && r.error) || '未知错误'));
      }
    } catch (e) {
      ElMessage.error('关闭失败：' + (e && e.message ? e.message : e));
    }
    return;
  }
  try {
    const r = await window.electronAPI.openPlatform(row.ip, p.key);
    if (r && r.ok) {
      openedPlatforms.value[key] = true;
      openedBrowsers.value[row.ip] = true;
      authStates[key] = { loggedIn: !!r.loggedIn, username: r.username || '' };
      const tip = r.loggedIn ? (r.username ? `已登录 ${r.username}` : '已登录') : '未登录';
      ElMessage.success(`已打开 ${row.ip} · ${p.name}（${tip}）`);
    } else {
      ElMessage.error('打开失败：' + ((r && r.error) || '未知错误'));
    }
  } catch (e) {
    ElMessage.error('打开失败：' + (e && e.message ? e.message : e));
  }
}

async function doTest(row, p) {
  if (!isElectron) return;
  const key = `${row.ip}:${p.key}`;
  const q = (testInputs[key] || '').trim();
  if (!q) {
    ElMessage.warning(`请先输入 ${p.name} 的测试问题`);
    return;
  }
  if (running[key]) return;
  running[key] = true;
  try {
    const r = await window.electronAPI.runChat(row.ip, p.key, q);
    if (r && r.ok) {
      results[key] = true;
      openedBrowsers.value[row.ip] = true;             // 对话会确保浏览器会话已打开
      if (r.openedPlatform) openedPlatforms.value[key] = true; // 对话自动补开的平台 tab
      ElMessage.success(`${p.name} 完成：回答 ${(r.answer || '').length} 字，信源 ${(r.sources || []).length} 条，已保存 HTML`);
    } else {
      ElMessage.error(`${p.name} 对话失败：${(r && r.error) || '未知错误'}`);
    }
  } catch (e) {
    ElMessage.error(`${p.name} 对话失败：${(e && e.message) || e}`);
  } finally {
    delete running[key];
  }
}

async function doPreview(row, p) {
  if (!isElectron) return;
  try {
    const r = await window.electronAPI.previewChat(row.ip, p.key);
    if (!r || !r.ok) ElMessage.info((r && r.error) || '暂无对话结果');
  } catch (e) {
    ElMessage.error('预览失败：' + ((e && e.message) || e));
  }
}

async function doPreviewJson(row, p) {
  if (!isElectron) return;
  try {
    const r = await window.electronAPI.previewChatJson(row.ip, p.key);
    if (!r || !r.ok) ElMessage.info((r && r.error) || '暂无对话结果');
  } catch (e) {
    ElMessage.error('JSON 预览失败：' + ((e && e.message) || e));
  }
}

async function doPull(row, p) {
  if (!isElectron) return;
  const key = `${row.ip}:${p.key}`;
  if (pulling[key] || running[key]) return;
  pulling[key] = true;
  try {
    const r = await window.electronAPI.pullAndRun(row.ip, p.key);
    if (r && r.empty) {
      ElMessage.info(r.message || `${p.name} 当前无待采集任务`);
      return;
    }
    if (r && r.ok) {
      results[key] = true;
      openedBrowsers.value[row.ip] = true;
      if (r.openedPlatform) openedPlatforms.value[key] = true;
      ElMessage.success(
        `${p.name} 拉取完成并已提交：回答 ${(r.answer || '').length} 字 · 信源 ${((r.sources || []).length)} 条`
      );
    } else {
      ElMessage.error(`${p.name} 拉取采集失败：${(r && r.error) || '未知错误'}`);
    }
  } catch (e) {
    ElMessage.error(`${p.name} 拉取采集失败：${(e && e.message) || e}`);
  } finally {
    delete pulling[key];
  }
}

onMounted(() => {
  load();
  // 订阅主进程推送的登录态变化（打开时检测 + 页面 load 复检）
  if (isElectron && window.electronAPI.onPlatformAuth) {
    window.electronAPI.onPlatformAuth(({ ip, platform, loggedIn, username }) => {
      authStates[`${ip}:${platform}`] = { loggedIn: !!loggedIn, username: username || '' };
    });
  }
  // 订阅主进程推送的对话测试日志（页面下方日志区）
  if (isElectron && window.electronAPI.onChatLog) {
    window.electronAPI.onChatLog(entry => pushLog(entry));
  }
});
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background: #f4f6fb;
}
</style>

<style scoped>
.page {
  padding: 20px 24px 260px;
}
.hd {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}
.title {
  margin: 0;
  font-size: 20px;
  color: #1f2430;
}
.sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: #6b7280;
}
.hd-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.count {
  font-size: 13px;
  color: #6b7280;
}
.mb {
  margin-bottom: 14px;
}
.ip {
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 14px;
  color: #1f2430;
}
.port {
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 12px;
  color: #9ca3af;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.plat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.plat-btn {
  width: 92px;
  flex: 0 0 92px;
}
.auth-text {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.auth-text.ok {
  color: #16a34a;
}
.auth-text.warn {
  color: #d97706;
}
.auth-text.muted {
  color: #c0c4cc;
}
.test-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.test-row .el-input {
  flex: 1;
}
.test-btn {
  flex: 0 0 104px;
  width: 104px;
}
.preview-row {
  display: flex;
}
.preview-btn {
  width: 100%;
}
.log-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  border: none;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 -4px 14px rgba(15, 23, 42, 0.12);
}
.log-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid #eef0f4;
  background: #fafbfc;
}
.log-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.log-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.log-box {
  height: 180px;
  overflow-y: auto;
  padding: 8px 14px;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 12px;
  line-height: 1.8;
  background: #0f172a;
}
.log-line {
  display: flex;
  gap: 8px;
  align-items: baseline;
}
.log-time {
  color: #64748b;
  flex: 0 0 auto;
}
.log-tag {
  color: #38bdf8;
  flex: 0 0 auto;
}
.log-msg {
  color: #cbd5e1;
  word-break: break-word;
  white-space: pre-wrap;
}
.log-line.lv-success .log-msg { color: #4ade80; }
.log-line.lv-warn .log-msg { color: #fbbf24; }
.log-line.lv-error .log-msg { color: #f87171; }
.log-empty {
  color: #475569;
}
.hint {
  margin-top: 14px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
