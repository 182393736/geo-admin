<script setup lang="ts">
const channels = [
  { name: '中华网',   tag: '官方网媒' },
  { name: '澎湃新闻', tag: '官方网媒' },
  { name: '腾讯网',   tag: '综合门户' },
  { name: '搜狐网',   tag: '综合门户' },
  { name: '网易新闻', tag: '综合门户' },
  { name: '凤凰网',   tag: '综合门户' },
  { name: '新浪网',   tag: '综合门户' },
  { name: '今日头条', tag: '内容平台' },
  { name: '环球日报', tag: '权威媒体' },
  { name: '知乎',     tag: 'UGC 社区' },
  { name: '36氪',     tag: '行业媒体' },
  { name: '虎嗅网',   tag: '行业媒体' },
  { name: '光明网',   tag: '中央重点新闻网站' },
  { name: '极客公园', tag: '行业媒体' },
  { name: '雷锋网',   tag: '行业媒体' },
  { name: 'IT之家',   tag: '行业媒体' },
  { name: '人民网',   tag: '中央重点新闻网站' },
  { name: '中国青年报', tag: '中央新闻媒体' },
];
</script>

<template>
  <section class="channels section--tight">
    <div class="container">
      <div class="eyebrow" style="text-align:center;margin-bottom:16px;">精准发稿</div>
      <h2 class="section-title" style="font-size:42px;">11万+渠道，筛出<br />高引用率平台一键发布</h2>
      <p class="section-sub">每家渠道都带被 AI 引用数据。按各引擎的取材偏好挑平台，一键分发、逐单回传收录链接。</p>

      <div class="channel-grid">
        <div v-for="c in channels" :key="c.name" class="channel">
          <div class="ch-logo">{{ c.name.slice(0, 2) }}</div>
          <div class="ch-info">
            <div class="ch-name">{{ c.name }}</div>
            <div class="ch-tag">{{ c.tag }}</div>
          </div>
        </div>
      </div>
      <p class="more-hint">部分支持渠道展示 · 完整名单以产品内媒体库为准</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.channels { background: #fff; padding-bottom: 96px; }
.channel-grid {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px;
  max-width: 1180px; margin: 0 auto;
}
.channel {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: 12px;
  border: 1px solid #ececf1; background: #fff;
  transition: all .15s ease;
  &:hover { border-color: #c7c7d4; transform: translateY(-2px); }
}
.ch-logo {
  width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #fef3f3, #fef0f0); color: #b91c1c;
  font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;
}
.ch-name { font-size: 13.5px; font-weight: 700; color: var(--ink); }
.ch-tag { font-size: 11px; color: #9ca3af; margin-top: 1px; }
.more-hint { text-align: center; font-size: 12.5px; color: #9ca3af; margin-top: 36px; }
</style>
