<template>
  <div class="p-wrap">
    <div class="p-hd">
      <h2>AI排名透视</h2>
      <p>实时位次 · 逐题下钻 · 提及率 / Top3 推荐率 / 首位推荐率趋势</p>
    </div>

    <!-- 采集前空态 -->
    <PreCollectionEmpty v-if="pending" title="AI排名透视" />

    <template v-else>
      <!-- 日期筛选 -->
      <div class="p-toolbar">
        <div class="p-seg">
          <span class="p-seg-label">统计日</span>
          <select v-model="date" class="p-select" @change="loadMatrix">
            <option v-for="d in dates" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <span v-if="dates.length" class="p-upd">最新数据日 {{ dates[0] }} · 自动随采集刷新</span>
      </div>

      <!-- 三率概览 -->
      <div class="p-kpis">
        <div class="p-kpi">
          <div class="p-kpi-label">品牌提及率</div>
          <div class="p-kpi-value">{{ fmtPct(rateSummary.mention) }}</div>
          <div class="p-kpi-sub">被提及采样占比（不限位次）</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">Top3 推荐率</div>
          <div class="p-kpi-value">{{ fmtPct(rateSummary.top3) }}</div>
          <div class="p-kpi-sub">进入前三的采样占比</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">首位推荐率</div>
          <div class="p-kpi-value">{{ fmtPct(rateSummary.first) }}</div>
          <div class="p-kpi-sub">排到首位的采样占比</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">监控问题</div>
          <div class="p-kpi-value">{{ rows.length }}</div>
          <div class="p-kpi-sub">{{ engines.length }} 个 AI 引擎每日采集</div>
        </div>
      </div>

      <!-- 排名矩阵 -->
      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">排名矩阵</div>
            <div class="p-card-s">每个监控问题在 {{ engines.length }} 个引擎的代表位次（未提及 = 该引擎当日未推荐）</div>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!rows.length" class="p-empty">该日暂无排名数据（采集或解析尚未产出）</div>
          <div v-else class="p-table">
            <div class="p-tr p-th">
              <span class="c-q">监控问题</span>
              <span v-for="e in engines" :key="e" class="c-e">{{ engineName(e) }}</span>
              <span class="c-c">榜一竞品</span>
              <span class="c-r">提及率</span>
              <span class="c-r">Top3</span>
              <span class="c-r">首位</span>
            </div>
            <div v-for="(row, i) in rows" :key="i" class="p-tr">
              <span class="c-q" :title="row.query">{{ row.query }}</span>
              <span v-for="e in engines" :key="e" class="c-e">
                <em :class="rankCls(row.rank_value[e])">{{ fmtRank(row.rank_value[e]) }}</em>
              </span>
              <span class="c-c">{{ row.competitor }}</span>
              <span class="c-r">{{ fmtPct(row.mention_rate) }}</span>
              <span class="c-r">{{ fmtPct(row.top3_mention_rate) }}</span>
              <span class="c-r">{{ fmtPct(row.first_mention_rate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 三率趋势 -->
      <div class="p-grid2">
        <div class="p-card">
          <div class="p-card-h">
            <div>
              <div class="p-card-t">品牌提及率趋势</div>
              <div class="p-card-s">被提及采样占比（不限位次）</div>
            </div>
          </div>
          <div class="p-body">
            <div v-if="!trends.mention.length" class="p-empty">暂无趋势数据</div>
            <SparkLine v-else :points="trends.mention" :labels="trends.labels" color="#4f46e5" unit="%" :digits="2" />
          </div>
        </div>
        <div class="p-card">
          <div class="p-card-h">
            <div>
              <div class="p-card-t">Top3 推荐率趋势</div>
              <div class="p-card-s">进入前三的采样占比</div>
            </div>
          </div>
          <div class="p-body">
            <div v-if="!trends.top3.length" class="p-empty">暂无趋势数据</div>
            <SparkLine v-else :points="trends.top3" :labels="trends.labels" color="#059669" unit="%" :digits="2" />
          </div>
        </div>
        <div class="p-card">
          <div class="p-card-h">
            <div>
              <div class="p-card-t">首位推荐率趋势</div>
              <div class="p-card-s">排到首位的采样占比</div>
            </div>
          </div>
          <div class="p-body">
            <div v-if="!trends.first.length" class="p-empty">暂无趋势数据</div>
            <SparkLine v-else :points="trends.first" :labels="trends.labels" color="#d97706" unit="%" :digits="2" />
          </div>
        </div>
        <div class="p-card">
          <div class="p-card-h">
            <div>
              <div class="p-card-t">逐引擎提及率</div>
              <div class="p-card-s">各引擎本期平均提及率对比</div>
            </div>
          </div>
          <div class="p-body">
            <div class="p-ebars">
              <div v-for="e in engines" :key="e" class="p-ebar-row">
                <span class="p-ebar-name"><i :style="{ background: engineColor(e) }"></i>{{ engineName(e) }}</span>
                <span class="p-ebar-track"><i :style="{ width: barWidth(engineAvg[e]) , background: engineColor(e) }"></i></span>
                <span class="p-ebar-v">{{ fmtPct(engineAvg[e]) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import PreCollectionEmpty from '@/components/PreCollectionEmpty.vue';
import SparkLine from '@/components/SparkLine.vue';
import { ENGINE_KEYS, engineName, engineColor, fmtPct, fmtRank, fmtNum, lastNDays } from '@/utils/engines';

const pending = ref(true);
const date = ref('');
const dates = ref<string[]>([]);
const matrix = ref<any>({ list: {}, platforms: ENGINE_KEYS });
const mentionTrend = ref<any>({ trend: [] });
const top3Trend = ref<any>({ trend: [] });
const firstTrend = ref<any>({ trend: [] });

const engines = ENGINE_KEYS as readonly string[];
const rows = computed(() => Object.values(matrix.value.list || {}));

const rateSummary = computed(() => {
  const list = rows.value;
  const avg = (k: string) => (list.length ? list.reduce((s: number, r: any) => s + (Number(r[k]) || 0), 0) / list.length : 0);
  return { mention: avg('mention_rate'), top3: avg('top3_mention_rate'), first: avg('first_mention_rate') };
});

const engineAvg = computed(() => {
  const m: Record<string, number> = {};
  for (const e of engines) {
    const sum = rows.value.reduce((s: number, r: any) => s + (Number(r.rank_value && r.rank_value[e] !== '未提及' ? 1 : 0)), 0);
    m[e] = rows.value.length ? (sum / rows.value.length) * 100 : 0;
  }
  return m;
});

const trends = computed(() => ({
  labels: (mentionTrend.value.trend || []).map((t: any) => fmtDate(t.date_day)),
  mention: (mentionTrend.value.trend || []).map((t: any) => t.rate ?? 0),
  top3: (top3Trend.value.trend || []).map((t: any) => t.rate ?? 0),
  first: (firstTrend.value.trend || []).map((t: any) => t.rate ?? 0),
}));

const barWidth = (v: number) => `${Math.max(0, Math.min(100, v))}%`;
const rankCls = (v: any) => (v == null || v === '' || v === '未提及' ? 'none' : Number(v) <= 3 ? 'top' : 'normal');

async function loadMatrix() {
  try {
    const qs = await monitorApi.queryList('industry');
    const qids = (qs?.list || []).map((q: any) => q.id).filter((n: number) => Number.isFinite(n));
    if (qids.length) {
      const m = await monitorApi.fullRankingMatrix(qids, date.value);
      matrix.value = m;
      dates.value = (m.valid_data_date_list || []).slice().sort().reverse();
    }
  } catch { /* 保持空态 */ }
}

async function loadTrends() {
  try {
    const { start, end } = lastNDays(7);
    const [a, b, c] = await Promise.all([
      monitorApi.mentionRateTrend(start, end),
      monitorApi.top3RateTrend(start, end),
      monitorApi.firstRateTrend(start, end),
    ]);
    mentionTrend.value = a; top3Trend.value = b; firstTrend.value = c;
  } catch { /* 保持空态 */ }
}

onMounted(async () => {
  try {
    const st = await monitorApi.queryStatus();
    pending.value = !!st?.pending;
    if (!st?.pending) {
      await loadTrends();
      await loadMatrix();
      if (!date.value && dates.value.length) date.value = dates.value[0];
      if (date.value) await loadMatrix();
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
.p-select { border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; font-size: 12.5px; color: #111827; background: #fff; outline: none; }
.p-upd { margin-left: auto; font-size: 12px; color: #9ca3af; }
.p-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
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
.p-table { display: flex; flex-direction: column; }
.p-tr { display: grid; grid-template-columns: minmax(220px, 2.2fr) repeat(4, 80px) minmax(120px, 1.2fr) repeat(3, 72px); gap: 10px; align-items: center; padding: 11px 12px; border-bottom: 1px solid #f0f1f5; }
.p-tr:last-child { border-bottom: none; }
.p-th { background: #f5f6fa; border-radius: 8px; padding: 9px 12px; font-size: 11.5px; font-weight: 600; color: #5b606a; border-bottom: none; }
.c-q { font-size: 13px; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c-e { text-align: center; }
.c-e em { font-style: normal; font-size: 12.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
.c-e em.top { color: #047857; background: #ecfdf5; }
.c-e em.normal { color: #4338ca; background: #eef2ff; }
.c-e em.none { color: #9ca3af; background: #f3f4f6; }
.c-c { font-size: 12.5px; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c-r { text-align: right; font-size: 13px; font-weight: 600; color: #374151; }
.p-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.p-ebars { display: flex; flex-direction: column; gap: 12px; }
.p-ebar-row { display: grid; grid-template-columns: 90px 1fr 64px; gap: 10px; align-items: center; }
.p-ebar-name { font-size: 12.5px; color: #374151; display: flex; align-items: center; gap: 6px; }
.p-ebar-name i { width: 8px; height: 8px; border-radius: 50%; display: block; }
.p-ebar-track { height: 8px; background: #f3f4f6; border-radius: 100px; overflow: hidden; }
.p-ebar-track i { display: block; height: 100%; border-radius: 100px; }
.p-ebar-v { font-size: 12.5px; font-weight: 700; color: #111827; text-align: right; }
@media (max-width: 900px) { .p-kpis { grid-template-columns: 1fr 1fr; } .p-grid2 { grid-template-columns: 1fr; } }
</style>
