<template>
  <div class="page">
    <header class="hd">
      <div>
        <h1 class="title">采集应用</h1>
        <p class="sub">IP 代理列表 · 每个 IP 一个独立浏览器会话 · 5 平台标签页</p>
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
      <el-table-column label="IP" min-width="180">
        <template #default="{ row }">
          <span class="ip">{{ row.ip }}</span>
          <span v-if="row.port" class="port">:{{ row.port }}</span>
        </template>
      </el-table-column>

      <el-table-column label="平台" min-width="400">
        <template #default="{ row }">
          <div class="plat">
            <el-button
              v-for="p in platforms"
              :key="p.key"
              size="small"
              :type="isPlatformOpen(row.ip, p.key) ? 'success' : 'default'"
              :plain="isPlatformOpen(row.ip, p.key)"
              @click="togglePlatform(row, p)"
            >{{ isPlatformOpen(row.ip, p.key) ? p.name + ' · 已开' : p.name }}</el-button>
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

    <p class="hint">提示：平台按钮再次点击关闭该标签页；浏览器按钮再次点击关闭整个浏览器会话（登录等数据保留在磁盘，可再打开）。</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import platforms from '../shared/platforms.json';

const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
const rows = ref([]);
const total = ref(0);
const loading = ref(false);
const opening = ref('');                 // 正在打开浏览器的 ip
const openedBrowsers = ref({});          // ip -> true（该 IP 的浏览器会话已打开）
const openedPlatforms = ref({});         // `${ip}:${platform}` -> true

const isBrowserOpen = ip => !!openedBrowsers.value[ip];
const isPlatformOpen = (ip, platform) => !!openedPlatforms.value[`${ip}:${platform}`];

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
    // 关闭整个浏览器会话（带确认，避免误触）
    try {
      await ElMessageBox.confirm(`确定关闭 ${row.ip} 的浏览器会话？（会话数据保留在磁盘，可再次打开）`, '关闭浏览器', {
        type: 'warning', confirmButtonText: '关闭', cancelButtonText: '取消',
      });
    } catch { return; }
    try {
      const r = await window.electronAPI.closeBrowser(row.ip);
      if (r && r.ok) {
        openedBrowsers.value[row.ip] = false;
        // 会话关闭后，其下所有平台 tab 一并失效
        for (const k of Object.keys(openedPlatforms.value)) {
          if (k.startsWith(`${row.ip}:`)) delete openedPlatforms.value[k];
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
  // 打开浏览器会话
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
    // 关闭该平台标签页
    try {
      const r = await window.electronAPI.closePlatform(row.ip, p.key);
      if (r && r.ok) {
        openedPlatforms.value[key] = false;
        ElMessage.info(`已关闭 ${row.ip} · ${p.name}`);
      } else {
        ElMessage.error('关闭失败：' + ((r && r.error) || '未知错误'));
      }
    } catch (e) {
      ElMessage.error('关闭失败：' + (e && e.message ? e.message : e));
    }
    return;
  }
  // 打开该平台标签页
  try {
    const r = await window.electronAPI.openPlatform(row.ip, p.key);
    if (r && r.ok) {
      openedPlatforms.value[key] = true;
      openedBrowsers.value[row.ip] = true; // 平台打开会顺带拉起该 IP 的浏览器会话
      ElMessage.success(`已打开 ${row.ip} · ${p.name}`);
    } else {
      ElMessage.error('打开失败：' + ((r && r.error) || '未知错误'));
    }
  } catch (e) {
    ElMessage.error('打开失败：' + (e && e.message ? e.message : e));
  }
}

onMounted(load);
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
  padding: 20px 24px 32px;
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
.plat {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.hint {
  margin-top: 14px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
