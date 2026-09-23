<template>
  <div class="geo-page">
    <PageHeader title="AI 口碑分析" desc="定性分析 AI 回答内容的语义理解与情感倾向">
      <template #actions>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-50"
            :disabled="exportingAnalysis || !brandQueries.length"
            @click="exportAnalysis"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
            {{ exportingAnalysis ? '导出中…' : '导出' }}
          </button>
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-all"
            @click="goManageTopics"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
            管理监控问题
          </button>
        </div>
      </template>
    </PageHeader>

    <div class="flex flex-col gap-6 animate-fade-in max-w-[1600px] mx-auto pb-20">
      <!-- 卡片 1：筛选 + 分布 / 走势 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div class="flex flex-col bg-white border-b border-gray-50">
          <div class="w-full px-6 pt-4 pb-2">
            <div class="flex items-start gap-4">
              <div class="flex items-center gap-1.5 mt-2 px-0 w-[60px] text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none justify-start">
                <span>问题:</span>
              </div>
              <div class="flex-1 min-w-0">
                <div
                  class="flex flex-wrap gap-2 transition-all duration-300 ease-in-out"
                  :class="queriesExpanded ? '' : 'max-h-[68px] overflow-hidden'"
                >
                  <button
                    v-for="q in brandQueries"
                    :key="q.id"
                    type="button"
                    class="flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border"
                    :class="q.id === queryId
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'"
                    @click="selectQuery(q.id)"
                  >{{ q.query }}</button>
                  <span v-if="!brandQueries.length" class="text-xs text-gray-400 py-1.5">暂无口碑监控问题</span>
                </div>
              </div>
              <button
                v-if="brandQueries.length > 2"
                type="button"
                class="flex items-center gap-1 px-3 py-1.5 mt-0.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                @click="queriesExpanded = !queriesExpanded"
              >
                {{ queriesExpanded ? '收起' : '展开全部' }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="queriesExpanded ? 'rotate-180' : ''"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>

          <div class="w-full px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1.5 w-[70px] text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none justify-start">
                  <span>AI平台:</span>
                </div>
                <div class="relative" ref="platformMenuRef">
                  <button
                    type="button"
                    class="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[130px]"
                    @click="platformOpen = !platformOpen"
                  >
                    <span>{{ platformLabel }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 transition-transform duration-200" :class="platformOpen ? 'rotate-180' : ''"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div
                    v-if="platformOpen"
                    class="absolute top-full left-0 mt-1 w-[190px] bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden py-1"
                  >
                    <div
                      v-for="p in platformOptions"
                      :key="p.key"
                      class="px-4 py-2.5 text-[13px] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      :class="platform === p.key ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 font-medium'"
                      @click="selectPlatform(p.key)"
                    >
                      <span class="truncate">{{ p.label }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3 relative">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">
                  <span>日期:</span>
                </div>
                <DashDateRange v-model:start="rangeStart" v-model:end="rangeEnd" @change="onRangeChange" />
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 bg-white flex flex-col gap-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- 情感倾向分布 -->
            <div class="lg:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 flex flex-col items-center justify-center relative min-h-[320px] transition-shadow duration-300">
              <div class="absolute top-6 left-6 flex items-center gap-2">
                <h3 class="text-sm font-bold text-gray-900">情感倾向分布</h3>
              </div>
              <div class="h-[180px] w-full relative mt-8">
                <svg viewBox="0 0 180 180" class="w-full h-full">
                  <circle cx="90" cy="90" r="70" fill="none" stroke="#f1f5f9" stroke-width="22" />
                  <g v-for="(seg, i) in donutSegs" :key="i">
                    <circle
                      cx="90" cy="90" r="70" fill="none" :stroke="seg.color" stroke-width="22"
                      :stroke-dasharray="`${seg.len} ${C - seg.len}`"
                      stroke-dashoffset="-1"
                      :stroke-linecap="seg.len > 0.5 ? 'round' : 'butt'"
                      :transform="`rotate(${seg.offset} 90 90)`"
                    />
                  </g>
                </svg>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div class="text-xl font-extrabold" :class="riskColor">{{ riskLabel }}</div>
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">综合评级</div>
                </div>
              </div>
              <div class="w-full px-4 mt-4">
                <div v-for="row in ratioRows" :key="row.key" class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :style="{ background: row.color }" />
                    <span class="text-xs font-medium text-gray-600">{{ row.label }}</span>
                  </div>
                  <span class="text-xs font-bold text-gray-900">{{ pct(row.value) }}</span>
                </div>
              </div>
            </div>

            <!-- 情感走势 -->
            <div class="lg:col-span-8 rounded-2xl border border-gray-100 bg-white p-6 flex flex-col min-h-[320px] transition-shadow duration-300">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">情感走势</h3>
              </div>
              <div class="flex-1 w-full min-h-[220px]">
                <SparkLine
                  v-if="scoreSeries.length"
                  :points="scoreSeries"
                  :labels="scoreLabels"
                  :series="scoreSparkSeries"
                  color="#10b981"
                  :height="220"
                  interactive
                  rate-label="口碑分"
                  value-class="text-emerald-600"
                  unit=""
                  :digits="1"
                />
                <div v-else class="flex items-center justify-center h-full text-sm text-gray-400">暂无情感走势数据</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 卡片 2：观点 + 原文 -->
      <div class="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col lg:flex-row h-[340px] overflow-hidden transition-shadow duration-300">
        <div class="lg:w-1/3 border-r border-gray-100 flex flex-col h-full bg-gray-50/20">
          <div class="p-5 border-b border-gray-100">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in polarityTabs"
                :key="p.key"
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border"
                :class="p.key === polarity ? p.activeCls : p.idleCls"
                @click="setPolarity(p.key)"
              >{{ p.label }}</button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-5">
            <div class="flex flex-wrap gap-2 content-start">
              <button
                v-for="label in topicLabels"
                :key="label"
                type="button"
                class="inline-flex items-center px-3 py-2 rounded-lg font-bold transition-all duration-200 shadow-sm border w-full justify-between group"
                :class="label === activeTopic
                  ? `ring-2 ring-indigo-500 ring-offset-1 z-10 bg-white ${polarityBorderCls}`
                  : 'hover:scale-[1.02] hover:shadow-md bg-white opacity-90 hover:opacity-100 border-gray-100'"
                @click="activeTopic = label"
              >
                <span class="flex items-center gap-2 text-xs" :class="polarityTextCls">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>
                  {{ label }}
                </span>
                <span
                  class="text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors"
                  :class="label === activeTopic ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'"
                >{{ topicGroups[label]?.variants_count || 0 }}次</span>
              </button>
              <div v-if="!topicLabels.length" class="text-xs text-gray-400 w-full text-center py-6">暂无观点</div>
            </div>
          </div>
        </div>

        <div class="lg:w-2/3 flex flex-col h-full bg-white">
          <div class="bg-gray-50/80 border-b border-gray-100 px-5 py-3 flex text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
            <div class="w-40 shrink-0">平台</div>
            <div class="flex-1 px-4">大模型原文引用</div>
          </div>
          <div class="overflow-y-auto flex-1">
            <div class="divide-y divide-gray-50">
              <div
                v-for="(item, i) in activeQuotes"
                :key="i"
                class="px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-start text-xs group"
              >
                <div class="w-40 shrink-0 pt-0.5 flex flex-wrap gap-2 content-start">
                  <span class="inline-flex items-center px-2 py-1 rounded bg-white border border-gray-200 text-gray-700 font-bold shadow-sm text-[11px]">
                    {{ platformName(item.platform) }}
                  </span>
                </div>
                <div class="flex-1 px-4 text-gray-600 leading-relaxed italic relative">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-0 top-0 text-gray-300 scale-x-[-1]"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>
                  <span class="pl-4 block">{{ item.quote }}</span>
                </div>
              </div>
              <div v-if="!activeQuotes.length" class="px-5 py-10 text-center text-xs text-gray-400">该主题暂无原文引用</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 卡片 3：全景口碑矩阵 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-indigo-50/20 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 21v-6h2v6H5zm7 0V3h2v18h-2zm7 0V9h2v12h-2z"/></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900 tracking-tight">全景口碑矩阵</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">
                监控 <span class="font-medium text-gray-600">口碑健康度</span>，并对比各平台情感分 · {{ matrixDate }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
              <DashDateInput
                v-model="matrixDate"
                class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 focus:border-indigo-500 focus:outline-none shadow-sm"
                @change="loadMatrix"
              />
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm disabled:opacity-50"
              :disabled="exportingMatrix || !matrixRows.length"
              @click="exportMatrix"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
              {{ exportingMatrix ? '导出中…' : '导出' }}
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 text-[10px] font-bold text-gray-400 tracking-widest border-b border-gray-100">
              <tr>
                <th class="px-8 py-4">监控问题</th>
                <th class="px-6 py-4 text-center">综合健康度 (含7日趋势)</th>
                <th class="px-6 py-4 text-center">风险评级</th>
                <th class="px-8 py-4 text-center">
                  <div class="flex justify-between px-6">
                    <span v-for="e in matrixEngines" :key="e.key" class="w-12 inline-flex flex-col items-center gap-0.5 leading-tight tracking-normal">
                      <span class="inline-flex items-center gap-1 whitespace-nowrap">{{ e.name }}</span>
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in matrixRows" :key="row.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-8 py-5">
                  <div class="text-sm font-bold text-gray-700">{{ row.query }}</div>
                </td>
                <td class="px-6 py-5 text-center">
                  <div class="flex items-center justify-center gap-3">
                    <div class="flex flex-col items-center">
                      <span
                        class="px-2.5 py-1 rounded-lg text-sm font-black"
                        :style="scorePillStyle(cellVal(row.today.all))"
                      >{{ fmtScore(cellVal(row.today.all)) }}</span>
                    </div>
                    <div class="flex items-center gap-0.5 mt-1">
                      <svg
                        v-if="row.allChange.trend === 'up'"
                        class="text-emerald-500"
                        width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      ><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>
                      <svg
                        v-else-if="row.allChange.trend === 'down'"
                        class="text-rose-500"
                        width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      ><path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/></svg>
                      <span v-else class="text-gray-300 text-xs">—</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 justify-center w-fit mx-auto border"
                    :class="riskBadgeCls(cellVal(row.today.all))"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    {{ riskOf(cellVal(row.today.all)) }}
                  </span>
                </td>
                <td class="px-8 py-5">
                  <div class="flex justify-between px-6">
                    <div
                      v-for="e in matrixEngines"
                      :key="e.key"
                      class="w-12 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border border-black/5 shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:scale-110 transition-all"
                      :style="engineCellStyle(cellVal(row.today[e.key]))"
                      :title="`查看 ${row.query} 在${e.name}的快照`"
                      @click="goSnapshot(row.query)"
                    >{{ fmtScore(cellVal(row.today[e.key])) }}</div>
                  </div>
                </td>
              </tr>
              <tr v-if="!matrixRows.length">
                <td colspan="4" class="px-8 py-10 text-center text-sm text-gray-400">暂无口碑监控问题</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { monitorApi } from '@/api/modules/monitor';
import { lastNDays } from '@/utils/engines';
import { downloadAoaSheets } from '@/utils/xlsxExport';
import type { ReputationAnalysis, ReputationDataResp, AiRankingMatrixResp, AiRankingScore } from '@/api/types';
import PageHeader from '@/components/PageHeader.vue';
import DashDateRange from '@/components/DashDateRange.vue';
import DashDateInput from '@/components/DashDateInput.vue';
import SparkLine from '@/components/SparkLine.vue';

const router = useRouter();

const PLATFORM_META: Record<string, string> = {
  doubao: '豆包', wenxin: '文心一言', deepseek: 'DeepSeek', qwen: '通义千问', yuanbao: '元宝',
  kimi: 'Kimi', qianwen: '通义千问', all: '综合评价',
};
const platformName = (p: string) => PLATFORM_META[p] || p;

const platformOptions = [
  { key: 'all', label: '综合评价' },
  { key: 'doubao', label: '豆包' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'qwen', label: '通义千问' },
  { key: 'wenxin', label: '文心一言' },
  { key: 'yuanbao', label: '元宝' },
];

const matrixEngines = [
  { key: 'doubao', name: '豆包' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'wenxin', name: '文心一言' },
  { key: 'qwen', name: '通义千问' },
  { key: 'yuanbao', name: '元宝' },
];

type Polarity = 'positive' | 'neutral' | 'negative';
const polarityTabs: { key: Polarity; label: string; activeCls: string; idleCls: string; textCls: string; borderCls: string }[] = [
  { key: 'positive', label: '正面评价', activeCls: 'bg-emerald-600 text-white border-emerald-600 shadow-md', idleCls: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100', textCls: 'text-emerald-600', borderCls: 'text-emerald-600 border-emerald-100' },
  { key: 'neutral', label: '中性描述', activeCls: 'bg-slate-600 text-white border-slate-600 shadow-md', idleCls: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100', textCls: 'text-slate-600', borderCls: 'text-slate-600 border-slate-200' },
  { key: 'negative', label: '负面反馈', activeCls: 'bg-rose-500 text-white border-rose-500 shadow-md', idleCls: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100', textCls: 'text-rose-600', borderCls: 'text-rose-600 border-rose-100' },
];

const brandQueries = ref<{ id: number; query: string }[]>([]);
const queryId = ref(0);
const queriesExpanded = ref(false);
const rangeStart = ref('');
const rangeEnd = ref('');
const matrixDate = ref('');
const platform = ref('all');
const platformOpen = ref(false);
const platformMenuRef = ref<HTMLElement | null>(null);
const reputation = ref<ReputationDataResp | null>(null);
const matrix = ref<AiRankingMatrixResp['list']>({});
const polarity = ref<Polarity>('positive');
const activeTopic = ref('');
const exportingAnalysis = ref(false);
const exportingMatrix = ref(false);

const platformLabel = computed(
  () => platformOptions.find(p => p.key === platform.value)?.label || '综合评价',
);

const emptyAnalysis = (): ReputationAnalysis => ({
  ratio: { positive: 0, neutral: 0, negative: 0 }, positive: {}, neutral: {}, negative: {},
});

const repAnalysis = computed<ReputationAnalysis>(() =>
  reputation.value?.result?.[0]?.reputation_analysis || emptyAnalysis());
const ratio = computed(() => repAnalysis.value.ratio);
const scoreResult = computed(() => reputation.value?.score_result || []);

const riskLabel = computed(() => {
  const s = ratio.value.positive * 100;
  return s >= 80 ? '健康' : s >= 60 ? '中风险' : '高风险';
});
const riskColor = computed(() =>
  (riskLabel.value === '健康' ? 'text-emerald-600' : riskLabel.value === '中风险' ? 'text-amber-600' : 'text-rose-600'));

const pct = (n: number) => `${Math.round((n || 0) * 100)}%`;

const ratioRows = computed(() => [
  { key: 'positive', label: '正面评价', color: '#10b981', value: ratio.value.positive },
  { key: 'neutral', label: '中性描述', color: '#94a3b8', value: ratio.value.neutral },
  { key: 'negative', label: '负面反馈', color: '#f43f5e', value: ratio.value.negative },
]);

const C = 2 * Math.PI * 70;
const donutSegs = computed(() => {
  const r = ratio.value;
  const total = r.positive + r.neutral + r.negative || 1;
  const segs = [
    { key: 'positive', color: '#10b981', frac: r.positive / total },
    { key: 'neutral', color: '#94a3b8', frac: r.neutral / total },
    { key: 'negative', color: '#f43f5e', frac: r.negative / total },
  ];
  let acc = 0;
  return segs.map(s => {
    const len = s.frac * C;
    const seg = { ...s, len, offset: (acc / C) * 360 };
    acc += len;
    return seg;
  });
});

const scoreSeries = computed(() => scoreResult.value.map(r => Number(r.score) || 0));
const scoreLabels = computed(() => scoreResult.value.map(r => {
  const d = String(r.date_day || '');
  return d.length >= 10 ? d.slice(5) : d;
}));
const scoreSparkSeries = computed(() => scoreResult.value.map(r => ({
  date: String(r.date_day || ''),
  rate: Number(r.score) || 0,
  numerator: Math.round(Number(r.score) || 0),
  denominator: 100,
})));

const topicGroups = computed(() => repAnalysis.value[polarity.value] || {} as Record<string, any>);
const topicLabels = computed(() => Object.keys(topicGroups.value));
const polarityTextCls = computed(() => polarityTabs.find(t => t.key === polarity.value)?.textCls || '');
const polarityBorderCls = computed(() => polarityTabs.find(t => t.key === polarity.value)?.borderCls || '');

const activeQuotes = computed(() => {
  const grp = topicGroups.value[activeTopic.value] as
    { platforms?: Record<string, string[]>; variants_count?: number } | undefined;
  if (!grp) return [];
  const out: { platform: string; quote: string }[] = [];
  for (const [p, quotes] of Object.entries(grp.platforms || {})) {
    for (const q of quotes || []) {
      if (q) out.push({ platform: p, quote: q });
    }
  }
  return out;
});

const EMPTY_MATRIX_ROW: AiRankingMatrixResp['list'][string] = {
  today_score: {}, yesterday_score: {}, change: {},
};
const matrixRows = computed(() => brandQueries.value.map(q => {
  const m = matrix.value[String(q.id)] || EMPTY_MATRIX_ROW;
  const today: Record<string, number> = m.today_score || {};
  const change: Record<string, AiRankingScore> = m.change || {};
  const allChange: AiRankingScore = change.all || { value: 0, trend: 'flat' as const };
  return { id: q.id, query: q.query, today, allChange };
}));

const riskOf = (score: number) => (score >= 80 ? '健康' : score >= 60 ? '中风险' : '高风险');
const riskBadgeCls = (score: number) =>
  (score >= 80
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
    : score >= 60
      ? 'bg-amber-50 text-amber-600 border-amber-100'
      : 'bg-rose-50 text-rose-600 border-rose-100');

function cellVal(v: number | null | undefined): number {
  return v == null || Number.isNaN(Number(v)) ? 0 : Number(v);
}
function fmtScore(v: number) {
  if (!v) return '0';
  return Number.isInteger(v) ? String(v) : String(+v.toFixed(2));
}
function scorePillStyle(score: number) {
  if (score >= 80) return { backgroundColor: '#d1fae5', color: '#047857' };
  if (score >= 60) return { backgroundColor: '#fef3c7', color: '#b45309' };
  return { backgroundColor: '#fee2e2', color: '#b91c1c' };
}
function engineCellStyle(score: number) {
  if (!score) return { backgroundColor: '#f1f5f9', color: '#94a3b8' };
  if (score >= 80) return { backgroundColor: '#d1fae5', color: '#047857' };
  if (score >= 60) return { backgroundColor: '#fef3c7', color: '#b45309' };
  return { backgroundColor: '#fee2e2', color: '#b91c1c' };
}

function selectQuery(id: number) {
  queryId.value = id;
  loadAnalysis();
}
function selectPlatform(key: string) {
  platform.value = key;
  platformOpen.value = false;
  loadAnalysis();
}
function onRangeChange() {
  if (!matrixDate.value) matrixDate.value = rangeEnd.value;
  loadAnalysis();
}
function setPolarity(key: Polarity) {
  polarity.value = key;
  activeTopic.value = topicLabels.value[0] || '';
}
function goManageTopics() {
  router.push({ path: '/dashboard/topic-management', query: { type: 'brand' } });
}
function goSnapshot(query: string) {
  router.push({ path: '/dashboard/downloads', query: { type: 'brand', q: query } });
}

function onDocClick(e: MouseEvent) {
  const t = e.target as Node;
  if (platformMenuRef.value && !platformMenuRef.value.contains(t)) platformOpen.value = false;
}

async function loadAnalysis() {
  if (!rangeStart.value || !rangeEnd.value) return;
  try {
    const rep = await monitorApi.reputationData(
      queryId.value,
      rangeStart.value,
      rangeEnd.value,
      platform.value,
    );
    reputation.value = rep;
    if (!activeTopic.value || !topicGroups.value[activeTopic.value]) {
      activeTopic.value = topicLabels.value[0] || '';
    }
  } catch {
    reputation.value = null;
  }
}

async function loadMatrix() {
  if (!matrixDate.value || !brandQueries.value.length) {
    matrix.value = {};
    return;
  }
  try {
    const mat = await monitorApi.aiRankingMatrix(
      brandQueries.value.map(q => q.id),
      matrixDate.value,
    );
    matrix.value = mat?.list || {};
  } catch {
    matrix.value = {};
  }
}

function exportAnalysis() {
  exportingAnalysis.value = true;
  try {
    const scoreRows = [['日期', '口碑分', '平台'], ...scoreResult.value.map(r => [r.date_day, r.score, platformLabel.value])];
    const topicRows = [['情感', '观点', '次数']];
    for (const pol of ['positive', 'neutral', 'negative'] as Polarity[]) {
      const label = polarityTabs.find(t => t.key === pol)?.label || pol;
      const groups = repAnalysis.value[pol] || {};
      for (const [topic, grp] of Object.entries(groups)) {
        topicRows.push([label, topic, (grp as any)?.variants_count || 0]);
      }
    }
    const quoteRows = [['情感', '观点', '平台', '原文']];
    for (const pol of ['positive', 'neutral', 'negative'] as Polarity[]) {
      const label = polarityTabs.find(t => t.key === pol)?.label || pol;
      const groups = repAnalysis.value[pol] || {};
      for (const [topic, grp] of Object.entries(groups)) {
        for (const [p, quotes] of Object.entries((grp as any)?.platforms || {})) {
          for (const q of quotes || []) quoteRows.push([label, topic, platformName(p), q]);
        }
      }
    }
    downloadAoaSheets([
      { name: '情感走势', rows: scoreRows },
      { name: '观点标签', rows: topicRows },
      { name: '原文引用', rows: quoteRows },
    ], `口碑分析_${rangeStart.value}_${rangeEnd.value}.xlsx`);
    Message.success('已导出口碑分析');
  } catch (e: any) {
    Message.error(e?.message || '导出失败');
  } finally {
    exportingAnalysis.value = false;
  }
}

function exportMatrix() {
  exportingMatrix.value = true;
  try {
    const head = ['监控问题', '综合健康度', '风险评级', ...matrixEngines.map(e => e.name)];
    const rows = [head, ...matrixRows.value.map(row => [
      row.query,
      fmtScore(cellVal(row.today.all)),
      riskOf(cellVal(row.today.all)),
      ...matrixEngines.map(e => fmtScore(cellVal(row.today[e.key]))),
    ])];
    downloadAoaSheets([{ name: '全景口碑矩阵', rows }], `全景口碑矩阵_${matrixDate.value}.xlsx`);
    Message.success('已导出矩阵');
  } catch (e: any) {
    Message.error(e?.message || '导出失败');
  } finally {
    exportingMatrix.value = false;
  }
}

watch(topicLabels, labels => {
  if (!labels.includes(activeTopic.value)) activeTopic.value = labels[0] || '';
});

onMounted(async () => {
  document.addEventListener('click', onDocClick);
  const { start, end } = lastNDays(7);
  rangeStart.value = start;
  rangeEnd.value = end;
  matrixDate.value = end;
  try {
    const qs = await monitorApi.queryList('brand');
    brandQueries.value = (qs?.list || []).map(q => ({ id: q.id, query: q.query }));
    if (brandQueries.value.length) queryId.value = brandQueries.value[0].id;
  } catch {
    brandQueries.value = [];
  }
  await Promise.all([loadAnalysis(), loadMatrix()]);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
});
</script>
