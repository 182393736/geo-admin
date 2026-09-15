<template>
  <div class="geo-page">
    <PageHeader title="AI排名透视" desc="深度分析品牌在不同 AI 引擎中的排名竞争态势">
      <template #actions>
        <div class="flex items-center gap-2">
          <DashReportExport :loading="exportingReport" @confirm="onExportReport" />
          <button
            type="button"
            class="mb-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
            @click="goManageTopics"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
            管理监控问题
          </button>
        </div>
      </template>
    </PageHeader>

    <div class="mx-auto flex max-w-[1600px] animate-fade-in flex-col gap-8 pb-20">
      <!-- ===== 卡片1：排名指标 ===== -->
      <div class="overflow-visible rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div class="relative z-20 flex items-center justify-between rounded-t-2xl border-b border-gray-100 px-6 py-4">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16l4-4 4 4 5-6"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">排名指标</span>
          </div>
          <div class="relative z-20 flex items-center gap-3">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="exportingKpi"
              @click="exportKpiPanel"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
              {{ exportingKpi ? '导出中...' : '导出' }}
            </button>
            <div class="flex items-center gap-2">
              <span class="select-none text-xs font-medium text-gray-400">统计周期</span>
              <DashDateRange v-model:start="kpiRangeStart" v-model:end="kpiRangeEnd" @change="reloadKpi" />
            </div>
          </div>
        </div>
        <div class="relative z-10 flex items-center gap-6 overflow-visible border-b border-gray-50 px-6 py-3">
          <div class="flex items-center gap-2">
            <span class="shrink-0 select-none text-xs font-medium text-gray-400">AI 引擎</span>
            <DashEngineMulti v-model="kpiEngines" :options="engineMultiOptions" @change="reloadKpi" />
          </div>
          <div class="flex min-w-0 items-center gap-2">
            <span class="shrink-0 select-none text-xs font-medium text-gray-400">监控问题</span>
            <DashQuerySelect v-model="kpiQueryId" v-model:label="kpiQueryLabel" :options="queryOptions" @change="reloadKpi" />
          </div>
          <span v-if="loadingKpi" class="text-xs text-gray-400">加载中…</span>
        </div>
        <div class="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          <div v-for="kpi in kpiCards" :key="kpi.key" class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-bold text-gray-700">{{ kpi.label }}</span>
                <div class="group relative">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cursor-help text-gray-400"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                  <div class="absolute left-1/2 top-full z-[100] mt-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-800 p-3 text-left text-xs leading-relaxed text-white shadow-lg group-hover:block">
                    <div class="mb-1 font-bold">{{ kpi.label }}</div>
                    <div class="text-gray-200">{{ kpi.tip }}</div>
                    <div class="mt-1.5 text-gray-300">公式 = {{ kpi.formula }}</div>
                    <div class="mt-0.5 text-[11px] text-gray-400">一次采样 = 单个话题 × 单个引擎 × 单次监测</div>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col items-end leading-none">
                <span :class="['text-3xl font-extrabold tracking-tight', kpi.color]">
                  {{ kpi.value }}<span class="text-lg">%</span>
                </span>
                <span class="mt-1 text-[11px] font-medium text-gray-400">{{ kpi.ratio }}</span>
              </div>
            </div>
            <div class="h-[120px]">
              <SparkLine
                :points="kpi.points"
                :labels="kpi.labels"
                :series="kpi.series"
                :color="kpi.line"
                :height="120"
                :digits="0"
                :interactive="true"
                :rate-label="kpi.rateLabel"
                :value-class="kpi.valueClass"
              />
            </div>
            <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span class="text-xs text-gray-400">提及问题 / 监控总数</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 卡片2：品牌排名 ===== -->
      <div class="overflow-visible rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div class="relative z-20 flex items-center justify-between rounded-t-2xl border-b border-gray-100 px-6 py-4">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M17 3H7v4h10z"/><path d="M17 5h3v4h-3z"/><path d="M7 5H4v4h3z"/></svg>
            </div>
            <span class="text-base font-bold text-gray-900">品牌排名</span>
          </div>
          <div class="relative z-20 flex items-center gap-3">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="exportingRank"
              @click="exportRankPanel"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
              {{ exportingRank ? '导出中...' : '导出' }}
            </button>
            <div class="relative flex items-center gap-2">
              <span class="select-none text-xs font-medium text-gray-400">统计周期</span>
              <DashDateRange v-model:start="rankRangeStart" v-model:end="rankRangeEnd" @change="reloadRank" />
            </div>
          </div>
        </div>
        <div class="relative z-10 flex flex-wrap items-center gap-x-6 gap-y-3 overflow-visible border-b border-gray-50 px-6 py-3">
          <div class="flex items-center gap-2">
            <span class="shrink-0 select-none text-xs font-medium text-gray-400">AI 引擎</span>
            <DashEngineMulti v-model="rankEngines" :options="engineMultiOptions" @change="reloadRank" />
          </div>
          <div class="flex min-w-0 items-center gap-2">
            <span class="shrink-0 select-none text-xs font-medium text-gray-400">监控问题</span>
            <DashQuerySelect v-model="rankQueryId" v-model:label="rankQueryLabel" :options="queryOptions" @change="reloadRank" />
          </div>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
            <div class="flex flex-col lg:col-span-4">
              <div class="flex h-[480px] flex-col rounded-2xl border border-gray-100 bg-white p-4">
                <div class="mb-3 flex items-center justify-between">
                  <span class="text-[13px] font-semibold text-gray-900">排名榜单</span>
                  <button type="button" class="flex shrink-0 items-center gap-1 text-[11px] font-medium text-gray-400 transition-colors hover:text-indigo-600">
                    查看全部
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
                <div class="-mx-1 flex-1 overflow-y-auto px-1">
                  <div class="flex flex-col">
                    <div
                      v-for="(r, i) in leaderboard"
                      :key="r.name + i"
                      class="grid items-center gap-3 border-b border-gray-100 px-1 py-3 transition-colors last:border-0 hover:bg-gray-50/60"
                      style="grid-template-columns:28px 1fr auto;"
                    >
                      <span :class="['inline-flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-extrabold shadow-sm', rankBadgeCls(r.current_rank || i + 1)]">{{ r.current_rank || i + 1 }}</span>
                      <div class="flex min-w-0 items-center gap-2">
                        <span :class="['truncate text-[13.5px] font-semibold', r.is_target ? 'text-indigo-600' : 'text-gray-900']">{{ r.name }}</span>
                      </div>
                      <div class="flex shrink-0 items-center">
                        <span v-if="r.trend === 'new'" class="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-blue-700">NEW</span>
                        <span v-else-if="r.trend === 'down'" class="rounded bg-red-50 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-red-500">▼ {{ r.rank_change }}</span>
                        <span v-else-if="r.trend === 'up'" class="rounded bg-green-50 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-green-600">▲ {{ Math.abs(r.rank_change || 0) }}</span>
                      </div>
                    </div>
                    <div v-if="!leaderboard.length" class="py-10 text-center text-sm text-gray-400">暂无榜单数据</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col lg:col-span-8">
              <div class="flex h-[480px] flex-col rounded-2xl border border-gray-100 bg-white p-4">
                <div class="mb-3 flex items-center justify-between">
                  <span class="text-[13px] font-semibold text-gray-900">排名趋势</span>
                  <span class="text-xs font-medium text-gray-400">{{ rankRangeStart.slice(5) }} - {{ rankRangeEnd.slice(5) }}</span>
                </div>
                <div class="min-h-0 flex-1">
                  <SparkLine v-if="hasRankTrend" :points="rankTrendPoints" :labels="rankTrendLabels" color="#4f46e5" :height="380" :digits="0" />
                  <div v-else class="flex h-full items-center justify-center text-sm text-gray-400">暂无趋势数据</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 卡片3：全景排名矩阵 ===== -->
      <div class="flex animate-fade-in-up flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div class="flex items-center justify-between rounded-t-2xl border-b border-gray-100 bg-gradient-to-r from-white to-indigo-50/20 px-8 py-6">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight text-gray-900">全景排名矩阵</h3>
              <p class="mt-0.5 text-[10px] text-gray-400">快速定位优势与劣势领域 · {{ matrixDate }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="flex shrink-0 select-none items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span>日期:</span>
              </div>
              <DashDateInput
                v-model="matrixDate"
                class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                @change="reloadMatrix"
              />
            </div>
            <div class="relative border-l border-gray-200 pl-4" ref="colMenuRef">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50"
                @click="colOpen = !colOpen"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/><path d="M3 12h18"/></svg>
                <span>显示列</span>
              </button>
              <div v-if="colOpen" class="absolute right-0 z-40 mt-1 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                <label
                  v-for="e in ENGINES_META"
                  :key="e.key"
                  class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50"
                >
                  <input v-model="visibleCols" type="checkbox" :value="e.key" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  {{ e.name }}
                </label>
              </div>
            </div>
            <div class="relative border-l border-gray-200 pl-4">
              <DashReportExport
                label="导出排名矩阵"
                loading-label="导出中..."
                :loading="exportingMatrix"
                @confirm="onExportMatrix"
              />
            </div>
          </div>
        </div>
        <div class="px-5 pb-5 pt-3">
          <div class="max-h-[90vh] overflow-auto rounded-xl border border-gray-100">
            <table class="w-full">
              <thead>
                <tr>
                  <th class="px-3.5 py-2.5 text-left text-[11.5px] font-semibold" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);">问题</th>
                  <th class="whitespace-nowrap px-2 py-2.5 text-center text-[11.5px] font-semibold" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);">综合排名</th>
                  <th class="px-2 py-2.5 text-center text-[11.5px] font-semibold" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);">品牌提及率</th>
                  <th class="px-2 py-2.5 text-center text-[11.5px] font-semibold" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);">Top3 推荐率</th>
                  <th class="px-2 py-2.5 text-center text-[11.5px] font-semibold" style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);">首位推荐率</th>
                  <th
                    v-for="e in visibleEngines"
                    :key="e.key"
                    class="whitespace-nowrap px-2 py-2.5 text-center align-bottom text-[11.5px] font-semibold"
                    style="position:sticky;top:0;z-index:20;border-bottom:1px solid rgb(225,225,236);background:rgb(250,250,254);color:rgb(110,110,122);"
                  >{{ e.name }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in matrixRows" :key="row.query" class="transition-colors hover:bg-[#fafafe]">
                  <td class="px-3.5 py-2.5 text-left align-middle" style="border-bottom:1px solid rgb(242,242,248);max-width:240px;white-space:normal;line-height:1.4;">
                    <span class="text-[12.5px] text-gray-700" :title="row.query">{{ row.query }}</span>
                  </td>
                  <td class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);">
                    <span v-if="row.overall === '未上榜'" class="text-[11.5px] font-semibold" style="color: rgb(192, 24, 37);">未上榜</span>
                    <span v-else class="inline-flex min-w-[56px] items-center justify-center rounded-lg px-2.5 py-1 font-mono text-[11.5px] font-bold" style="background: rgb(230, 251, 244); color: rgb(0, 110, 84);">第{{ row.overall }}名</span>
                  </td>
                  <td class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);"><span class="font-mono text-[12.5px] font-semibold text-gray-700">{{ pct(row.mention_rate) }}</span></td>
                  <td class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);"><span class="font-mono text-[12.5px] font-semibold text-gray-700">{{ pct(row.top3_mention_rate) }}</span></td>
                  <td class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);"><span class="font-mono text-[12.5px] font-semibold text-gray-700">{{ pct(row.first_mention_rate) }}</span></td>
                  <td v-for="e in visibleEngines" :key="e.key" class="px-2 py-2.5 text-center" style="border-bottom:1px solid rgb(242,242,248);">
                    <span :class="cellCls()" :style="cellStyle(row.rank_value[e.key])" :title="`${row.query} · ${e.name}`">{{ cellText(row.rank_value[e.key]) }}</span>
                  </td>
                </tr>
                <tr v-if="!matrixRows.length">
                  <td :colspan="5 + visibleEngines.length" class="px-3.5 py-10 text-center text-sm text-gray-400">暂无排名数据（采集或解析尚未产出）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { monitorApi } from '@/api/modules/monitor';
