<template>
  <div class="bl-page geo-page">
    <!-- 页头 -->
    <header class="bl-header">
      <div class="bl-header__text">
        <h1 class="bl-title">品牌</h1>
        <p class="bl-desc">品牌档案与参考资料 · 写稿、问答、洞察分析时 AI 自动调用</p>
      </div>
      <button type="button" class="bl-add-btn">
        <icon-plus :size="13" />
        添加资料
        <icon-down :size="11" />
      </button>
    </header>

    <!-- 品牌档案卡 -->
    <section class="bl-hero">
      <div class="bl-hero__inner">
        <div class="bl-avatar" aria-hidden="true">{{ brandMark }}</div>

        <div class="bl-hero__body">
          <div class="bl-name-row">
            <span class="bl-name">{{ brandName || '未命名品牌' }}</span>
            <span class="bl-badge">✓ 已认证品牌</span>
          </div>

          <div v-if="industry" class="bl-chips">
            <span class="bl-chip">{{ industry }}</span>
          </div>

          <div class="bl-hero-desc">
            {{ heroDesc }}
          </div>
        </div>

        <div class="bl-hero__actions">
          <button
            type="button"
            class="bl-action-btn"
            :class="{ 'bl-action-btn--on': panelMode === 'alias' }"
            title="维护识别名，决定 AI 回答里哪些说法算作你"
            :aria-expanded="panelMode === 'alias'"
            @click="togglePanel('alias')"
          >
            <icon-tags :size="13" />
            {{ panelMode === 'alias' ? '收起识别名' : '识别名管理' }}
          </button>
          <button
            type="button"
            class="bl-action-btn"
            :class="{ 'bl-action-btn--on': panelMode === 'edit' }"
            :aria-expanded="panelMode === 'edit'"
            @click="togglePanel('edit')"
          >
            <icon-edit :size="13" />
            {{ panelMode === 'edit' ? '收起编辑' : '编辑档案' }}
          </button>
        </div>
      </div>
    </section>

    <!-- 展开区：识别名 / 编辑档案 互斥，对标页内展开不跳转 -->
    <div v-if="panelMode === 'alias'" class="bl-expand-panel">
      <section class="bl-expand-card bl-expand-card--stack">
        <BrandIdentityFields
          v-model:name="brandName"
          :aliases="aliases"
          v-model:rename-remaining="renameRemaining"
          @update:aliases="onAliasesUpdate"
        />
      </section>
    </div>

    <div v-else-if="panelMode === 'edit'" class="bl-expand-panel">
      <section class="bl-expand-card">
        <BrandProfileFields
          v-model:industry="industry"
          v-model:protocol="protocol"
          v-model:url-path="urlPath"
          v-model:description="description"
        />
      </section>
    </div>

    <!-- 筛选 + 搜索 -->
    <div class="bl-filter">
      <div class="bl-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="bl-tab"
          :class="{ 'bl-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span v-if="tab.emoji" class="bl-tab-emoji">{{ tab.emoji }}</span>
          {{ tab.label }}
          <span class="bl-tab-count" :class="{ 'bl-tab-count--active': activeTab === tab.key }">0</span>
        </button>
      </div>
      <div class="bl-search">
        <icon-search :size="13" />
        <input v-model="search" type="text" class="bl-search-input" placeholder="搜索资料..." />
      </div>
    </div>

    <!-- 资料区 -->
    <div class="bl-grid">
      <button type="button" class="bl-add-tile">
        <span class="bl-add-tile__icon">
          <icon-plus :size="20" />
        </span>
        <span class="bl-add-tile__title">添加更多资料</span>
        <span class="bl-add-tile__hint">PDF / URL / 文本</span>
      </button>

      <div class="bl-empty">
        <div class="bl-empty__title">品牌资料还是空的</div>
        <div class="bl-empty__hint">点右上角「添加资料」开始上传</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { IconPlus, IconDown, IconSearch, IconEdit, IconTags } from '@arco-design/web-vue/es/icon';
import { brandApi } from '@/api/modules/brand';
import BrandIdentityFields from '@/components/brand/BrandIdentityFields.vue';
import BrandProfileFields from '@/components/brand/BrandProfileFields.vue';

type PanelMode = 'none' | 'alias' | 'edit';

