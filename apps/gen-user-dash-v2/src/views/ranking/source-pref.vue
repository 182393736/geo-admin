<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader title="信源平台偏好" description="分析各 AI 平台收录引用的来源偏好，洞察内容分发策略" />

    <!-- 筛选行 -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="shrink-0 text-xs text-muted-foreground">日期</span>
        <DashDateRange v-model:start="rangeStart" v-model:end="rangeEnd" @change="reload" />
      </div>
      <div class="flex items-center gap-0.5 rounded-lg border bg-muted p-0.5">
        <button
          type="button"
          :class="[
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            tab === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="setTab('all')"
        >全部平台</button>
        <button
          v-for="p in tabPlatforms"
          :key="p.key"
          type="button"
          :class="[
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            tab === p.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="setTab(p.key)"
        >{{ p.name }}</button>
      </div>
      <div class="relative">
        <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="keyword"
          placeholder="搜索来源..."
          class="h-8 w-48 pl-8 text-xs"
        />
      </div>
      <span v-if="loading" class="text-xs text-muted-foreground">加载中…</span>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardContent class="flex items-center gap-4 p-5">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText class="h-4 w-4" />
          </div>
          <div class="min-w-0">
            <div class="mb-0.5 text-sm text-muted-foreground">引用来源数</div>
            <div class="text-2xl font-bold tabular-nums">{{ filteredSummary.total_sources }}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="flex items-center gap-4 p-5">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ThumbsUp class="h-4 w-4" />
          </div>
          <div class="min-w-0">
            <div class="mb-0.5 text-sm text-muted-foreground">总引用次数</div>
            <div class="text-2xl font-bold tabular-nums">{{ filteredSummary.total_ref_count.toLocaleString() }}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="flex items-center gap-4 p-5">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp class="h-4 w-4" />
          </div>
          <div class="min-w-0">
            <div class="mb-0.5 text-sm text-muted-foreground">平均引用次数</div>
            <div class="text-2xl font-bold tabular-nums">{{ avgRef }}</div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 图表：整行铺满，左 2 / 右 1 -->
    <div class="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch">
      <Card class="flex min-w-0 w-full flex-[2] flex-col overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ChartColumn class="h-4 w-4" />
            </div>
            <span class="text-sm font-semibold">
              TOP10 信源平台<span v-if="tab !== 'all'" class="font-medium text-muted-foreground"> ({{ tabName }})</span>
            </span>
          </div>
          <div v-if="tab === 'all'" class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div v-for="p in platforms" :key="p.key" class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: p.color }" />{{ p.name }}
            </div>
          </div>
        </div>
        <CardContent class="min-w-0 flex-1 p-5">
          <div class="relative w-full" @mouseleave="barHover = null">
            <svg :viewBox="`0 0 ${BW} ${BH}`" class="h-[380px] w-full" preserveAspectRatio="xMidYMid meet">
              <line
                v-for="(tick, i) in xTicks"
                :key="'xg' + i"
                :x1="xOf(tick)"
                :x2="xOf(tick)"
                :y1="PAD.t"
                :y2="BH - PAD.b"
                stroke="hsl(var(--border))"
                stroke-width="1"
              />
              <text
                v-for="(tick, i) in xTicks"
                :key="'xl' + i"
                :x="xOf(tick)"
                :y="BH - 8"
                text-anchor="middle"
                class="bar-axis"
              >{{ tick }}</text>

              <g v-for="(row, ri) in topSources" :key="row.canonical_source">
                <text
                  :x="PAD.l - 8"
                  :y="yOf(ri) + BAR_H / 2 + 4"
                  text-anchor="end"
                  class="bar-label"
                >{{ truncate(row.canonical_source, 10) }}</text>
                <g>
                  <rect
                    v-for="(seg, si) in stackSegs(row)"
                    :key="si"
                    :x="seg.x"
                    :y="yOf(ri)"
                    :width="Math.max(seg.w, 0)"
                    :height="BAR_H"
                    :fill="seg.color"
                    class="cursor-pointer"
                    @mousemove="onBarMove($event, row)"
                  />
                </g>
                <text
                  :x="xOf(row.ref_count) + 6"
                  :y="yOf(ri) + BAR_H / 2 + 4"
                  class="bar-value"
                >{{ row.ref_count }}</text>
              </g>
            </svg>

            <div
              v-if="barHover"
              class="pointer-events-none absolute z-20 min-w-[140px] rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-md"
              :style="{ left: barHover.left + 'px', top: barHover.top + 'px' }"
            >
              <div class="mb-2 font-medium">{{ barHover.name }}</div>
              <div
                v-for="s in barHover.segs"
                :key="s.key"
                class="flex items-center justify-between gap-3 leading-6 text-muted-foreground"
              >
                <span class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full" :style="{ background: s.color }" />{{ s.name }}
                </span>
                <span class="font-semibold tabular-nums text-foreground">{{ s.count }}</span>
              </div>
              <div class="mt-1.5 flex items-center justify-between gap-3 border-t pt-1.5 text-muted-foreground">
                <span>合计</span>
                <span class="font-bold tabular-nums text-primary">{{ barHover.total }}</span>
              </div>
            </div>

            <div v-if="!topSources.length" class="py-16 text-center text-sm text-muted-foreground">暂无信源引用数据</div>
          </div>
        </CardContent>
      </Card>

      <Card class="flex min-w-0 w-full flex-[1] flex-col overflow-hidden">
        <CardContent class="flex min-w-0 flex-1 flex-col p-5">
          <div class="relative mx-auto w-full max-w-[260px] flex-1" style="min-height: 220px;">
            <div class="flex h-full items-center justify-center">
              <svg class="h-[200px] w-[200px]" viewBox="0 0 42 42">
                <circle
                  v-for="(seg, i) in donutSegs"
                  :key="i"
                  cx="21" cy="21" r="15.9155"
                  fill="none"
                  :stroke="seg.color"
                  :stroke-width="6"
                  :stroke-dasharray="`${seg.len} ${100 - seg.len}`"
                  :stroke-dashoffset="seg.offset"
                  stroke-linecap="butt"
                />
              </svg>
            </div>
            <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold tabular-nums leading-none">{{ filteredSummary.total_ref_count.toLocaleString() }}</div>
              <div class="mt-1 text-xs text-muted-foreground">总引用</div>
            </div>
          </div>
          <div class="mt-4 w-full space-y-1.5">
            <div v-for="p in donutLegend" :key="p.key" class="flex items-center gap-2.5 text-sm">
              <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: p.color }" />
              <span class="shrink-0 text-muted-foreground">{{ p.name }}</span>
              <div class="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                <div class="h-full rounded-full" :style="{ width: p.width, background: p.color }" />
              </div>
              <span class="w-10 shrink-0 text-right font-semibold tabular-nums">{{ p.pct }}%</span>
            </div>
            <div v-if="!donutLegend.length" class="py-4 text-center text-xs text-muted-foreground">暂无占比数据</div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 明细表 -->
    <Card class="overflow-hidden">
      <div class="flex items-center gap-2.5 border-b px-5 py-4">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <List class="h-4 w-4" />
        </div>
        <span class="text-sm font-semibold">引用来源明细</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-muted text-xs text-muted-foreground">
              <th class="px-5 py-3 text-left font-medium">排名</th>
              <th class="px-5 py-3 text-left font-medium">信源平台</th>
              <th class="px-5 py-3 font-medium">
                <div class="flex items-center justify-center gap-1.5">
                  <span>豆包媒体权威度</span>
                  <span class="group/authority-tip relative inline-flex">
                    <button
                      type="button"
                      class="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <CircleHelp class="h-3 w-3" />
                    </button>
                    <span class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-[11px] font-medium text-background shadow-md group-hover/authority-tip:block">
                      此评价来源于豆包接口。
                    </span>
                  </span>
                </div>
              </th>
              <th class="px-5 py-3 text-right font-medium">引用次数</th>
              <th class="px-5 py-3 text-right font-medium">文章数</th>
              <th class="px-5 py-3 text-left font-medium">平台分布</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(s, i) in filteredList"
              :key="s.canonical_source"
              class="border-b transition-colors last:border-0 hover:bg-muted/45"
            >
              <td class="px-5 py-3 font-medium text-muted-foreground">{{ i + 1 }}</td>
              <td class="px-5 py-3">
                <span class="font-medium">{{ s.canonical_source }}</span>
                <div v-if="s.domain" class="mt-0.5 text-xs text-muted-foreground">{{ s.domain }}</div>
              </td>
              <td class="px-5 py-3 text-center">
                <span v-if="s.auth_info_des" class="text-xs text-muted-foreground">{{ s.auth_info_des }}</span>
                <Badge
                  v-else-if="s.auth_info_level"
                  class="border-transparent bg-amber-50 text-[11px] text-amber-700"
                >{{ s.auth_info_level }}</Badge>
                <span v-else class="text-xs text-muted-foreground/50">--</span>
              </td>
              <td class="px-5 py-3 text-right font-semibold tabular-nums">{{ s.ref_count }}</td>
              <td class="px-5 py-3 text-right text-muted-foreground">{{ s.article_count }}</td>
              <td class="px-5 py-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span
                    v-for="(seg, idx) in platformSegs(s)"
                    :key="idx"
                    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-white"
                    :style="{ background: seg.color }"
                  >{{ seg.name }}<span class="opacity-80">{{ seg.count }}</span></span>
                  <span v-if="!platformSegs(s).length" class="text-xs text-muted-foreground/50">--</span>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredList.length">
              <td colspan="6" class="px-5 py-10 text-center text-sm text-muted-foreground">暂无信源引用数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Search, FileText, ThumbsUp, TrendingUp, ChartColumn, PieChart, List, CircleHelp,
} from 'lucide-vue-next';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Badge, Card, CardContent, Input } from '@/components/ui';
import { monitorApi } from '@/api/modules/monitor';
import { lastNDays } from '@/utils/engines';
import DashDateRange from '@/components/DashDateRange.vue';