import { lastNDays, fmtDate } from '@/utils/engines';
import SparkLine from '@/components/SparkLine.vue';
import DashDateRange from '@/components/DashDateRange.vue';
import DashDateInput from '@/components/DashDateInput.vue';
import DashEngineMulti from '@/components/DashEngineMulti.vue';
import DashQuerySelect from '@/components/DashQuerySelect.vue';
import DashReportExport from '@/components/DashReportExport.vue';
import { downloadAoaSheets } from '@/utils/xlsxExport';

const router = useRouter();
const exportingReport = ref(false);
const exportingKpi = ref(false);
const exportingRank = ref(false);
const exportingMatrix = ref(false);

const ENGINES_ALL = ['doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao'] as const;
const ENGINES_META = [
  { key: 'doubao', name: '豆包', color: '#3b82f6' },
  { key: 'wenxin', name: '文心一言', color: '#ec4899' },
  { key: 'deepseek', name: 'DeepSeek', color: '#4f46e5' },
  { key: 'qwen', name: '通义千问', color: '#f59e0b' },
  { key: 'yuanbao', name: '元宝', color: '#06b6d4' },
] as const;

const initRange = lastNDays(7);
/** 排名指标 / 品牌排名 各自独立筛选，互不影响 */
const kpiRangeStart = ref(initRange.start);
const kpiRangeEnd = ref(initRange.end);
const kpiEngines = ref<string[]>([]);
const kpiQueryId = ref<number | string>(0);
const kpiQueryLabel = ref('全部问题');

