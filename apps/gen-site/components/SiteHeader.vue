<template>
  <div class="nav-fix" id="navFix" :class="{ scrolled }">
  <nav>
    <div class="logo" style="cursor:pointer">
      <img class="logo-image" src="/i_e4fc38b37b.svg" alt="" aria-hidden="true">
      <span>透镜GEO</span>
    </div>
    <div class="nav-left">
      <a href="https://geo.timus.cn/" class="nav-link on" data-page="home">首页</a>
      <a href="/diagnose" class="nav-link" data-page="diagnose">单次诊断</a>
      <a href="/pricing" class="nav-link" data-page="pricing">定价</a>
      <a href="/resources" class="nav-link" data-page="reports">报告</a>
      <a href="/articles" class="nav-link" data-page="academy">文章</a>
      <a href="/news" class="nav-link" data-page="news">资讯</a>
      <a href="/contact" class="nav-link" data-page="contact">联系我们</a>
    </div>
    <div class="nav-right">
      <a class="nav-cta" href="/trial" id="primaryCta">开始试用</a>
      <a href="https://geo.timus.cn/login" class="nav-login" id="loginLink" @click.prevent="login">登录</a>
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
