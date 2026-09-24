<template>
  <div
    ref="root"
    class="spark"
    :style="{ height: height + 'px' }"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <svg
      :viewBox="`0 0 ${vbW} ${vbH}`"
      class="spark-svg"
      :style="{ height: chartH + 'px' }"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop :offset="interactive ? '5%' : '0%'" :stop-color="color" :stop-opacity="interactive ? 0.15 : 0.22" />
          <stop :offset="interactive ? '95%' : '100%'" :stop-color="color" stop-opacity="0" />
        </linearGradient>
        <clipPath v-if="interactive" :id="clipId">
          <rect :x="ml" :y="MT" :width="plotW" :height="plotH" />
        </clipPath>
        <!-- 从左到右揭示动画 -->
        <clipPath :id="revealId">
          <rect
            class="spark-reveal-rect"
            :x="interactive ? ml : 0"
            y="0"
            :width="revealW"
            :height="vbH"
          />
        </clipPath>
      </defs>

      <!-- 网格 -->
      <template v-if="interactive">
        <line
          v-for="(tick, i) in yTicks"
          :key="'yg' + i"
          :x1="ml"
          :x2="ml + plotW"
          :y1="yOfValue(tick)"
          :y2="yOfValue(tick)"
          stroke="#f1f5f9"
          stroke-width="1"
          stroke-dasharray="3 3"
        />
        <text
          v-for="(tick, i) in yTicks"
          :key="'yl' + i"
          :x="ml - 6"
          :y="yOfValue(tick) + 3"
          text-anchor="end"
          class="spark-axis-label"
        >{{ formatYTick(tick) }}</text>
      </template>
      <template v-else>
        <line
          v-for="g in 3"
          :key="'g' + g"
          :x1="0"
          :x2="vbW"
          :y1="(vbH - PAD) / 3 * g"
          :y2="(vbH - PAD) / 3 * g"
          stroke="#eef0f5"
          stroke-width="1"
        />
      </template>

      <g :clip-path="`url(#${revealId})`">
        <g :clip-path="interactive ? `url(#${clipId})` : undefined">
          <path v-if="pts.length > 1" :d="areaPath" :fill="`url(#${gid})`" />
        </g>
        <!-- stroke 不裁剪 plot，避免 0%/低值水平线贴底被 clip 掉 -->
        <path
          v-if="pts.length > 1"
          :d="linePath"
          fill="none"
          :stroke="color"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        <template v-if="!interactive">
          <circle
            v-for="(p, i) in pts"
            :key="'p' + i"
            :cx="xOf(i)"
            :cy="yNorm(p)"
            r="2.6"
            :fill="color"
          />
          <text
            v-if="pts.length"
            :x="xOf(pts.length - 1)"
            :y="yNorm(pts[pts.length - 1]) - 9"
            text-anchor="end"
            class="spark-v"
          >{{ fmt(drawPoints[pts.length - 1]) }}</text>
        </template>
      </g>

      <template v-if="interactive && hoverIdx != null">
        <line
          :x1="xOf(hoverIdx)"
          :x2="xOf(hoverIdx)"
          :y1="MT"
          :y2="MT + plotH"
          stroke="#94a3b8"
          stroke-width="1"
          stroke-dasharray="4 4"
        />
        <circle
          :cx="xOf(hoverIdx)"
          :cy="yNorm(pts[hoverIdx])"
          r="4"
          :fill="color"
          stroke="#fff"
          stroke-width="2"
        />
      </template>
    </svg>

    <div
      v-if="interactive && axisLabels.length"
      class="spark-x-axis"
      :style="{ paddingLeft: `${ml}px` }"
    >
      <span v-for="(lb, i) in axisLabels" :key="'x' + i" class="spark-x-tick">{{ lb }}</span>
    </div>
    <div v-else-if="axisLabels.length" class="spark-axis">
      <span>{{ axisLabels[0] }}</span>
      <span>{{ axisLabels[axisLabels.length - 1] }}</span>
    </div>

    <div
      v-if="interactive && hoverIdx != null && tip"
      class="spark-tip"
      :style="tipStyle"
    >
      <p class="mb-1 font-bold text-gray-900">{{ tip.date }}</p>
      <div class="flex justify-between gap-3">
        <span class="text-gray-500">{{ rateLabel }}:</span>
        <span class="font-bold" :class="valueClass">{{ tip.rateText }}</span>
      </div>
      <div v-if="variant !== 'rank'" class="flex justify-between gap-3">
        <span class="text-gray-500">分子 / 分母:</span>
        <span class="font-bold text-gray-900">{{ tip.num }} / {{ tip.den }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

export type SparkSeriesPoint = {
  date?: string;
  rate: number;
  numerator?: number;
  denominator?: number;
};

const props = withDefaults(defineProps<{
  points: number[];
  labels?: string[];
  color?: string;
  height?: number;
  unit?: string;
  digits?: number;
  interactive?: boolean;
  /** rate=百分比轴；rank=名次轴（第1名在上，倒序） */
  variant?: 'rate' | 'rank';
  rateLabel?: string;
  valueClass?: string;
  series?: SparkSeriesPoint[];
}>(), {
  labels: () => [],
  color: 'hsl(var(--primary))',
  height: 120,
  unit: '',
  digits: 1,
  interactive: false,
  variant: 'rate',
  rateLabel: '提及率',
  valueClass: 'text-primary',
  series: () => [],
});

const PAD = 26;
const MR = 5;
const MT = 8;
const MB = 10;
const REVEAL_MS = 900;

const ml = computed(() => (props.variant === 'rank' ? 52 : 40));

const vbW = computed(() => {
  if (!props.interactive) return 600;
  return props.variant === 'rank' ? 560 : 323;
});
const vbH = computed(() => {
  if (!props.interactive) return 160;
  return props.variant === 'rank' ? 280 : 100;
});
const plotW = computed(() => vbW.value - ml.value - MR);
const plotH = computed(() => vbH.value - MT - MB);

const gid = `spark-${Math.random().toString(36).slice(2, 9)}`;
const clipId = `clip-${Math.random().toString(36).slice(2, 9)}`;
const revealId = `reveal-${Math.random().toString(36).slice(2, 9)}`;

const root = ref<HTMLElement | null>(null);
const hoverIdx = ref<number | null>(null);
const revealW = ref(0);
let revealRaf = 0;
let revealStart = 0;

const chartH = computed(() => (props.interactive ? Math.max(90, props.height - 18) : props.height));

const rawPoints = computed(() => {
  const fromSeries = (props.series || []).map(s => Number(s.rate) || 0);
  const fromPoints = props.points || [];
  // series 优先；但若 series 全 0 而 points 有值，用 points（避免单日贴底假 0 线）
  if (fromSeries.length) {
    const seriesAllZero = fromSeries.every(v => v === 0);
    const pointsHasValue = fromPoints.some(v => Number(v) > 0);
    if (seriesAllZero && pointsHasValue && fromPoints.length === fromSeries.length) {
      return fromPoints.map(v => Number(v) || 0);
    }
    return fromSeries;
  }
  return fromPoints;
});

/** 仅 1 天时复制为起止两点，曲线横向拉满（与「两天同值」一致，按真实 rate 高度画水平线） */
const drawPoints = computed(() => {
  const arr = rawPoints.value;
  if (arr.length === 1) return [arr[0], arr[0]];
  return arr;
});

const drawSeries = computed(() => {
  const s = props.series || [];
  if (s.length === 1) return [s[0], s[0]];
  return s;
});

const axisLabels = computed(() => {
  const lbs = props.labels?.length
    ? [...props.labels]
    : (props.series || []).map(s => s.date || '');
  if (lbs.length === 1) return [lbs[0], lbs[0]];
  return lbs;
});

const yDomain = computed(() => {
  if (props.interactive && props.variant === 'rank') {
    const arr = drawPoints.value.filter(v => Number.isFinite(v) && v > 0);
    const dataMax = arr.length ? Math.max(...arr) : 5;
    return { min: 1, max: Math.max(5, Math.ceil(dataMax)) };
  }
  if (props.interactive) return { min: 0, max: 100 };
  const arr = drawPoints.value;
  if (!arr.length) return { min: 0, max: 1 };
  const min = Math.min(...arr, 0);
  const max = Math.max(...arr, 0);
  if (max === min) return { min: min - 1, max: max + 1 };
  return { min, max };
});

const yTicks = computed(() => {
  if (props.variant === 'rank') {
    const { min, max } = yDomain.value;
    const ticks: number[] = [];
    for (let i = min; i <= max; i++) ticks.push(i);
    // 名次过多时抽稀，最多 6 档
    if (ticks.length <= 6) return ticks;
    const step = Math.ceil((max - min) / 4);
    const sparse = [min];
    for (let v = min + step; v < max; v += step) sparse.push(v);
    if (sparse[sparse.length - 1] !== max) sparse.push(max);
    return sparse;
  }
  return [0, 25, 50, 75, 100];
});

function formatYTick(tick: number) {
  if (props.variant === 'rank') return `第${tick}名`;
  return String(tick);
}

const pts = computed(() => {
  const { min, max } = yDomain.value;
  const span = max - min || 1;
  if (props.interactive && props.variant === 'rank') {
    // 倒序：第1名在上 → 小名次映射为高 y 归一化值
    return drawPoints.value.map(v => (max - v) / span);
  }
  if (props.interactive) {
    return drawPoints.value.map(v => (v - min) / span);
  }
  // 简易模式：平坦线居中
  if (max === min || Math.max(...drawPoints.value, 0) === Math.min(...drawPoints.value, 0)) {
    return drawPoints.value.map(() => 0.5);
  }
  return drawPoints.value.map(v => (v - min) / span);
});

function xOf(i: number) {
  const n = pts.value.length;
  if (props.interactive) {
    // 至少两点时铺满；单点兜底居中（drawPoints 已保证 ≥2）
    if (n <= 1) return ml.value + plotW.value / 2;
    return ml.value + (i / (n - 1)) * plotW.value;
  }
  if (n <= 1) return 0;
  return (i / (n - 1)) * vbW.value;
}

function yNorm(p: number) {
  if (props.interactive) return MT + plotH.value - p * plotH.value;
  return vbH.value - PAD - p * (vbH.value - PAD * 2);
}

function yOfValue(v: number) {
  const { min, max } = yDomain.value;
  const span = max - min || 1;
  if (props.variant === 'rank') return yNorm((max - v) / span);
  return yNorm((v - min) / span);
}

/** Catmull-Rom → 三次贝塞尔；张力略大，视觉上更「曲线」而非折线 */
function buildSmoothPath(coords: { x: number; y: number }[]) {
  if (!coords.length) return '';
  if (coords.length === 1) {
    return `M${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}`;
  }
  if (coords.length === 2) {
    const a = coords[0];
    const b = coords[1];
    const dx = (b.x - a.x) / 3;
    // 两点也用水平控制柄的三次贝塞尔，避免纯折线
    return `M${a.x.toFixed(1)},${a.y.toFixed(1)} C${(a.x + dx).toFixed(1)},${a.y.toFixed(1)} ${(b.x - dx).toFixed(1)},${b.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  }
  const tension = 1 / 4; // 原 1/6，略加大弯曲
  let d = `M${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i - 1] || coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

const coordPts = computed(() =>
  pts.value.map((p, i) => ({ x: xOf(i), y: yNorm(p) })),
);

const linePath = computed(() => buildSmoothPath(coordPts.value));

const areaPath = computed(() => {
  if (!pts.value.length) return '';
  const base = props.interactive ? MT + plotH.value : vbH.value - PAD;
  const last = pts.value.length - 1;
  return `${linePath.value} L${xOf(last).toFixed(1)},${base} L${xOf(0).toFixed(1)},${base} Z`;
});

const tip = computed(() => {
  if (hoverIdx.value == null) return null;
  const i = hoverIdx.value;
  const s = drawSeries.value[i] || drawSeries.value[0];
  const rate = s ? Number(s.rate) || 0 : drawPoints.value[i] || 0;
  const rateText = props.variant === 'rank'
    ? `第${Math.round(rate)}名`
    : `${Number(rate).toFixed(props.digits)}%`;
  return {
    date: s?.date || axisLabels.value[i] || axisLabels.value[0] || '',
    rateText,
    num: s?.numerator ?? 0,
    den: s?.denominator ?? 0,
  };
});

const tipStyle = computed(() => {
  if (hoverIdx.value == null || !root.value) return {};
  const el = root.value;
  const w = el.clientWidth || 1;
  const n = Math.max(1, pts.value.length - 1);
  const ratio = hoverIdx.value / n;
  const leftPx = ((ml.value + ratio * plotW.value) / vbW.value) * w;
  const tipW = 148;
  let left = leftPx + 12;
  if (left + tipW > w) left = leftPx - tipW - 8;
  if (left < 0) left = 4;
  return { left: `${left}px`, top: '4px' };
});

function onMove(ev: MouseEvent) {
  if (!props.interactive || !root.value || !pts.value.length) return;
  const rect = root.value.getBoundingClientRect();
  const relX = ((ev.clientX - rect.left) / rect.width) * vbW.value;
  const n = pts.value.length;
  if (n <= 1) {
    hoverIdx.value = 0;
    return;
  }
  const t = (relX - ml.value) / plotW.value;
  hoverIdx.value = Math.round(Math.max(0, Math.min(1, t)) * (n - 1));
}

function onLeave() {
  hoverIdx.value = null;
}

function fmt(v: number) {
  if (props.variant === 'rank') return `第${Math.round(v)}名`;
  const s = Number.isFinite(v) ? v.toFixed(props.digits) : '0';
  return `${s}${props.unit}`;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function stopReveal() {
  if (revealRaf) {
    cancelAnimationFrame(revealRaf);
    revealRaf = 0;
  }
}

function startReveal() {
  stopReveal();
  const full = props.interactive ? ml.value + plotW.value : vbW.value;
  revealW.value = 0;
  if (pts.value.length < 2) {
    revealW.value = full;
    return;
  }
  revealStart = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - revealStart) / REVEAL_MS);
    revealW.value = full * easeOutCubic(t);
    if (t < 1) revealRaf = requestAnimationFrame(tick);
    else revealRaf = 0;
  };
  revealRaf = requestAnimationFrame(tick);
}

watch(
  () => [drawPoints.value.join(','), props.interactive, props.variant, vbW.value, plotW.value] as const,
  async () => {
    await nextTick();
    startReveal();
  },
  { immediate: true },
);

onBeforeUnmount(stopReveal);
</script>

<style scoped>
.spark {
  position: relative;
  width: 100%;
  cursor: default;
}
.spark-svg {
  width: 100%;
  display: block;
}
.spark-v {
  font-size: 12px;
  font-weight: 700;
  fill: #374151;
}
.spark-axis {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #9ca3af;
  padding: 4px 2px 0;
}
.spark-axis-label {
  font-size: 9px;
  fill: #94a3b8;
}
.spark-x-axis {
  display: flex;
  justify-content: space-between;
  padding: 2px 5px 0 0;
  margin-top: -2px;
}
.spark-x-tick {
  font-size: 9px;
  color: #94a3b8;
  flex: 1;
  text-align: center;
  white-space: nowrap;
}
.spark-x-tick:first-child { text-align: left; }
.spark-x-tick:last-child { text-align: right; }
.spark-tip {
  position: absolute;
  z-index: 20;
  pointer-events: none;
  background: #fff;
  padding: 0.5rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.35;
  min-width: 132px;
}
</style>
