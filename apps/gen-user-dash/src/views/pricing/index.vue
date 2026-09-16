<template>
  <div class="pricing-page geo-page">
    <header class="pp-header geo-page-header">
      <div class="pp-header-left geo-page-header__text">
        <h1 class="geo-page-title">套餐版本</h1>
        <p class="geo-page-desc">查看当前的套餐权益、用量与账单记录 · 统计周期：实时</p>
      </div>
      <div class="pp-header-right geo-page-header__actions">
        <button type="button" class="pp-credit-btn" title="查看积分明细" @click="openCreditDetail">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
          账户积分 ✦ {{ creditDisplay }}
        </button>
        <button type="button" class="pp-topup-btn" @click="openRecharge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          充值积分
        </button>
      </div>
    </header>

    <div class="geo-page-stack">
      <div class="pp-current-card">
        <div class="pp-current-left">
          <div class="pp-current-label">
            <svg class="pp-ic-layers" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            当前套餐 · {{ brandName }}
          </div>
          <div class="pp-current-name">{{ sub?.plan_name || '暂无订阅' }}</div>
          <div class="pp-current-expiry">有效期至 {{ expireText }}</div>
        </div>
        <div class="pp-current-right">
          <div class="pp-quota">
            <div class="pp-quota-head">
              <svg class="pp-ic-layers" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
              <span class="pp-quota-label">监控问题配额</span>
              <span class="pp-quota-value"><b>{{ sub?.query_limit ?? 0 }}</b> / {{ sub?.query_count ?? 0 }}</span>
            </div>
            <div class="pp-quota-bar"><div class="pp-quota-fill indigo" :style="{ width: quotaPct + '%' }"></div></div>
          </div>
          <div class="pp-quota">
            <div class="pp-quota-head">
              <svg class="pp-ic-layers" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
              <span class="pp-quota-label">覆盖大模型平台</span>
              <span class="pp-quota-value"><b>{{ platformMax }}</b> / {{ platformCount }}</span>
            </div>
            <div class="pp-quota-bar pp-quota-seg">
              <div v-for="i in 5" :key="i" class="pp-seg" :class="{ on: i <= platformCount }" />
            </div>
          </div>
        </div>
      </div>

      <div class="pp-section-title">
        <div class="pp-st-main">
          <svg class="pp-ic-zap-amber" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
          监控会员套餐
        </div>
        <div class="pp-st-sub">监控会员套餐按品牌独立开通 · 当前品牌：{{ brandName }} · 可用账户积分或现金支付</div>
      </div>

      <div class="pp-plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="pp-plan-card"
          :class="{ highlighted: plan.highlighted, current: plan.current, custom: plan.id === 'custom' }"
        >
          <div v-if="plan.current" class="pp-current-ribbon">当前套餐</div>
          <div v-if="plan.banner" class="pp-plan-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
            {{ plan.banner }}
          </div>

          <div class="pp-plan-name-wrap">
            <h4 class="pp-plan-name">{{ plan.name }}<span v-if="plan.icon" class="pp-plan-icon">{{ plan.icon }}</span></h4>
          </div>

          <div class="pp-plan-price-block">
            <div v-if="plan.price !== null" class="pp-plan-price">
              <span class="pp-price-currency">¥</span>
              <span class="pp-price-amount">{{ displayPrice(plan) }}</span>
              <span v-if="plan.unit" class="pp-price-unit">{{ plan.unit }}</span>
            </div>
            <div v-else class="pp-plan-price custom-price">
              <span class="pp-custom-price-text">{{ plan.priceText }}</span>
            </div>
            <p v-if="plan.subtitle" class="pp-plan-subtitle">{{ plan.subtitle }}</p>
          </div>

          <template v-if="plan.hasAISection">
            <div class="pp-ai-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
              AI 引擎监控能力
            </div>
            <div class="pp-ai-toggle">
              <div class="pp-platform-row">
                <button type="button" class="pp-platform-btn" :class="{ active: scopeOf(plan.id) === 'pc' }" @click="setScope(plan.id, 'pc')">网页端</button>
                <button type="button" class="pp-platform-btn disabled" disabled title="即将开放">APP 端</button>
                <button type="button" class="pp-platform-btn" :class="{ active: scopeOf(plan.id) === 'both' }" @click="setScope(plan.id, 'both')">双端</button>
              </div>
              <div class="pp-ai-models">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                <span class="pp-ai-models-text">{{ scopeOf(plan.id) === 'both' ? '8 端主流 AI' : '5 大主流 AI' }}</span>
                <span class="pp-info-icon" :title="scopeOf(plan.id) === 'both' ? '网页端 5 + APP 端 3' : 'DeepSeek · 豆包 · 文心一言 · 通义千问 · 元宝'">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </span>
              </div>
            </div>
          </template>

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

          <template v-if="plan.billingPeriods">
            <div class="pp-billing-title">计费周期</div>
            <div class="pp-billing">
              <button
                v-for="bp in plan.billingPeriods"
                :key="bp.cycle"
                type="button"
                class="pp-billing-btn"
                :class="{ active: cycleOf(plan.id) === bp.cycle }"
                @click="setCycle(plan.id, bp.cycle)"
              >
                {{ bp.label }}
                <span v-if="bp.discount" class="pp-discount-badge">{{ bp.discount }}</span>
              </button>
            </div>
          </template>

          <div class="pp-plan-actions">
            <button
              v-if="plan.primaryBtn"
              type="button"
              class="pp-btn"
              :class="{
                'pp-btn-primary': plan.primaryBtn.type === 'primary',
                'pp-btn-green': plan.primaryBtn.type === 'green',
                'pp-btn-disabled': plan.primaryBtn.type === 'disabled',
              }"
              :disabled="plan.primaryBtn.type === 'disabled' || paying"
              @click="onPrimary(plan)"
            >{{ plan.primaryBtn.text }}</button>
            <button
              v-if="plan.secondaryBtn"
              type="button"
              class="pp-btn pp-btn-secondary"
              :disabled="paying"
              @click="onCreditPay(plan)"
            >{{ plan.secondaryBtn.text }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 积分明细 -->
    <div v-if="creditDetailOpen" class="pp-overlay" @click.self="creditDetailOpen = false">
      <div class="pp-modal pp-modal-credit">
        <div class="pp-modal-hd">
          <h3>积分明细</h3>
          <div class="pp-modal-hd-acts">
            <button type="button" class="pp-buy-mini" @click="openRechargeFromDetail">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              购买积分
            </button>
            <button type="button" class="pp-x" @click="creditDetailOpen = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
        <div class="pp-credit-summary">
          <div class="pp-cs-label">账户积分余额</div>
          <div class="pp-cs-bal"><span class="pp-cs-star">✦</span>{{ creditDisplay }}</div>
          <div class="pp-cs-row">
            <span>总额度 <b>{{ creditDisplay }}</b></span>
            <span>当前冻结 <b class="amber">{{ creditFrozen }}</b></span>
            <span>剩余额度 <b class="emerald">{{ creditDisplay }}</b></span>
          </div>
          <div class="pp-cs-row">
            <span>累计充值 <b>{{ fmtNum(creditMeta.total_recharge) }}</b></span>
            <span>累计消耗 <b>{{ fmtNum(creditMeta.total_consume) }}</b></span>
            <span>累计过期 <b>{{ fmtNum(creditMeta.total_expired) }}</b></span>
          </div>
        </div>
        <div class="pp-credit-tabs">
          <button type="button" :class="{ on: txnTab === 'all' }" @click="switchTxnTab('all')">全部</button>
          <button type="button" :class="{ on: txnTab === 'consume' }" @click="switchTxnTab('consume')">消耗</button>
          <button type="button" :class="{ on: txnTab === 'obtain' }" @click="switchTxnTab('obtain')">获得</button>
        </div>
        <div class="pp-credit-list">
          <div v-if="!txns.length" class="pp-credit-empty">暂无流水</div>
          <div v-for="t in txns" :key="t.txn_id" class="pp-txn">
            <div class="pp-txn-l">
              <div class="pp-txn-title">{{ t.title || t.remark || '积分变动' }}</div>
              <div class="pp-txn-time">{{ fmtTime(t.created_at) }}</div>
            </div>
            <div class="pp-txn-r">
              <div class="pp-txn-amt" :class="{ neg: t.amount < 0, pos: t.amount > 0 }">{{ t.amount > 0 ? '+' : '' }}{{ fmtNum(t.amount) }}</div>
              <span class="pp-txn-badge">积分</span>
            </div>
          </div>
        </div>
        <div class="pp-credit-foot">充值积分自充值起 2 年有效,先到期的先抵扣;不支持退款、不可转赠、不可提现。</div>
      </div>
    </div>

    <!-- 购买积分 -->
    <div v-if="rechargeOpen" class="pp-overlay" @click.self="rechargeOpen = false">
      <div class="pp-modal pp-modal-recharge">
        <button type="button" class="pp-x abs" @click="rechargeOpen = false">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div class="pp-recharge-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
          <h3>购买积分</h3>
        </div>
        <div class="pp-pack-grid">
          <button v-for="p in packs" :key="p.pack_id" type="button" class="pp-pack" @click="buyPack(p)">
            <div class="pp-pack-cr"><span>✦</span>{{ fmtNum(p.credits) }}</div>
            <div class="pp-pack-price"><span>¥</span>{{ p.price }}</div>
            <div class="pp-pack-unit">¥{{ p.unit_price.toFixed(2) }}/积分</div>
          </button>
        </div>
        <p class="pp-recharge-note">积分可用于开通各品牌监测套餐、单次诊断与按次监测;充值积分自购买起 2 年有效,不支持退款、不可转赠、不可提现。</p>
      </div>
    </div>

    <!-- 微信支付 -->
    <div v-if="payOpen && payOrder" class="pp-overlay" @click.self="closePay">
      <div class="pp-modal pp-modal-pay">
        <div class="pp-pay-left">
          <div class="pp-pay-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>
            {{ payBadge }}
          </div>
          <h3>{{ payTitle }}</h3>
          <p class="pp-pay-sub">{{ paySubtitle }}</p>
          <div class="pp-pay-benefits">
            <div v-for="b in payBenefits" :key="b.t" class="pp-pay-ben">
              <div class="pp-pay-ben-ic">
                <svg v-if="b.ic === 'layers'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
                <svg v-else-if="b.ic === 'bot'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
              </div>
              <div>
                <div class="pp-pay-ben-t">{{ b.t }}</div>
                <div class="pp-pay-ben-d">{{ b.d }}</div>
              </div>
            </div>
          </div>
          <div class="pp-pay-total">
            <div class="pp-pay-total-l">订单总额</div>
            <div class="pp-pay-total-v">
              <span class="yen">¥</span>
              <span class="num">{{ payOrder.price }}</span>
              <span class="unit">/ {{ payDurationLabel }}</span>
            </div>
          </div>
        </div>
        <div class="pp-pay-right">
          <button type="button" class="pp-x abs" @click="closePay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <h4>微信扫码支付</h4>
          <p class="pp-pay-hint">请使用手机微信扫描下方二维码完成支付</p>
          <div class="pp-qr-wrap">
            <div class="pp-qr-mock">
              <div class="pp-qr-grid" />
              <span>模拟收款码</span>
            </div>
          </div>
          <div class="pp-pay-timer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            支付剩余时间 {{ payRemainText }}
          </div>
          <div class="pp-pay-method">
            <span>支付方式</span>
            <span class="pp-wx"><i />微信支付</span>
          </div>
          <button type="button" class="pp-mock-pay" :disabled="paying" @click="confirmMockPay">开发环境：模拟支付成功</button>
          <p class="pp-pay-legal">购买即代表你同意《透镜GEO 用户协议》，因机制特殊性，付款不支持退款，请知悉。《支付/退款协议》</p>
          <p class="pp-pay-help">支付遇到问题？联系客服</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useAuthStore } from '@/stores/auth';
