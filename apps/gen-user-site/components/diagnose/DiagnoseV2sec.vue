<template>
  <section class="v2-sec" style="padding-top:0">
    <div class="v2-wrap">
      <div class="diag-steps rv in">
        <div class="diag-step"><span class="diag-step-no">1</span><div><div class="diag-step-t">配置诊断范围</div><div class="diag-step-d">选定诊断监控问题数量与要覆盖的大模型平台</div></div></div>
        <div class="diag-step"><span class="diag-step-no">2</span><div><div class="diag-step-t">按量付费</div><div class="diag-step-d">按监控问题 × 平台消耗积分（网页端 2 / APP 端 4，豆包 APP 8），100 积分起，确认后进入诊断队列</div></div></div>
        <div class="diag-step"><span class="diag-step-no">3</span><div><div class="diag-step-t">生成报告</div><div class="diag-step-d">预计 3 小时内交付完整可下载报告（高峰期可能排队）</div></div></div>
      </div>

      <div class="diag-includes rv in">
        <div class="diag-inc-title">每份诊断报告包含</div>
        <div class="diag-inc-grid">
          <div class="diag-inc-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><div><div class="diag-inc-t">品牌可见性</div><div class="diag-inc-d">在各模型回答中的出现率与占位</div></div></div>
          <div class="diag-inc-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg><div><div class="diag-inc-t">排名快照</div><div class="diag-inc-d">各监控问题下品牌的排序位置</div></div></div>
          <div class="diag-inc-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><div><div class="diag-inc-t">引用源分析</div><div class="diag-inc-d">模型引用了哪些内容与站点</div></div></div>
          <div class="diag-inc-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path></svg><div><div class="diag-inc-t">竞品对比</div><div class="diag-inc-d">与主要竞品的可见性 / 排名差距</div></div></div>
        </div>
      </div>

      <div class="calc-tool rv in" id="calcSection">
        <div class="calc-tool-head">
          <h3>费用计算器</h3>
          <p>按引擎 × 终端估算积分消耗 · 网页端 2 / APP 端 4（豆包 8）积分 / 监控问题·平台 · 100 积分起 · 仅供估价</p>
        </div>
        <div class="calc-tool-body">
        <div class="oneshot-wrap">
          <div class="oneshot-config">
            <div class="oneshot-section">
              <div class="oneshot-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-4.35-4.35"></path><circle cx="11" cy="11" r="7"></circle></svg>
                诊断监控问题数量
              </div>
              <div class="oneshot-hint">本次诊断要覆盖的监控问题 / 关键词总数</div>
              <div style="display:flex; align-items:center; flex-wrap:wrap; gap:10px;">
                <div class="oneshot-stepper">
                  <button class="oneshot-step-btn">−</button>
                  <input class="oneshot-topic-input" id="calcTopics" type="number" min="1" value="100">
                  <button class="oneshot-step-btn">+</button>
                </div>
                <div class="oneshot-quick">
                  <button class="oneshot-quick-btn">30</button>
                  <button class="oneshot-quick-btn">50</button>
                  <button class="oneshot-quick-btn">100</button>
                </div>
              </div>
            </div>
            <div class="oneshot-section">
              <div class="oneshot-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                诊断平台 · 终端
                <button class="oneshot-selall" id="calcSelAll">取消全选</button>
              </div>
              <div class="oneshot-hint">勾选每个 AI 引擎要诊断的终端，逐项单独计费（仅豆包 / DeepSeek / 通义千问开放 APP 端）</div>
              <div class="calc-eng-list" id="calcPlats"><div class="calc-eng-row"><span class="calc-eng-name"><span class="oneshot-plat-dot" style="background:#F59E0B"></span>豆包</span><span class="calc-eng-ends"><button type="button" class="calc-end-chip sel" data-key="豆包|web">网页端 ✦2</button><button type="button" class="calc-end-chip sel" data-key="豆包|app">APP 端 ✦8</button></span></div><div class="calc-eng-row"><span class="calc-eng-name"><span class="oneshot-plat-dot" style="background:#6366F1"></span>DeepSeek</span><span class="calc-eng-ends"><button type="button" class="calc-end-chip sel" data-key="DeepSeek|web">网页端 ✦2</button><button type="button" class="calc-end-chip sel" data-key="DeepSeek|app">APP 端 ✦4</button></span></div><div class="calc-eng-row"><span class="calc-eng-name"><span class="oneshot-plat-dot" style="background:#E91E63"></span>文心一言</span><span class="calc-eng-ends"><button type="button" class="calc-end-chip sel" data-key="文心一言|web">网页端 ✦2</button><span class="calc-end-chip na">APP 端 · 暂无</span></span></div><div class="calc-eng-row"><span class="calc-eng-name"><span class="oneshot-plat-dot" style="background:#10B981"></span>通义千问</span><span class="calc-eng-ends"><button type="button" class="calc-end-chip sel" data-key="通义千问|web">网页端 ✦2</button><button type="button" class="calc-end-chip sel" data-key="通义千问|app">APP 端 ✦4</button></span></div><div class="calc-eng-row"><span class="calc-eng-name"><span class="oneshot-plat-dot" style="background:#EF4444"></span>元宝</span><span class="calc-eng-ends"><button type="button" class="calc-end-chip sel" data-key="元宝|web">网页端 ✦2</button><span class="calc-end-chip na">APP 端 · 暂无</span></span></div></div>
            </div>
          </div>
          <div class="oneshot-summary">
            <div class="oneshot-summary-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              费用预估
            </div>
            <div class="oneshot-sum-row"><span>诊断监控问题</span><span class="v" id="calcTopicsV">100</span></div>
            <div class="oneshot-sum-row"><span>引擎 · 终端</span><span class="v" id="calcPlatsV">网页端 5 · APP 端 3</span></div>
            <div class="oneshot-sum-row"><span>查询次数</span><span class="v" id="calcCombosV">800 次</span></div>
            <div class="oneshot-formula" id="calcFormula">100 监控问题 × (网页端 5×2 + APP 端 2×4 + APP 端 1×8) 积分</div>
            <div class="oneshot-sum-divider"></div>
            <div class="oneshot-total-label">预估消耗积分</div>
            <div class="oneshot-total"><span class="oneshot-total-cur">✦</span><span class="oneshot-total-num" id="calcTotal">2,600</span></div>
            <div class="oneshot-total-yuan" id="calcYuan">≈ ¥260 · 按基准价 ¥0.1/积分</div>
            <div class="oneshot-min-note hidden" id="calcMin">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              未达最低消耗，已按 100 积分计
            </div>
            <a class="oneshot-pay-btn" href="#" style="display:block;text-align:center;text-decoration:none">去诊断 →</a>
            <div class="oneshot-sum-foot">仅供估价，实际以诊断订单结算为准</div>
          </div>
        </div>
        </div>
      </div>

    </div>
  </section>
</template>
