<template>
  <div class="pricing-page">
    <!-- ============ 1. 头部 ============ -->
    <header class="pp-header">
      <div class="pp-header-left">
        <h1>套餐版本</h1>
        <p>查看当前的套餐权益、用量与账单记录 · 统计周期：实时</p>
      </div>
      <div class="pp-header-right">
        <button class="pp-credit-btn">账户积分 ✦ 330</button>
        <button class="pp-topup-btn">充值积分</button>
      </div>
    </header>

    <!-- ============ 2. 当前套餐信息卡 ============ -->
    <div class="pp-current-card">
      <div class="pp-current-left">
        <div class="pp-current-label">
          <svg class="pp-ic-layers" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
          当前套餐 · 佛山市宏祥家具实业有限公司
        </div>
        <div class="pp-current-name">入门版-月付</div>
        <div class="pp-current-expiry">有效期至 2026/9/20</div>
      </div>
      <div class="pp-current-right">
        <div class="pp-quota">
          <div class="pp-quota-head">
            <svg class="pp-ic-layers" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            <span class="pp-quota-label">监控问题配额</span>
            <span class="pp-quota-value">8 / 8</span>
          </div>
          <div class="pp-quota-bar"><div class="pp-quota-fill red" style="width: 100%"></div></div>
        </div>
        <div class="pp-quota">
          <div class="pp-quota-head">
            <svg class="pp-ic-layers" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            <span class="pp-quota-label">覆盖大模型平台</span>
            <span class="pp-quota-value">5 / 5</span>
          </div>
          <div class="pp-quota-bar"><div class="pp-quota-fill green" style="width: 100%"></div></div>
        </div>
      </div>
    </div>

    <!-- ============ 3. 板块标题 ============ -->
    <div class="pp-section-title">
      <div class="pp-st-main">
        <svg class="pp-ic-zap-amber" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
        监控会员套餐
      </div>
      <div class="pp-st-sub">监控会员套餐按品牌独立开通 · 当前品牌：佛山市宏祥家具实业有限公司 · 可用账户积分或现金支付</div>
    </div>

    <!-- ============ 4. 套餐卡片网格 ============ -->
    <div class="pp-plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="pp-plan-card"
        :class="{ highlighted: plan.highlighted, current: plan.current, custom: plan.id === 'custom' }"
      >
        <!-- 当前套餐角标（入门版，旋转丝带） -->
        <div v-if="plan.current" class="pp-current-ribbon">当前套餐</div>

        <!-- 高亮横幅（专业版） -->
        <div v-if="plan.banner" class="pp-plan-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
          {{ plan.banner }}
        </div>

        <!-- 套餐名 -->
        <div class="pp-plan-name-wrap">
          <h4 class="pp-plan-name">{{ plan.name }}<span v-if="plan.icon" class="pp-plan-icon">{{ plan.icon }}</span></h4>
        </div>

        <!-- 价格 -->
        <div class="pp-plan-price-block">
          <div class="pp-plan-price" v-if="plan.price !== null">
            <span class="pp-price-currency">¥</span>
            <span class="pp-price-amount">{{ plan.price }}</span>
            <span v-if="plan.unit" class="pp-price-unit">{{ plan.unit }}</span>
          </div>
          <div class="pp-plan-price custom-price" v-else>
            <span class="pp-custom-price-text">{{ plan.priceText }}</span>
          </div>
          <p v-if="plan.subtitle" class="pp-plan-subtitle">{{ plan.subtitle }}</p>
        </div>

        <!-- AI 引擎监控能力（付费套餐） -->
        <template v-if="plan.hasAISection">
          <div class="pp-ai-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            AI 引擎监控能力
          </div>
          <div class="pp-ai-toggle">
            <div class="pp-platform-row">
              <div class="pp-platform-btn active">网页端</div>
              <div class="pp-platform-btn disabled">APP 端</div>
              <div class="pp-platform-btn">双端</div>
            </div>
            <div class="pp-ai-models">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
              <span class="pp-ai-models-text">5 大主流 AI</span>
              <span class="pp-info-icon" title="DeepSeek · 豆包 · 文心一言 · 通义千问 · 元宝">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </span>
            </div>
          </div>
        </template>

        <!-- 功能列表 -->
        <div class="pp-features" :class="{ 'pp-features-mt': plan.id === 'custom' }">
          <div
            v-for="(feat, fi) in plan.features"
            :key="fi"
            class="pp-feature"
            :class="{ excluded: !feat.included, highlighted: plan.hasAISection && fi === 0 && feat.included }"
          >
            <svg v-if="feat.included" class="pp-feat-zap" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
            <span v-else class="pp-feat-x">✕</span>
            <span>{{ feat.text }}</span>
          </div>
          <!-- 定制版功能列表 -->
          <div
            v-for="(feat, fi) in plan.customFeatures || []"
            :key="'c' + fi"
            class="pp-feature custom-feat"
            :class="{ 'custom-last': fi === (plan.customFeatures || []).length - 1 }"
          >
            <svg class="pp-feat-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span>{{ feat }}</span>
          </div>
        </div>

        <!-- 计费周期（付费套餐） -->
        <template v-if="plan.billingPeriods">
          <div class="pp-billing-title">计费周期</div>
          <div class="pp-billing">
            <div
              v-for="(bp, bi) in plan.billingPeriods"
              :key="bi"
              class="pp-billing-btn"
              :class="{ active: bi === 0 }"
            >
              {{ bp.label }}
              <span v-if="bp.discount" class="pp-discount-badge">{{ bp.discount }}</span>
            </div>
          </div>
        </template>

        <!-- 按钮 -->
        <div class="pp-plan-actions">
          <button
            v-if="plan.primaryBtn"
            class="pp-btn"
            :class="{
              'pp-btn-primary': plan.primaryBtn.type === 'primary',
              'pp-btn-green': plan.primaryBtn.type === 'green',
              'pp-btn-disabled': plan.primaryBtn.type === 'disabled',
            }"
            :disabled="plan.primaryBtn.type === 'disabled'"
          >{{ plan.primaryBtn.text }}</button>
          <button
            v-if="plan.secondaryBtn"
            class="pp-btn pp-btn-secondary"
          >{{ plan.secondaryBtn.text }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Feature {
  text: string;
  included: boolean;
}

interface BillingPeriod {
  label: string;
  discount?: string;
}

interface Plan {
  id: string;
  name: string;
  icon?: string;
  price: number | null;
  priceText?: string;
  unit?: string;
  subtitle?: string;
  current?: boolean;
  highlighted?: boolean;
  banner?: string;
  hasAISection?: boolean;
  features: Feature[];
  customFeatures?: string[];
  billingPeriods?: BillingPeriod[];
  primaryBtn?: { text: string; type: 'primary' | 'green' | 'disabled' };
  secondaryBtn?: { text: string };
}

const plans: Plan[] = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    unit: '',
    features: [
      { text: '真实账号抓取', included: true },
      { text: '监控问题数量 3 个', included: true },
      { text: '3 个网页端 AI 引擎', included: true },
      { text: '品牌排名分析', included: true },
      { text: '品牌舆情分析', included: true },
      { text: '搜索快照下载', included: true },
      { text: '引用源情报洞察', included: false },
      { text: '数据导出报告', included: false },
      { text: '稿件中心撰稿', included: false },
      { text: '稿件中心发稿', included: false },
    ],
    primaryBtn: { text: '免费版', type: 'disabled' },
  },
  {
    id: 'starter',
    name: '入门版',
    price: 79,
    unit: '/月',
    subtitle: '按月灵活订阅',
    current: true,
    hasAISection: true,
    features: [
      { text: '真实账号抓取', included: true },
      { text: '监控问题数量 8 个', included: true },
      { text: '监测频率 1 天 1 次', included: true },
      { text: '品牌排名分析', included: true },
      { text: '品牌舆情分析', included: true },
      { text: '搜索快照下载', included: true },
      { text: '引用源情报洞察', included: true },
      { text: '数据导出报告', included: true },
      { text: '解锁撰稿功能（需额外消耗积分）', included: true },
      { text: '解锁发稿功能（需额外消耗积分）', included: true },
    ],
    billingPeriods: [
      { label: '1 个月' },
      { label: '3 个月', discount: '8 折' },
      { label: '12 个月', discount: '7 折' },
    ],
    primaryBtn: { text: '支付 ¥79 续费', type: 'primary' },
    secondaryBtn: { text: '积分支付 ✦ 790' },
  },
  {
    id: 'basic',
    name: '基础版',
    price: 199,
    unit: '/月',
    subtitle: '按月灵活订阅',
    hasAISection: true,
    features: [
      { text: '真实账号抓取', included: true },
      { text: '监控问题数量 30 个', included: true },
      { text: '监测频率 1 天 1 次', included: true },
      { text: '品牌排名分析', included: true },
      { text: '品牌舆情分析', included: true },
      { text: '搜索快照下载', included: true },
      { text: '引用源情报洞察', included: true },
      { text: '数据导出报告', included: true },
      { text: '专属客户经理', included: true },
      { text: '解锁撰稿功能（需额外消耗积分）', included: true },
      { text: '解锁发稿功能（需额外消耗积分）', included: true },
    ],
    billingPeriods: [
      { label: '1 个月' },
      { label: '3 个月', discount: '8 折' },
      { label: '12 个月', discount: '7 折' },
    ],
    primaryBtn: { text: '直接支付 ¥199', type: 'primary' },
    secondaryBtn: { text: '积分支付 ✦ 1,990' },
  },
  {
    id: 'pro',
    name: '专业版',
    icon: '👑',
    price: 499,
    unit: '/月',
    subtitle: '按月灵活订阅',
    highlighted: true,
    banner: '最受欢迎 · 性价比之选',
    hasAISection: true,
    features: [
      { text: '真实账号抓取', included: true },
      { text: '监控问题数量 100 个', included: true },
      { text: '监测频率 1 天 1 次', included: true },
      { text: '品牌排名分析', included: true },
      { text: '品牌舆情分析', included: true },
      { text: '搜索快照下载', included: true },
      { text: '引用源情报洞察', included: true },
      { text: '数据导出报告', included: true },
      { text: '专属客户经理', included: true },
      { text: '7×24 小时技术支持', included: true },
      { text: '解锁撰稿功能（需额外消耗积分）', included: true },
      { text: '解锁发稿功能（需额外消耗积分）', included: true },
    ],
    billingPeriods: [
      { label: '1 个月' },
      { label: '3 个月', discount: '8 折' },
      { label: '12 个月', discount: '7 折' },
    ],
    primaryBtn: { text: '直接支付 ¥499', type: 'primary' },
    secondaryBtn: { text: '积分支付 ✦ 4,990' },
  },
  {
    id: 'custom',
    name: '定制版',
    icon: '★',
    price: null,
    priceText: '按需定价',
    subtitle: '根据企业需求量身定制',
    features: [],
    customFeatures: [
      '更多监控问题查询',
      '批量品牌诊断',
      'AI 模型定制',
      '产品 OEM 定制',
      'API 接口输出',
      '功能定制',
      '监控代运营服务',
      '等等……',
    ],
    primaryBtn: { text: '联系客服', type: 'green' },
  },
];
</script>

