<template>
  <div class="p-wrap">
    <div class="p-hd">
      <h2>信源平台偏好</h2>
      <p>各 AI 引擎引用信源的偏好分布（本期 vs 上期）</p>
    </div>

    <PreCollectionEmpty v-if="pending" title="信源平台偏好" />

    <template v-else>
      <div class="p-kpis">
        <div class="p-kpi">
          <div class="p-kpi-label">本期被引总量</div>
          <div class="p-kpi-value">{{ totalCur }}</div>
          <div class="p-kpi-sub">各引擎信源被引次数之和</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">引用最多的引擎</div>
          <div class="p-kpi-value">{{ topEngineName }}</div>
          <div class="p-kpi-sub">{{ topEngineCount }} 次被引</div>
        </div>
      </div>

      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">引擎引用对比</div>
            <div class="p-card-s">本期与上期各引擎信源被引次数</div>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!totalCur" class="p-empty">暂无信源引用数据（本期与上期均为空）</div>
          <div v-else class="p-cmp">
            <div v-for="r in rows" :key="r.key" class="p-cmp-row">
              <span class="p-cmp-name"><i :style="{ background: r.color }"></i>{{ r.name }}</span>
              <span class="p-cmp-track">
                <i class="cur" :style="{ width: barW(r.cur), background: r.color }"></i>
              </span>
              <span class="p-cmp-track">
                <i class="cmp" :style="{ width: barW(r.cmp), background: '#d1d5db' }"></i>
              </span>
              <span class="p-cmp-v cur">{{ r.cur }}</span>
              <span class="p-cmp-v cmp">{{ r.cmp }}</span>
              <span class="p-cmp-v"><em :class="r.delta >= 0 ? 'p-up' : 'p-down'">{{ r.delta >= 0 ? '+' : '' }}{{ r.delta }}</em></span>
            </div>
          </div>
          <div class="p-legend"><i class="cur"></i>本期被引 <i class="cmp"></i>上期被引</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import PreCollectionEmpty from '@/components/PreCollectionEmpty.vue';
import { ENGINE_KEYS, engineName, engineColor, lastNDays } from '@/utils/engines';

const pending = ref(true);
const current = ref<Record<string, number>>({});
const compare = ref<Record<string, number>>({});

const rows = computed(() => (ENGINE_KEYS as readonly string[]).map(k => ({
  key: k, name: engineName(k), color: engineColor(k),
  cur: current.value[k] || 0, cmp: compare.value[k] || 0,
  delta: (current.value[k] || 0) - (compare.value[k] || 0),
})).sort((a, b) => b.cur - a.cur));

const totalCur = computed(() => rows.value.reduce((s, r) => s + r.cur, 0));
const maxVal = computed(() => Math.max(1, ...rows.value.map(r => Math.max(r.cur, r.cmp))));
const topEngine = computed(() => rows.value[0]);
const topEngineName = computed(() => (topEngine.value ? topEngine.value.name : '—'));
const topEngineCount = computed(() => (topEngine.value ? topEngine.value.cur : 0));
const barW = (v: number) => `${Math.max(0, Math.min(100, (v / maxVal.value) * 100))}%`;

onMounted(async () => {
  try {
    const st = await monitorApi.queryStatus();
    pending.value = !!st?.pending;
    if (!st?.pending) {
      const { start, end } = lastNDays(7);
      const cs = new Date(); cs.setDate(cs.getDate() - 14);
      const ce = new Date(); ce.setDate(ce.getDate() - 7);
      const f = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const resp: any = await monitorApi.siEnginePreference(start, end, f(cs), f(ce));
      current.value = resp?.current || {};
      compare.value = resp?.compare || {};
    }
  } catch { pending.value = false; }
});
</script>

<style scoped lang="scss">
.p-wrap { margin: -16px -24px; padding: 28px 36px 96px; background: #f8fafc; min-height: calc(100vh - 32px); display: flex; flex-direction: column; gap: 16px; }
.p-hd h2 { font-size: 22px; font-weight: 800; color: #0f1115; margin: 0; line-height: 33px; }
.p-hd p { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }
.p-kpis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; max-width: 640px; }
.p-kpi { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 18px; }
.p-kpi-label { font-size: 12px; color: #6b7280; }
.p-kpi-value { font-size: 24px; font-weight: 800; color: #111827; margin-top: 6px; line-height: 1.2; }
.p-kpi-sub { font-size: 11px; color: #9ca3af; margin-top: 4px; }
.p-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.p-card-h { padding: 14px 18px; border-bottom: 1px solid #f0f1f5; }
.p-card-t { font-size: 14.5px; font-weight: 800; color: #0f1115; }
.p-card-s { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }
.p-body { padding: 16px 18px 18px; }
.p-empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 36px 0; }
.p-cmp { display: flex; flex-direction: column; gap: 12px; }
.p-cmp-row { display: grid; grid-template-columns: 90px 1fr 1fr 56px 56px 56px; gap: 10px; align-items: center; }
.p-cmp-name { font-size: 12.5px; color: #374151; display: flex; align-items: center; gap: 6px; }
.p-cmp-name i { width: 8px; height: 8px; border-radius: 50%; }
.p-cmp-track { height: 9px; background: #f3f4f6; border-radius: 100px; overflow: hidden; }
.p-cmp-track i { display: block; height: 100%; border-radius: 100px; min-width: 2px; }
.p-cmp-v { font-size: 12.5px; font-weight: 700; color: #111827; text-align: right; }
.p-cmp-v.cmp { color: #9ca3af; font-weight: 600; }
.p-up { font-style: normal; color: #059669; }
.p-down { font-style: normal; color: #dc2626; }
.p-legend { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #9ca3af; margin-top: 14px; }
.p-legend i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
.p-legend i.cur { background: #4f46e5; }
.p-legend i.cmp { background: #d1d5db; margin-left: 10px; }
</style>