import { paymentApi, creditApi } from '@/api/modules/payment';
import type { PlansGrouped, PlanItem, CreditTxn, RechargePack, PayOrderCreated } from '@/api/modules/payment';
import { userApi } from '@/api/modules/user';
import type { CreditAccount, Subscription } from '@/api/types';

interface Feature { text: string; included: boolean }
interface BillingPeriod { label: string; discount?: string; cycle: string }
interface PlanCard {
  id: string; name: string; icon?: string;
  price: number | null; priceText?: string; unit?: string; subtitle?: string;
  current?: boolean; highlighted?: boolean; banner?: string; hasAISection?: boolean;
  features: Feature[]; customFeatures?: string[]; billingPeriods?: BillingPeriod[];
  primaryBtn?: { text: string; type: 'primary' | 'green' | 'disabled' };
  secondaryBtn?: { text: string };
  queryLimit?: number;
}

const auth = useAuthStore();
const credit = ref(0);
const creditFrozen = ref(0);
const creditMeta = reactive({ total_recharge: 0, total_consume: 0, total_expired: 0 });
const sub = ref<Subscription | null>(null);
const grouped = ref<PlansGrouped | null>(null);
const paying = ref(false);

const scopeSel = reactive<Record<string, 'pc' | 'both'>>({});
const cycleSel = reactive<Record<string, string>>({});

