<template>
  <section class="v2-sec" style="padding-top:44px">
    <div class="v2-wrap">
      <div class="plan-picker-grid bill-plans">

          <!-- 免费版 ¥0(当前套餐)-->
          <div class="plan-card plan-card-free" data-plan="free">
            <div class="plan-card-head">
              <div class="plan-card-name">免费版</div>
            </div>
            <div class="plan-card-price-area">
              <div class="plan-card-price"><span class="plan-card-currency">¥</span><span class="plan-card-amount">0</span></div>
            </div>
            <div class="plan-card-features">
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>真实账号抓取</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>监控问题数量 3 个</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>3 个网页端 AI 引擎</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>品牌排名分析</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>品牌舆情分析</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>搜索快照下载</div>
              <div class="plan-card-feature no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M18 6 6 18M6 6l12 12"></path></svg>引用源情报洞察</div>
              <div class="plan-card-feature no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M18 6 6 18M6 6l12 12"></path></svg>数据导出报告</div>
              <div class="plan-card-feature no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M18 6 6 18M6 6l12 12"></path></svg>稿件中心撰稿</div>
              <div class="plan-card-feature no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M18 6 6 18M6 6l12 12"></path></svg>稿件中心发稿</div>
            </div>
          </div>

          <!-- 入门版 ¥79 -->
          <div class="plan-card plan-card-starter" data-plan="starter" data-cycle="1">
            <div class="plan-card-head">
              <div class="plan-card-name">入门版</div>
            </div>
            <div class="plan-card-price-area">
              <div class="plan-card-price"><span class="plan-card-currency">¥</span><span class="plan-card-amount">79</span><span class="plan-card-unit">/月</span></div>
            </div>
                      <div class="plan-scope-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>AI 引擎监控能力</div>
            <div class="plan-scope-block">
            <div class="plan-scope-row">
              <button class="plan-scope-btn active">网页端</button>
              <button class="plan-scope-btn">APP 端</button>
              <button class="plan-scope-btn">双端</button>
            </div>
            <div class="plan-scope-readout" data-scopehint=""><svg class="psr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg><span class="psr-body"><span class="psr-title">5 大主流 AI<span class="psr-info" tabindex="0"><svg class="psr-info-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="11" x2="12" y2="16"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg><span class="psr-pop"><span class="psr-pop-list" style="opacity: 1 !important; visibility: visible !important; transform: none !important;">豆包 · DeepSeek · 文心一言 · 通义千问 · 元宝</span><span class="psr-pop-note" style="opacity: 1 !important; visibility: visible !important; transform: none !important;">以上为当前支持的 AI 模型,覆盖范围可能随各平台情况动态调整,以实际服务为准。</span></span></span></span></span></div>
            </div>

            <div class="plan-card-features">
              <div class="plan-card-feature highlight"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>真实账号抓取</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>监控问题数量 8 个</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>监测频率 1 天 1 次</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>品牌排名分析</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>品牌舆情分析</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>搜索快照下载</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>引用源情报洞察</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>数据导出报告</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>稿件中心撰稿(消耗积分)</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>稿件中心发稿(消耗积分)</div>
            </div>
            <div class="plan-cycle-label">计费周期</div>
            <div class="plan-card-cycle">
              <button class="plan-cycle-btn active">1 个月</button>
              <button class="plan-cycle-btn">3 个月<span class="plan-cycle-discount">8 折</span></button>
              <button class="plan-cycle-btn">12 个月<span class="plan-cycle-discount">7 折</span></button>
            </div>
          </div>

          <!-- 基础版 -->
          <div class="plan-card plan-card-basic" data-plan="basic" data-cycle="1">
            <div class="plan-card-head">
              <div class="plan-card-name">基础版</div>
            </div>
            <div class="plan-card-price-area">
              <div class="plan-card-price"><span class="plan-card-currency">¥</span><span class="plan-card-amount">199</span><span class="plan-card-unit">/月</span></div>
            </div>
                      <div class="plan-scope-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>AI 引擎监控能力</div>
            <div class="plan-scope-block">
            <div class="plan-scope-row">
              <button class="plan-scope-btn active">网页端</button>
              <button class="plan-scope-btn">APP 端</button>
              <button class="plan-scope-btn">双端</button>
            </div>
            <div class="plan-scope-readout" data-scopehint=""><svg class="psr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg><span class="psr-body"><span class="psr-title">5 大主流 AI<span class="psr-info" tabindex="0"><svg class="psr-info-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="11" x2="12" y2="16"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg><span class="psr-pop"><span class="psr-pop-list" style="opacity: 1 !important; visibility: visible !important; transform: none !important;">豆包 · DeepSeek · 文心一言 · 通义千问 · 元宝</span><span class="psr-pop-note" style="opacity: 1 !important; visibility: visible !important; transform: none !important;">以上为当前支持的 AI 模型,覆盖范围可能随各平台情况动态调整,以实际服务为准。</span></span></span></span></span></div>
            </div>

            <div class="plan-card-features">
              <div class="plan-card-feature highlight"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>真实账号抓取</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>监控问题数量 30 个</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>监测频率 1 天 1 次</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>品牌排名分析</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>品牌舆情分析</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>搜索快照下载</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>引用源情报洞察</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>数据导出报告</div>
                <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>专属客户经理</div>
                <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>稿件中心撰稿(消耗积分)</div>
                <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>稿件中心发稿(消耗积分)</div>
            </div>
            <div class="plan-cycle-label">计费周期</div>
            <div class="plan-card-cycle">
              <button class="plan-cycle-btn active">1 个月</button>
              <button class="plan-cycle-btn">3 个月<span class="plan-cycle-discount">8 折</span></button>
              <button class="plan-cycle-btn">12 个月<span class="plan-cycle-discount">7 折</span></button>
            </div>
          </div>

          <!-- 专业版 -->
          <div class="plan-card plan-card-pro" data-plan="pro" data-cycle="1">
            <div class="plan-card-pro-banner"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"></path></svg>最受欢迎 · 性价比之选</div>
            <div class="plan-card-head">
              <div class="plan-card-name">专业版<span style="margin-left:4px;">👑</span></div>
            </div>
            <div class="plan-card-price-area">
              <div class="plan-card-price"><span class="plan-card-currency">¥</span><span class="plan-card-amount">499</span><span class="plan-card-unit">/月</span></div>
            </div>
                      <div class="plan-scope-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>AI 引擎监控能力</div>
            <div class="plan-scope-block">
            <div class="plan-scope-row">
              <button class="plan-scope-btn active">网页端</button>
              <button class="plan-scope-btn">APP 端</button>
              <button class="plan-scope-btn">双端</button>
            </div>
            <div class="plan-scope-readout" data-scopehint=""><svg class="psr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg><span class="psr-body"><span class="psr-title">5 大主流 AI<span class="psr-info" tabindex="0"><svg class="psr-info-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="11" x2="12" y2="16"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg><span class="psr-pop"><span class="psr-pop-list" style="opacity: 1 !important; visibility: visible !important; transform: none !important;">豆包 · DeepSeek · 文心一言 · 通义千问 · 元宝</span><span class="psr-pop-note" style="opacity: 1 !important; visibility: visible !important; transform: none !important;">以上为当前支持的 AI 模型,覆盖范围可能随各平台情况动态调整,以实际服务为准。</span></span></span></span></span></div>
            </div>

            <div class="plan-card-features">
              <div class="plan-card-feature highlight"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>真实账号抓取</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>监控问题数量 100 个</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>监测频率 1 天 1 次</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>品牌排名分析</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>品牌舆情分析</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>搜索快照下载</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>引用源情报洞察</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>数据导出报告</div>
                <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>专属客户经理</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>7×24 小时技术支持</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>稿件中心撰稿(消耗积分)</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>稿件中心发稿(消耗积分)</div>
            </div>
            <div class="plan-cycle-label">计费周期</div>
            <div class="plan-card-cycle">
              <button class="plan-cycle-btn active">1 个月</button>
              <button class="plan-cycle-btn">3 个月<span class="plan-cycle-discount">8 折</span></button>
              <button class="plan-cycle-btn">12 个月<span class="plan-cycle-discount">7 折</span></button>
            </div>
          </div>

          <!-- 定制版 -->
          <div class="plan-card plan-card-custom" data-plan="custom">
            <div class="plan-card-head">
              <div class="plan-card-name">定制版<span style="margin-left:4px;color:#10b981;">★</span></div>
            </div>
            <div class="plan-card-price-area">
              <div class="plan-card-price-custom">按需定价</div>
              <div class="plan-card-billing">根据企业需求量身定制</div>
            </div>
            <div class="plan-card-features" style="margin-top:12px;">
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>更多监控问题查询</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>批量品牌诊断</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>AI 模型定制</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>产品 OEM 定制</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>API 接口输出</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>功能定制</div>
              <div class="plan-card-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M20 6 9 17l-5-5"></path></svg>监控代运营服务</div>
              <div class="plan-card-feature custom-more"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="color:#10b981;"><path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 22v-4M19.07 19.07l-2.83-2.83M22 12h-4M19.07 4.93l-2.83 2.83"></path></svg>等等……</div>
            </div>
          </div>
        </div>

    </div>
  </section>
</template>