/** Tab 顺序 ≠ 图例/堆叠色序 */
const tabPlatforms = [
  { key: 'doubao', name: '豆包', color: '#3b82f6' },
  { key: 'deepseek', name: 'DeepSeek', color: '#2563eb' },
  { key: 'wenxin', name: '文心一言', color: '#ec4899' },
  { key: 'qwen', name: '通义千问', color: '#f59e0b' },
  { key: 'yuanbao', name: '元宝', color: '#06b6d4' },
];
/** 图例 & 堆叠条色序：文心 → 豆包 → DeepSeek → 通义 → 元宝 */
const platforms = [
  { key: 'wenxin', name: '文心一言', color: '#ec4899' },
  { key: 'doubao', name: '豆包', color: '#3b82f6' },
  { key: 'deepseek', name: 'DeepSeek', color: '#2563eb' },
  { key: 'qwen', name: '通义千问', color: '#f59e0b' },
  { key: 'yuanbao', name: '元宝', color: '#06b6d4' },
];

const tab = ref('all');
const list = ref<any[]>([]);
const summary = ref<any>({ total_ref_count: 0, total_sources: 0, platform_breakdown: {} });
const init = lastNDays(7);
const rangeStart = ref(init.start);
const rangeEnd = ref(init.end);
const keyword = ref('');
const loading = ref(false);
const barHover = ref<null | {
  name: string;
  segs: { key: string; name: string; color: string; count: number }[];
  total: number;
  left: number;
  top: number;
}>(null);

