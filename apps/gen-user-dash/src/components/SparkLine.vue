<template>
  <div class="spark" :style="{ height: height + 'px' }">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="none"
      class="spark-svg"
      :style="{ height: height + 'px' }"
    >
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.22" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
      <!-- 网格线 -->
      <line v-for="g in 3" :key="'g' + g" :x1="0" :x2="W" :y1="(H - PAD) / 3 * g" :y2="(H - PAD) / 3 * g" stroke="#eef0f5" stroke-width="1" />
      <!-- 面积 -->
      <path v-if="pts.length > 1" :d="areaPath" :fill="`url(#${gid})`" />
      <!-- 折线 -->
      <path v-if="pts.length > 1" :d="linePath" fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      <!-- 数据点 -->
      <circle v-for="(p, i) in pts" :key="'p' + i" :cx="x(i)" :cy="y(p)" r="2.6" :fill="color" />
      <!-- 最新值标签 -->
      <text v-if="pts.length" :x="x(pts.length - 1)" :y="y(pts[pts.length - 1]) - 9" text-anchor="end" class="spark-v">{{ fmt(pts[pts.length - 1]) }}</text>
    </svg>
    <div v-if="labels && labels.length" class="spark-axis">
      <span>{{ labels[0] }}</span>
      <span>{{ labels[labels.length - 1] }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  points: number[];
  labels?: string[];
  color?: string;
  height?: number;
  unit?: string;
  digits?: number;
}>(), {
  labels: () => [],
  color: '#4f46e5',
  height: 120,
  unit: '',
  digits: 1,
});

const W = 600;
const H = 160;
const PAD = 26;

const gid = `spark-${Math.random().toString(36).slice(2, 9)}`;

const pts = computed(() => {
  const arr = props.points || [];
  const min = Math.min(...arr, 0);
  const max = Math.max(...arr, 0);
  if (max === min) return arr.map(() => 0.5); // 平坦线居中
  return arr.map(v => (v - min) / (max - min));
});

const x = (i: number) => (pts.value.length <= 1 ? 0 : (i / (pts.value.length - 1)) * W);
const y = (p: number) => H - PAD - p * (H - PAD * 2);

const linePath = computed(() =>
  pts.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(' '),
);
const areaPath = computed(() => {
  if (!pts.value.length) return '';
  return `${linePath.value} L${x(pts.value.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`;
});

const fmt = (v: number) => {
  const d = props.digits;
  const s = Number.isFinite(v) ? v.toFixed(d) : '0';
  return `${s}${props.unit}`;
};
</script>

<style scoped>
.spark { position: relative; width: 100%; }
.spark-svg { width: 100%; display: block; }
.spark-v { font-size: 12px; font-weight: 700; fill: #374151; }
.spark-axis { display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; padding: 4px 2px 0; }
</style>