<style lang="scss" scoped>
/* ================================================================
   套餐页面 - 像素级复刻
   对标: geo.timus.cn/dashboard/plan-upgrade
   ================================================================ */

.pricing-page {
  max-width: 1240px;
  margin: 0 auto;
  padding: 28px 36px 80px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #111827;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ====== 1. 头部 ====== */
.pp-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  h1 {
    font-size: 24px;
    font-weight: 800;
    color: #111827;
    line-height: 32px;
    margin: 0;
    letter-spacing: -0.6px;
  }

  p {
    font-size: 14px;
    font-weight: 400;
    color: #9ca3af;
    line-height: 20px;
    margin: 4px 0 0;
  }
}

.pp-header-left {
  display: block;
}

.pp-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.pp-credit-btn {
  background: linear-gradient(to right bottom, #4f46e5, #6d28d9);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pp-topup-btn {
  background: #111827;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ====== 2. 当前套餐信息卡 ====== */
.pp-current-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.pp-current-left {
  flex-shrink: 0;
  min-width: 260px;
}

.pp-current-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  line-height: 16px;
  margin-bottom: 8px;

  .pp-ic-layers {
    color: #9ca3af;
    flex-shrink: 0;
  }
}

.pp-current-name {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  line-height: 32px;
  margin-bottom: 8px;
}

.pp-current-expiry {
  font-size: 14px;
  font-weight: 400;
  color: #9ca3af;
  line-height: 20px;
}

.pp-current-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  width: 100%;
}

