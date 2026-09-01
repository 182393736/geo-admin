<template>
  <header class="site-nav">
    <div class="nav-inner">
      <NuxtLink to="/" class="logo">
        <span class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>
        </span>
        <span class="logo-text">透镜GEO</span>
      </NuxtLink>
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-link nav-link--active">首页</NuxtLink>
        <NuxtLink to="/diagnosis" class="nav-link">单次诊断</NuxtLink>
        <NuxtLink to="/pricing" class="nav-link">定价</NuxtLink>
        <NuxtLink to="/reports" class="nav-link">报告</NuxtLink>
        <NuxtLink to="/articles" class="nav-link">文章</NuxtLink>
        <NuxtLink to="/news" class="nav-link">资讯</NuxtLink>
        <NuxtLink to="/contact" class="nav-link">联系我们</NuxtLink>
      </nav>
      <div class="nav-actions">
        <NuxtLink to="/register" class="btn btn--dark">开始试用</NuxtLink>
        <NuxtLink to="/login" class="btn btn--ghost">登录</NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
/* 实测：h=69px padding 14/56 gap=40 bg=rgba(255,255,255,.82) blur(14) */
.site-nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(236, 236, 241, 0.7);
}
.nav-inner {
  max-width: 1440px; margin: 0 auto; padding: 14px 56px;
  height: 69px; display: flex; align-items: center; gap: 40px;
}
.logo { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.logo-icon {
  width: 24px; height: 24px; border-radius: 6px;
  background: #0a0a0f; color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.logo-text { font-size: 17px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; }

.nav-links { display: flex; gap: 4px; flex: 1; }
.nav-link {
  padding: 8px 13px; font-size: 14px; color: var(--ink-3); border-radius: 8px;
  transition: all .15s ease; font-weight: 500;
  &:hover { color: var(--ink); background: #f4f4f6; }
  &--active { color: var(--ink); font-weight: 600; }
}

.nav-actions { display: flex; gap: 10px; flex-shrink: 0; }
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 41px; border-radius: 999px; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all .18s ease; border: none;
}
.btn--dark {
  background: rgb(10, 10, 15); color: #fff; padding: 0 22px;
  &:hover { background: rgb(26, 26, 34); }
}
.btn--ghost {
  background: #fff; color: var(--ink); border: 1px solid rgb(229, 229, 234); padding: 0 20px;
  &:hover { border-color: rgb(212, 212, 218); background: #fafafa; }
}
</style>
