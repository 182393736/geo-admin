<template>
  <div class="page-container agent-page">
    <div class="page-header">
      <h2 class="page-title">AGENT</h2>
      <p class="page-desc">AI对话助手 · GEO智能分析</p>
    </div>

    <div class="agent-layout">
      <div class="agent-sidebar">
        <a-button block type="primary" size="large" style="margin-bottom: 12px">+ 新建对话</a-button>
        <a-button block size="large" style="margin-bottom: 12px">新建稿件</a-button>
        <a-button block size="large" style="margin-bottom: 12px">稿件库</a-button>
        <a-button block size="large" style="margin-bottom: 16px">话题挖掘</a-button>

        <a-divider />

        <div class="context-config">
          <div class="config-title">上下文配置</div>
          <a-form layout="vertical" size="small" :model="agentForm">
            <a-form-item label="品牌">
              <a-select :default-value="'hanyuai'">
                <a-option value="hanyuai">HANYUAI 图像助理</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="公司">
              <a-input :default-value="'涵宇科技'" />
            </a-form-item>
            <a-form-item label="竞品">
              <a-select mode="multiple" :default-value="['c1', 'c2']">
                <a-option value="c1">美图云</a-option>
                <a-option value="c2">可灵AI</a-option>
                <a-option value="c3">即梦AI</a-option>
                <a-option value="c4">Runway</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="可用余额">
              <div class="credits-display">
                <icon-gift />
                <span class="credits-amount">13</span>
                <span class="credits-unit">积分</span>
              </div>
            </a-form-item>
          </a-form>
        </div>
      </div>

      <div class="agent-main">
        <div class="chat-area">
          <div class="chat-empty">
            <icon-message :size="48" style="color: #c9cdd4" />
            <p>选择下方预设问题开始对话，或直接输入你的问题</p>
          </div>

          <div class="preset-questions">
            <div class="preset-title">快捷指令</div>
            <a-row :gutter="12">
              <a-col :span="12" v-for="preset in agentPresets" :key="preset.id">
                <div class="preset-card" @click="askPreset(preset)">
                  <div class="preset-text">{{ preset.text }}</div>
                  <div class="preset-desc">{{ preset.desc }}</div>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>

        <div class="chat-input-area">
          <a-input
            v-model="chatInput"
            placeholder="输入你的问题..."
            :auto-size="{ minRows: 2, maxRows: 6 }"
          >
            <template #append>
              <a-button type="primary" @click="sendMessage">发送</a-button>
            </template>
          </a-input>
          <div class="input-hint">按 Enter 发送，Shift + Enter 换行</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { IconGift, IconMessage } from '@arco-design/web-vue/es/icon';
import { agentPresets } from '@/mock/data';

const agentForm = reactive({
  brand: 'hanyuai',
  company: '涵宇科技',
  competitors: ['c1', 'c2'],
});

const chatInput = ref('');

function askPreset(preset: typeof agentPresets[0]) {
  chatInput.value = preset.text;
}

function sendMessage() {
  if (chatInput.value.trim()) {
    console.log('send:', chatInput.value);
    chatInput.value = '';
  }
}
</script>

<style lang="scss" scoped>
.agent-page {
  .page-desc {
    color: #86909c;
  }
}

.agent-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 140px);
}

.agent-sidebar {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;

  .context-config {
    .config-title {
      font-weight: 600;
      margin-bottom: 12px;
    }
  }

  .credits-display {
    display: flex;
    align-items: center;
    gap: 6px;

    .credits-amount {
      font-size: 20px;
      font-weight: 700;
      color: #ff7d00;
    }
    .credits-unit {
      color: #86909c;
    }
  }
}

.agent-main {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #86909c;

  p {
    margin-top: 12px;
  }
}

.preset-questions {
  margin-top: 32px;

  .preset-title {
    font-weight: 600;
    margin-bottom: 16px;
    color: #4e5969;
  }
}

.preset-card {
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;

  &:hover {
    background: #e8f3ff;
    border: 1px solid #165dff;
  }

  .preset-text {
    font-weight: 500;
    margin-bottom: 4px;
    color: #1d2129;
  }

  .preset-desc {
    font-size: 13px;
    color: #86909c;
  }
}

.chat-input-area {
  border-top: 1px solid #e5e6eb;
  padding: 16px 24px;

  .input-hint {
    font-size: 12px;
    color: #c9cdd4;
    margin-top: 4px;
  }
}
</style>
