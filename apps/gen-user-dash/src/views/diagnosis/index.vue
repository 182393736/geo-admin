<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">诊断</h2>
      <p class="page-desc">单次品牌诊断 · 覆盖五大国产大模型</p>
    </div>

    <a-row :gutter="16">
      <a-col :span="16">
        <a-card class="card-shadow diagnosis-intro">
          <h3>品牌诊断报告</h3>
          <p class="intro-desc">
            覆盖五大国产大模型网页端 + 豆包/DeepSeek/通义千问 APP 端，输出品牌可见性、排名、引用源与竞品对比，几分钟生成可直接交付的 PDF 报告。
          </p>
          <a-row :gutter="16" style="margin: 24px 0">
            <a-col :span="6" v-for="item in diagnosisFeatures" :key="item.label">
              <div class="feature-item">
                <component :is="item.icon" :size="24" style="color: #165dff" />
                <div class="feature-label">{{ item.label }}</div>
              </div>
            </a-col>
          </a-row>
          <a-space>
            <a-button type="primary" size="large">立即诊断</a-button>
            <a-button size="large">费用计算器</a-button>
            <a-button size="large">预览示例报告</a-button>
          </a-space>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="card-shadow" title="诊断引擎覆盖">
          <div class="engine-list">
            <div v-for="e in engines" :key="e.key" class="engine-item">
              <div class="engine-info">
                <span class="engine-dot" :style="{ background: e.color }" />
                <span class="engine-name">{{ e.label }}</span>
              </div>
              <a-tag :color="e.locked ? 'gray' : 'green'">{{ e.locked ? '🔒' : '已接入' }}</a-tag>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="card-shadow" title="近期诊断记录" style="margin-top: 16px">
      <a-table :data="diagnosisRecords" :pagination="false" bordered stripe>
        <template #columns>
          <a-table-column title="报告名称" data-index="name" :width="250" />
          <a-table-column title="品牌" data-index="brand" :width="150" />
          <a-table-column title="引擎数" data-index="engineCount" :width="80" />
          <a-table-column title="创建时间" data-index="createdAt" :width="160" />
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'completed' ? 'green' : 'orange'">
                {{ record.status === 'completed' ? '已完成' : '生成中' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150">
            <template #cell>
              <a-space>
                <a-button type="text" size="mini">查看</a-button>
                <a-button type="text" size="mini">下载PDF</a-button>
                <a-button type="text" size="mini">分享</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { engines } from '@/mock/data';
import {
  IconFile,
  IconBarChart,
  IconDownload,
  IconShareAlt,
} from '@arco-design/web-vue/es/icon';

const diagnosisFeatures = [
  { label: 'AI排名透视', icon: IconBarChart },
  { label: '竞品对比', icon: IconFile },
  { label: '引用源追溯', icon: IconDownload },
  { label: 'PDF报告', icon: IconShareAlt },
];

const diagnosisRecords = [
  { id: '1', name: 'HANYUAI品牌诊断报告_0826', brand: 'HANYUAI', engineCount: 5, createdAt: '2026-08-26 10:30', status: 'completed' },
  { id: '2', name: '美图云品牌诊断报告_0825', brand: '美图云', engineCount: 5, createdAt: '2026-08-25 15:20', status: 'completed' },
  { id: '3', name: '可灵AI品牌诊断报告_0825', brand: '可灵AI', engineCount: 3, createdAt: '2026-08-25 09:10', status: 'completed' },
];
</script>

<style lang="scss" scoped>
.diagnosis-intro {
  h3 {
    margin: 0 0 8px;
    font-size: 18px;
  }

  .intro-desc {
    color: #4e5969;
    line-height: 1.6;
  }
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;

  .feature-label {
    font-size: 13px;
    color: #4e5969;
  }
}

.engine-list {
  .engine-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f2f3f5;

    &:last-child {
      border-bottom: none;
    }

    .engine-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .engine-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }
}
</style>
