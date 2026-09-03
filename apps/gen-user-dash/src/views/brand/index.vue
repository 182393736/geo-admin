<template>
  <div class="brand-page">
    <!-- 名片 -->
    <div v-if="currentTab === 'Brand'" class="brand-card-layout">
      <!-- 头部 -->
      <header class="brand-header">
        <h1 class="brand-title">品牌名片</h1>
        <p class="brand-subtitle">品牌身份与基础信息 · 监控统计、AI 写稿、洞察分析时调用</p>
      </header>

      <!-- 第一卡片: 品牌名 + 别名 -->
      <section class="brand-card">
        <!-- 品牌名 -->
        <div class="field-group">
          <div class="field-label-row">
            <span class="field-name">品牌名</span>
            <span class="badge-required">必填</span>
            <span class="field-hint">剩余修改次数 <strong>3</strong> 次</span>
            <button class="field-edit-btn">
              <icon-edit :size="11" />
              修改
            </button>
          </div>
          <input
            type="text"
            class="input-readonly"
            v-model="form.name"
            readonly
          />
        </div>

        <!-- 相似名称 / 别名 -->
        <div class="field-group">
          <div class="field-label-row">
            <span class="field-name">相似名称 / 别名</span>
            <span class="field-hint">已登记 <strong>{{ form.aliases.length }}</strong> 个别名 · 监控统计时合并为「{{ form.name }}」</span>
            <button class="field-edit-btn">
              <icon-edit :size="11" />
              修改
            </button>
          </div>
          <div class="aliases-box">
            <span v-for="alias in form.aliases" :key="alias" class="alias-tag">
              {{ alias }}
            </span>
          </div>
        </div>
      </section>

      <!-- 第二卡片: 行业 + 官网 + 简介 -->
      <section class="brand-card">
        <div class="grid-form">
          <!-- 所属行业 -->
          <div class="form-field">
            <label class="form-label">所属行业</label>
            <input
              type="text"
              class="form-input"
              v-model="form.industry"
              placeholder="例如:家电 · 空调"
            />
          </div>

          <!-- 官网 / 主链接 -->
          <div class="form-field">
            <label class="form-label">官网 / 主链接</label>
            <div class="url-input-group">
              <select class="url-select" v-model="form.protocol">
                <option value="https://">https://</option>
                <option value="http://">http://</option>
              </select>
              <input
                type="text"
                class="url-input"
                v-model="form.urlPath"
                placeholder="example.com/path"
              />
            </div>
          </div>

          <!-- 品牌简介 -->
          <div class="form-field form-field--full">
            <label class="form-label">品牌简介</label>
            <textarea
              class="form-textarea"
              v-model="form.description"
              placeholder="一段话描述品牌的背景与定位..."
              rows="4"
            ></textarea>
          </div>
        </div>
      </section>
    </div>

    <!-- 产品 -->
    <div v-else-if="currentTab === 'BrandProducts'" class="brand-card-layout">
      <!-- 头部 + 添加按钮 -->
      <header class="products-header">
        <div>
          <h1 class="brand-title">产品矩阵</h1>
          <p class="brand-subtitle">品牌旗下的产品系列 · 写稿、关联资料、产品分析时调用</p>
        </div>
        <button class="add-product-btn">
          <icon-plus :size="13" />
          添加产品系列
        </button>
      </header>

      <!-- 产品系列列表 -->
      <div class="products-list">
        <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
        >
          <!-- 标题行 -->
          <div class="product-card-header">
            <input
              type="text"
              class="product-name-input"
              v-model="product.name"
            />
            <button class="product-delete-btn" title="删除产品系列">
              <icon-delete :size="12" />
            </button>
          </div>

          <!-- 产品介绍 -->
          <div class="product-intro">
            <span class="product-intro-label">产品介绍</span>
            <textarea
              class="product-intro-textarea"
              v-model="product.desc"
              placeholder="价格区间 · 主打卖点 · 目标用户..."
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 竞品 -->
    <div v-else-if="currentTab === 'BrandCompetitors'" class="brand-card-layout">
      <!-- 头部 + 搜索 + 添加按钮 -->
      <header class="products-header">
        <div>
          <h1 class="brand-title">竞品名单</h1>
          <p class="brand-subtitle">主要竞争对手 · 监控分析、对比稿件、竞争洞察时作为对照</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <icon-search :size="14" />
            <input
              type="text"
              class="search-input"
              v-model="compSearch"
              placeholder="搜索竞品 / 别名…"
            />
          </div>
          <button class="add-product-btn">
            <icon-plus :size="13" />
            添加竞品
          </button>
        </div>
      </header>

      <!-- 竞品列表 -->
      <div class="products-list">
        <div
          v-for="comp in competitors"
          :key="comp.id"
          class="product-card"
        >
          <!-- 标题行 -->
          <div class="product-card-header">
            <input
              type="text"
              class="product-name-input"
              v-model="comp.name"
            />
            <button class="product-delete-btn" title="删除竞品">
              <icon-delete :size="12" />
            </button>
          </div>

          <!-- 主要竞争点 -->
          <div class="product-intro">
            <span class="product-intro-label">主要竞争点</span>
            <textarea
              class="comp-intro-textarea"
              v-model="comp.desc"
              placeholder="描述这个竞品的主要竞争维度..."
              rows="2"
            ></textarea>
          </div>

          <!-- 相似名称 / 别名 -->
          <div class="comp-aliases-section">
            <div class="comp-aliases-label-row">
              <span class="product-intro-label">相似名称 / 别名</span>
              <span class="comp-aliases-hint">已登记 <strong>{{ comp.aliases.length }}</strong> 个 · 监控 / 排名统计时合并识别</span>
              <button class="comp-edit-btn">
                <icon-edit :size="10" />
                修改
              </button>
            </div>
            <div class="comp-aliases-box">
              <span v-if="comp.aliases.length === 0" class="comp-aliases-empty">
                暂无别名,点「修改」添加同一竞品的其它写法
              </span>
              <span v-for="alias in comp.aliases" :key="alias" class="alias-tag">
                {{ alias }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识库 -->
    <div v-else-if="currentTab === 'BrandWiki'" class="brand-card-layout">
      <!-- 头部 + 添加资料按钮 -->
      <header class="products-header">
        <div>
          <h1 class="brand-title">资料库</h1>
          <p class="brand-subtitle">为 AI 准备的参考资料 · 写稿、问答、洞察分析时自动调用</p>
        </div>
        <button class="add-product-btn wiki-add-btn">
          <icon-plus :size="13" />
          添加资料
          <icon-down :size="11" />
        </button>
      </header>

      <!-- 筛选标签 + 搜索框 -->
      <div class="wiki-filter-bar">
        <div class="wiki-tabs">
          <button class="wiki-tab wiki-tab--active">
            全部
            <span class="wiki-tab-count wiki-tab-count--active">0</span>
          </button>
          <button class="wiki-tab">
            <span>📄</span>
            文档
            <span class="wiki-tab-count">0</span>
          </button>
          <button class="wiki-tab">
            <span>🔗</span>
            链接
            <span class="wiki-tab-count">0</span>
          </button>
          <button class="wiki-tab">
            <span>📝</span>
            文本
            <span class="wiki-tab-count">0</span>
          </button>
        </div>
        <div class="wiki-search-box">
          <icon-search :size="13" />
          <input
            type="text"
            class="wiki-search-input"
            placeholder="搜索资料..."
          />
        </div>
      </div>

      <!-- 资料列表（空状态） -->
      <div class="wiki-grid">
        <div class="wiki-empty">
          <div class="wiki-empty-title">资料库还是空的</div>
          <div class="wiki-empty-hint">点右上角「添加资料」开始上传</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IconEdit, IconPlus, IconDelete, IconSearch, IconDown } from '@arco-design/web-vue/es/icon';
