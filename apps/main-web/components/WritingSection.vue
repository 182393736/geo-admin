<script setup lang="ts">
const features = [
  { title: '锁定选题',   desc: '读取你的排名波动与引用缺口，自动确定这一篇该写什么、为谁补位。', icon: '🕐' },
  { title: '循证依据',   desc: '锁定高权重引用源作为事实底座，不引用原文未提及的外部源，杜绝编造。', icon: '🔗' },
  { title: '护栏自检',   desc: '禁用词扫描、事实核验、结构检查逐项通过，交付可直接进入发稿的成品。', icon: '✅' },
];
const chips = ['生成循证稿件', '补位下滑问题', '重写旧内容'];
</script>

<template>
  <section class="writing section">
    <div class="container">
      <div class="eyebrow" style="text-align:center;">循证写作</div>
      <h2 class="section-title" style="font-size:40px;">循证写作 <em>Agent</em>，<br />撰写 AI 愿意引用的稿件</h2>
      <p class="section-sub" style="max-width:720px;margin:20px auto 48px;">不是一个"帮你润色"的对话框，而是一个读得懂你监测数据的写作 Agent：自己锁定选题、自己找循证依据、自己过安全护栏，交付一篇可直接发稿的成品。</p>

      <div class="writing-panel">
        <!-- 左：聊天面板 -->
        <div class="chat-panel">
          <div class="chat-title">需要我写点什么？</div>
          <div class="chat-sub">把监测数据交给我，我来一步步把稿子写出来</div>
          <div class="chat-input">
            <span class="chat-placeholder">根据"geo 监控工具"的排名波动，写一篇能抢回推荐位的循证稿件</span>
            <span class="chat-send">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </span>
          </div>
          <div class="chat-chips">
            <button v-for="c in chips" :key="c" class="chat-chip" type="button">{{ c }}</button>
          </div>
        </div>

        <!-- 右：特性卡片 -->
        <div class="feat-cards">
          <div v-for="f in features" :key="f.title" class="feat">
            <div class="feat-icon">{{ f.icon }}</div>
            <div class="feat-text">
              <div class="feat-title">{{ f.title }}</div>
              <div class="feat-desc">{{ f.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.writing { background: #fff; padding-top: 88px; }
.section-title {
  em { font-style: normal; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
}
.writing-panel {
  margin-top: 8px;
  background: linear-gradient(135deg, #2e1a5b 0%, #1e1535 100%);
  border-radius: 24px; padding: 56px 48px;
  display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center;
}
.chat-panel { background: #fff; border-radius: 16px; padding: 30px 28px; }
.chat-title { font-size: 19px; font-weight: 800; color: var(--ink); margin-bottom: 6px; }
.chat-sub { font-size: 13px; color: #6b7280; margin-bottom: 22px; }
.chat-input {
  display: flex; align-items: center; gap: 12px;
  border: 1px solid #e5e5ea; border-radius: 12px; padding: 12px 14px;
  margin-bottom: 14px; cursor: text;
}
.chat-placeholder { flex: 1; font-size: 13.5px; color: #4b5563; line-height: 1.5; }
.chat-send {
  width: 32px; height: 32px; border-radius: 999px; background: #0a0a0a; color: #fff;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.chat-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chat-chip {
  padding: 7px 14px; border-radius: 999px; font-size: 12.5px; color: #4b5563;
  background: #fff; border: 1px solid #e5e5ea; cursor: pointer;
  transition: all .15s ease;
  &:hover { border-color: #c7c7d1; }
}
.feat-cards { display: flex; flex-direction: column; gap: 16px; }
.feat {
  background: #fff; border-radius: 14px; padding: 20px 22px;
  display: flex; gap: 14px; align-items: flex-start;
}
.feat-icon { font-size: 20px; flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #f4f4f6; border-radius: 10px; }
.feat-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.feat-desc { font-size: 13px; color: #6b7280; line-height: 1.7; }
</style>