const rankRangeStart = ref(initRange.start);
const rankRangeEnd = ref(initRange.end);
const rankEngines = ref<string[]>([]);
const rankQueryId = ref<number | string>(0);
const rankQueryLabel = ref('全部问题');

const matrixDate = ref(initRange.end);
const industryQueries = ref<any[]>([]);
const matrix = ref<any>({ list: {}, platforms: [] });
const ranking = ref<any[]>([]);
const visibilityTrend = ref<any[]>([]);
const mentionTrend = ref<any>({ trend: [], summary: {} });
const top3Trend = ref<any>({ trend: [], summary: {} });
const firstTrend = ref<any>({ trend: [], summary: {} });
const loadingKpi = ref(false);
const visibleCols = ref<string[]>([...ENGINES_ALL]);
const colOpen = ref(false);
const colMenuRef = ref<HTMLElement | null>(null);

const engineMultiOptions = ENGINES_META.map(e => ({ value: e.key, label: e.name }));

const queryOptions = computed(() =>
  industryQueries.value.map((q: any) => ({
    value: q.id ?? q.query_id,
    label: q.query || q.name || String(q.id),
  })),
);

const visibleEngines = computed(() => ENGINES_META.filter(e => visibleCols.value.includes(e.key)));

const pct = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? `${(+v).toFixed(2)}%` : '0.00%');