const creditDetailOpen = ref(false);
const txnTab = ref<'all' | 'consume' | 'obtain'>('all');
const txns = ref<CreditTxn[]>([]);

const rechargeOpen = ref(false);
const packs = ref<RechargePack[]>([]);

const payOpen = ref(false);
const payOrder = ref<PayOrderCreated | null>(null);
const payKind = ref<'plan' | 'recharge'>('plan');
const payRemain = ref(15 * 60);
let payTimer: ReturnType<typeof setInterval> | null = null;

const brandName = computed(() => auth.activeBrand?.name || '当前品牌');
const creditDisplay = computed(() => fmtNum(credit.value));
const expireText = computed(() => (sub.value?.expire_date || '').replace(/-/g, '/') || '—');
const quotaPct = computed(() => {
  const s = sub.value; if (!s || !s.query_limit) return 0;
  return Math.min(100, Math.round((s.query_count / s.query_limit) * 100));
});
const platformMax = computed(() => (sub.value?.platform_list?.length && sub.value.platform_list.length > 5 ? 8 : 5));
const platformCount = computed(() => Math.min(platformMax.value, sub.value?.platform_list?.length ?? 0));

const TIER_ORDER = [
  { type: 'free', name: '免费版' },
  { type: 'starter', name: '入门版', subtitle: '按月灵活订阅' },
  { type: 'basic', name: '基础版', subtitle: '按月灵活订阅' },
  { type: 'pro', name: '专业版', icon: '👑', subtitle: '按月灵活订阅', highlighted: true, banner: '最受欢迎 · 性价比之选' },
  { type: 'custom', name: '定制版', icon: '★', subtitle: '根据企业需求量身定制' },
] as const;