const brandName = ref('');
const industry = ref('');
const protocol = ref('https://');
const urlPath = ref('');
const description = ref('');
const products = reactive<{ name: string }[]>([]);
const aliases = reactive<string[]>([]);
const renameRemaining = ref(0);
const panelMode = ref<PanelMode>('none');
const search = ref('');
const activeTab = ref<'all' | 'doc' | 'link' | 'text'>('all');

const tabs = [
  { key: 'all' as const, label: '全部', emoji: '' },
  { key: 'doc' as const, label: '文档', emoji: '📄' },
  { key: 'link' as const, label: '链接', emoji: '🔗' },
  { key: 'text' as const, label: '文本', emoji: '📝' },
];

const brandMark = computed(() => {
  const n = (brandName.value || '').trim();
  return n ? n[0] : '品';
});

const heroDesc = computed(() => {
  if (products.length) return products.map(p => p.name).filter(Boolean).join('、');
  return '完善品牌档案，让 AI 更准确地理解你的品牌与业务。';
});

function togglePanel(mode: Exclude<PanelMode, 'none'>) {
  panelMode.value = panelMode.value === mode ? 'none' : mode;
}

function onAliasesUpdate(list: string[]) {
  aliases.splice(0, aliases.length, ...list);
}

function splitWebsite(website: string) {
  const w = (website || '').trim();
  if (w.startsWith('http://')) {
    protocol.value = 'http://';
    urlPath.value = w.slice('http://'.length);
  } else if (w.startsWith('https://')) {
    protocol.value = 'https://';
    urlPath.value = w.slice('https://'.length);
  } else {
    protocol.value = 'https://';
    urlPath.value = w;
  }
}

onMounted(async () => {
  try {
    const s = await brandApi.summary();
    if (!s) return;
    brandName.value = s.brand?.name || '';
    industry.value = s.brand?.industry || '';
    description.value = s.profile?.description || s.brand?.business_desc || '';
    renameRemaining.value = s.brand?.rename_remaining ?? 0;
    splitWebsite(s.brand?.website || '');
    products.splice(0, products.length, ...(s.products || []).map(p => ({ name: p.name })));
    aliases.splice(0, aliases.length, ...(s.aliases || []).map(a => a.alias));
  } catch { /* 空态兜底 */ }
});
</script>

<style lang="scss" scoped>
.bl-page {
  color: #0f1115;
}

.bl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 20px;
  padding: 0;
}

.bl-title {
  margin: 0;
  padding: 0;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f1115;
  line-height: 33px;
  letter-spacing: -0.55px;
}

.bl-desc {
  margin: 4px 0 0;
  padding: 0;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #5b606a;
  line-height: 19.5px;
}

.bl-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: #6452ff;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.02);
  }
}

/* 品牌档案卡 */
.bl-hero {
  position: relative;
  overflow: hidden;
  margin: 0 0 18px;
  padding: 22px 24px;
  border-radius: 16px;
  border: 1px solid rgba(100, 82, 255, 0.14);
  background: linear-gradient(135deg, #f7f5ff 0%, #efe9ff 52%, #fdf2fb 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  color: #0f1115;
}

.bl-hero__inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: flex-start;
  }
}

.bl-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.025em;
  color: #fff;
  background: linear-gradient(135deg, #6452ff 0%, #8a7bff 50%, #b8a9ff 100%);
  box-shadow: 0 8px 20px rgba(100, 82, 255, 0.3);
}

.bl-hero__body {
  min-width: 0;
  flex: 1 1 auto;
}

.bl-name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: #0f1115;
  line-height: 1.3;
}

.bl-name {
  min-width: 0;
}

.bl-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(15, 181, 166, 0.3);
  background: #e6fbf4;
  font-size: 10.5px;
  font-weight: 700;
  color: #007a5e;
  line-height: 1.4;
}

.bl-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 9px 0;
}

.bl-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 11px;
  border-radius: 9999px;
  border: 1px solid rgba(100, 82, 255, 0.16);
  background: rgba(255, 255, 255, 0.8);
  font-size: 11.5px;
  color: #2a2d36;
}

.bl-hero-desc {
  max-width: 660px;
  font-size: 12.5px;
  line-height: 1.75;
  color: #5b606a;
}

.bl-hero__actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;

  @media (min-width: 640px) {
    margin-left: auto;
  }
}