const leaderboard = computed(() => ranking.value.slice(0, 10));

const matrixRows = computed(() => {
  const rows: any[] = Object.values(matrix.value.list || {});
  const scored = rows.map(r => {
    const all = r.rank_value?.all;
    const allN = Number(all);
    const _avg = Number.isFinite(allN) ? allN : null;
    const fallbackVals = ENGINES_ALL.map(k => Number(r.rank_value?.[k])).filter(Number.isFinite);
    return {
      ...r,
      _avg: _avg ?? (fallbackVals.length ? fallbackVals.reduce((s: number, n: number) => s + n, 0) / fallbackVals.length : null),
    };
  });
  const orderable = scored.filter(r => r._avg != null).sort((a, b) => a._avg - b._avg);
  const rankOf = new Map(orderable.map((r, i) => [r.query, i + 1]));
  return scored.map(r => ({ ...r, overall: rankOf.get(r.query) ?? '未上榜' }));
});

function resolveEngines(selected: string[]): string[] {
  if (!selected.length) return [...ENGINES_ALL];
  return selected;
}

function resolveQueryIds(qidRaw: number | string): number[] {
  const qid = Number(qidRaw);
  if (Number.isFinite(qid) && qid > 0) return [qid];
  return industryQueries.value.map((q: any) => q.id ?? q.query_id).filter((n: number) => Number.isFinite(n));
}

