<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, HelpCircle, LogOut, Plus, UserRound } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const auth = useAuthStore()

const open = defineModel<boolean>('open', { default: false })

const brand = computed(() => auth.activeBrand ?? auth.brands?.[0] ?? null)
const brandName = computed(() => brand.value?.name || '我的账户')
const brandInitial = computed(
  () => (brand.value?.name || '账号').replace(/\s+/g, '').slice(0, 1) || '账',
)
const accountText = computed(() => {
  const acc = auth.user?.username || auth.user?.id || ''
  const n = auth.brands?.length ?? 0
  return n > 0 ? `${acc} · 服务 ${n} 个品牌` : acc || '账号'
})
const avatarText = computed(() => {
  const u = (auth.user?.username || '').trim()
  if (/^\d/.test(u)) return u.slice(0, 2)
  return (u.slice(0, 2) || '我').toUpperCase()
})
const statusBadge = computed(() => {
  const status = (brand.value as { status?: string } | null)?.status
  if (!status || status === 'active') return null
  if (status === 'expired') return { text: '过期', tone: 'red' as const }
  if (status === 'building') return { text: '初始化', tone: 'amber' as const }
  return { text: '已停用', tone: 'gray' as const }
})

function close() {
  open.value = false
  emit('close')
}

function goBilling() {
  close()
  router.push('/dashboard/plan-upgrade')
}
function goAddBrand() {
  close()
  router.push({ path: '/trial', query: { from: 'add_brand' } })
}
function goProfile() {
  close()
  router.push('/dashboard/profile')
}
function contactSupport() {
  close()
  toast.info('请添加客服微信或发送邮件至 support@hanyuai.com')
}
async function doLogout() {
  close()
  try {
    auth.logout()
  } finally {
    router.push('/login')
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-[10px] transition hover:bg-accent"
      :aria-expanded="open"
      aria-label="用户菜单"
      @click.stop="open = !open"
    >
      <span
        class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-bold tabular-nums text-slate-600"
      >
        {{ avatarText }}
      </span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 z-[999]"
        @click="close"
      />
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-x-1"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-1"
      >
        <div
          v-if="open"
          class="fixed bottom-4 left-[92px] z-[1000] w-[260px] overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          role="menu"
          @click.stop
        >
          <!-- Head -->
          <div class="flex items-center gap-3 border-b border-border/70 px-4 py-3.5">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-primary text-sm font-bold text-primary-foreground"
            >
              {{ brandInitial }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-[13px] font-bold text-foreground">{{ brandName }}</div>
              <div class="truncate text-[11px] text-muted-foreground">{{ accountText }}</div>
            </div>
            <span
              v-if="statusBadge"
              :class="
                cn(
                  'shrink-0 rounded border px-1.5 py-px text-[10px] font-bold leading-none',
                  statusBadge.tone === 'red' && 'border-red-200 bg-red-50 text-red-600',
                  statusBadge.tone === 'amber' && 'border-amber-200 bg-amber-50 text-amber-600',
                  statusBadge.tone === 'gray' && 'border-border bg-muted text-muted-foreground',
                )
              "
            >
              {{ statusBadge.text }}
            </span>
          </div>

          <!-- Actions -->
          <div class="py-2">
            <button
              type="button"
              class="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left transition hover:bg-accent"
              @click="goBilling"
            >
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <CreditCard class="h-3 w-3" />
              </span>
              <span class="text-[12.5px] font-semibold text-foreground">计费与套餐</span>
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left transition hover:bg-accent"
              @click="goAddBrand"
            >
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Plus class="h-3 w-3" />
              </span>
              <span class="text-[12.5px] font-semibold text-foreground">添加品牌</span>
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left transition hover:bg-accent"
              @click="goProfile"
            >
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <UserRound class="h-3 w-3" />
              </span>
              <span class="text-[12.5px] font-semibold text-foreground">个人资料</span>
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left transition hover:bg-accent"
              @click="contactSupport"
            >
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <HelpCircle class="h-3 w-3" />
              </span>
              <span class="text-[12.5px] font-semibold text-foreground">联系客服</span>
            </button>
          </div>

          <!-- Logout -->
          <div class="border-t border-border/70 py-2">
            <button
              type="button"
              class="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left transition hover:bg-red-50"
              @click="doLogout"
            >
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-red-50 text-red-500">
                <LogOut class="h-3 w-3" />
              </span>
              <span class="text-[12.5px] font-semibold text-red-600">退出登录</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