const CUSTOM_FEATURES = [ '更多监控问题查询', '批量品牌诊断', 'AI 模型定制', '产品 OEM 定制', 'API 接口输出', '功能定制', '监控代运营服务', '等等……' ];

function fmtNum(n: number) {
  return Number(n || 0).toLocaleString('en-US');
}
function fmtTime(s: string) {
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s).replace('T', ' ').slice(0, 19);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function scopeOf(id: string) { return scopeSel[id] || 'pc'; }
function cycleOf(id: string) { return cycleSel[id] || 'monthly'; }
function setScope(id: string, s: 'pc' | 'both') { scopeSel[id] = s; }
function setCycle(id: string, c: string) { cycleSel[id] = c; }

function featuresFor(type: string, limit: number): Feature[] {
  const list: Feature[] = [
    { text: '真实账号抓取', included: true },
    { text: `监控问题数量 ${limit} 个`, included: true },
  ];
  if (type === 'free') {
    list.push(
      { text: '3 个网页端 AI 引擎', included: true },
      { text: '品牌排名分析', included: true },
      { text: '品牌舆情分析', included: true },
      { text: '搜索快照下载', included: true },
      { text: '引用源情报洞察', included: false },
      { text: '数据导出报告', included: false },
      { text: '稿件中心撰稿', included: false },
      { text: '稿件中心发稿', included: false },
    );
  } else {
    list.push(
      { text: '5 大主流 AI 引擎', included: true },
      { text: '监测频率 1 天 1 次', included: true },
      { text: '品牌排名分析', included: true },
      { text: '品牌舆情分析', included: true },
      { text: '搜索快照下载', included: true },
      { text: '引用源情报洞察', included: true },
      { text: '数据导出报告', included: true },
    );
    if (type === 'pro') {
      list.push({ text: '专属客户经理', included: true }, { text: '7×24 小时技术支持', included: true });
    }
    list.push(
      { text: '解锁撰稿功能（需额外消耗积分）', included: true },
      { text: '解锁发稿功能（需额外消耗积分）', included: true },
    );
  }
  return list;
}

function discountLabel(item: PlanItem): string | undefined {
  const rate = item.discount_rate != null
    ? item.discount_rate
    : (item.original_price > 0 ? item.price / item.original_price : 1);
  if (rate >= 0.999) return undefined;
  const z = Math.round(rate * 10);
  return `${z}折`;
}

function itemsForTier(type: string, scope: 'pc' | 'both'): PlanItem[] {
  const g = grouped.value as unknown as Record<string, PlanItem[]> | null;
  const items = g?.[type] || [];
  return items.filter(i => {
    const sc = i.platform_scope || 'pc';
    if (scope === 'both') return sc === 'both';
    return sc === 'pc' || (!i.platform_scope && !/_app|_both/.test(i.plan_code));
  });
}

function selectedItem(type: string): PlanItem | null {
  const items = itemsForTier(type, scopeOf(type));
  if (!items.length) return null;
  const cycle = cycleOf(type);
  return items.find(i => i.billing_cycle === cycle) || items.find(i => i.billing_cycle === 'monthly') || items[0];
}

function billingPeriodsFor(type: string): BillingPeriod[] | undefined {
  const items = itemsForTier(type, scopeOf(type));
  const order: Record<string, number> = { monthly: 0, quarterly: 1, yearly: 2 };
  const label: Record<string, string> = { monthly: '1个月', quarterly: '3个月', yearly: '12个月' };
  const seen = new Set<string>();
  const periods: BillingPeriod[] = [];
  for (const i of [ ...items ].sort((a, b) => (order[a.billing_cycle] ?? 9) - (order[b.billing_cycle] ?? 9))) {
    if (!i.billing_cycle || i.billing_cycle === 'permanent' || seen.has(i.billing_cycle)) continue;
    seen.add(i.billing_cycle);
    periods.push({ label: label[i.billing_cycle] || i.billing_cycle, discount: discountLabel(i), cycle: i.billing_cycle });
  }
  return periods.length ? periods : undefined;
}

function priceLabel(n: number) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
}

function displayPrice(plan: PlanCard) {
  if (plan.id === 'free' || plan.price === null) return plan.price ?? 0;
  const item = selectedItem(plan.id);
  if (!item) return plan.price;
  const cycle = item.billing_cycle;
  if (cycle === 'monthly') return priceLabel(item.price);
  // 卡片主价格展示「折合月价」：季/年 ÷ 月数，对标页展示档位标价；这里跟对标一致直接展示套餐价的「/月」基准
  // 对标页卡片价格固定为月价（79/199/499），切换周期只改按钮金额
  const monthly = itemsForTier(plan.id, scopeOf(plan.id)).find(i => i.billing_cycle === 'monthly');
  return priceLabel(monthly?.price ?? item.price);
}

