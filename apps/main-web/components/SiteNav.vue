<template>
  <header class="site-nav">
    <div class="nav-inner">
      <NuxtLink to="/" class="logo">
        <span class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>
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
.site-nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #eeeef3;
}
.nav-inner {
  max-width: 1440px; margin: 0 auto; padding: 0 32px;
  height: 66px; display: flex; align-items: center; gap: 40px;
}
.logo { display: flex; align-items: center; gap: 9px; flex-shrink: 0; }
.logo-icon {
  width: 26px; height: 26px; border-radius: 7px;
  background: #0a0a0a; color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.logo-text { font-size: 17px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.01em; }

.nav-links { display: flex; gap: 8px; flex: 1; }
.nav-link {
  padding: 8px 14px; font-size: 14px; color: #4b5563; border-radius: 8px;
  transition: all .15s ease; font-weight: 500;
  &:hover { color: #111; background: #f4f4f6; }
  &--active { color: #0a0a0a; font-weight: 700; }
}

.nav-actions { display: flex; gap: 10px; flex-shrink: 0; }
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 22px; height: 40px; border-radius: 999px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all .18s ease; border: none;
}
.btn--dark {
  background: #0a0a0a; color: #fff;
  &:hover { background: #1c1c1e; }
}
.btn--ghost {
  background: #fff; color: #0a0a0a; border: 1px solid #e5e5ea;
  &:hover { border-color: #d4d4da; background: #fafafa; }
}
</style>