const BW = 720;
const BH = 380;
const PAD = { t: 4, r: 40, b: 28, l: 124 };
const BAR_H = 10;
const ROW_GAP = 34.2;

const tabName = computed(() => tabPlatforms.find(p => p.key === tab.value)?.name || '');

const filteredList = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return list.value;
  return list.value.filter((s: any) => (s.canonical_source || '').includes(kw) || (s.domain || '').includes(kw));
});

const filteredSummary = computed(() => {
  const rows = filteredList.value;
  if (!keyword.value.trim()) {
    return {
      total_sources: summary.value.total_sources || rows.length,
      total_ref_count: summary.value.total_ref_count || 0,
      platform_breakdown: summary.value.platform_breakdown || {},
    };
  }
  const bd: Record<string, number> = {};
  let total = 0;
  for (const s of rows) {
    total += s.ref_count || 0;
    for (const [k, v] of Object.entries(s.platforms || {})) {
      bd[k] = (bd[k] || 0) + ((v as any)?.ref_count || 0);
    }
  }
  return { total_sources: rows.length, total_ref_count: total, platform_breakdown: bd };
});

const avgRef = computed(() => {
  const s = filteredSummary.value;
  return s.total_sources ? (s.total_ref_count / s.total_sources).toFixed(1) : '0';
});