function creditPriceOf(item: PlanItem) {
  return item.credit_price != null ? item.credit_price : Math.round(item.price * 10);
}

const plans = computed<PlanCard[]>(() => {
  const g = grouped.value;
  if (!g) {
    // 无数据时仍展示定制版壳，避免空页
    return [{
      id: 'custom', name: '定制版', icon: '★', price: null, priceText: '按需定价',
      subtitle: '根据企业需求量身定制', features: [], customFeatures: CUSTOM_FEATURES,
      primaryBtn: { text: '联系客服', type: 'green' },
    }];
  }
  const groups = g as unknown as Record<string, PlanItem[]>;
  return TIER_ORDER.map(t => {
    if (t.type === 'custom') {
      return {
        id: 'custom', name: t.name, icon: t.icon, price: null, priceText: '按需定价',
        subtitle: t.subtitle, features: [], customFeatures: CUSTOM_FEATURES,
        primaryBtn: { text: '联系客服', type: 'green' as const },
      } as PlanCard;
    }
    const all = groups[t.type];
    if (!all?.length && t.type !== 'free') return null;
    const item = selectedItem(t.type) || all?.[0];
    if (!item && t.type !== 'free') return null;
    const monthly = itemsForTier(t.type, scopeOf(t.type)).find(i => i.billing_cycle === 'monthly') || item;
    const price = monthly?.price ?? item?.price ?? 0;
    const qLimit = item?.query_limit || monthly?.query_limit || 0;
    const current = sub.value?.vip_level === t.type;
    const payAmt = item?.price ?? price;
    const creditAmt = item ? creditPriceOf(item) : Math.round(price * 10);
    return {
      id: t.type, name: t.name, icon: (t as any).icon, price, unit: t.type === 'free' ? '' : '/月',
      subtitle: (t as any).subtitle, current, highlighted: (t as any).highlighted, banner: (t as any).banner,
      hasAISection: t.type !== 'free',
      queryLimit: qLimit,
      features: featuresFor(t.type, qLimit),
      billingPeriods: t.type === 'free' ? undefined : billingPeriodsFor(t.type),
      primaryBtn: t.type === 'free'
        ? { text: '免费版', type: 'disabled' as const }
        : { text: current ? `支付 ¥${priceLabel(payAmt)} 续费` : `直接支付 ¥${priceLabel(payAmt)}`, type: 'primary' as const },
      secondaryBtn: t.type === 'free' ? undefined : { text: `积分支付 ✦ ${fmtNum(creditAmt)}` },
    } as PlanCard;
  }).filter((x): x is PlanCard => !!x);
});

const payRemainText = computed(() => {
  const m = Math.floor(payRemain.value / 60);
  const s = payRemain.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});
const payBadge = computed(() => (payKind.value === 'recharge' ? '积分充值' : (sub.value?.vip_level && payOrder.value?.plan_type === sub.value.vip_level ? '续费订阅' : '开通订阅')));
const payTitle = computed(() => {
  if (payKind.value === 'recharge') return `充值 ${fmtNum(payOrder.value?.credits || 0)} 积分`;
  return `解锁${payOrder.value?.plan_name || '套餐'}权益`;
});
const paySubtitle = computed(() => (
  payKind.value === 'recharge'
    ? '积分可用于开通套餐、单次诊断与按次监测'
    : '解锁更多核心业务词与竞品词查询'
));
const payDurationLabel = computed(() => {
  const d = payOrder.value?.duration_days || 0;
  if (payKind.value === 'recharge') return '一次';
  if (d >= 360) return '12个月';
  if (d >= 80) return '3个月';
  return '1个月';
});
const payBenefits = computed(() => {
  if (payKind.value === 'recharge') {
    return [
      { ic: 'layers', t: `${fmtNum(payOrder.value?.credits || 0)} 积分到账`, d: '充值后立即到账，2 年有效' },
      { ic: 'bot', t: '全站通用', d: '套餐开通 / 诊断 / 发稿均可抵扣' },
      { ic: 'crown', t: '安全可靠', d: '不支持退款、不可转赠、不可提现' },
    ];
  }
  const q = payOrder.value?.query_limit || 8;
  return [
    { ic: 'layers', t: `${q} 个监控问题`, d: '覆盖更多核心业务词与竞品词' },
    { ic: 'bot', t: '5 大主流模型覆盖', d: '包含 豆包, DeepSeek, 文心, 通义千问，元宝等' },
    { ic: 'crown', t: '专属客户经理', d: '1对1 策略咨询服务' },
  ];
});

async function refreshCredit() {
  const acc = await creditApi.account().catch(() => null);
  if (!acc) return;
  credit.value = acc.available ?? acc.balance ?? 0;
  creditFrozen.value = acc.frozen ?? 0;
  creditMeta.total_recharge = acc.total_recharge ?? 0;
  creditMeta.total_consume = acc.total_consume ?? 0;
  creditMeta.total_expired = acc.total_expired ?? 0;
}