function sumOf(t: any) {
  const keys = resolveEngines(kpiEngines.value);
  if (keys.length === ENGINES_ALL.length) {
    return t?.summary?.all || { denominator: 0, numerator: 0, rate: 0 };
  }
  if (keys.length === 1) {
    return t?.summary?.[keys[0]] || { denominator: 0, numerator: 0, rate: 0 };
  }
  let denominator = 0;
  let numerator = 0;
  for (const k of keys) {
    const s = t?.summary?.[k];
    if (!s) continue;
    denominator += Number(s.denominator) || 0;
    numerator += Number(s.numerator) || 0;
  }
  return {
    denominator,
    numerator,
    rate: denominator ? +(numerator / denominator * 100).toFixed(2) : 0,
  };
}

/** 每日 {date, rate, numerator, denominator}，供图表 hover tooltip */
function trendSeries(t: any) {
  const rows = t?.trend || [];
  const keys = resolveEngines(kpiEngines.value);
  const series = rows.map((x: any) => {
    let rate = 0;
    let numerator = 0;
    let denominator = 0;
    if (keys.length === ENGINES_ALL.length) {
      rate = Number(x.rate) || 0;
      numerator = Number(x.numerator) || 0;
      denominator = Number(x.denominator) || 0;
      // 部分接口把汇总放在 all / platforms.all
      if (!denominator && x.all) {
        numerator = Number(x.all.numerator) || 0;
        denominator = Number(x.all.denominator) || 0;
        rate = Number(x.all.rate) || rate;
      }
    } else if (keys.length === 1) {
      const p = x.platforms?.[keys[0]] || {};
      rate = Number(p.rate) || 0;
      numerator = Number(p.numerator) || 0;
      denominator = Number(p.denominator) || 0;
    } else {
      for (const k of keys) {
        const p = x.platforms?.[k];
        if (!p) continue;
        denominator += Number(p.denominator) || 0;
        numerator += Number(p.numerator) || 0;
      }
      rate = denominator ? +(numerator / denominator * 100).toFixed(2) : 0;
    }
    return {
      date: fmtDate(x.date_day || x.date || ''),
      rate,
      numerator,
      denominator,
    };
  });
  // 单日：若点上 rate 为 0 但 summary 有值，用 summary 校准，避免水平线误贴 Y=0
  if (series.length === 1) {
    const sum = sumOf(t);
    const sumRate = Number(sum.rate) || 0;
    if (series[0].rate === 0 && sumRate > 0) {
      series[0] = {
        ...series[0],
        rate: sumRate,
        numerator: Number(sum.numerator) || 0,
        denominator: Number(sum.denominator) || 0,
      };
    }
  }
  return series;
}

function trendPoints(t: any) {
  return trendSeries(t).map(s => s.rate);
}

const trendLabels = computed(() => (mentionTrend.value.trend || []).map((t: any) => fmtDate(t.date_day)));
const rankTrendLabels = computed(() => visibilityTrend.value.map((t: any) => fmtDate(t.date_day)));
const rankTrendPoints = computed(() => visibilityTrend.value.map((t: any) => Number(t.rank_value)).filter((n: number) => Number.isFinite(n)));
const hasRankTrend = computed(() => rankTrendPoints.value.length > 1);

/** 仅 1 个点时复制为起止两点，曲线横向拉满（对标：两天同值时的水平线，而不是贴底单点） */
function padFlatSeries(series: { date?: string; rate: number; numerator?: number; denominator?: number }[]) {
  if (series.length !== 1) return series;
  const a = series[0];
  return [a, { ...a }];
}
function padFlatPoints(points: number[]) {
  if (points.length !== 1) return points;
  return [points[0], points[0]];
}
function padFlatLabels(labels: string[], seriesLen: number) {
  if (labels.length === 1) return [labels[0], labels[0]];
  // series 已 pad 而 labels 仍空时，用空占位避免轴错位
  if (labels.length === 0 && seriesLen === 1) return ['', ''];
  return labels;
}

