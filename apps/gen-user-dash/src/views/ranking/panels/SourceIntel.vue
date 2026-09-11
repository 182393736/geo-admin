<template>
  <div class="p-wrap">
    <div class="p-hd">
      <h2>引用源洞察</h2>
      <p>被 AI 引用的信源全景：被引榜、自有内容趋势与信源明细</p>
    </div>

    <PreCollectionEmpty v-if="pending" title="引用源洞察" />

    <template v-else>
      <div class="p-kpis">
        <div class="p-kpi">
          <div class="p-kpi-label">命中信源数</div>
          <div class="p-kpi-value">{{ summary.total_sources }}</div>
          <div class="p-kpi-sub">本期被 AI 引用的去重信源</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">被引总次数</div>
          <div class="p-kpi-value">{{ summary.total_ref_count }}</div>
          <div class="p-kpi-sub">全部信源被引次数之和</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">自有信源数</div>
          <div class="p-kpi-value">{{ summary.own_source_count }}</div>
          <div class="p-kpi-sub">含自有发稿内容的信源</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">Top5 集中度</div>
          <div class="p-kpi-value">{{ summary.top5_share }}%</div>
          <div class="p-kpi-sub">前 5 信源占被引总量比例</div>
        </div>
      </div>

      <div class="p-grid2">
        <!-- Top 被引信源 -->
        <div class="p-card">
          <div class="p-card-h">
            <div>
              <div class="p-card-t">Top 被引信源</div>
              <div class="p-card-s">按被引次数降序</div>
            </div>
          </div>
          <div class="p-body">
            <div v-if="!topSources.length" class="p-empty">暂无信源引用数据</div>
            <div v-else class="p-ebars">
              <div v-for="s in topSources" :key="s.source_id" class="p-ebar-row">
                <span class="p-ebar-name" :title="s.canonical_source">{{ s.canonical_source }}</span>
                <span class="p-ebar-track"><i :style="{ width: barW(s.ref_count) }"></i></span>
                <span class="p-ebar-v">{{ s.ref_count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 自有内容趋势 -->
        <div class="p-card">
          <div class="p-card-h">
            <div>
              <div class="p-card-t">自有内容趋势</div>
              <div class="p-card-s">自有发稿内容被引的逐日变化（本期 vs 上期）</div>
            </div>
          </div>
          <div class="p-body">
            <div v-if="!ownTrend.length" class="p-empty">暂无自有内容数据</div>
            <SparkLine v-else :points="ownTrend" :labels="ownTrendLabels" color="#059669" :digits="0" />
          </div>
        </div>
      </div>

      <!-- 信源明细 -->
      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">信源被引明细</div>
            <div class="p-card-s">含类目、覆盖问题数、自有内容与可投放标记（信源库内可直接下单）</div>
          </div>
          <div class="p-card-right">
            <span class="p-page">共 {{ total }} 个信源</span>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!statsList.length" class="p-empty">暂无信源明细</div>
          <div v-else class="p-table">
            <div class="p-tr p-th">
              <span class="c-n">信源</span>
              <span class="c-c">类目</span>
              <span class="c-r">被引</span>
              <span class="c-r">覆盖问题</span>
              <span class="c-r">自有内容</span>
              <span class="c-r">单次被引成本</span>
              <span class="c-p">可投放</span>
            </div>
            <div v-for="s in statsList" :key="s.canonical_source" class="p-tr">
              <span class="c-n" :title="s.canonical_source">{{ s.canonical_source }}</span>
              <span class="c-c">{{ s.category || '未分类' }}</span>
              <span class="c-r">{{ s.ref_count }}</span>
              <span class="c-r">{{ s.query_count }}</span>
              <span class="c-r">{{ s.own_article_count }}</span>
              <span class="c-r">{{ s.cost_per_citation != null ? '✦ ' + s.cost_per_citation : '—' }}</span>
              <span class="c-p"><em :class="s.media_key ? 'p-ok' : 'p-no'">{{ s.media_key ? '信源库内' : '未收录' }}</em></span>
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
import { lastNDays, fmtDate } from '@/utils/engines';

const pending = ref(true);
const topSources = ref<any[]>([]);
const ownCur = ref<Record<string, number>>({});
const ownCmp = ref<Record<string, number>>({});
const statsList = ref<any[]>([]);
const summary = ref<any>({ total_sources: 0, total_ref_count: 0, own_source_count: 0, top5_share: 0 });
const total = ref(0);

const ownTrend = computed(() => {
  const dates = Object.keys(ownCur.value).sort();
  return dates.map(d => ownCur.value[d] || 0);
});
const ownTrendLabels = computed(() => Object.keys(ownCur.value).sort().map(d => fmtDate(d)));
const maxRef = computed(() => Math.max(1, ...topSources.value.map((s: any) => s.ref_count || 0)));
const barW = (v: number) => `${Math.max(0, Math.min(100, (v / maxRef.value) * 100))}%`;

onMounted(async () => {
  try {
    const st = await monitorApi.queryStatus();
    pending.value = !!st?.pending;
    if (!st?.pending) {
      const { start, end } = lastNDays(7);
      const cs = new Date(); cs.setDate(cs.getDate() - 14);
      const ce = new Date(); ce.setDate(ce.getDate() - 7);
      const f = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const [trend, own, stats] = await Promise.all([
        monitorApi.siSourceTrend(start, end),
        monitorApi.siOwnTrend(start, end, f(cs), f(ce)),
        monitorApi.sourceStats(start, end, 1, 30),
      ]);
      topSources.value = (trend as any)?.list || [];
      ownCur.value = (own as any)?.current || {};
      ownCmp.value = (own as any)?.compare || {};
      statsList.value = (stats as any)?.list || [];
      summary.value = (stats as any)?.summary || summary.value;
      total.value = (stats as any)?.total || statsList.value.length;
    }
  } catch { pending.value = false; }
});
</script>

<style scoped lang="scss">
.p-wrap { margin: -16px -24px; padding: 28px 36px 96px; background: #f8fafc; min-height: calc(100vh - 32px); display: flex; flex-direction: column; gap: 16px; }
.p-hd h2 { font-size: 22px; font-weight: 800; color: #0f1115; margin: 0; line-height: 33px; }
.p-hd p { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }
.p-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.p-kpi { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 18px; }
.p-kpi-label { font-size: 12px; color: #6b7280; }
.p-kpi-value { font-size: 24px; font-weight: 800; color: #111827; margin-top: 6px; line-height: 1.2; }
.p-kpi-sub { font-size: 11px; color: #9ca3af; margin-top: 4px; }
.p-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.p-card-h { padding: 14px 18px; border-bottom: 1px solid #f0f1f5; display: flex; align-items: center; gap: 10px; }
.p-card-t { font-size: 14.5px; font-weight: 800; color: #0f1115; }
.p-card-s { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }
.p-card-right { margin-left: auto; }
.p-page { font-size: 12px; color: #6b7280; }
.p-body { padding: 16px 18px 18px; }
.p-empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 36px 0; }
.p-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.p-ebars { display: flex; flex-direction: column; gap: 12px; }
.p-ebar-row { display: grid; grid-template-columns: minmax(100px, 1.2fr) 2fr 48px; gap: 10px; align-items: center; }
.p-ebar-name { font-size: 12.5px; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.p-ebar-track { height: 8px; background: #f3f4f6; border-radius: 100px; overflow: hidden; }
.p-ebar-track i { display: block; height: 100%; border-radius: 100px; background: linear-gradient(90deg, #6366f1, #4f46e5); min-width: 2px; }
.p-ebar-v { font-size: 12.5px; font-weight: 700; color: #111827; text-align: right; }
.p-table { display: flex; flex-direction: column; }
.p-tr { display: grid; grid-template-columns: minmax(160px, 2fr) 100px repeat(4, 80px) 90px; gap: 10px; align-items: center; padding: 11px 12px; border-bottom: 1px solid #f0f1f5; }
.p-tr:last-child { border-bottom: none; }
.p-th { background: #f5f6fa; border-radius: 8px; padding: 9px 12px; font-size: 11.5px; font-weight: 600; color: #5b606a; border-bottom: none; }
.c-n { font-size: 13px; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c-c { font-size: 12.5px; color: #6b7280; }
.c-r { text-align: right; font-size: 13px; font-weight: 600; color: #374151; }
.c-p { text-align: center; }
.p-ok { font-style: normal; font-size: 11px; font-weight: 700; color: #047857; background: #ecfdf5; border-radius: 6px; padding: 3px 8px; }
.p-no { font-style: normal; font-size: 11px; font-weight: 700; color: #9ca3af; background: #f3f4f6; border-radius: 6px; padding: 3px 8px; }
@media (max-width: 900px) { .p-kpis { grid-template-columns: 1fr 1fr; } .p-grid2 { grid-template-columns: 1fr; } }
</style>
