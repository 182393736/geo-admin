<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="flex flex-col gap-6 animate-fade-in max-w-[1600px] mx-auto pb-20">

      <!-- 头部 -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">AI 口碑分析</h2>
          <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span>定性分析 AI 回答内容的语义理解与情感倾向</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            导出
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/></svg>
            分享
          </button>
        </div>
      </div>

      <!-- 卡片 1：问题选择 + 评分网格 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div class="flex flex-col bg-white border-b border-gray-50">
          <!-- 问题 chips -->
          <div class="w-full px-6 pt-4 pb-2">
            <div class="flex items-start gap-4">
              <div class="flex items-center gap-1.5 mt-2 px-0 w-[60px] text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none justify-start">
                <span>问题:</span>
              </div>
              <div class="flex-1">
                <div class="flex flex-wrap gap-2 transition-all duration-300 ease-in-out">
                  <button
                    v-for="q in brandQueries"
                    :key="q.id"
                    class="flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border"
                    :class="q.id === queryId ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'"
                    @click="selectQuery(q.id)"
                  >{{ q.query }}</button>
                </div>
              </div>
              <button class="flex items-center gap-1 px-3 py-1.5 mt-0.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0">查看全部</button>
            </div>
          </div>
          <!-- AI平台 + 日期 -->
          <div class="w-full px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1.5 w-[70px] text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none justify-start"><span>AI平台:</span></div>
                <div class="relative">
                  <button class="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[130px]">
                    <span>综合评价</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-3 relative">
                <div class="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none"><span>日期:</span></div>
                <div class="relative">
                  <button class="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 transition-all shadow-sm min-w-[220px]">
                    <div class="flex items-center gap-2">
                      <span>{{ rangeStart }}</span>
                      <span>—</span>
                      <span>{{ rangeEnd }}</span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                  </button>
                </div>
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
                      :stroke-dashoffset="-1" :stroke-linecap="seg.len > 0.5 ? 'round' : 'butt'"
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
                <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background:#10b981"></span>
                    <span class="text-xs font-medium text-gray-600">正面评价</span>
                  </div>
                  <span class="text-xs font-bold text-gray-900">{{ pct(ratio.positive) }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background:#94a3b8"></span>
                    <span class="text-xs font-medium text-gray-600">中性描述</span>
                  </div>
                  <span class="text-xs font-bold text-gray-900">{{ pct(ratio.neutral) }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background:#f43f5e"></span>
                    <span class="text-xs font-medium text-gray-600">负面反馈</span>
                  </div>
                  <span class="text-xs font-bold text-gray-900">{{ pct(ratio.negative) }}</span>
                </div>
              </div>
            </div>
            <!-- 口碑分趋势 -->
            <div class="lg:col-span-8 rounded-2xl border border-gray-100 bg-white p-6 flex flex-col min-h-[320px] transition-shadow duration-300">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">口碑分趋势</h3>
              </div>
              <div class="flex-1 w-full min-h-[220px]">
                <svg v-if="scorePoints.length" :viewBox="`0 0 ${chartW} 220`" preserveAspectRatio="none" class="w-full h-full">
                  <defs>
                    <linearGradient id="repArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.18" />
                      <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    :points="scorePoints.map(p => `${p.x},${p.y}`).join(' ')"
                    fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
                  />
                  <polygon :points="areaPoints" fill="url(#repArea)" />
                  <g v-for="(p, i) in scorePoints" :key="i">
                    <circle :cx="p.x" :cy="p.y" r="3.5" fill="#fff" stroke="#6366f1" stroke-width="2" />
                  </g>
                </svg>
                <div v-else class="flex items-center justify-center h-full text-sm text-gray-400">暂无口碑分数据</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 卡片 2：观点标签 + 原文引用 -->
      <div class="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col lg:flex-row h-[340px] overflow-hidden transition-shadow duration-300">
        <div class="lg:col-span-4 lg:w-1/3 border-r border-gray-100 flex flex-col h-full bg-gray-50/20">
          <div class="p-5 border-b border-gray-100">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in polarityTabs"
                :key="p.key"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border"
                :class="p.key === polarity ? p.activeCls : p.idleCls"
                @click="polarity = p.key"
              >{{ p.label }}</button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-200">
            <div class="flex flex-wrap gap-2 content-start">
              <button
                v-for="(grp, label) in topicGroups"
                :key="label"
                class="inline-flex items-center px-3 py-2 rounded-lg font-bold transition-all duration-200 shadow-sm border w-full justify-between group"
                :class="label === activeTopic ? 'ring-2 ring-indigo-500 ring-offset-1 z-10 bg-white border-indigo-100' : 'hover:scale-[1.02] hover:shadow-md bg-white opacity-90 hover:opacity-100 border-gray-100'"
                @click="activeTopic = label"
              >
                <span class="flex items-center gap-2 text-xs" :class="polarityTextCls">{{ label }}</span>
                <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-50 group-hover:bg-gray-100 transition-colors" :class="label === activeTopic ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'">{{ grp.variants_count }}次</span>
              </button>
              <div v-if="!topicLabels.length" class="text-xs text-gray-400 w-full text-center py-6">暂无观点</div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-8 lg:w-2/3 flex flex-col h-full bg-white">
          <div class="bg-gray-50/80 border-b border-gray-100 px-5 py-3 flex text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
            <div class="w-40 shrink-0">平台</div>
            <div class="flex-1 px-4">大模型原文引用</div>
          </div>
          <div class="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
            <div class="divide-y divide-gray-50">
              <div v-for="(item, i) in activeQuotes" :key="i" class="px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-start text-xs group">
                <div class="w-40 shrink-0 pt-0.5 flex flex-wrap gap-2 content-start">
                  <span class="inline-flex items-center px-2 py-1 rounded bg-white border border-gray-200 text-gray-700 font-bold shadow-sm text-[11px]">{{ platformName(item.platform) }}</span>
                </div>
                <div class="flex-1 px-4 text-gray-600 leading-relaxed italic relative">
                  <span class="pl-4 block">{{ item.quote }}</span>
                </div>
              </div>
              <div v-if="!activeQuotes.length" class="px-5 py-10 text-center text-xs text-gray-400">该主题暂无原文引用</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 卡片 3：全景口碑矩阵 -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-fade-in-up">
        <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-indigo-50/20 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="8" rx="1"/><rect x="12" y="6" width="3" height="12" rx="1"/><rect x="17" y="13" width="3" height="5" rx="1"/></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900 tracking-tight">全景口碑矩阵</h3>
              <p class="text-[10px] text-gray-400 mt-0.5">
                <span class="font-medium text-gray-600">口碑健康度</span> 今日 vs 昨日，按引擎拆解（0–100，越高越正面）
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input placeholder="搜索问题..." class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm" />
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm disabled:opacity-50">导出</button>
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
                      <span class="px-2.5 py-1 rounded-lg text-sm font-black" :class="scoreCellCls(cellVal(row.today.all))">{{ cellVal(row.today.all) }}</span>
                    </div>
                    <div class="flex items-center gap-0.5 mt-1">
                      <svg v-if="row.allChange.trend !== 'flat'" :class="row.allChange.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path v-if="row.allChange.trend === 'up'" d="M7 17 17 7"/><path v-if="row.allChange.trend === 'up'" d="M7 7h10v10"/>
                        <path v-if="row.allChange.trend === 'down'" d="M7 7l10 10"/><path v-if="row.allChange.trend === 'down'" d="M17 7v10H7"/>
                      </svg>
                      <span v-else class="text-gray-300 text-xs">—</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 justify-center w-fit mx-auto" :class="riskBadgeCls(cellVal(row.today.all))">
                    {{ riskOf(cellVal(row.today.all)) }}
                  </span>
                </td>
                <td class="px-8 py-5">
                  <div class="flex justify-between px-6">
                    <div
                      v-for="e in matrixEngines" :key="e.key"
                      class="w-12 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border border-black/5 shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:scale-110 transition-all"
                      :style="{ background: engineCellBg(cellVal(row.today[e.key])) }"
                    >{{ cellVal(row.today[e.key]) }}</div>
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
import { ref, computed, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import { lastNDays } from '@/utils/engines';
import type { ReputationAnalysis, ReputationDataResp, AiRankingMatrixResp, AiRankingScore } from '@/api/types';

const PLATFORM_META: Record<string, string> = {
  doubao: '豆包', wenxin: '文心一言', deepseek: 'DeepSeek', qwen: '通义千问', yuanbao: '元宝',
  kimi: 'Kimi', qianwen: '通义千问',
};
const platformName = (p: string) => PLATFORM_META[p] || p;

// 全景口碑矩阵引擎顺序（对标表头：豆包 / DeepSeek / 文心一言 / 通义千问 / 元宝）
const matrixEngines = [
  { key: 'doubao', name: '豆包' },
  { key: 'deepseek', name: 'DeepSeek' },
  { key: 'wenxin', name: '文心一言' },
  { key: 'qwen', name: '通义千问' },
  { key: 'yuanbao', name: '元宝' },
];

type Polarity = 'positive' | 'neutral' | 'negative';
const polarityTabs: { key: Polarity; label: string; activeCls: string; idleCls: string; textCls: string }[] = [
  { key: 'positive', label: '正面评价', activeCls: 'bg-emerald-600 text-white border-emerald-600 shadow-md', idleCls: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100', textCls: 'text-emerald-600' },
  { key: 'neutral', label: '中性描述', activeCls: 'bg-slate-600 text-white border-slate-600 shadow-md', idleCls: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100', textCls: 'text-slate-600' },
  { key: 'negative', label: '负面反馈', activeCls: 'bg-rose-500 text-white border-rose-500 shadow-md', idleCls: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100', textCls: 'text-rose-600' },
];

const brandQueries = ref<{ id: number; query: string }[]>([]);
const queryId = ref(0);
const rangeStart = ref('');
const rangeEnd = ref('');
const reputation = ref<ReputationDataResp | null>(null);
const matrix = ref<AiRankingMatrixResp['list']>({});
const polarity = ref<Polarity>('positive');
const activeTopic = ref('');

const emptyAnalysis = (): ReputationAnalysis => ({
  ratio: { positive: 0, neutral: 0, negative: 0 }, positive: {}, neutral: {}, negative: {},
});

// 对标 /summary/reputation_data：reputation_analysis 位于 result[0]
const repAnalysis = computed<ReputationAnalysis>(() =>
  reputation.value?.result?.[0]?.reputation_analysis || emptyAnalysis());
const ratio = computed(() => repAnalysis.value.ratio);
const scoreResult = computed(() => reputation.value?.score_result || []);

const riskLabel = computed(() => {
  const s = ratio.value.positive * 100;
  return s >= 80 ? '健康' : s >= 60 ? '中风险' : '高风险';
});
const riskColor = computed(() => (riskLabel.value === '健康' ? 'text-emerald-600' : riskLabel.value === '中风险' ? 'text-amber-600' : 'text-rose-600'));

const pct = (n: number) => `${Math.round((n || 0) * 100)}%`;

// —— 情感倾向 donut 段 ——
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

// —— 口碑分趋势折线 ——
const chartW = 800;
const scorePoints = computed(() => {
  const rows = scoreResult.value;
  if (!rows.length) return [];
  const n = rows.length;
  const pad = 30;
  const h = 220;
  const min = Math.min(0, ...rows.map(r => Number(r.score)));
  const max = Math.max(100, ...rows.map(r => Number(r.score)));
  const span = max - min || 1;
  return rows.map((r, i) => ({
    x: pad + (i * (chartW - pad * 2)) / Math.max(1, n - 1),
    y: h - pad - ((Number(r.score) - min) / span) * (h - pad * 2),
  }));
});
const areaPoints = computed(() => {
  if (!scorePoints.value.length) return '';
  const pts = scorePoints.value.map(p => `${p.x},${p.y}`).join(' ');
  const first = scorePoints.value[0];
  const last = scorePoints.value[scorePoints.value.length - 1];
  return `${first.x},220 ${pts} ${last.x},220`;
});

// —— 观点标签 + 引用 ——
const topicGroups = computed(() => repAnalysis.value[polarity.value] || {});
const topicLabels = computed(() => Object.keys(topicGroups.value));
const polarityTextCls = computed(() => polarityTabs.find(t => t.key === polarity.value)?.textCls || '');
const activeQuotes = computed(() => {
  const grp = topicGroups.value[activeTopic.value] as
    { platforms?: Record<string, string[]>; variants_count?: number } | undefined;
  if (!grp) return [];
  const out: { platform: string; quote: string }[] = [];
  for (const [p, quotes] of Object.entries(grp.platforms || {})) {
    for (const q of quotes) out.push({ platform: p, quote: q });
  }
  return out;
});

// —— 全景口碑矩阵 ——
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
const riskBadgeCls = (score: number) => (score >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : score >= 60 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-rose-50 text-rose-600 border border-rose-100');
const scoreCellCls = (score: number) => (score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600');
const engineCellBg = (score: number) => {
  if (!score) return '#f1f5f9';
  if (score >= 80) return '#d1fae5';
  if (score >= 60) return '#fef3c7';
  return '#ffe4e6';
};
const cellVal = (v: number | null | undefined): number => (v == null || Number.isNaN(v) ? 0 : v);

function selectQuery(id: number) {
  queryId.value = id;
  loadAll();
}

async function loadAll() {
  const { start, end } = lastNDays(7);
  rangeStart.value = start;
  rangeEnd.value = end;
  try {
    const [rep, mat] = await Promise.all([
      monitorApi.reputationData(queryId.value, start, end),
      monitorApi.aiRankingMatrix(brandQueries.value.map(q => q.id), end),
    ]);
    reputation.value = rep;
    matrix.value = mat?.list || {};
    // 默认选中第一个有观点的主题
    if (!activeTopic.value || !topicGroups.value[activeTopic.value]) {
      activeTopic.value = topicLabels.value[0] || '';
    }
  } catch { /* 空态 */ }
}

onMounted(async () => {
  try {
    const qs = await monitorApi.queryList('brand');
    brandQueries.value = (qs?.list || []).map(q => ({ id: q.id, query: q.query }));
    if (brandQueries.value.length) queryId.value = brandQueries.value[0].id;
  } catch { brandQueries.value = []; }
  await loadAll();
});
</script>
