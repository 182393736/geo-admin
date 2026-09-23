<template>
  <div class="page-container">
    <h2 class="page-title">解析监控</h2>
    <p class="page-desc">解析流水线产出：提及 / 观点 / 实体 / 引用 / 归一信源 + 近 7 天口碑走势</p>

    <a-spin :loading="loading">
      <template v-if="d">
        <div class="stat-grid">
          <StatCard label="品牌提及" :value="d.counts.mentions" />
          <StatCard label="观点" :value="d.counts.opinions" />
          <StatCard label="归一实体" :value="d.counts.entities" />
          <StatCard label="引用边" :value="d.counts.citations" />
          <StatCard label="归一信源" :value="d.counts.canonical_sources" />
          <StatCard label="被引文章" :value="d.counts.cited_articles" />
        </div>

        <a-row :gutter="16" class="mt">
          <a-col :span="12">
            <div class="card">
              <h3 class="card-title">观点极性分布</h3>
              <v-chart :option="polarOption" style="height: 260px" autoresize />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="card">
              <h3 class="card-title">近 7 天口碑分走势（全平台均值）</h3>
              <v-chart :option="trendOption" style="height: 260px" autoresize />
            </div>
          </a-col>
        </a-row>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import StatCard from '@/components/StatCard.vue';
import { adminApi } from '@/api/admin';
import type { AdminParseOverview } from '@geo-admin/contracts';

use([CanvasRenderer, PieChart, LineChart, TooltipComponent, LegendComponent, GridComponent]);

const loading = ref(false);
const d = ref<AdminParseOverview | null>(null);

const polarOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [{
    type: 'pie',
    radius: ['40%', '66%'],
    label: { formatter: '{b}: {c}' },
    data: [
      { name: '正面', value: d.value?.polarity.positive ?? 0, itemStyle: { color: '#16a34a' } },
      { name: '中性', value: d.value?.polarity.neutral ?? 0, itemStyle: { color: '#9ca3af' } },
      { name: '负面', value: d.value?.polarity.negative ?? 0, itemStyle: { color: '#dc2626' } },
    ],
  }],
}));

const trendOption = computed(() => {
  const rows = d.value?.recent_7d ?? [];
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: rows.map(r => r.date.slice(5)) },
    yAxis: { type: 'value', min: 0, max: 100 },
    series: [{
      type: 'line', smooth: true, data: rows.map(r => r.avg_rep_score),
      lineStyle: { color: '#4338ca', width: 3 }, itemStyle: { color: '#4338ca' },
      areaStyle: { color: 'rgba(67,56,202,0.12)' },
    }],
  };
});

onMounted(async () => {
  loading.value = true;
  try { d.value = await adminApi.parseOverview(); } finally { loading.value = false; }
});
</script>

<style scoped lang="scss">
.mt { margin-top: 16px; }
.stat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.card-title { font-size: 14px; font-weight: 600; margin: 0 0 12px; color: #1f2430; }
</style>
