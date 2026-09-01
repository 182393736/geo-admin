<script setup lang="ts">
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="f-logo">
            <span class="f-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/></svg>
            </span>
            <span class="f-logo-text">透镜GEO</span>
          </div>
          <p class="f-desc">北京时光不语科技有限公司是一家以技术为驱动的AI人工智能解决方案公司，为企业提供全域人工智能解决方案。</p>
        </div>

        <div class="footer-col">
          <div class="f-head">电话</div>
          <div class="f-line">15611186501</div>
        </div>
        <div class="footer-col">
          <div class="f-head">地址</div>
          <div class="f-line">北京市朝阳区广顺北大街17号北京市数字人基地三层</div>
        </div>
        <div class="footer-col">
          <div class="f-head">产品</div>
          <div class="f-line"><NuxtLink to="/">透镜GEO</NuxtLink> · <NuxtLink to="/">星海智能体</NuxtLink></div>
        </div>
        <div class="footer-col">
          <div class="f-head">资源</div>
          <div class="f-line">
            <NuxtLink to="/reports">报告</NuxtLink> · <NuxtLink to="/articles">文章</NuxtLink> ·
            <NuxtLink to="/news">资讯</NuxtLink> · <NuxtLink to="/docs/ai-instructions">AI Instructions</NuxtLink>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="f-copy">© 2026 北京时光不语科技有限公司 版权所有</div>
        <div class="f-links">
          <NuxtLink to="/news">近期更新</NuxtLink>
          <NuxtLink to="/articles">全部文章</NuxtLink>
          <NuxtLink to="/news">全部资讯</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.site-footer { background: #191622; color: #d6d3d8; padding: 56px 0 28px; }
.footer-grid { display: grid; grid-template-columns: 1.4fr repeat(4, 1fr); gap: 32px; margin-bottom: 44px; }
.f-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.f-logo-icon { width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: #fff; }
.f-logo-text { font-size: 16px; font-weight: 700; color: #fafafa; }
.f-desc { font-size: 12.5px; color: #8f8b9c; line-height: 1.8; margin: 0; max-width: 260px; }
.f-head { font-size: 13px; font-weight: 600; color: #fafafa; margin-bottom: 10px; }
.f-line { font-size: 13px; color: #a8a3b6; line-height: 1.8; }
.f-line a { transition: color .12s ease; &:hover { color: #e9e7f2; } }
.footer-bottom { border-top: 1px solid #282332; padding-top: 22px; display: flex; justify-content: space-between; align-items: center; }
.f-copy { font-size: 12px; color: #6b6580; }
.f-links { display: flex; gap: 20px; }
.f-links a { font-size: 12.5px; color: #8f8b9c; &:hover { color: #e9e7f2; } }
</style>
