<template>
  <div class="p-wrap">
    <div class="p-hd">
      <h2>AI 口碑分析</h2>
      <p>定性分析 AI 回答内容的语义理解与情感倾向</p>
    </div>

    <PreCollectionEmpty v-if="pending" title="AI 口碑分析" />

    <template v-else>
      <!-- 监控问题选择 -->
      <div class="p-toolbar">
        <div class="p-seg">
          <span class="p-seg-label">口碑问题</span>
          <select v-model="queryId" class="p-select" @change="loadReputation">
            <option v-for="q in brandQueries" :key="q.id" :value="q.id">{{ q.query }}</option>
          </select>
        </div>
        <span class="p-upd">{{ brandQueries.length }} 个口碑监控问题</span>
      </div>

      <!-- 口碑分网格 -->
      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">口碑评分网格</div>
            <div class="p-card-s">品牌口碑分（0–100，越高越正面）：今日 vs 昨日，按引擎拆解</div>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!gridRows.length" class="p-empty">暂无口碑分数据</div>
          <div v-else class="p-grid">
            <div v-for="r in gridRows" :key="r.key" class="p-score">
              <div class="p-score-h"><i :style="{ background: r.color }"></i>{{ r.name }}</div>
              <div class="p-score-v">{{ r.today }}</div>
              <div class="p-score-d">
                昨日 {{ r.yesterday }}
                <em :class="r.trend === 'up' ? 'p-up' : r.trend === 'down' ? 'p-down' : 'p-flat'">
                  {{ r.trend === 'up' ? '↑' : r.trend === 'down' ? '↓' : '—' }} {{ r.delta }}
                </em>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-grid2">
        <!-- 情感占比 -->
        <div class="p-card">
          <div class="p-card-h">
            <div>
              <div class="p-card-t">情感倾向占比</div>
              <div class="p-card-s">正面 / 中性 / 负面观点比例</div>
            </div>
          </div>
          <div class="p-body">
            <div class="p-senti">
              <div class="p-senti-bar">
                <i class="pos" :style="{ width: pct(ratio.positive) }"></i>
                <i class="neu" :style="{ width: pct(ratio.neutral) }"></i>
                <i class="neg" :style="{ width: pct(ratio.negative) }"></i>
              </div>
              <div class="p-senti-legend">
                <span><i class="pos"></i>正面 {{ fmtPct100(ratio.positive) }}</span>
                <span><i class="neu"></i>中性 {{ fmtPct100(ratio.neutral) }}</span>
                <span><i class="neg"></i>负面 {{ fmtPct100(ratio.negative) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 口碑分趋势 -->
        <div class="p-card">
          <div class="p-card-h">
            <div>
              <div class="p-card-t">口碑分趋势</div>
              <div class="p-card-s">逐日口碑分变化</div>
            </div>
          </div>
          <div class="p-body">
            <div v-if="!scorePoints.length" class="p-empty">暂无趋势数据</div>
            <SparkLine v-else :points="scorePoints" :labels="scoreLabels" color="#059669" :digits="0" />
          </div>
        </div>
      </div>

      <!-- 观点标签 -->
      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">观点标签</div>
            <div class="p-card-s">AI 回答中提取的观点主题与变体数（按情感极性分组）</div>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!topicGroups.length" class="p-empty">暂无观点数据（口碑题解析尚未产出）</div>
          <div v-else class="p-topics">
            <div v-for="g in topicGroups" :key="g.polarity" class="p-topic-group">
              <div class="p-topic-group-h">
                <em :class="g.polarity"></em>{{ g.label }}
                <span class="p-topic-count">{{ g.total }} 条观点</span>
              </div>
              <div class="p-topic-chips">
                <span v-for="t in g.topics" :key="t.label" class="p-chip">
                  {{ t.label }}
                  <b v-if="t.variants_count > 1">×{{ t.variants_count }}</b>
                </span>
                <span v-if="!g.topics.length" class="p-none">暂无</span>
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
import { ENGINE_KEYS, engineName, engineColor, fmtDate, lastNDays } from '@/utils/engines';

const pending = ref(true);
const brandQueries = ref<any[]>([]);
const queryId = ref<number>(0);
const grid = ref<any>(null);
const reputation = ref<any>(null);

const gridRows = computed(() => {
  const g = grid.value;
  if (!g || !g.list || !g.list.all) return [];
  const all = g.list.all;
  const today = all.today_score || {};
  const yest = all.yesterday_score || {};
  const change = all.change || {};
  const rows = [{ key: 'all', name: '全部引擎', color: '#4f46e5', today: today.all, yesterday: yest.all, change: change.all }];
  for (const k of ENGINE_KEYS as readonly string[]) {
    rows.push({ key: k, name: engineName(k), color: engineColor(k), today: today[k], yesterday: yest[k], change: change[k] });
  }
  return rows.map(r => ({
    ...r,
    today: r.today ?? 0,
    yesterday: r.yesterday ?? 0,
    delta: r.change ? r.change.value ?? 0 : 0,
    trend: r.change ? r.change.trend : 'flat',
  }));
});

const analysis = computed(() => {
  const r = reputation.value;
  const res = (r?.result && r.result[0]) || {};
  return res.reputation_analysis || { ratio: { positive: 0, neutral: 0, negative: 0 }, positive: {}, neutral: {}, negative: {} };
});
const ratio = computed(() => analysis.value.ratio || { positive: 0, neutral: 0, negative: 0 });

const scoreResult = computed(() => {
  const r = reputation.value;
  const sr = r?.score_result || [];
  const byDate: Record<string, number[]> = {};
  for (const s of sr) {
    const d = s.date_day || s.date || '';
    if (!d) continue;
    (byDate[d] ||= []).push(Number(s.score) || 0);
  }
  return Object.keys(byDate).sort().map(d => {
    const arr = byDate[d];
    return { date: d, score: arr.reduce((a: number, b: number) => a + b, 0) / arr.length };
  });
});
const scorePoints = computed(() => scoreResult.value.map(x => x.score));
const scoreLabels = computed(() => scoreResult.value.map(x => fmtDate(x.date)));

const topicGroups = computed(() => {
  const a = analysis.value;
  const groups = [
    { polarity: 'positive', label: '正面观点', map: a.positive || {} },
    { polarity: 'neutral', label: '中性观点', map: a.neutral || {} },
    { polarity: 'negative', label: '负面观点', map: a.negative || {} },
  ];
  return groups.map(g => {
    const topics = Object.entries(g.map).map(([label, v]: [string, any]) => ({
      label,
      variants_count: v?.variants_count || 0,
    })).sort((x, y) => y.variants_count - x.variants_count);
    return { ...g, topics, total: topics.reduce((s, t) => s + t.variants_count, 0) };
  });
});

const pct = (v: number) => `${Math.max(0, Math.min(100, (v || 0) * 100))}%`;
const fmtPct100 = (v: number) => `${((v || 0) * 100).toFixed(1)}%`;

async function loadGrid() {
  try {
    const qids = brandQueries.value.map((q: any) => q.id).filter((n: number) => Number.isFinite(n));
    const { end } = lastNDays(1);
    if (qids.length) grid.value = await monitorApi.aiRankingMatrix(qids, end);
  } catch { grid.value = null; }
}

async function loadReputation() {
  try {
    if (!queryId.value) return;
    const { start, end } = lastNDays(14);
    reputation.value = await monitorApi.reputationData(queryId.value, start, end);
  } catch { reputation.value = null; }
}

onMounted(async () => {
  try {
    const st = await monitorApi.queryStatus();
    pending.value = !!st?.pending;
    if (!st?.pending) {
      const qs = await monitorApi.queryList('brand');
      brandQueries.value = qs?.list || [];
      if (brandQueries.value.length) queryId.value = brandQueries.value[0].id;
      await loadGrid();
      await loadReputation();
    }
  } catch { pending.value = false; }
});
</script>

<style scoped lang="scss">
.p-wrap { max-width: 1240px; margin: 0 auto; padding: 28px 36px 80px; display: flex; flex-direction: column; gap: 16px; }
.p-hd h2 { font-size: 22px; font-weight: 800; color: #0f1115; margin: 0; line-height: 33px; }
.p-hd p { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }
.p-toolbar { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 16px; }
.p-seg { display: flex; align-items: center; gap: 8px; }
.p-seg-label { font-size: 12px; color: #6b7280; }
.p-select { border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; font-size: 12.5px; color: #111827; background: #fff; outline: none; min-width: 260px; }
.p-upd { margin-left: auto; font-size: 12px; color: #9ca3af; }
.p-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.p-card-h { padding: 14px 18px; border-bottom: 1px solid #f0f1f5; }
.p-card-t { font-size: 14.5px; font-weight: 800; color: #0f1115; }
.p-card-s { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }
.p-body { padding: 16px 18px 18px; }
.p-empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 36px 0; }
.p-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.p-score { border: 1px solid #f0f1f5; border-radius: 12px; padding: 14px; background: #f9fafb; }
.p-score-h { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #374151; }
.p-score-h i { width: 8px; height: 8px; border-radius: 50%; }
.p-score-v { font-size: 28px; font-weight: 800; color: #111827; margin-top: 8px; line-height: 1; }
.p-score-d { font-size: 11.5px; color: #9ca3af; margin-top: 8px; }
.p-up { font-style: normal; color: #059669; }
.p-down { font-style: normal; color: #dc2626; }
.p-flat { font-style: normal; color: #9ca3af; }
.p-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.p-senti { display: flex; flex-direction: column; gap: 14px; padding: 8px 0; }
.p-senti-bar { display: flex; height: 14px; border-radius: 100px; overflow: hidden; background: #f3f4f6; }
.p-senti-bar i { display: block; height: 100%; }
.p-senti-bar i.pos { background: #059669; }
.p-senti-bar i.neu { background: #d1d5db; }
.p-senti-bar i.neg { background: #dc2626; }
.p-senti-legend { display: flex; gap: 16px; font-size: 12.5px; color: #374151; }
.p-senti-legend i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 6px; }
.p-senti-legend i.pos { background: #059669; }
.p-senti-legend i.neu { background: #d1d5db; }
.p-senti-legend i.neg { background: #dc2626; }
.p-topics { display: flex; flex-direction: column; gap: 16px; }
.p-topic-group-h { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #111827; }
.p-topic-group-h em { width: 8px; height: 8px; border-radius: 50%; }
.p-topic-group-h em.positive { background: #059669; }
.p-topic-group-h em.neutral { background: #9ca3af; }
.p-topic-group-h em.negative { background: #dc2626; }
.p-topic-count { margin-left: auto; font-size: 11.5px; font-weight: 500; color: #9ca3af; }
.p-topic-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.p-chip { font-size: 12px; color: #374151; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 999px; padding: 5px 12px; }
.p-chip b { color: #4f46e5; font-weight: 700; margin-left: 4px; }
.p-none { font-size: 12px; color: #d1d5db; }
@media (max-width: 900px) { .p-grid { grid-template-columns: repeat(2, 1fr); } .p-grid2 { grid-template-columns: 1fr; } }
</style>
