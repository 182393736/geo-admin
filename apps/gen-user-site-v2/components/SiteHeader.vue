<script setup lang="ts">
const { isDark, init, toggle } = useTheme()
const { isLoggedIn, user, goDash, logout } = useAuth()
const { open } = useAuthModal()
const navOpen = ref(false)

onMounted(() => init())

function closeNav() {
  navOpen.value = false
}

function onLoginClick(e: Event) {
  e.preventDefault()
  if (isLoggedIn.value) {
    goDash()
    return
  }
  open('password', 'header')
}

function onStartClick(e: Event) {
  e.preventDefault()
  if (isLoggedIn.value) {
    goDash()
    return
  }
  open('password', 'cta')
}
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <a href="#hero" class="brand" aria-label="HANYUAI GEO助手" @click="closeNav">
        <span class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
        </span>
        HANYUAI GEO助手
        <span class="kbd hide-mobile">GEO / AI</span>
      </a>
      <nav class="nav" :class="{ open: navOpen }" id="main-nav" @click="closeNav">
        <a href="#capabilities">产品能力</a>
        <a href="#workflow">工作流</a>
        <a href="#report">报告示例</a>
        <a href="#insights">方法论</a>
      </nav>
      <div class="header-actions">
        <button class="btn btn-ghost btn-icon btn-sm" type="button" aria-label="切换主题" @click="toggle">
          <svg v-if="!isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
        </button>
        <template v-if="isLoggedIn">
          <button class="btn btn-ghost btn-sm hide-mobile" type="button" @click="goDash()">
            {{ user?.account || '工作台' }}
          </button>
          <button class="btn btn-ghost btn-sm hide-mobile" type="button" @click="logout">退出</button>
        </template>
        <a v-else href="#" class="btn btn-ghost btn-sm hide-mobile" @click="onLoginClick">登录</a>
        <a href="#diagnose" class="btn btn-default btn-sm" @click="onStartClick">免费开始</a>
        <button
          class="btn btn-outline btn-icon btn-sm mobile-toggle"
          type="button"
          aria-label="菜单"
          @click="navOpen = !navOpen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
    </div>
  </header>
</template>