.pp-quota {
  display: block;
}

.pp-quota-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .pp-ic-layers {
    color: #9ca3af;
    flex-shrink: 0;
  }
}

.pp-quota-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  line-height: 16px;
}

.pp-quota-value {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  line-height: 16px;
  margin-left: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.pp-quota-bar {
  height: 6px;
  background: #f3f4f6;
  border-radius: 9999px;
  overflow: hidden;
}

.pp-quota-fill {
  height: 100%;
  border-radius: 9999px;

  &.red {
    background: #ef4444;
  }

  &.green {
    background: #10b981;
  }
}

/* ====== 3. 板块标题 ====== */
.pp-section-title {
  margin-top: 8px;
}

.pp-st-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  line-height: 28px;

  .pp-ic-zap-amber {
    color: #f59e0b;
    flex-shrink: 0;
  }
}

.pp-st-sub {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
  line-height: 16px;
  text-align: center;
  margin-top: 6px;
}

/* ====== 4. 套餐卡片网格 ====== */
.pp-plans-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  align-items: stretch;
}

.pp-plan-card {
  background: #fafafe;
  border: 1px solid #ececf3;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(20, 20, 40, 0.03);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  padding: 26px 22px 22px;

  &.highlighted {
    border: 1.5px solid #6452ff;
    background: #fff;
    box-shadow: 0 10px 30px rgba(100, 82, 255, 0.12);
    padding-top: 0;
  }
}

