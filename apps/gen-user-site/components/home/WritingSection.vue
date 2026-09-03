<template>
  <!-- 循证写作 Agent -->
  <section class="v2-sec" style="padding:76px 0">
    <div class="v2-wrap">
      <div class="wa-head rv">
        <span class="step-eyebrow">循证写作</span>
        <h2>循证写作 Agent，<br>撰写 AI 愿意引用的稿件</h2>
        <p>不是一个"帮你润色"的对话框，而是一个读得懂你监测数据的写作 Agent：自己锁定选题、自己找循证依据、自己过安全护栏，交付一篇可直接发稿的成品。</p>
      </div>
      <!-- 展台背景可整体替换为品牌 KV：background:url(...) center/cover -->
      <div class="wa-stage rv">
        <div class="wa-card">
          <h3>需要我写点什么？</h3>
          <p>把监测数据交给我，我来一步步把稿子写出来</p>
          <div class="wa-input">
            <span class="wa-typing">根据"geo 监控工具"的排名波动，写一篇能抢回推荐位的循证稿件</span>
            <button class="wa-send" aria-label="发送">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
            </button>
          </div>
          <div class="wa-chips">
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>生成循证稿件</span>
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>补位下滑问题</span>
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"></path><path d="M21 3v6h-6"></path></svg>重写旧内容</span>
          </div>
        </div>
        <div class="wa-stack">
          <div class="wa-act">
            <div><h4>锁定选题</h4><p>读取你的排名波动与引用缺口，自动确定这一篇该写什么、为谁补位。</p></div>
            <span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg></span>
          </div>
          <div class="wa-act">
            <div><h4>循证依据</h4><p>锁定高权重引用源作为事实底座，不引用原文未提及的外部源，杜绝编造。</p></div>
            <span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></span>
          </div>
          <div class="wa-act">
            <div><h4>护栏自检</h4><p>禁用词扫描、事实核验、结构检查逐项通过，交付可直接进入发稿的成品。</p></div>
            <span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