async function refreshSub() {
  sub.value = await paymentApi.subscription().catch(() => null) as Subscription | null;
}

async function loadTxns() {
  const res = await creditApi.transactions(1, 20, txnTab.value).catch(() => null);
  txns.value = res?.list || [];
}

async function openCreditDetail() {
  creditDetailOpen.value = true;
  txnTab.value = 'all';
  await Promise.all([ refreshCredit(), loadTxns() ]);
}

async function switchTxnTab(tab: 'all' | 'consume' | 'obtain') {
  txnTab.value = tab;
  await loadTxns();
}

async function openRecharge() {
  rechargeOpen.value = true;
  packs.value = (await creditApi.packs().catch(() => [])) || [];
}

function openRechargeFromDetail() {
  creditDetailOpen.value = false;
  openRecharge();
}

function startPayTimer(expireIso?: string) {
  stopPayTimer();
  if (expireIso) {
    const left = Math.max(0, Math.floor((new Date(expireIso).getTime() - Date.now()) / 1000));
    payRemain.value = left || 15 * 60;
  } else {
    payRemain.value = 15 * 60;
  }
  payTimer = setInterval(() => {
    if (payRemain.value <= 0) { stopPayTimer(); return; }
    payRemain.value -= 1;
  }, 1000);
}
function stopPayTimer() {
  if (payTimer) { clearInterval(payTimer); payTimer = null; }
}
function closePay() {
  payOpen.value = false;
  payOrder.value = null;
  stopPayTimer();
}

async function openWxPay(order: PayOrderCreated, kind: 'plan' | 'recharge') {
  payKind.value = kind;
  payOrder.value = order;
  payOpen.value = true;
  startPayTimer(order.expire_time);
}

async function onPrimary(plan: PlanCard) {
  if (plan.id === 'custom') {
    Message.info('请联系客服定制方案');
    return;
  }
  if (plan.id === 'free') return;
  const item = selectedItem(plan.id);
  if (!item) { Message.error('套餐不可用'); return; }
  paying.value = true;
  try {
    const order = await paymentApi.createOrder({
      brand_id: auth.activeBrandId || undefined,
      plan_code: item.plan_code,
      pay_method: 'wx',
      order_type: plan.current ? 'upgrade' : 'new',
    });
    await openWxPay(order, 'plan');
  } catch (e: any) {
    Message.error(e?.message || '下单失败');
  } finally {
    paying.value = false;
  }
}

async function onCreditPay(plan: PlanCard) {
  if (plan.id === 'custom' || plan.id === 'free') return;
  const item = selectedItem(plan.id);
  if (!item) { Message.error('套餐不可用'); return; }
  const need = creditPriceOf(item);
  if (credit.value < need) {
    Message.warning(`积分不足，还需 ${fmtNum(need - credit.value)} 积分`);
    openRecharge();
    return;
  }
  paying.value = true;
  try {
    await paymentApi.createOrder({
      brand_id: auth.activeBrandId || undefined,
      plan_code: item.plan_code,
      pay_method: 'credit',
      order_type: plan.current ? 'upgrade' : 'new',
    });
    Message.success('积分支付成功，套餐已生效');
    await Promise.all([ refreshCredit(), refreshSub() ]);
  } catch (e: any) {
    Message.error(e?.message || '积分支付失败');
    if (/不足/.test(e?.message || '')) openRecharge();
  } finally {
    paying.value = false;
  }
}

async function buyPack(p: RechargePack) {
  paying.value = true;
  try {
    const order = await creditApi.createRecharge(p.pack_id, auth.activeBrandId || undefined);
    rechargeOpen.value = false;
    await openWxPay(order, 'recharge');
  } catch (e: any) {
    Message.error(e?.message || '创建充值订单失败');
  } finally {
    paying.value = false;
  }
}

async function confirmMockPay() {
  if (!payOrder.value?.order_no) return;
  paying.value = true;
  try {
    await paymentApi.mockPay(payOrder.value.order_no);
    Message.success(payKind.value === 'recharge' ? '充值成功' : '支付成功，套餐已生效');
    closePay();
    await Promise.all([ refreshCredit(), refreshSub() ]);
    if (creditDetailOpen.value) await loadTxns();
  } catch (e: any) {
    Message.error(e?.message || '支付失败');
  } finally {
    paying.value = false;
  }
}

onMounted(async () => {
  try {
    const [ creditRes, subRes, planRes ] = await Promise.all([
      userApi.creditAccount().catch(() => null),
      paymentApi.subscription().catch(() => null),
      paymentApi.plansGrouped().catch(() => null),
    ]);
    const acc = creditRes as CreditAccount | null;
    credit.value = acc?.available ?? acc?.balance ?? 0;
    creditFrozen.value = acc?.frozen ?? 0;
    creditMeta.total_recharge = acc?.total_recharge ?? 0;
    creditMeta.total_consume = acc?.total_consume ?? 0;
    creditMeta.total_expired = acc?.total_expired ?? 0;
    sub.value = subRes as Subscription | null;
    grouped.value = planRes as PlansGrouped | null;
    for (const t of [ 'starter', 'basic', 'pro' ]) {
      scopeSel[t] = 'pc';
      cycleSel[t] = 'monthly';
    }
  } catch { /* 降级空态 */ }
});

