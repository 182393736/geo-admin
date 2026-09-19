<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Message } from '@/lib/toast'
import { Button, Input } from '@/components/ui'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const account = ref('')
const password = ref('')
const errMsg = ref('')
const submitting = ref(false)

async function handleSubmit() {
  if (submitting.value) return
  errMsg.value = ''
  submitting.value = true
  try {
    await auth.login(account.value.trim(), password.value)
    Message.success(auth.user?.username ? `欢迎回来，${auth.user.username}` : '登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    if (redirect.startsWith('/') && !redirect.startsWith('//')) {
      router.push(redirect)
    } else if (auth.hasBrand) {
      router.push('/dashboard/brand-library')
    } else {
      router.push('/trial')
    }
  } catch (e: any) {
    const msg = e?.message || '网络异常，请确认后端已启动（:6001）'
    errMsg.value = msg
    Message.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-4">
    <div class="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
      <div class="mb-6">
        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          透
        </div>
        <h1 class="text-2xl font-bold tracking-tight">登录</h1>
        <p class="mt-1 text-sm text-muted-foreground">透镜 GEO 用户后台</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label class="text-sm font-medium">账号</label>
          <Input v-model="account" placeholder="请输入账号" autocomplete="username" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">密码</label>
          <Input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <p v-if="errMsg" class="text-sm text-destructive">{{ errMsg }}</p>
        <Button
          type="submit"
          class="w-full"
          :disabled="!account || !password || submitting"
        >
          {{ submitting ? '登录中…' : '登录' }}
        </Button>
      </form>
    </div>
  </div>
</template>
