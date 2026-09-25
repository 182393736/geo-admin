<script setup lang="ts">
import { GEO_PRIMARY_NAV } from '~/utils/geo-hub'

const { isDark, init, toggle } = useGeoTheme()
const { isLoggedIn, user, goDash, logout } = useGeoAuth()
const { open: openAuth } = useGeoAuthModal()
const navOpen = ref(false)
/** 仅窄屏点击展开；桌面端用 CSS :hover */
const openMenu = ref<string | null>(null)
const isNarrow = ref(false)

onMounted(() => {
  init()
  const mq = window.matchMedia('(max-width: 860px)')
  const sync = () => {
    isNarrow.value = mq.matches
    if (!mq.matches) openMenu.value = null
  }
  sync()
  mq.addEventListener('change', sync)
  onUnmounted(() => mq.removeEventListener('change', sync))
})

function closeNav() {
  navOpen.value = false
  openMenu.value = null
}

function onLoginClick(e: Event) {
  e.preventDefault()
  if (isLoggedIn.value) {
    goDash()
    return
  }
  closeNav()
  openAuth('wechat', 'header')
}

/** 窄屏：第一次点展开子菜单；已展开再点则进入总览页。桌面：直接进总览，悬停仍展开下拉。 */
function onParentClick(e: Event, label: string) {
  if (!isNarrow.value) {
    closeNav()
    return
  }
  if (openMenu.value !== label) {
    e.preventDefault()
    openMenu.value = label
    return
  }
  closeNav()
}
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <NuxtLink to="/" class="brand" aria-label="HANYUAI GEO" @click="closeNav">
        <span class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
        </span>
        HANYUAI GEO
        <span class="kbd hide-mobile">GEO / AI</span>
      </NuxtLink>

      <nav class="nav" :class="{ open: navOpen }" id="main-nav" @click="closeNav">
        <div
          v-for="item in GEO_PRIMARY_NAV"
          :key="item.label"
          class="nav-item"
          :class="{ 'has-dd': item.children?.length, open: openMenu === item.label }"
          @click.stop
        >
          <NuxtLink
            v-if="!item.children?.length"
            :to="item.to"
            class="nav-link"
            @click="closeNav"
          >{{ item.label }}</NuxtLink>
          <template v-else>
            <NuxtLink
              :to="item.to"
              class="nav-link"
              :aria-expanded="openMenu === item.label"
              aria-haspopup="true"
              @click="onParentClick($event, item.label)"
            >
              {{ item.label }}
            </NuxtLink>
            <div class="nav-dd" role="menu">
              <NuxtLink
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                role="menuitem"
                @click="closeNav"
              >{{ child.label }}</NuxtLink>
            </div>
          </template>
        </div>
      </nav>

      <div class="header-actions">
        <button class="btn btn-ghost btn-icon btn-sm" type="button" aria-label="切换主题" @click="toggle">
          <svg v-if="!isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
        </button>
        <template v-if="isLoggedIn">
          <button class="btn btn-ghost btn-sm hide-mobile" type="button" @click="goDash()">{{ user?.account || '工作台' }}</button>
          <button class="btn btn-ghost btn-sm hide-mobile" type="button" @click="logout">退出</button>
        </template>
        <button
          v-else
          class="btn btn-ghost btn-sm hide-mobile"
          type="button"
          @click="onLoginClick"
        >登录</button>
        <button class="btn btn-outline btn-icon btn-sm mobile-toggle" type="button" aria-label="菜单" @click="navOpen = !navOpen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
}
.nav-link {
  color: hsl(var(--foreground) / 0.6);
  transition: color 0.15s;
  text-decoration: none;
  white-space: nowrap;
}
.nav-link:hover,
.nav-link:focus-visible {
  color: hsl(var(--primary));
}
.nav-dd {
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: min(42rem, calc(100vw - 2rem));
  margin-top: 0;
  padding: 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  background: hsl(var(--background));
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.1);
  z-index: 60;
  grid-template-columns: repeat(3, minmax(8.75rem, 1fr));
  column-gap: 0.35rem;
  row-gap: 0.15rem;
}
.nav-dd a {
  padding: 0.45rem 0.6rem;
  border-radius: 0.35rem;
  font-size: 0.8125rem;
  line-height: 1.35;
  color: hsl(var(--foreground) / 0.82);
  white-space: nowrap;
  text-decoration: none;
}
.nav-dd a:hover,
.nav-dd a:focus-visible {
  background: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  outline: none;
}

/* 桌面：项拉满 header 高，面板顶边贴导航底边；两项垂直对齐 */
@media (min-width: 861px) {
  .nav {
    align-self: stretch;
    align-items: stretch;
  }
  .nav-item.has-dd:hover > .nav-dd,
  .nav-item.has-dd:focus-within > .nav-dd {
    display: grid;
  }
}

/* 窄屏：点击 .open 展开，单列 */
@media (max-width: 860px) {
  .nav-item {
    width: 100%;
    display: block;
  }
  .nav-item.has-dd.open > .nav-dd {
    display: flex;
    flex-direction: column;
    position: static;
    transform: none;
    width: 100%;
    max-width: none;
    box-shadow: none;
    border: 0;
    padding: 0.35rem 0 0.15rem 0.75rem;
  }
  .nav-dd a {
    white-space: normal;
  }
}
</style>