import { brandInfo } from '@/mock/data';

const route = useRoute();
const currentTab = computed(() => route.name as string);

const form = reactive({
  name: brandInfo.name,
  industry: brandInfo.industry,
  protocol: brandInfo.protocol || 'https://',
  urlPath: brandInfo.website || '',
  description: brandInfo.description,
  aliases: brandInfo.aliases || [],
});

const products = reactive((brandInfo.products || []).map(p => ({ ...p })));

const competitors = reactive((brandInfo.competitors || []).map(c => ({ ...c })));
const compSearch = ref('');
</script>

<style lang="scss" scoped>
/* 容器 - 目标站: max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 */
.brand-page {
  max-width: 1240px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 36px 80px;
  min-width: 0;
}

.brand-card-layout {
  display: flex;
  flex-direction: column;
}

/* Header - 目标站: mb-5 */
.brand-header {
  margin-bottom: 20px;
}

/* h1 - 目标站: 22px/800/lh33px/ls-0.55px/color #0f1115 */
.brand-title {
  font-size: 22px;
  font-weight: 800;
  line-height: 33px;
  letter-spacing: -0.55px;
  color: #0f1115;
  margin: 0;
}

/* p - 目标站: 13px/400/lh19.5px/mt4px/color #5b606a */
.brand-subtitle {
  font-size: 13px;
  font-weight: 400;
  line-height: 19.5px;
  margin-top: 4px;
  margin-bottom: 0;
  color: #5b606a;
}

/* 卡片 - 目标站: rounded-2xl p-5 mb-5 flex flex-col gap-[18px] bg #fff border 1px solid #e6e8ee */
.brand-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  &:last-child {
    margin-bottom: 0;
  }
}