const kpiCards = computed(() => {
  const mentionS = padFlatSeries(trendSeries(mentionTrend.value));
  const top3S = padFlatSeries(trendSeries(top3Trend.value));
  const firstS = padFlatSeries(trendSeries(firstTrend.value));
  const labels = padFlatLabels(trendLabels.value, (mentionTrend.value.trend || []).length);
  return [
  {
    key: 'mention', label: '品牌提及率', color: 'text-blue-600', line: '#3B82F6',
    valueClass: 'text-blue-600', rateLabel: '提及率',
    value: (+(sumOf(mentionTrend.value).rate || 0)).toFixed(2),
    ratio: `${sumOf(mentionTrend.value).numerator || 0} / ${sumOf(mentionTrend.value).denominator || 0}`,
    tip: '品牌在 AI 答案中被提及的采样占比，不限位次。',
    formula: '被提及的采样数 ÷ 总采样数',
    points: padFlatPoints(trendPoints(mentionTrend.value)),
    labels,
    series: mentionS,
  },
  {
    key: 'top3', label: 'Top3 推荐率', color: 'text-green-600', line: '#10B981',
    valueClass: 'text-green-600', rateLabel: 'Top3率',
    value: (+(sumOf(top3Trend.value).rate || 0)).toFixed(2),
    ratio: `${sumOf(top3Trend.value).numerator || 0} / ${sumOf(top3Trend.value).denominator || 0}`,
    tip: '品牌在 AI 答案中位列前三名的采样占比。',
    formula: '进入 Top3 的采样数 ÷ 总采样数',
    points: padFlatPoints(trendPoints(top3Trend.value)),
    labels,
    series: top3S,
  },
  {
    key: 'first', label: '首位推荐率', color: 'text-amber-500', line: '#F59E0B',
    valueClass: 'text-amber-500', rateLabel: '首位率',
    value: (+(sumOf(firstTrend.value).rate || 0)).toFixed(2),
    ratio: `${sumOf(firstTrend.value).numerator || 0} / ${sumOf(firstTrend.value).denominator || 0}`,
    tip: '品牌在 AI 答案中位列首位的采样占比。',
    formula: '排到首位的采样数 ÷ 总采样数',
    points: padFlatPoints(trendPoints(firstTrend.value)),
    labels,
    series: firstS,
  },
];
});