onUnmounted(() => stopPayTimer());
</script>

<style lang="scss" scoped>
.pricing-page {
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #111827;
}

.pp-header-left { display: block; }

/* 对标：flex items-stretch gap-2，两钮横排同高 */
.pp-header-right {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 8px;
  flex-shrink: 0;
}

.pp-credit-btn {
  background: linear-gradient(to bottom right, #4f46e5, #6d28d9);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.25;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.15s ease;
  &:hover { box-shadow: 0 4px 10px rgba(79, 70, 229, 0.28); }
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
  line-height: 1.25;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s ease;
  &:hover { background: #1f2937; }
}

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

.pp-current-left { flex-shrink: 0; min-width: 260px; }

.pp-current-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  line-height: 16px;
  margin-bottom: 8px;
  .pp-ic-layers { color: #9ca3af; flex-shrink: 0; }
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

.pp-quota-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  .pp-ic-layers { color: #9ca3af; flex-shrink: 0; }
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
  b {
    font-weight: 700;
    color: #374151;
  }
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
  &.indigo { background: #6366f1; }
}

.pp-quota-seg {
  display: flex;
  gap: 2px;
  overflow: visible;
  background: #f3f4f6;
}

.pp-seg {
  flex: 1;
  height: 6px;
  border-radius: 9999px;
  background: transparent;
  &.on { background: #3b82f6; }
}

.pp-section-title { margin-top: 8px; }

.pp-st-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  line-height: 28px;
  .pp-ic-zap-amber { color: #f59e0b; flex-shrink: 0; }
}

.pp-st-sub {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
  line-height: 16px;
  text-align: center;
  margin-top: 6px;
}

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
  svg { flex-shrink: 0; }
}

.pp-plan-name-wrap { margin-bottom: 12px; }

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

.pp-plan-price-block { margin-bottom: 14px; }

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

.pp-ai-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #9a9aa6;
  letter-spacing: 0.44px;
  margin-bottom: 7px;
  svg { flex-shrink: 0; }
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
  border: none;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
  transition: all 0.15s;
  &.active {
    background: #6452ff;
    color: #fff;
    box-shadow: 0 2px 7px rgba(100, 82, 255, 0.4);
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
  svg { flex-shrink: 0; color: #6452ff; }
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
  &:hover { color: #6452ff; }
}

.pp-features {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 18px;
  &.pp-features-mt { margin-top: 12px; }
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
  .pp-feat-zap { flex-shrink: 0; color: #9a9aa6; }
  &.highlighted {
    font-weight: 700;
    color: #6452ff;
    .pp-feat-zap { color: #6452ff; }
  }
  &.excluded {
    color: #9a9aa6;
    .pp-feat-x { font-size: 11px; line-height: 1; flex-shrink: 0; color: #9a9aa6; }
  }
  &.custom-feat {
    color: #065f46;
    .pp-feat-check { flex-shrink: 0; color: #10b981; }
    &.custom-last { font-weight: 700; color: #047857; }
  }
}

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
  border: none;
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
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.pp-btn-primary { background: #6452ff; color: #fff; }
.pp-btn-secondary { background: #efecff; color: #4a38e0; }
.pp-btn-green { background: #10b981; color: #fff; }
.pp-btn-disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  &:hover { opacity: 1; }
}

/* ===== overlays / modals ===== */
.pp-overlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(4px);
  padding: 16px;
}

.pp-modal {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  position: relative;
  max-height: 88vh;
}

.pp-x {
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  padding: 6px;
  border-radius: 9999px;
  display: inline-flex;
  &:hover { background: #f3f4f6; color: #4b5563; }
  &.abs { position: absolute; right: 20px; top: 20px; z-index: 2; }
}

.pp-modal-credit {
  width: 100%;
  max-width: 36rem;
  display: flex;
  flex-direction: column;
}

.pp-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  h3 { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
}

.pp-modal-hd-acts { display: flex; align-items: center; gap: 8px; }

.pp-buy-mini {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #4f46e5;
  color: #fff;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: #4338ca; }
}

.pp-credit-summary {
  padding: 20px 24px;
  background: linear-gradient(to bottom right, #eef2ff, #f5f3ff);
  border-bottom: 1px solid #f3f4f6;
}

.pp-cs-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.pp-cs-bal {
  font-size: 30px;
  font-weight: 900;
  color: #111827;
  display: flex;
  align-items: baseline;
  gap: 4px;
  .pp-cs-star { color: #6366f1; font-size: 20px; }
}
.pp-cs-row {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  font-size: 11px;
  color: #6b7280;
  b { color: #374151; font-weight: 700; }
  .amber { color: #d97706; }
  .emerald { color: #059669; }
}

.pp-credit-tabs {
  display: flex;
  gap: 4px;
  padding: 16px 24px 0;
  button {
    padding: 6px 14px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    &.on { background: #4f46e5; color: #fff; }
    &:hover:not(.on) { background: #f3f4f6; }
  }
}

.pp-credit-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 24px;
  max-height: 360px;
}

.pp-credit-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 32px 0;
}

.pp-txn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f9fafb;
}

.pp-txn-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280px;
}
.pp-txn-time { font-size: 11px; color: #9ca3af; margin-top: 2px; }
.pp-txn-r { text-align: right; flex-shrink: 0; padding-left: 12px; }
.pp-txn-amt {
  font-size: 16px;
  font-weight: 700;
  &.neg { color: #ef4444; }
  &.pos { color: #059669; }
}
.pp-txn-badge {
  display: inline-block;
  margin-top: 2px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: #fffbeb;
  color: #d97706;
}

.pp-credit-foot {
  padding: 12px 24px 16px;
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.5;
}

.pp-modal-recharge {
  width: 100%;
  max-width: 48rem;
  padding: 28px;
  border-radius: 24px;
  overflow: hidden;
}

.pp-recharge-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #6366f1;
  h3 { margin: 0; font-size: 20px; font-weight: 800; color: #111827; }
}

.pp-pack-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.pp-pack {
  text-align: left;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: #818cf8;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.08);
  }
}

.pp-pack-cr {
  font-size: 24px;
  font-weight: 900;
  color: #111827;
  display: flex;
  align-items: baseline;
  gap: 2px;
  span { color: #6366f1; font-size: 16px; }
}
.pp-pack-price {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  span { font-size: 14px; color: #9ca3af; }
}
.pp-pack-unit { font-size: 11px; color: #9ca3af; margin-top: 2px; }

.pp-recharge-note {
  margin: 16px 0 0;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
}

.pp-modal-pay {
  width: 100%;
  max-width: 56rem;
  min-height: 500px;
  display: flex;
  overflow: hidden;
  border-radius: 24px;
}

.pp-pay-left {
  width: 42%;
  background: linear-gradient(to bottom right, #2563eb, #4338ca);
  color: #fff;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.pp-pay-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 16px;
  width: fit-content;
}

.pp-pay-left h3 {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
}

.pp-pay-sub {
  margin: 0 0 24px;
  font-size: 14px;
  color: #e0e7ff;
  opacity: 0.9;
  line-height: 1.5;
}

.pp-pay-benefits { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }

.pp-pay-ben { display: flex; gap: 12px; align-items: flex-start; }
.pp-pay-ben-ic {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.pp-pay-ben-t { font-size: 14px; font-weight: 700; }
.pp-pay-ben-d { font-size: 12px; color: rgba(224, 231, 255, 0.7); margin-top: 2px; }

.pp-pay-total { margin-top: auto; }
.pp-pay-total-l {
  font-size: 12px;
  color: #c7d2fe;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.pp-pay-total-v {
  display: flex;
  align-items: baseline;
  gap: 4px;
  .yen { font-size: 24px; color: #c7d2fe; font-weight: 500; }
  .num { font-size: 48px; font-weight: 900; letter-spacing: -0.03em; }
  .unit { font-size: 14px; color: #c7d2fe; margin-left: 4px; }
}

.pp-pay-right {
  width: 58%;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  h4 { margin: 0; font-size: 20px; font-weight: 800; color: #111827; }
}

.pp-pay-hint {
  margin: 8px 0 20px;
  font-size: 13px;
  color: #9ca3af;
}

.pp-qr-wrap {
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
  margin-bottom: 12px;
}

.pp-qr-mock {
  width: 180px;
  height: 180px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 12px;
}

.pp-qr-grid {
  width: 96px;
  height: 96px;
  background:
    linear-gradient(#111 1px, transparent 1px) 0 0 / 12px 12px,
    linear-gradient(90deg, #111 1px, transparent 1px) 0 0 / 12px 12px;
  opacity: 0.15;
}

.pp-pay-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
}

.pp-pay-method {
  width: 100%;
  max-width: 280px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f3f4f6;
  border-radius: 10px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.pp-wx {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #111827;
  font-weight: 600;
  i {
    width: 16px; height: 16px; border-radius: 4px;
    background: #07c160;
    display: inline-block;
  }
}

.pp-mock-pay {
  width: 100%;
  max-width: 280px;
  border: none;
  border-radius: 10px;
  padding: 10px;
  background: #6452ff;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 14px;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.pp-pay-legal {
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
  line-height: 1.5;
  max-width: 320px;
  margin: 0 0 8px;
}

.pp-pay-help {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

@media (max-width: 1280px) {
  .pp-plans-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .pp-plans-grid { grid-template-columns: 1fr 1fr; }
  .pp-current-card { flex-direction: column; align-items: stretch; }
  .pp-modal-pay { flex-direction: column; }
  .pp-pay-left, .pp-pay-right { width: 100%; }
  .pp-pack-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
