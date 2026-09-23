<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="AI排名透视" description="深度分析品牌在不同 AI 引擎中的排名竞争态势">
      <template #actions>
        <Button
          variant="outline"
          size="icon"
          class="h-9 w-9"
          :title="isDark ? '切换浅色模式' : '切换暗黑模式'"
          @click="toggleTheme"
        >
          <Moon v-if="!isDark" class="h-4 w-4" />
          <Sun v-else class="h-4 w-4" />
        </Button>
        <DashReportExport :loading="exportingReport" @confirm="onExportReport" />
        <Button variant="outline" @click="goManageTopics">
          <List class="h-4 w-4" />
          管理监控问题
        </Button>
      </template>
    </PageHeader>

    <!-- 排名指标 -->
    <Card class="overflow-visible">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ChartColumn class="h-4 w-4" />
          </div>
          <span class="text-sm font-semibold">排名指标</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="outline" :disabled="exportingKpi" @click="exportKpiPanel">
            <Download class="h-3.5 w-3.5" />
            {{ exportingKpi ? '导出中…' : '导出' }}
          </Button>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground">统计周期</span>
            <DashDateRange v-model:start="kpiRangeStart" v-model:end="kpiRangeEnd" @change="reloadKpi" />
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-4 border-b bg-muted/30 px-5 py-3">
        <div class="flex items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">AI 引擎</span>
          <DashEngineMulti v-model="kpiEngines" :options="engineMultiOptions" @change="reloadKpi" />
        </div>
        <div class="flex min-w-0 items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">监控问题</span>
          <DashQuerySelect v-model="kpiQueryId" v-model:label="kpiQueryLabel" :options="queryOptions" @change="reloadKpi" />
        </div>
        <span v-if="loadingKpi" class="text-xs text-muted-foreground">加载中…</span>
      </div>
      <CardContent class="grid gap-4 p-5 md:grid-cols-3">
        <div
          v-for="kpi in kpiCards"
          :key="kpi.key"
          class="relative overflow-hidden rounded-lg border bg-card p-5"
        >
          <div class="absolute inset-x-0 top-0 h-[3px]" :style="{ background: kpi.line }" />
          <div class="mb-3 flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-semibold">{{ kpi.label }}</span>
                <div class="group relative">
                  <CircleHelp class="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                  <div class="absolute left-1/2 top-full z-[100] mt-2 hidden w-64 -translate-x-1/2 rounded-lg border bg-popover p-3 text-left text-xs leading-relaxed text-popover-foreground shadow-md group-hover:block">
                    <div class="mb-1 font-semibold">{{ kpi.label }}</div>
                    <div class="text-muted-foreground">{{ kpi.tip }}</div>
                    <div class="mt-1.5 text-muted-foreground">公式 = {{ kpi.formula }}</div>
                  </div>
                </div>
              </div>
              <div class="mt-0.5 text-[11px] text-muted-foreground">{{ kpi.sub }}</div>
            </div>
            <div class="text-right leading-none">
              <span :class="['text-3xl font-bold tabular-nums tracking-tight', kpi.color]">
                {{ kpi.value }}<span class="text-lg">%</span>
              </span>
              <div class="mt-1 text-[11px] text-muted-foreground">{{ kpi.ratio }}</div>
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
          <div class="mt-3 border-t pt-3 text-xs text-muted-foreground">提及问题 / 监控总数</div>
        </div>
      </CardContent>
    </Card>

    <!-- 品牌排名 -->
    <Card class="overflow-visible">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Trophy class="h-4 w-4" />
          </div>
          <span class="text-sm font-semibold">品牌排名</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="outline" :disabled="exportingRank" @click="exportRankPanel">
            <Download class="h-3.5 w-3.5" />
            {{ exportingRank ? '导出中…' : '导出' }}
          </Button>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground">统计周期</span>
            <DashDateRange v-model:start="rankRangeStart" v-model:end="rankRangeEnd" @change="reloadRank" />
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-4 border-b bg-muted/30 px-5 py-3">
        <div class="flex items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">AI 引擎</span>
          <DashEngineMulti v-model="rankEngines" :options="engineMultiOptions" @change="reloadRank" />
        </div>
        <div class="flex min-w-0 items-center gap-2">
          <span class="shrink-0 text-xs text-muted-foreground">监控问题</span>
          <DashQuerySelect v-model="rankQueryId" v-model:label="rankQueryLabel" :options="queryOptions" @change="reloadRank" />
        </div>
      </div>
      <CardContent class="p-5">
        <div class="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
          <div class="flex flex-col lg:col-span-4">
            <div class="flex h-[480px] flex-col rounded-lg border bg-muted/20 p-4">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-sm font-semibold">排名榜单</span>
                <Button variant="ghost" size="sm" class="h-7 px-2 text-xs text-muted-foreground">
                  查看全部
                  <ChevronRight class="h-3.5 w-3.5" />
                </Button>
              </div>
              <div class="min-h-0 flex-1 overflow-y-auto">
                <div
                  v-for="(r, i) in leaderboard"
                  :key="r.name + i"
                  class="grid items-center gap-3 border-b px-1 py-3 last:border-0 hover:bg-accent/50"
                  style="grid-template-columns: 28px 1fr auto"
                >
                  <span
                    :class="[
                      'inline-flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-bold',
                      rankBadgeCls(r.current_rank || i + 1),
                    ]"
                  >{{ r.current_rank || i + 1 }}</span>
                  <span
                    :class="['truncate text-sm font-semibold', r.is_target ? 'text-primary' : 'text-foreground']"
                  >{{ r.name }}</span>
                  <div class="flex shrink-0 items-center">
                    <Badge v-if="r.trend === 'new'" class="border-transparent bg-primary/10 font-mono text-[10px] text-primary">NEW</Badge>
                    <Badge
                      v-else-if="r.trend === 'down'"
                      class="border-transparent bg-red-50 font-mono text-[10px] text-red-600 dark:bg-red-500/15 dark:text-red-300"
                    >▼ {{ r.rank_change }}</Badge>
                    <Badge
                      v-else-if="r.trend === 'up'"
                      class="border-transparent bg-emerald-50 font-mono text-[10px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    >▲ {{ Math.abs(r.rank_change || 0) }}</Badge>
                  </div>
                </div>
                <div v-if="!leaderboard.length" class="py-10 text-center text-sm text-muted-foreground">暂无榜单数据</div>
              </div>
            </div>
          </div>
          <div class="flex flex-col lg:col-span-8">
            <div class="flex h-[480px] flex-col rounded-lg border bg-muted/20 p-4">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-sm font-semibold">排名趋势</span>
                <span class="text-xs text-muted-foreground">{{ rankRangeStart.slice(5) }} - {{ rankRangeEnd.slice(5) }}</span>
              </div>
              <div class="min-h-0 flex-1">
                <SparkLine
                  v-if="hasRankTrend"
                  :points="rankTrendPoints"
                  :labels="rankTrendLabels"
                  :series="rankTrendSeries"
                  color="hsl(221.2 83.2% 53.3%)"
                  :height="380"
                  :digits="0"
                  :interactive="true"
                  variant="rank"
                  rate-label="排名"
                  value-class="text-primary"
                />
                <div v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">暂无趋势数据</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 全景排名矩阵 -->
    <Card>
      <div class="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div class="flex items-start gap-2.5">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutGrid class="h-4 w-4" />
          </div>
          <div>
            <div class="text-sm font-semibold">全景排名矩阵</div>
            <p class="mt-0.5 text-xs text-muted-foreground">快速定位优势与劣势领域 · {{ matrixDate }}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground">日期</span>
            <DashDateInput v-model="matrixDate" class="h-9 rounded-lg border border-input bg-background px-3 text-sm" @change="reloadMatrix" />
          </div>
          <div class="relative" ref="colMenuRef">
            <Button size="sm" variant="outline" @click="colOpen = !colOpen">
              <Columns3 class="h-3.5 w-3.5" />
              显示列
            </Button>
            <div v-if="colOpen" class="absolute right-0 z-40 mt-1 w-48 rounded-lg border bg-popover p-2 shadow-md">
              <label
                v-for="e in ENGINES_META"
                :key="e.key"
                class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent"
              >
                <input v-model="visibleCols" type="checkbox" :value="e.key" class="rounded border-input accent-primary" />
                {{ e.name }}
              </label>
            </div>
          </div>
          <DashReportExport
            label="导出排名矩阵"
            loading-label="导出中…"
            :loading="exportingMatrix"
            @confirm="onExportMatrix"
          />
        </div>
      </div>
      <CardContent class="p-5">
        <div class="max-h-[90vh] overflow-auto rounded-lg border">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-muted text-xs text-muted-foreground">
                <th class="sticky top-0 z-20 bg-muted px-3.5 py-2.5 text-left font-medium">问题</th>
                <th class="sticky top-0 z-20 whitespace-nowrap bg-muted px-2 py-2.5 text-center font-medium">综合排名</th>
                <th class="sticky top-0 z-20 bg-muted px-2 py-2.5 text-center font-medium">品牌提及率</th>
                <th class="sticky top-0 z-20 bg-muted px-2 py-2.5 text-center font-medium">Top3 推荐率</th>
                <th class="sticky top-0 z-20 bg-muted px-2 py-2.5 text-center font-medium">首位推荐率</th>
                <th
                  v-for="e in visibleEngines"
                  :key="e.key"
                  class="sticky top-0 z-20 whitespace-nowrap bg-muted px-2 py-2.5 text-center font-medium"
                >{{ e.name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in matrixRows" :key="row.query" class="border-b last:border-0 hover:bg-muted/45">
                <td class="max-w-[240px] px-3.5 py-2.5 align-middle">
                  <span class="text-[12.5px] leading-snug" :title="row.query">{{ row.query }}</span>
                </td>
                <td class="px-2 py-2.5 text-center">
                  <Badge
                    v-if="row.overall === '未上榜'"
                    class="border-transparent bg-red-50 text-red-700"
                  >未上榜</Badge>
                  <Badge
                    v-else
                    class="border-transparent bg-primary/10 font-mono text-primary"
                  >第{{ row.overall }}名</Badge>
                </td>
                <td class="px-2 py-2.5 text-center font-mono text-[12.5px] font-semibold text-primary">{{ pct(row.mention_rate) }}</td>
                <td class="px-2 py-2.5 text-center font-mono text-[12.5px] font-semibold">{{ pct(row.top3_mention_rate) }}</td>
                <td class="px-2 py-2.5 text-center font-mono text-[12.5px] font-semibold">{{ pct(row.first_mention_rate) }}</td>
                <td v-for="e in visibleEngines" :key="e.key" class="px-2 py-2.5 text-center">
                  <span
                    :class="cellCls()"
                    :style="cellStyle(row.rank_value[e.key])"
                    :title="`查看「${row.query}」在${e.name}的搜索快照`"
                    role="link"
                    tabindex="0"
                    @click="goMatrixCell(row, e.key)"
                    @keydown.enter.prevent="goMatrixCell(row, e.key)"
                  >{{ cellText(row.rank_value[e.key]) }}</span>
                </td>
              </tr>
              <tr v-if="!matrixRows.length">
                <td :colspan="5 + visibleEngines.length" class="px-3.5 py-10 text-center text-muted-foreground">
                  暂无排名数据（采集或解析尚未产出）
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { List, Download, CircleHelp, ChevronRight, Columns3, ChartColumn, Trophy, LayoutGrid, Moon, Sun } from 'lucide-vue-next';
import { Message } from '@/lib/toast';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Badge, Button, Card, CardContent } from '@/components/ui';
import { useTheme } from '@/composables/useTheme';
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
const { isDark, toggleTheme } = useTheme();
const exportingReport = ref(false);
const exportingKpi = ref(false);
const exportingRank = ref(false);
const exportingMatrix = ref(false);

const ENGINES_ALL = ['doubao', 'wenxin', 'deepseek', 'qwen', 'yuanbao'] as const;
const ENGINES_META = [
  { key: 'doubao', name: '豆包', color: '#3b82f6' },
  { key: 'wenxin', name: '文心一言', color: '#ec4899' },
  { key: 'deepseek', name: 'DeepSeek', color: '#2563eb' },
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

/** 对标：综合排名直接展示 rank_value.all（不做题间相对重排） */
function overallFromRankValue(rankValue: Record<string, any> | undefined) {
  const raw = rankValue?.all;
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return String(Math.round(n));
  return '未上榜';
}

const matrixRows = computed(() => {
  const list = matrix.value.list || {};
  return Object.entries(list).map(([qid, r]: [string, any]) => ({
    ...r,
    query_id: Number((r as any)?.query_id) || Number(qid) || 0,
    overall: overallFromRankValue(r?.rank_value),
  }));
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
const rankTrendSeries = computed(() =>
  visibilityTrend.value
    .map((t: any) => ({
      date: fmtDate(t.date_day),
      dateRaw: String(t.date_day || ''),
      rate: Number(t.rank_value),
    }))
    .filter((s: { date: string; dateRaw: string; rate: number }) => Number.isFinite(s.rate) && s.rate > 0)
    // 接口 validList 为降序；曲线 X 轴需从左到右升序
    .sort((a, b) => a.dateRaw.localeCompare(b.dateRaw))
    .map(({ date, rate }) => ({ date, rate })),
);
const rankTrendLabels = computed(() => rankTrendSeries.value.map(s => s.date || ''));
const rankTrendPoints = computed(() => rankTrendSeries.value.map(s => s.rate));
const hasRankTrend = computed(() => rankTrendSeries.value.length >= 1);

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
    key: 'mention', label: '品牌提及率', sub: '被提及采样占比（不限位次）',
    color: 'text-primary', line: 'hsl(221.2 83.2% 53.3%)',
    valueClass: 'text-primary', rateLabel: '提及率',
    value: (+(sumOf(mentionTrend.value).rate || 0)).toFixed(2),
    ratio: `${sumOf(mentionTrend.value).numerator || 0} / ${sumOf(mentionTrend.value).denominator || 0}`,
    tip: '品牌在 AI 答案中被提及的采样占比，不限位次。',
    formula: '被提及的采样数 ÷ 总采样数',
    points: padFlatPoints(trendPoints(mentionTrend.value)),
    labels,
    series: mentionS,
  },
  {
    key: 'top3', label: 'Top3 推荐率', sub: '进入前三名的采样占比',
    color: 'text-sky-600 dark:text-sky-400', line: 'hsl(199 89% 48%)',
    valueClass: 'text-sky-600 dark:text-sky-400', rateLabel: 'Top3率',
    value: (+(sumOf(top3Trend.value).rate || 0)).toFixed(2),
    ratio: `${sumOf(top3Trend.value).numerator || 0} / ${sumOf(top3Trend.value).denominator || 0}`,
    tip: '品牌在 AI 答案中位列前三名的采样占比。',
    formula: '进入 Top3 的采样数 ÷ 总采样数',
    points: padFlatPoints(trendPoints(top3Trend.value)),
    labels,
    series: top3S,
  },
  {
    key: 'first', label: '首位推荐率', sub: '排到首位的采样占比',
    color: 'text-blue-700 dark:text-blue-400', line: 'hsl(221.2 70% 48%)',
    valueClass: 'text-blue-700 dark:text-blue-400', rateLabel: '首位率',
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
  if (i === 1) return 'bg-primary text-primary-foreground';
  if (i === 2) return 'bg-primary/70 text-primary-foreground';
  if (i === 3) return 'bg-primary/40 text-primary';
  return 'bg-secondary text-muted-foreground';
}
function cellCls() {
  return 'inline-block min-w-[36px] cursor-pointer rounded-md px-[7px] py-[3px] font-mono text-[12.5px] font-bold transition-all hover:ring-2 hover:ring-ring';
}
function cellStyle(v: any) {
  const dark = document.documentElement.classList.contains('dark')
  if (Number.isFinite(Number(v))) {
    return dark
      ? { background: 'hsl(217.2 91.2% 59.8% / 0.18)', color: 'hsl(213 94% 78%)' }
      : { background: 'hsl(221.2 83.2% 53.3% / 0.12)', color: 'hsl(221.2 83.2% 40%)' }
  }
  return dark
    ? { background: 'hsl(0 63% 30% / 0.25)', color: 'hsl(0 90% 75%)' }
    : { background: 'hsl(0 84% 96%)', color: 'hsl(0 72% 40%)' }
}
function cellText(v: any) {
  if (Number.isFinite(Number(v))) return `#${v}`;
  return '未上榜';
}

/** 对标：矩阵引擎格点击 → 搜索快照（按问题×平台×日期过滤） */
function goMatrixCell(row: any, platform: string) {
  const qid = Number(row?.query_id);
  router.push({
    path: '/dashboard/downloads',
    query: {
      type: 'industry',
      platform,
      date: matrixDate.value || undefined,
      ...(Number.isFinite(qid) && qid > 0 ? { query_id: String(qid) } : {}),
      ...(row?.query ? { q: String(row.query) } : {}),
    },
  });
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
