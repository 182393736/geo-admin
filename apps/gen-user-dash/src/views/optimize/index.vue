<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">优化</h2>
      <p class="page-desc">信源库媒体发稿平台 · 155,554 个信源渠道</p>
    </div>
    <div>
      <div class="tab-content" v-if="currentTab === 'Optimize'">
        <div class="filter-bar">
          <a-row :gutter="16">
            <a-col :span="4">
              <a-select placeholder="AI引擎偏好">
                <a-option value="all">全部引擎</a-option>
                <a-option value="doubao">豆包</a-option>
                <a-option value="deepseek">DeepSeek</a-option>
                <a-option value="wenxin">文心一言 🔒</a-option>
                <a-option value="qianwen">通义千问 🔒</a-option>
                <a-option value="yuanbao">元宝</a-option>
              </a-select>
            </a-col>
            <a-col :span="4">
              <a-select placeholder="媒体类型">
                <a-option value="all">全部类型</a-option>
                <a-option value="portal">门户</a-option>
                <a-option value="media">自媒体</a-option>
                <a-option value="qa">问答</a-option>
              </a-select>
            </a-col>
            <a-col :span="3">
              <a-slider :default-value="[0, 1000]" range />
            </a-col>
            <a-col :span="4">
              <a-select placeholder="认证状态">
                <a-option value="all">全部</a-option>
                <a-option value="verified">已认证</a-option>
                <a-option value="unverified">未认证</a-option>
              </a-select>
            </a-col>
            <a-col :span="4">
              <a-select placeholder="地区分类">
                <a-option value="all">全部地区</a-option>
              </a-select>
            </a-col>
            <a-col :span="5">
              <a-select :default-value="'recommend'" placeholder="排序方式">
                <a-option value="recommend">综合推荐</a-option>
                <a-option value="authority-desc">引用指数↓</a-option>
                <a-option value="rate-desc">出稿率↓</a-option>
                <a-option value="price-asc">价格↑</a-option>
                <a-option value="price-desc">价格↓</a-option>
              </a-select>
            </a-col>
          </a-row>
        </div>
        <a-table :data="mediaSources" :pagination="{ pageSize: 8, showTotal: true }" bordered stripe>
          <template #columns>
            <a-table-column :width="50">
              <template #cell><a-checkbox /></template>
            </a-table-column>
            <a-table-column title="媒体" data-index="name" :width="160">
              <template #cell="{ record }">
                <div class="media-cell">
                  <div class="media-logo">{{ record.name.charAt(0) }}</div>
                  <div>
                    <div class="media-name">{{ record.name }}</div>
                    <div class="media-type">{{ record.type }}</div>
                  </div>
                </div>
              </template>
            </a-table-column>
            <a-table-column title="引擎偏好" :width="200">
              <template #cell="{ record }">
                <a-tag
                  v-for="eng in record.enginePref"
                  :key="eng"
                  :color="getEngineColor(eng)"
                  size="small"
                  style="margin-right: 4px"
                >
                  {{ getEngineLabel(eng) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="权威度" :width="120">
              <template #cell="{ record }">
                <a-progress :percent="record.authority" :color="record.authority > 80 ? '#00b42a' : '#ff7d00'" />
              </template>
            </a-table-column>
            <a-table-column title="出稿率" :width="100">
              <template #cell="{ record }">
                <span>{{ (record.rate * 100).toFixed(0) }}%</span>
              </template>
            </a-table-column>
            <a-table-column title="价格" :width="100">
              <template #cell="{ record }">
                <span class="price">¥{{ record.price }}</span>
              </template>
            </a-table-column>
            <a-table-column title="认证" :width="80">
              <template #cell="{ record }">
                <a-tag color="green">{{ record.certStatus }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="120">
              <template #cell>
                <a-space>
                  <a-button type="text" size="mini">稿件案例</a-button>
                  <a-button type="primary" size="mini">发稿</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
      <div class="tab-content" v-else-if="currentTab === 'OptimizePublish'">
        <a-card class="card-shadow">
          <a-form layout="vertical" :model="publishForm">
            <a-form-item label="选择信源">
              <a-select placeholder="选择要发布的媒体" mode="multiple" show-search>
                <a-option v-for="m in mediaSources" :key="m.id" :value="m.id">{{ m.name }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="稿件标题">
              <a-input placeholder="输入稿件标题" />
            </a-form-item>
            <a-form-item label="稿件内容">
              <a-textarea placeholder="输入稿件内容" :auto-size="{ minRows: 8, maxRows: 20 }" />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" size="large">提交发布</a-button>
                <a-button size="large">存为草稿</a-button>
                <a-button size="large">AI辅助写作</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </div>
      <div class="tab-content" v-else-if="currentTab === 'OptimizeRecords'">
        <a-table :data="publishRecords" :pagination="false" bordered stripe>
          <template #columns>
            <a-table-column title="稿件标题" data-index="title" :width="250" />
            <a-table-column title="媒体" data-index="media" :width="120" />
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="提交时间" data-index="submitTime" :width="160" />
            <a-table-column title="引擎引用" :width="100">
              <template #cell="{ record }">
                <span :style="{ color: record.engineRefs > 0 ? '#00b42a' : '#c9cdd4' }">
                  {{ record.engineRefs }} 次
                </span>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="120">
              <template #cell>
                <a-space>
                  <a-button type="text" size="mini">查看</a-button>
                  <a-button type="text" size="mini">追踪</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
      <div class="tab-content" v-else-if="currentTab === 'OptimizeTracking'">
        <a-empty description="稿件追踪（开发中）" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { mediaSources, publishRecords, engines } from '@/mock/data';

const route = useRoute();
const currentTab = computed(() => route.name as string);

const publishForm = reactive({
  sources: [],
  title: '',
  content: '',
});

function getEngineColor(engine: string) {
  const map: Record<string, string> = {
    doubao: 'blue',
    deepseek: 'purple',
    yuanbao: 'red',
    wenxin: 'green',
    qianwen: 'pink',
  };
  return map[engine] || 'gray';
}

function getEngineLabel(engine: string) {
  return engines.find(e => e.key === engine)?.label || engine;
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    已发布: 'green',
    审核中: 'orange',
    待审核: 'blue',
    已拒绝: 'red',
  };
  return map[status] || 'gray';
}
</script>

<style lang="scss" scoped>
.tab-content {
  padding: 16px 0;
}

.filter-bar {
  margin-bottom: 16px;
}

.media-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .media-logo {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    background: #e8f3ff;
    color: #165dff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
  }

  .media-name {
    font-weight: 500;
  }
  .media-type {
    font-size: 12px;
    color: #86909c;
  }
}

.price {
  color: #f53f3f;
  font-weight: 600;
}
</style>