.bl-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 15px;
  border-radius: 9px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 12.5px;
  font-weight: 600;
  color: #2a2d36;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: rgba(100, 82, 255, 0.4);
    background: #fbfaff;
    color: #4a38e0;
  }

  &--on {
    border-color: rgba(100, 82, 255, 0.4);
    background: #fbfaff;
    color: #4a38e0;
  }
}

/* 展开面板（识别名 / 编辑档案） */
.bl-expand-panel {
  margin: 0 0 18px;
  animation: bl-expand-in 0.2s ease-out;
}

@keyframes bl-expand-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bl-expand-card {
  padding: 20px 22px 22px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e6e8ee;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: rgba(100, 82, 255, 0.25);
    box-shadow: 0 8px 24px rgba(20, 20, 40, 0.06);
  }

  &--stack {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
}

.bl-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bl-field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12.5px;
}

.bl-field-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f1115;
}

.bl-badge-req {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
}

.bl-field-hint {
  font-size: 11.5px;
  color: #8a8f9b;

  strong {
    font-weight: 700;
    color: #2a2d36;
  }
}

.bl-field-edit {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11.5px;
  font-weight: 600;
  color: #5b606a;
  background: transparent;
  border: 1px solid #e6e8ee;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background: #fafafe;
  }
}

.bl-input-ro {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #f5f6fa;
  font-size: 14px;
  font-weight: 600;
  color: #0f1115;
  cursor: pointer;
  outline: none;
}

.bl-aliases-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #f5f6fa;
  min-height: 40px;
}

.bl-alias-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #efecff;
  color: #4a38e0;
  height: 24px;
}

.bl-edit-grid {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 16px;
  column-gap: 18px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.bl-form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  &--full {
    grid-column: 1 / -1;
  }
}

.bl-form-label {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: #2a2d36;
}

.bl-form-input {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 13px;
  color: #0f1115;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.bl-url-group {
  display: flex;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.bl-url-select {
  padding: 0 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: #2a2d36;
  background: #f5f6fa;
  border: none;
  border-right: 1px solid #e6e8ee;
  height: 100%;
  outline: none;
  cursor: pointer;
  appearance: none;
  padding-right: 28px;
}

.bl-url-input {
  flex: 1;
  min-width: 0;
  padding: 0 12px;
  font-size: 13px;
  color: #0f1115;
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: #9ca3af;
  }
}

.bl-form-textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 13px;
  line-height: 1.6;
  color: #0f1115;
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

/* 筛选栏 */
.bl-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.bl-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.bl-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: #5b606a;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s;

  &--active {
    background: #efecff;
    color: #4a38e0;
  }
}

.bl-tab-emoji {
  font-size: 12px;
  line-height: 1;
}

.bl-tab-count {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 9999px;
  background: #f5f6fa;
  color: #5b606a;

  &--active {
    background: rgba(100, 82, 255, 0.18);
    color: #4a38e0;
  }
}

.bl-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 34px;
  width: 220px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e6e8ee;
  color: #8a8f9b;
  transition: all 0.15s;

  &:focus-within {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.bl-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12.5px;
  color: #0f1115;

  &::placeholder {
    color: #9ca3af;
  }
}

/* 资料网格 */
.bl-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.bl-add-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  width: 100%;
  padding: 30px 20px;
  border-radius: 16px;
  border: 1px dashed rgba(100, 82, 255, 0.3);
  background: transparent;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background: #efecff;

    .bl-add-tile__icon {
      background: #6452ff;
      color: #fff;
    }
  }
}

.bl-add-tile__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
  border-radius: 9999px;
  background: #efecff;
  color: #4a38e0;
  transition: background-color 0.15s, color 0.15s;
}

.bl-add-tile__title {
  margin-bottom: 3px;
  font-size: 13px;
  font-weight: 700;
  color: #4a38e0;
}

.bl-add-tile__hint {
  font-size: 11px;
  font-weight: 500;
  color: #8a8f9b;
}

.bl-empty {
  grid-column: 1 / -1;
  padding: 48px 0;
  text-align: center;
  border-radius: 16px;
  background: #fff;
  border: 1px dashed #e6e8ee;
}

.bl-empty__title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 700;
  color: #0f1115;
}

.bl-empty__hint {
  font-size: 12px;
  color: #8a8f9b;
}
</style>