/* 字段组 - 目标站: flex flex-col gap-2 */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 标签行 - 目标站: flex items-center gap-2 flex-wrap text-[12.5px] */
.field-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12.5px;
}

/* 字段名 - 目标站: font-bold text-[13px] color #0f1115 */
.field-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f1115;
}

/* 必填badge - 目标站: px-1.5 py-[1px] rounded text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 */
.badge-required {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
}

/* 提示文字 - 目标站: text-[11.5px] color #8a8f9b */
.field-hint {
  font-size: 11.5px;
  color: #8a8f9b;

  strong {
    font-weight: 700;
    color: #2a2d36;
  }
}

/* 修改按钮 - 目标站: ml-auto flex items-center gap-1 px-2 py-1 rounded text-[11.5px] font-semibold color #5b606a border 1px solid #e6e8ee */
.field-edit-btn {
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
  transition: all 0.15s;

  &:hover {
    background: #f5f6fa;
  }
}

/* 只读输入框 - 目标站: h-10 px-3 rounded-lg text-[14px] font-semibold cursor-pointer bg #f5f6fa border 1px solid #e6e8ee color #0f1115 */
.input-readonly {
  height: 40px;
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

/* 别名容器 - 目标站: flex items-center gap-1.5 flex-wrap p-1.5 rounded-lg border 1px solid #e6e8ee bg #f5f6fa min-height 40px */
.aliases-box {
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

/* 别名标签 - 目标站: inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold bg #efecff color #4a38e0 height 24px */
.alias-tag {
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

/* Grid 表单 - 目标站: grid gap-4 grid-cols-1 md:grid-cols-2 */
.grid-form {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

/* 表单字段 - 目标站: flex flex-col gap-1.5 min-w-0 */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  &--full {
    grid-column: 1 / -1;
  }
}

/* 表单标签 - 目标站: text-[12.5px] font-semibold tracking-wide color #2a2d36 */
.form-label {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #2a2d36;
}

/* 普通输入框 - 目标站: h-[38px] px-3 rounded-lg text-[13px] bg #fff border 1px solid #e6e8ee color #0f1115 */
.form-input {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 13px;
  color: #0f1115;
  outline: none;
  transition: all 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

/* URL 输入组 - 目标站: flex h-[38px] rounded-lg overflow-hidden border 1px solid #e6e8ee bg #fff */
.url-input-group {
  display: flex;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  overflow: hidden;
  transition: all 0.15s;

  &:focus-within {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

/* select - 目标站: px-3 text-[12.5px] font-semibold bg #f5f6fa border-right 1px solid #e6e8ee color #2a2d36 */
.url-select {
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
}

.url-input {
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

/* 文本域 - 目标站: px-3 py-2.5 rounded-lg text-[13px] leading-relaxed resize-none min-h-[80px] */
.form-textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 13px;
  line-height: 1.6;
  color: #0f1115;
  outline: none;
  resize: none;
  min-height: 80px;
  transition: all 0.15s;
  font-family: inherit;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

/* ===== 产品页面 ===== */
/* Header - 目标站: mb-5 flex items-center justify-between gap-4 */
.products-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

/* 添加按钮 - 目标站: px-3.5 py-2 rounded-lg text-[12.5px] font-bold text-white bg #6452ff shadow-sm hover:scale-1.02 */
.add-product-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  background: #6452ff;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.02);
  }
}

/* 产品列表 - 目标站: flex flex-col gap-3.5 */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 产品卡片 - 目标站: rounded-2xl p-5 group bg #fff border 1px solid #e6e8ee */
.product-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.15s;

  &:hover {
    .product-delete-btn {
      opacity: 1;
    }
  }
}

/* 标题行 - 目标站: flex items-center gap-2 mb-3.5 pb-3 border-bottom 1px solid #f0f1f6 */
.product-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f1f6;
}

/* 产品名 input - 目标站: flex-1 px-2 py-1.5 rounded-md text-[14px] font-bold bg transparent border transparent color #0f1115 */
.product-name-input {
  flex: 1;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: 1px solid transparent;
  color: #0f1115;
  outline: none;
  transition: all 0.15s;

  &:hover {
    background: #f9fafb;
  }

  &:focus {
    background: #fff;
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

/* 删除按钮 - 目标站: w-7 h-7 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 color #8a8f9b border #e6e8ee */
.product-delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: #8a8f9b;
  background: transparent;
  border: 1px solid #e6e8ee;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;

  &:hover {
    background: #fef2f2;
    color: #ef4444;
  }
}

/* 产品介绍区 - 目标站: flex flex-col gap-1.5 */
.product-intro {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 标签 - 目标站: text-[11.5px] font-semibold color #5b606a */
.product-intro-label {
  font-size: 11.5px;
  font-weight: 600;
  color: #5b606a;
}

/* textarea - 目标站: px-3 py-2 rounded-lg text-[13px] leading-relaxed resize-none min-h-[100px] bg #f5f6fa border #e6e8ee color #0f1115 */
.product-intro-textarea {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.625;
  background: #f5f6fa;
  border: 1px solid #e6e8ee;
  color: #0f1115;
  outline: none;
  resize: none;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

/* ===== 竞品页面 ===== */
/* 操作区 - 目标站: flex items-center gap-2.5 shrink-0 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* 搜索框 - 目标站: flex items-center gap-1.5 px-3 h-[36px] rounded-lg bg #fff border #e6e8ee */
.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 36px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e6e8ee;
  color: #8a8f9b;
}

/* 搜索输入 - 目标站: w-[160px] outline-none bg-transparent text-[12.5px] color #0f1115 */
.search-input {
  width: 160px;
  outline: none;
  background: transparent;
  font-size: 12.5px;
  color: #0f1115;
  border: none;

  &::placeholder {
    color: #9ca3af;
  }
}

/* 竞品竞争点 textarea - 目标站: rows=2 min-h-[60px] bg #f5f6fa border #e6e8ee */
.comp-intro-textarea {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.625;
  background: #f5f6fa;
  border: 1px solid #e6e8ee;
  color: #0f1115;
  outline: none;
  resize: none;
  min-height: 60px;
  font-family: inherit;
  transition: all 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

/* 别名区 - 目标站: flex flex-col gap-1.5 mt-3.5 */
.comp-aliases-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 14px;
}

/* 别名标签行 - 目标站: flex items-center gap-2 flex-wrap */
.comp-aliases-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 别名提示 - 目标站: text-[11px] color #8a8f9b */
.comp-aliases-hint {
  font-size: 11px;
  color: #8a8f9b;

  strong {
    font-weight: 700;
    color: #2a2d36;
  }
}

/* 修改按钮 - 目标站: ml-auto px-2 py-1 rounded text-[11px] font-semibold color #5b606a border #e6e8ee */
.comp-edit-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #5b606a;
  background: transparent;
  border: 1px solid #e6e8ee;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f5f6fa;
  }
}

/* 别名容器 - 目标站: flex items-center gap-1.5 flex-wrap p-1.5 rounded-lg border #e6e8ee bg #f5f6fa min-h-40px */
.comp-aliases-box {
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

/* 空别名提示 - 目标站: px-1.5 text-[11.5px] color #8a8f9b */
.comp-aliases-empty {
  padding: 0 6px;
  font-size: 11.5px;
  color: #8a8f9b;
}

/* ===== 知识库页面 ===== */
/* 添加资料按钮间距 - gap-1.5 */
.wiki-add-btn {
  gap: 6px;
}

/* 筛选栏 - 目标站: flex items-center justify-between gap-3 mb-4 flex-wrap */
.wiki-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

/* 筛选标签组 - 目标站: flex items-center gap-1.5 flex-wrap */
.wiki-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* 筛选标签 - 目标站: px-[11px] py-1.5 rounded-lg text-[12px] font-semibold */
.wiki-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: transparent;
  color: #5b606a;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;

  &--active {
    background: #efecff;
    color: #4a38e0;
    border: 1px solid rgba(100, 82, 255, 0.2);
  }
}

/* 标签计数 - 目标站: text-[10.5px] font-bold px-1.5 py-[1px] rounded-full */
.wiki-tab-count {
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 9999px;
  background: #f5f6fa;
  color: #5b606a;
  font-family: 'JetBrains Mono', monospace;

  &--active {
    background: rgba(100, 82, 255, 0.18);
    color: #4a38e0;
  }
}

/* 搜索框 - 目标站: px-3 h-[34px] w-[220px] rounded-lg bg #fff border #e6e8ee */
.wiki-search-box {
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

.wiki-search-input {
  flex: 1;
  background: transparent;
  outline: none;
  font-size: 12.5px;
  color: #0f1115;
  border: none;

  &::placeholder {
    color: #9ca3af;
  }
}

/* 资料网格 - 目标站: grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 */
.wiki-grid {
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

/* 空状态 - 目标站: col-span-full py-12 text-center rounded-2xl bg #fff border 1px dashed #e6e8ee */
.wiki-empty {
  grid-column: 1 / -1;
  padding: 48px 0;
  text-align: center;
  border-radius: 16px;
  background: #fff;
  border: 1px dashed #e6e8ee;
}

/* 空状态标题 - 目标站: text-[14px] font-bold mb-1 color #0f1115 */
.wiki-empty-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #0f1115;
}

/* 空状态提示 - 目标站: text-[12px] color #8a8f9b */
.wiki-empty-hint {
  font-size: 12px;
  color: #8a8f9b;
}

.tab-content {
  padding: 16px 0;
}
</style>
