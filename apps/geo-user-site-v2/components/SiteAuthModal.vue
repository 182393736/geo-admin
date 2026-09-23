<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="auth-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-auth-title"
      @click.self="close"
    >
      <div class="auth-card">
        <button class="auth-close" type="button" aria-label="关闭" @click="close">×</button>
        <h2 id="site-auth-title" class="auth-title">登录透镜 GEO</h2>
        <p class="auth-sub">登录后进入工作台；未建档账号将直接进入首登分析。</p>

        <label class="auth-label" for="site-auth-account">账号</label>
        <input
          id="site-auth-account"
          v-model="account"
          class="auth-input"
          type="text"
          autocomplete="username"
          placeholder="账号 / 手机号"
          @keyup.enter="onSubmit"
        >

        <label class="auth-label" for="site-auth-password">密码</label>
        <input
          id="site-auth-password"
          v-model="password"
          class="auth-input"
          type="password"
          autocomplete="current-password"
          placeholder="密码"
          @keyup.enter="onSubmit"
        >

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button
          class="btn btn-default auth-submit"
          type="button"
          :disabled="!canSubmit || loading"
          @click="onSubmit"
        >
          {{ loading ? '登录中…' : '登录 →' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { isOpen, close } = useAuthModal()
const { login, goDash } = useAuth()

const account = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const canSubmit = computed(
  () => account.value.trim().length > 0 && password.value.length >= 6,
)

watch(isOpen, (open) => {
  if (open) {
    account.value = ''
    password.value = ''
    error.value = ''
  }
})

async function onSubmit() {
  if (!canSubmit.value || loading.value) return
  error.value = ''
  loading.value = true
  const res = await login(account.value, password.value)
  loading.value = false
  if (res === true) {
    close()
    goDash()
  } else {
    error.value = res
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) close()
}
watch(isOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
}
.auth-card {
  position: relative;
  width: min(100%, 400px);
  padding: 1.75rem 1.5rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
}
.auth-close {
  position: absolute;
  top: 0.75rem;
  right: 0.85rem;
  border: 0;
  background: transparent;
  font-size: 1.35rem;
  line-height: 1;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
}
.auth-title {
  margin: 0 0 0.35rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.auth-sub {
  margin: 0 0 1.25rem;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}
.auth-label {
  display: block;
  margin: 0 0 0.35rem;
  font-size: 0.8125rem;
  font-weight: 500;
}
.auth-input {
  width: 100%;
  margin: 0 0 0.9rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  font-size: 0.875rem;
  outline: none;
}
.auth-input:focus {
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.15);
}
.auth-error {
  margin: -0.35rem 0 0.75rem;
  font-size: 0.8125rem;
  color: #dc2626;
}
.auth-submit {
  width: 100%;
  margin-top: 0.25rem;
}
.auth-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