function rankBadgeCls(i: number) {
  if (i === 1) return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white';
  if (i === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white';
  if (i === 3) return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white';
  return 'bg-gray-100 text-gray-400';
}
function cellCls() {
  return 'inline-block min-w-[36px] cursor-pointer rounded-md px-[7px] py-[3px] font-mono text-[12.5px] font-bold transition-all hover:ring-2 hover:ring-indigo-300';
}
function cellStyle(v: any) {
  if (Number.isFinite(Number(v))) return { background: 'rgb(230, 251, 244)', color: 'rgb(0, 110, 84)' };
  return { background: 'rgb(254, 242, 242)', color: 'rgb(192, 24, 37)' };
}
function cellText(v: any) {
  if (Number.isFinite(Number(v))) return `#${v}`;
  return '未上榜';
}

async function reloadKpi() {
  loadingKpi.value = true;
  try {
    const start = kpiRangeStart.value;
    const end = kpiRangeEnd.value;
    const qids = resolveQueryIds(kpiQueryId.value);
    const platforms = resolveEngines(kpiEngines.value);
    const [a, b, c] = await Promise.all([
      monitorApi.mentionRateTrend(start, end, { platforms, query_ids: qids }),
      monitorApi.top3RateTrend(start, end, { platforms, query_ids: qids }),
      monitorApi.firstRateTrend(start, end, { platforms, query_ids: qids }),
    ]);
    mentionTrend.value = a || { trend: [], summary: {} };
    top3Trend.value = b || { trend: [], summary: {} };
    firstTrend.value = c || { trend: [], summary: {} };
  } catch { /* 保持空态 */ }
  finally { loadingKpi.value = false; }
}

async function reloadRank() {
  try {
    const qid = Number(rankQueryId.value);
    const refs = await monitorApi.getReferences(
      Number.isFinite(qid) && qid > 0 ? qid : undefined,
    );
    ranking.value = refs?.company_ranking_data || [];
    // 有选引擎时优先用对应平台趋势；否则用综合
    const platforms = resolveEngines(rankEngines.value);
    const trendMap = refs?.visibility_trend || {};
    if (platforms.length === 1 && trendMap[platforms[0]]) {
      visibilityTrend.value = trendMap[platforms[0]] || [];
    } else {
      visibilityTrend.value = trendMap.all || [];
    }
  } catch {
    ranking.value = [];
    visibilityTrend.value = [];
  }
}

async function reloadMatrix() {
  const qids = resolveQueryIds(0);
  if (!qids.length || !matrixDate.value) {
    matrix.value = { list: {}, platforms: [] };
    return;
  }
  try {
    const m = await monitorApi.fullRankingMatrix(qids, matrixDate.value);
    matrix.value = m || { list: {}, platforms: [] };
    if ((m as any)?.valid_data_date_list?.length && !matrixDate.value) {
      matrixDate.value = (m as any).valid_data_date_list[0];
    }
  } catch {
    matrix.value = { list: {}, platforms: [] };
  }
}

function onDocClick(e: MouseEvent) {
  const t = e.target as Node;
  if (colMenuRef.value && !colMenuRef.value.contains(t)) colOpen.value = false;
}

function goManageTopics() {
  router.push({ path: '/dashboard/topic-management', query: { type: 'industry' } });
}

function engineLabel(selected: string[]) {
  const keys = resolveEngines(selected);
  if (keys.length === ENGINES_ALL.length) return '全部';
  return keys.map(k => ENGINES_META.find(e => e.key === k)?.name || k).join('、');
}

function dayBucket(trend: any, engines: string[]) {
  const keys = resolveEngines(engines);
  const rows = trend?.trend || [];
  return rows.map((x: any) => {
    if (keys.length === ENGINES_ALL.length) {
      return {
        date: x.date_day,
        rate: Number(x.rate) || 0,
        numerator: Number(x.numerator) || 0,
        denominator: Number(x.denominator) || 0,
      };
    }
    if (keys.length === 1) {
      const p = x.platforms?.[keys[0]] || {};
      return {
        date: x.date_day,
        rate: Number(p.rate) || 0,
        numerator: Number(p.numerator) || 0,
        denominator: Number(p.denominator) || 0,
      };
    }
    let d = 0;
    let n = 0;
    for (const k of keys) {
      const p = x.platforms?.[k];
      if (!p) continue;
      d += Number(p.denominator) || 0;
      n += Number(p.numerator) || 0;
    }
    return {
      date: x.date_day,
      rate: d ? +(n / d * 100).toFixed(2) : 0,
      numerator: n,
      denominator: d,
    };
  });
}

function exportKpiPanel() {
  const has = [mentionTrend.value, top3Trend.value, firstTrend.value].some(
    (t: any) => (t?.trend || []).length,
  );
  if (!has) {
    Message.warning('暂无可导出的排名指标数据');
    return;
  }
  exportingKpi.value = true;
  try {
    const map = new Map<string, any>();
    const merge = (trend: any, key: string) => {
      for (const row of dayBucket(trend, kpiEngines.value)) {
        const cur = map.get(row.date) || { date: row.date };
        cur[`${key}_rate`] = row.rate;
        cur[`${key}_numerator`] = row.numerator;
        cur[`${key}_denominator`] = row.denominator;
        map.set(row.date, cur);
      }
    };
    merge(mentionTrend.value, 'mention');
    merge(top3Trend.value, 'top3');
    merge(firstTrend.value, 'first');
    const rows = [
      [ '排名指标导出' ],
      [ '监控问题', kpiQueryLabel.value || '全部问题' ],
      [ 'AI 引擎', engineLabel(kpiEngines.value) ],
      [ '终端', '网页端' ],
      [ '统计周期', `${kpiRangeStart.value || '--'} ~ ${kpiRangeEnd.value || '--'}` ],
      [],
      [ '日期', '提及率(%)', '提及问题数', '监控总数', 'Top3推荐率(%)', 'Top3问题数', '监控总数', '首位推荐率(%)', '首位问题数', '监控总数' ],
      ...Array.from(map.values())
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))
        .map(x => [
          x.date,
          x.mention_rate ?? 0, x.mention_numerator ?? 0, x.mention_denominator ?? 0,
          x.top3_rate ?? 0, x.top3_numerator ?? 0, x.top3_denominator ?? 0,
          x.first_rate ?? 0, x.first_numerator ?? 0, x.first_denominator ?? 0,
        ]),
    ];
    downloadAoaSheets(
      [{ name: '排名指标', rows, cols: Array(10).fill({ wch: 14 }) }],
      `排名指标_${kpiRangeStart.value || '开始'}~${kpiRangeEnd.value || '结束'}.xlsx`,
    );
    Message.success('排名指标导出成功');
  } catch (e) {
    console.error(e);
    Message.error('排名指标导出失败，请重试');
  } finally {
    exportingKpi.value = false;
  }
}

