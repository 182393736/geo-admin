<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { open: openAuth } = useGeoAuthModal()

watch(
  () => route.query.auth,
  (v) => {
    if (v === '1' || v === 'login' || v === 'wechat') {
      openAuth('wechat', 'auth_query')
      const q = { ...route.query }
      delete q.auth
      router.replace({ path: route.path, query: q, hash: route.hash })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="geo-layout">
    <GeoHeader />
    <slot />
    <GeoFooter />
    <GeoAuthModal />
  </div>
</template>

<style>
@import '~/assets/css/geo-site.css';
</style>
