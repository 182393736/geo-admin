<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Building2, KeyRound, Loader2, Shield, UserRound } from 'lucide-vue-next'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { userApi } from '@/api/modules/user'
import { useAuthStore } from '@/stores/auth'
import { Message } from '@/lib/toast'

const auth = useAuthStore()

const loading = ref(true)
const savingProfile = ref(false)
const savingPwd = ref(false)

const account = ref('')
const profile = reactive({
  name: '',
  phone: '',
  company: '',
  position: '',
  industry: '',
})

const pwd = reactive({
  old_password: '',
  new_password: '',
  confirm: '',
})

const avatarText = computed(() => {
  const u = (profile.name || account.value || auth.user?.username || '我').trim()
  if (/^\d/.test(u)) return u.slice(0, 2)
  return (u.slice(0, 2) || '我').toUpperCase()
})

async function load() {
  loading.value = true
  try {
    const info = await userApi.info()
    account.value = info.account || auth.user?.username || ''
    profile.name = info.name || ''
    profile.phone = info.phone || ''
    profile.company = info.company || ''
    profile.position = info.position || ''
    profile.industry = info.industry || info.industary || ''
  } catch (e: any) {
    Message.error(e?.message || '加载个人资料失败')
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  if (savingProfile.value) return
  if (profile.phone && !/^1\d{10}$/.test(profile.phone.trim())) {
    Message.error('手机号格式不正确')
    return
  }
  savingProfile.value = true
  try {
    await userApi.updateInfo({
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      company: profile.company.trim(),
      position: profile.position.trim(),
      industry: profile.industry.trim(),
    })
    Message.success('个人资料已保存')
  } catch (e: any) {
    Message.error(e?.message || '保存失败')
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  if (savingPwd.value) return
  if (!pwd.old_password || !pwd.new_password) {
    Message.error('请填写当前密码与新密码')
    return
  }
  if (pwd.new_password.length < 6) {
    Message.error('新密码至少 6 位')
    return
  }
  if (pwd.new_password !== pwd.confirm) {
    Message.error('两次输入的新密码不一致')
    return
  }
  savingPwd.value = true
  try {
    await userApi.changePassword(pwd.old_password, pwd.new_password)
    Message.success('密码已更新')
    pwd.old_password = ''
    pwd.new_password = ''
    pwd.confirm = ''
  } catch (e: any) {
    Message.error(e?.message || '修改密码失败')
  } finally {
    savingPwd.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-[880px] space-y-6 px-6 py-8">
    <PageHeader
      title="个人资料"
      description="管理账号基本信息与登录密码"
    />

    <div v-if="loading" class="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" />
      加载中…
    </div>

    <template v-else>
      <!-- 账号概览 -->
      <Card>
        <CardContent class="flex items-center gap-4 p-6">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            {{ avatarText }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-base font-semibold tracking-tight">
              {{ profile.name || account || '未设置姓名' }}
            </div>
            <div class="mt-0.5 truncate text-sm text-muted-foreground">
              登录账号 {{ account || '—' }}
              <span v-if="profile.phone"> · {{ profile.phone }}</span>
            </div>
          </div>
          <div class="hidden items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground sm:flex">
            <Shield class="h-3 w-3" />
            账号安全
          </div>
        </CardContent>
      </Card>

      <!-- 基本信息 -->
      <Card>
        <CardContent class="space-y-5 p-6">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <UserRound class="h-4 w-4" />
            </span>
            <div>
              <h2 class="text-sm font-semibold">基本信息</h2>
              <p class="text-xs text-muted-foreground">姓名、手机与公司信息，便于客服与账单联系</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">登录账号</label>
              <Input :model-value="account" disabled class="bg-muted/40" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">姓名</label>
              <Input v-model="profile.name" placeholder="真实姓名或昵称" maxlength="40" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">手机号</label>
              <Input v-model="profile.phone" placeholder="11 位手机号" maxlength="11" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">职位</label>
              <Input v-model="profile.position" placeholder="如：市场负责人" maxlength="40" />
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-xs font-medium text-muted-foreground">公司名称</label>
              <div class="relative">
                <Building2 class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input v-model="profile.company" class="pl-9" placeholder="公司全称" maxlength="80" />
              </div>
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-xs font-medium text-muted-foreground">所属行业</label>
              <Input v-model="profile.industry" placeholder="如：公共家具制造" maxlength="60" />
            </div>
          </div>

          <div class="flex justify-end border-t pt-4">
            <Button type="button" :disabled="savingProfile" @click="saveProfile">
              <Loader2 v-if="savingProfile" class="h-3.5 w-3.5 animate-spin" />
              {{ savingProfile ? '保存中…' : '保存资料' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 修改密码 -->
      <Card>
        <CardContent class="space-y-5 p-6">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <KeyRound class="h-4 w-4" />
            </span>
            <div>
              <h2 class="text-sm font-semibold">修改密码</h2>
              <p class="text-xs text-muted-foreground">定期更新密码有助于保护账号安全</p>
            </div>
          </div>

          <div class="grid max-w-md gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">当前密码</label>
              <Input
                v-model="pwd.old_password"
                type="password"
                autocomplete="current-password"
                placeholder="输入当前密码"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">新密码</label>
              <Input
                v-model="pwd.new_password"
                type="password"
                autocomplete="new-password"
                placeholder="至少 6 位"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">确认新密码</label>
              <Input
                v-model="pwd.confirm"
                type="password"
                autocomplete="new-password"
                placeholder="再次输入新密码"
              />
            </div>
          </div>

          <div class="flex justify-end border-t pt-4">
            <Button
              type="button"
              variant="outline"
              :disabled="savingPwd || !pwd.old_password || !pwd.new_password"
              @click="savePassword"
            >
              <Loader2 v-if="savingPwd" class="h-3.5 w-3.5 animate-spin" />
              {{ savingPwd ? '提交中…' : '更新密码' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