const topSources = computed(() => filteredList.value.slice(0, 10));
const maxRef = computed(() => Math.max(1, ...topSources.value.map((s: any) => s.ref_count || 0), 1));

const xTicks = computed(() => {
  const max = maxRef.value;
  const step = niceStep(max);
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.01; v += step) ticks.push(Math.round(v));
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks.slice(0, 6);
});

function niceStep(max: number) {
  if (max <= 10) return 2;
  if (max <= 50) return 10;
  if (max <= 100) return 25;
  if (max <= 200) return 50;
  if (max <= 500) return 100;
  if (max <= 1000) return 200;
  return Math.ceil(max / 4 / 100) * 100;
}

function xOf(v: number) {
  const maxX = xTicks.value[xTicks.value.length - 1] || maxRef.value;
  const plotW = BW - PAD.l - PAD.r;
  return PAD.l + (v / Math.max(maxX, 1)) * plotW;
}
function yOf(i: number) {
  return PAD.t + 12 + i * ROW_GAP;
}

function stackSegs(s: any) {
  const segs = platforms
    .map(p => ({
      key: p.key,
      color: p.color,
      count: (s.platforms?.[p.key]?.ref_count) || 0,
    }))
    .filter(x => x.count > 0);
  let acc = 0;
  return segs.map(x => {
    const x0 = xOf(acc);
    acc += x.count;
    const x1 = xOf(acc);
    return { ...x, x: x0, w: Math.max(0, x1 - x0) };
  });
}

function platformSegs(s: any) {
  return platforms
    .map(p => ({
      name: p.name,
      color: p.color,
      count: (s.platforms?.[p.key]?.ref_count) || 0,
    }))
    .filter(x => x.count > 0);
}

function truncate(s: string, n: number) {
  const t = String(s || '');
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

function onBarMove(ev: MouseEvent, row: any) {
  const host = (ev.currentTarget as SVGElement)?.ownerSVGElement?.parentElement;
  if (!host) return;
  const rect = host.getBoundingClientRect();
  const segs = platforms
    .map(p => ({
      key: p.key,
      name: p.name,
      color: p.color,
      count: (row.platforms?.[p.key]?.ref_count) || 0,
    }))
    .filter(x => x.count > 0);
  barHover.value = {
    name: row.canonical_source,
    segs,
    total: row.ref_count || segs.reduce((a, x) => a + x.count, 0),
    left: Math.min(ev.clientX - rect.left + 12, rect.width - 160),
    top: Math.max(8, ev.clientY - rect.top - 10),
  };
}

const donutData = computed(() => {
  const bd = filteredSummary.value.platform_breakdown || {};
  return platforms.map(p => ({ ...p, value: bd[p.key] || 0 })).filter(x => x.value > 0);
});
const donutTotal = computed(() => donutData.value.reduce((s, x) => s + x.value, 0) || 1);
const donutSegs = computed(() => {
  let acc = 0;
  const total = donutTotal.value;
  return donutData.value.map(x => {
    const len = (x.value / total) * 100;
    const seg = { color: x.color, len, offset: 100 - acc - len + 25 };
    acc += len;
    return seg;
  });
});
const donutLegend = computed(() => donutData.value.map(x => ({
  ...x,
  pct: Math.round((x.value / donutTotal.value) * 100),
  width: `${Math.max(0, Math.min(100, (x.value / donutTotal.value) * 100))}%`,
})));

function setTab(key: string) {
  tab.value = key;
  reload();
}

async function reload() {
  loading.value = true;
  barHover.value = null;
  try {
    const opts: { platform?: string } = {};
    if (tab.value !== 'all') opts.platform = tab.value;
    const resp: any = await monitorApi.sourceStats(
      rangeStart.value,
      rangeEnd.value,
      1,
      500,
      'industry',
      opts,
    );
    list.value = resp?.list || [];
    summary.value = resp?.summary || { total_ref_count: 0, total_sources: 0, platform_breakdown: {} };
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(reload);
</script>

<style scoped>
.bar-axis { font-size: 11px; fill: hsl(var(--muted-foreground)); }
.bar-label { font-size: 11px; fill: hsl(var(--foreground) / 0.7); }
.bar-value { font-size: 11px; fill: hsl(var(--foreground)); font-weight: 600; }
</style>