function exportRankPanel() {
  if (!leaderboard.value.length && !visibilityTrend.value.length) {
    Message.warning('暂无可导出的品牌排名数据');
    return;
  }
  exportingRank.value = true;
  try {
    const trendMap: Record<string, string> = { up: '上升', down: '下降', stable: '持平', new: '新上榜' };
    const boardRows = [
      [ '品牌排名导出' ],
      [ '监控问题', rankQueryLabel.value || '全部问题' ],
      [ 'AI 引擎', engineLabel(rankEngines.value) ],
      [ '终端', '网页端' ],
      [ '统计周期', `${rankRangeStart.value || '--'} ~ ${rankRangeEnd.value || '--'}` ],
      [],
      [ '当前排名', '品牌', '是否本品牌', '当前得分', '上期排名', '上期得分', '排名变化', '趋势' ],
      ...leaderboard.value.map((c: any, i: number) => [
        c.current_rank > 0 ? c.current_rank : i + 1,
        c.name,
        c.is_target ? '是' : '否',
        c.current_score ?? '',
        c.previous_rank ?? '',
        c.previous_score ?? '',
        c.rank_change ?? 0,
        trendMap[c.trend] || c.trend || '',
      ]),
    ];
    const trendRows = [
      [ '品牌排名趋势' ],
      [ '监控问题', rankQueryLabel.value || '全部问题' ],
      [ 'AI 引擎', engineLabel(rankEngines.value) ],
      [ '终端', '网页端' ],
      [],
      [ '日期', '排名', '得分' ],
      ...visibilityTrend.value.map((c: any) => [
        c.date_day || c.date_full || c.date || '',
        c.rank_value ?? c.rank ?? '',
        c.score ?? '',
      ]),
    ];
    downloadAoaSheets(
      [
        { name: '品牌排名', rows: boardRows, cols: [{ wch: 12 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }] },
        { name: '排名趋势', rows: trendRows, cols: [{ wch: 14 }, { wch: 14 }, { wch: 14 }] },
      ],
      `品牌排名_${rankRangeStart.value || '开始'}~${rankRangeEnd.value || '结束'}.xlsx`,
    );
    Message.success('品牌排名导出成功');
  } catch (e) {
    console.error(e);
    Message.error('品牌排名导出失败，请重试');
  } finally {
    exportingRank.value = false;
  }
}

async function onExportReport({ start, end }: { start: string; end: string }) {
  exportingReport.value = true;
  try {
    const { blob, filename } = await monitorApi.exportCompetitorReportBlob(start, end);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    Message.success('品牌透视报告已导出');
  } catch (e: any) {
    Message.error(e?.message || '导出失败');
  } finally {
    exportingReport.value = false;
  }
}

async function onExportMatrix({ start, end }: { start: string; end: string }) {
  exportingMatrix.value = true;
  try {
    const platforms = visibleCols.value.length ? [...visibleCols.value] : [...ENGINES_ALL];
    const { blob, filename } = await monitorApi.exportRankingMatrixBlob(start, end, platforms);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `排名矩阵_${start}~${end}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    Message.success('排名矩阵已导出');
  } catch (e: any) {
    Message.error(e?.message || '导出失败');
  } finally {
    exportingMatrix.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('click', onDocClick);
  try {
    const qs = await monitorApi.queryList('industry');
    industryQueries.value = qs?.list || [];
  } catch { industryQueries.value = []; }
  await Promise.all([reloadKpi(), reloadRank(), reloadMatrix()]);
});

onUnmounted(() => document.removeEventListener('click', onDocClick));
</script>
