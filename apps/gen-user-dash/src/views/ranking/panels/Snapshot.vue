<template>
  <div class="p-wrap">
    <div class="p-hd">
      <h2>搜索快照下载</h2>
      <p>按监控问题回放 AI 回答截图快照，支持批量下载</p>
    </div>

    <PreCollectionEmpty v-if="pending" title="搜索快照下载" />

    <template v-else>
      <div class="p-toolbar">
        <div class="p-seg">
          <span class="p-seg-label">监控问题</span>
          <select v-model="topicId" class="p-select" @change="load">
            <option :value="0">全部问题</option>
            <option v-for="t in topics" :key="t.query_id" :value="t.query_id">{{ t.name }}</option>
          </select>
        </div>
        <div class="p-seg">
          <span class="p-seg-label">日期</span>
          <input v-model="date" type="date" class="p-select" @change="load" />
        </div>
        <button class="p-btn" :disabled="!list.length" @click="downloadAll">批量下载</button>
      </div>

      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">快照列表</div>
            <div class="p-card-s">截图快照上传功能暂未开放（采集 worker 截图留待后续），当前列表为空</div>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!list.length" class="p-empty">暂无快照记录</div>
          <div v-else class="p-table">
            <div class="p-tr p-th">
              <span class="c-i">#</span>
              <span class="c-n">平台</span>
              <span class="c-n">执行日期</span>
              <span class="c-p">操作</span>
            </div>
            <div v-for="(s, i) in list" :key="s.id" class="p-tr">
              <span class="c-i">{{ i + 1 }}</span>
              <span class="c-n">{{ s.platform }}</span>
              <span class="c-n">{{ s.exec_date }}</span>
              <span class="c-p">
                <a v-if="s.photo_url" :href="s.photo_url" target="_blank" class="p-link">查看</a>
                <span v-else class="p-none">—</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import PreCollectionEmpty from '@/components/PreCollectionEmpty.vue';

const pending = ref(true);
const topics = ref<any[]>([]);
const list = ref<any[]>([]);
const topicId = ref(0);
const date = ref('');

async function load() {
  try {
    const resp: any = await monitorApi.snapshotList(date.value, topicId.value, 1);
    list.value = resp?.list || [];
  } catch { list.value = []; }
}

function downloadAll() {
  const blob = new Blob([JSON.stringify(list.value, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `snapshot-${date.value || 'all'}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

onMounted(async () => {
  try {
    const st = await monitorApi.queryStatus();
    pending.value = !!st?.pending;
    if (!st?.pending) {
      const t: any = await monitorApi.siTopics();
      topics.value = Array.isArray(t) ? t : [];
      const d = new Date();
      date.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      await load();
    }
  } catch { pending.value = false; }
});
</script>

<style scoped lang="scss">
.p-wrap { margin: -16px -24px; padding: 28px 36px 96px; background: #f8fafc; min-height: calc(100vh - 32px); display: flex; flex-direction: column; gap: 16px; }
.p-hd h2 { font-size: 22px; font-weight: 800; color: #0f1115; margin: 0; line-height: 33px; }
.p-hd p { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }
.p-toolbar { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 16px; }
.p-seg { display: flex; align-items: center; gap: 8px; }
.p-seg-label { font-size: 12px; color: #6b7280; }
.p-select { border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; font-size: 12.5px; color: #111827; background: #fff; outline: none; min-width: 180px; }
.p-btn { margin-left: auto; background: #4f46e5; color: #fff; border: none; border-radius: 9px; padding: 8px 16px; font-size: 12.5px; font-weight: 700; cursor: pointer; }
.p-btn:disabled { background: #c7d2fe; cursor: not-allowed; }
.p-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.p-card-h { padding: 14px 18px; border-bottom: 1px solid #f0f1f5; }
.p-card-t { font-size: 14.5px; font-weight: 800; color: #0f1115; }
.p-card-s { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }
.p-body { padding: 16px 18px 18px; }
.p-empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 36px 0; }
.p-table { display: flex; flex-direction: column; }
.p-tr { display: grid; grid-template-columns: 60px 160px 1fr 120px; gap: 10px; align-items: center; padding: 11px 12px; border-bottom: 1px solid #f0f1f5; }
.p-tr:last-child { border-bottom: none; }
.p-th { background: #f5f6fa; border-radius: 8px; padding: 9px 12px; font-size: 11.5px; font-weight: 600; color: #5b606a; border-bottom: none; }
.c-i { font-size: 13px; font-weight: 700; color: #9ca3af; }
.c-n { font-size: 13px; color: #111827; }
.c-p { text-align: center; }
.p-link { color: #4f46e5; font-size: 12.5px; font-weight: 600; text-decoration: none; }
.p-none { color: #d1d5db; }
</style>
