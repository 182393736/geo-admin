<template>
  <div class="p-wrap">
    <div class="p-hd">
      <h2>导出品牌透视报告</h2>
      <p>将已生成的周报 / 月报导出为 HTML 或 JSON 存档</p>
    </div>

    <PreCollectionEmpty v-if="pending" title="导出品牌透视报告" />

    <template v-else>
      <div class="p-toolbar">
        <div class="p-seg">
          <span class="p-seg-label">报告类型</span>
          <select v-model="periodType" class="p-select" @change="reload">
            <option value="weekly">周报</option>
            <option value="monthly">月报</option>
          </select>
        </div>
        <span class="p-upd">共 {{ reports.length }} 期报告</span>
      </div>

      <div v-if="!reports.length" class="p-card">
        <div class="p-body"><div class="p-empty">暂无已生成报告（采集完成后可生成）</div></div>
      </div>

      <div v-for="r in reports" :key="r.period_key" class="p-card">
        <div class="p-row">
          <div class="p-row-main">
            <div class="p-row-t">{{ r.label }}</div>
            <div class="p-row-s">周期 {{ r.range || '—' }} · 状态 {{ statusTxt(r.status) }} · 生成于 {{ fmtTime(r.generated_at) }}</div>
          </div>
          <div class="p-row-actions">
            <button class="p-btn ghost" @click="downloadReport(r, 'html')">导出 HTML</button>
            <button class="p-btn" @click="downloadReport(r, 'json')">导出 JSON</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import { reportApi } from '@/api/modules/report';
import PreCollectionEmpty from '@/components/PreCollectionEmpty.vue';

const pending = ref(true);
const periodType = ref<'weekly' | 'monthly'>('weekly');
const reports = ref<any[]>([]);

const statusTxt = (s: string) => (s === 'ready' ? '已就绪' : s === 'generating' ? '生成中' : s === 'failed' ? '失败' : s);
const fmtTime = (t: string) => (t ? String(t).replace('T', ' ').slice(0, 16) : '—');

async function reload() {
  try {
    const resp: any = await reportApi.list(periodType.value);
    reports.value = resp?.list || [];
  } catch { reports.value = []; }
}

function toHtml(r: any) {
  const p = r.payload || {};
  const rows = [
    ['品牌提及率', p.metrics?.find((m: any) => m.key === 'mention_rate')?.value + '%'],
    ['Top3 推荐率', p.metrics?.find((m: any) => m.key === 'top3_rate')?.value + '%'],
    ['首位推荐率', p.metrics?.find((m: any) => m.key === 'first_rate')?.value + '%'],
    ['口碑分', p.metrics?.find((m: any) => m.key === 'rep_score')?.value],
    ['引用源总量', p.metrics?.find((m: any) => m.key === 'sources')?.value],
  ];
  return `<!doctype html><meta charset="utf-8"><title>${r.label}</title>
  <style>body{font-family:sans-serif;max-width:820px;margin:40px auto;color:#111827}
  h1{font-size:22px} table{width:100%;border-collapse:collapse;margin-top:16px}
  td,th{border:1px solid #e5e7eb;padding:10px 12px;text-align:left;font-size:14px}
  th{background:#f9fafb}</style>
  <h1>${r.label}</h1><p>周期 ${r.range || '—'} · 生成于 ${r.generated_at || '—'}</p>
  <table><tr><th>指标</th><th>值</th></tr>${rows.map(x => `<tr><td>${x[0]}</td><td>${x[1] ?? '—'}</td></tr>`).join('')}</table>`;
}

function downloadReport(r: any, kind: 'html' | 'json') {
  const content = kind === 'json' ? JSON.stringify(r, null, 2) : toHtml(r);
  const type = kind === 'json' ? 'application/json' : 'text/html';
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${r.period_key}.${kind === 'json' ? 'json' : 'html'}`;
  a.click();
  URL.revokeObjectURL(a.href);
}

onMounted(async () => {
  try {
    const st = await monitorApi.queryStatus();
    pending.value = !!st?.pending;
    if (!st?.pending) await reload();
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
.p-select { border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; font-size: 12.5px; color: #111827; background: #fff; outline: none; }
.p-upd { margin-left: auto; font-size: 12px; color: #9ca3af; }
.p-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.p-body { padding: 16px 18px 18px; }
.p-empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 36px 0; }
.p-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid #f0f1f5; }
.p-row:last-child { border-bottom: none; }
.p-row-main { flex: 1; min-width: 0; }
.p-row-t { font-size: 14px; font-weight: 700; color: #111827; }
.p-row-s { font-size: 12px; color: #9ca3af; margin-top: 3px; }
.p-row-actions { display: flex; gap: 8px; }
.p-btn { background: #4f46e5; color: #fff; border: none; border-radius: 9px; padding: 8px 14px; font-size: 12.5px; font-weight: 700; cursor: pointer; }
.p-btn.ghost { background: #fff; color: #4f46e5; border: 1px solid #e0e7ff; }
</style>