/* 当前套餐丝带角标 */
.pp-current-ribbon {
  position: absolute;
  top: 16px;
  right: -34px;
  width: 130px;
  transform: rotate(45deg);
  background: #6452ff;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  padding: 5px 0;
  letter-spacing: 0.08em;
  box-shadow: 0 2px 7px rgba(100, 82, 255, 0.4);
  z-index: 10;
}

/* 高亮横幅 */
.pp-plan-banner {
  margin: 0 -22px 20px;
  padding: 9px 22px;
  background: linear-gradient(to right bottom, #6452ff, #4a38e0);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3px;
  line-height: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  svg {
    flex-shrink: 0;
  }
}

/* 套餐名 */
.pp-plan-name-wrap {
  margin-bottom: 12px;
}

.pp-plan-name {
  font-size: 19px;
  font-weight: 800;
  color: #111114;
  line-height: 28.5px;
  margin: 0;
  display: flex;
  align-items: center;
}

.pp-plan-icon {
  font-size: 19px;
  font-weight: 400;
  margin-left: 2px;
  line-height: 1;
}

/* 价格 */
.pp-plan-price-block {
  margin-bottom: 14px;
}

.pp-plan-price {
  display: flex;
  align-items: baseline;

  .pp-price-currency {
    font-size: 22px;
    font-weight: 800;
    color: #111114;
    line-height: 1;
    margin-right: 2px;
  }

  .pp-price-amount {
    font-size: 44px;
    font-weight: 800;
    color: #111114;
    line-height: 44px;
    letter-spacing: -0.04em;
  }

  .pp-price-unit {
    font-size: 13px;
    font-weight: 600;
    color: #9a9aa6;
    margin-left: 3px;
  }

  &.custom-price {
    align-items: flex-start;

    .pp-custom-price-text {
      font-size: 30px;
      font-weight: 800;
      color: #047857;
      line-height: 37.5px;
      letter-spacing: -0.02em;
    }
  }
}

.pp-plan-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: #9a9aa6;
  line-height: 16px;
  margin: 4px 0 0;
}

