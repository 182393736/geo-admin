<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TrialChat from './TrialChat.vue'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  if (!auth.isAuthenticated) {
    router.replace({ path: '/login', query: { redirect: '/trial' } })
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <header class="flex h-14 items-center border-b border-border/60 bg-background/70 px-4 backdrop-blur-sm">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          透
        </div>
        <span class="text-sm font-semibold tracking-tight">透镜 GEO</span>
        <span class="text-xs text-muted-foreground">· 品牌分析</span>
      </div>
    </header>
    <TrialChat />
  </div>
</template>
