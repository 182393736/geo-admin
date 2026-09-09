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
      <a v-show="!isLoggedIn" class="nav-cta" href="/trial" id="primaryCta">开始试用</a>
      <a
        v-show="!isLoggedIn"
        href="/login"
        class="nav-login"
        id="loginLink"
        @click.prevent="login"
      >登录</a>
      <div class="user-menu" id="userMenu" :class="{ active: isLoggedIn }">
        <button class="user-avatar-btn" type="button" @click="goConsole">
          <div class="avatar-circle">{{ user?.initial || '进' }}</div>
          <span class="user-name">{{ user?.account || '进入平台' }}</span>
        </button>
        <button class="user-logout-btn" data-timus-logout="" type="button" @click="logout">退出</button>
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

// 登录态（前端模拟，见 composables/useAuth.ts）
const { isLoggedIn, user, refreshBrandState, logout } = useAuth()
const { open } = useAuthModal()

// 右上角登录按钮：弹出登录框，默认选中「账号密码」
const login = () => open('password', 'header')

/**
 * 点击用户名：已过首登分析（有品牌）→ 跳控制台（带 token 免二次登录）；
 * 未建档 → 跳 /trial 建档；品牌态确认失败 → 兜底跳控制台，由后台裁决（无品牌会跳回 /trial#token）。
 */
async function goConsole() {
  if (!isLoggedIn.value) { open('password', 'header'); return }
  const { getToken } = useGeoApi()
  const config = useRuntimeConfig()
  const consoleUrl = String((config.public as Record<string, unknown>).consoleUrl || 'http://127.0.0.1:5173')
  const base = consoleUrl.split('#')[0]
  const tk = getToken()
  const withToken = (u: string) => (tk ? `${u}#token=${encodeURIComponent(tk)}` : u)
  const has = await refreshBrandState()
  if (has === false) {
    navigateTo('/trial')
    return
  }
  window.location.href = withToken(base)
}

onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 8 }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>
