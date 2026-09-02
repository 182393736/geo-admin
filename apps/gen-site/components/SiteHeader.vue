<template>
  <div class="nav-fix" id="navFix" :class="{ scrolled }">
  <nav>
    <div class="logo" style="cursor:pointer">
      <img class="logo-image" src="/i_e4fc38b37b.svg" alt="" aria-hidden="true">
      <span>透镜GEO</span>
    </div>
    <div class="nav-left">
      <a href="/" :class="navClass('home')" data-page="home">首页</a>
      <a href="/diagnose" :class="navClass('diagnose')" data-page="diagnose">单次诊断</a>
      <a href="/pricing" :class="navClass('pricing')" data-page="pricing">定价</a>
      <a href="/resources" :class="navClass('reports')" data-page="reports">报告</a>
      <a href="/articles" :class="navClass('academy')" data-page="academy">文章</a>
      <a href="/news" :class="navClass('news')" data-page="news">资讯</a>
      <a href="/contact" :class="navClass('contact')" data-page="contact">联系我们</a>
    </div>
    <div class="nav-right">
      <a class="nav-cta" href="/trial" id="primaryCta">开始试用</a>
      <a href="/login" class="nav-login" id="loginLink" @click.prevent="login">登录</a>
      <div class="user-menu" id="userMenu">
        <button class="user-avatar-btn">
          <div class="avatar-circle">进</div>
          <span class="user-name">进入平台</span>
        </button>
        <button class="user-logout-btn" data-timus-logout="" type="button">退出</button>
      </div>
    </div>
  </nav>
  </div>
</template>

<script setup lang="ts">
const scrolled = ref(false)
const route = useRoute()
// 导航高亮跟随当前路由（原站由服务端按页面输出 .on）
const navClass = (key: string) => ['nav-link', { on: route.path === PATH_BY_KEY[key] }]
const PATH_BY_KEY: Record<string, string> = {
  home: '/', diagnose: '/diagnose', pricing: '/pricing',
  reports: '/resources', academy: '/articles', news: '/news', contact: '/contact',
}
const go = (path: string) => navigateTo(path)
const login = () => window.dispatchEvent(
  new CustomEvent('timus:auth-open', { detail: { intent: 'login' } })
)

onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 8 }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>
