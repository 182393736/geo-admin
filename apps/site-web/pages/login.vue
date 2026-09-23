<script setup lang="ts">
definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '登录｜HANYUAI GEO',
  description: '微信扫码或账号密码登录 HANYUAI GEO，进入工作台继续监测与优化。',
  keywords: 'GEO登录,HANYUAI登录,微信登录',
  path: '/login',
})

const { isLoggedIn, goDash } = useGeoAuth()
const { open } = useGeoAuthModal()

onMounted(() => {
  if (isLoggedIn.value) {
    goDash()
    return
  }
  open('wechat', 'login_page')
})
</script>

<template>
  <div class="login-page">
    <p class="msg">正在打开登录框…</p>
    <button class="btn btn-default" type="button" @click="open('wechat', 'login_page')">打开登录</button>
    <p class="back"><NuxtLink to="/">返回首页</NuxtLink></p>
  </div>
</template>

<style scoped>
.login-page {
  max-width: 28rem;
  margin: 4rem auto;
  padding: 0 1.5rem;
  text-align: center;
}
.msg { margin-bottom: 1rem; color: hsl(var(--muted-foreground)); }
.back { margin-top: 1.25rem; color: hsl(var(--muted-foreground)); }
.back a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
</style>
