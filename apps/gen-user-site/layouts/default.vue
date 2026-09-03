<template>
  <div class="original-design-root">
    <SiteBackground />
    <SiteHeader />
    <main>
      <slot />
    </main>
    <SiteFooter />
    <SiteToast />
    <!-- 登录弹窗：全站共用，由 useAuthModal() 或 timus:auth-open 事件唤起 -->
    <SiteAuthModal />
  </div>
</template>

<script setup lang="ts">
const { open } = useAuthModal()

// 页面内容挂载后启动滚动渐显（替代原站 design-runtime.js）
onMounted(() => {
  nextTick(() => useReveal())
  // 兼容原站的自定义事件写法（如 <button data-timus-login> 之类）
  window.addEventListener('timus:auth-open', onAuthOpen)
})

onUnmounted(() => window.removeEventListener('timus:auth-open', onAuthOpen))

function onAuthOpen(e: Event) {
  const detail = (e as CustomEvent<{ intent?: string }>).detail || {}
  // 默认选中「账号密码」登录
  open('password', detail.intent || 'event')
}
</script>