/* ====== AI 引擎监控能力 ====== */
.pp-ai-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #9a9aa6;
  letter-spacing: 0.44px;
  margin-bottom: 7px;

  svg {
    flex-shrink: 0;
  }
}

.pp-ai-toggle {
  background: #fafafe;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 14px;
}

.pp-platform-row {
  display: flex;
  gap: 5px;
  margin-bottom: 6px;
}

.pp-platform-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  color: #6e6e7a;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
  transition: all 0.15s;

  &.active {
    background: #6452ff;
    color: #fff;
    box-shadow: 0 2px 7px rgba(100, 82, 255, 0.4);
    cursor: pointer;
  }

  &.disabled {
    color: #d3d3dd;
    cursor: not-allowed;
  }
}

.pp-ai-models {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 4px 2px;
  border-top: 1px solid #ececf3;

  svg {
    flex-shrink: 0;
    color: #6452ff;
  }
}

.pp-ai-models-text {
  min-width: 0;
  font-size: 12px;
  font-weight: 800;
  color: #111114;
  line-height: 1.375;
  white-space: nowrap;
}

.pp-info-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 5px;
  color: #9a9aa6;
  cursor: help;

  &:hover {
    color: #6452ff;
  }
}

/* ====== 功能列表 ====== */
.pp-features {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 18px;

  &.pp-features-mt {
    margin-top: 12px;
  }
}

.pp-feature {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  white-space: nowrap;
  line-height: 17.25px;
  font-weight: 400;
  color: #3a3a45;

  .pp-feat-zap {
    flex-shrink: 0;
    color: #9a9aa6;
  }

  &.highlighted {
    font-weight: 700;
    color: #6452ff;

    .pp-feat-zap {
      color: #6452ff;
    }
  }

  &.excluded {
    color: #9a9aa6;

    .pp-feat-x {
      font-size: 11px;
      line-height: 1;
      flex-shrink: 0;
      color: #9a9aa6;
    }
  }

  &.custom-feat {
    color: #065f46;

    .pp-feat-check {
      flex-shrink: 0;
      color: #10b981;
    }

    &.custom-last {
      font-weight: 700;
      color: #047857;
    }
  }
}

/* ====== 计费周期 ====== */
.pp-billing-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #9a9aa6;
  letter-spacing: 0.44px;
  margin-bottom: 7px;
  margin-top: 2px;
}

.pp-billing {
  display: flex;
  gap: 5px;
  padding: 4px;
  background: #fafafe;
  border-radius: 12px;
  margin-bottom: 18px;
}

.pp-billing-btn {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  color: #6e6e7a;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
  transition: all 0.15s;

  &.active {
    background: #fff;
    color: #111114;
    box-shadow: 0 1px 3px rgba(20, 20, 40, 0.12);
  }
}

.pp-discount-badge {
  position: absolute;
  top: -8px;
  right: -4px;
  padding: 1px 5px;
  background: #ff4757;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  border-radius: 9999px;
  line-height: 1.4;
  white-space: nowrap;
}

/* ====== 按钮 ====== */
.pp-plan-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-btn {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
  text-align: center;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }
}

.pp-btn-primary {
  background: #6452ff;
  color: #fff;
}

.pp-btn-secondary {
  background: #efecff;
  color: #4a38e0;
}

.pp-btn-green {
  background: #10b981;
  color: #fff;
}

.pp-btn-disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;

  &:hover {
    opacity: 1;
  }
}
</style>
