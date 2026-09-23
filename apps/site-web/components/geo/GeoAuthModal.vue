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
        <h2 id="site-auth-title" class="auth-title">登陆后免费使用</h2>
        <p class="auth-sub">{{ authSub }}</p>

        <div class="auth-tabs" role="tablist" aria-label="登录方式">
          <button
            type="button"
            role="tab"
            :aria-selected="tab === 'wechat'"
            :class="{ on: tab === 'wechat' }"
            @click="setTab('wechat')"
          >
            微信登录
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="tab === 'password'"
            :class="{ on: tab === 'password' }"
            @click="setTab('password')"
          >
            账号密码
          </button>
        </div>

        <!-- 微信扫码 -->
        <div v-if="tab === 'wechat'" class="wx-pane" role="tabpanel">
          <div class="wx-frame" :class="{ dim: wxState === 'expired' || wxState === 'error' }">
            <img
              v-if="qrcodeUrl && wxState !== 'error'"
              :src="qrcodeUrl"
              alt="微信登录二维码"
              width="180"
              height="180"
            >
            <div v-else class="wx-placeholder" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                <path d="M9.5 4C5.91 4 3 6.47 3 9.5c0 1.72.9 3.25 2.3 4.28L4.5 16.5l2.7-1.35c.7.2 1.45.35 2.3.35.18 0 .35 0 .52-.02C9.7 14.72 9.5 13.9 9.5 13c0-3.04 2.69-5.5 6-5.5.2 0 .4 0 .6.03C15.4 5.35 12.7 4 9.5 4zm-2.25 3.25a.88.88 0 1 1 0 1.75.88.88 0 0 1 0-1.75zm4.5 0a.88.88 0 1 1 0 1.75.88.88 0 0 1 0-1.75zM15.5 8.5c-2.76 0-5 1.9-5 4.25S12.74 17 15.5 17c.6 0 1.17-.1 1.7-.27L19 17.5l-.7-1.75C19.4 14.9 20 13.9 20 12.75c0-2.35-2.24-4.25-4.5-4.25zm-1.5 2.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm3 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z" />
              </svg>
            </div>
          </div>
          <p class="wx-hint">{{ wxHint }}</p>
          <button
            v-if="wxState === 'error' || wxState === 'expired'"
            class="auth-link"
            type="button"
            @click="refreshWechat"
          >
            刷新二维码
          </button>
          <p class="auth-agree">
            免费登录即表示同意
            <NuxtLink to="/terms" @click="close">《服务条款》</NuxtLink>
            与
            <NuxtLink to="/privacy" @click="close">《隐私政策》</NuxtLink>
          </p>
        </div>

        <!-- 账号密码 -->
        <div v-else class="pwd-pane" role="tabpanel">
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
            {{ loading ? '登录中…' : '免费登录' }}
          </button>
          <p class="auth-agree">
            免费登录即表示同意
            <NuxtLink to="/terms" @click="close">《服务条款》</NuxtLink>
            与
            <NuxtLink to="/privacy" @click="close">《隐私政策》</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { isOpen, tab, close, setTab } = useGeoAuthModal()
const { login, loginWithToken, createWechatQr, pollWechatQr, goDash } = useGeoAuth()

const account = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const qrcodeUrl = ref('')
const ticket = ref('')
const wxState = ref<'idle' | 'loading' | 'pending' | 'scanned' | 'expired' | 'error'>('idle')
const wxMessage = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null
let expireTimer: ReturnType<typeof setTimeout> | null = null

const canSubmit = computed(
  () => account.value.trim().length > 0 && password.value.length >= 6,
)

const authSub = computed(() =>
  tab.value === 'wechat'
    ? '打开微信扫一扫，登录后开启 GEO 之旅。'
    : '输入账号和密码登录，开启 GEO 之旅。',
)

const wxHint = computed(() => {
  if (wxState.value === 'loading') return '正在生成免费登录二维码…'
  if (wxState.value === 'scanned') return '已扫码，请在手机上确认免费登录'
  if (wxState.value === 'expired') return '二维码已过期，请刷新'
  if (wxState.value === 'error') return wxMessage.value || '微信登录暂不可用，可切换账号密码免费登录'
  return '请用微信扫上方二维码'
})

function clearWechatTimers() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (expireTimer) {
    clearTimeout(expireTimer)
    expireTimer = null
  }
}

async function refreshWechat() {
  clearWechatTimers()
  qrcodeUrl.value = ''
  ticket.value = ''
  wxState.value = 'loading'
  wxMessage.value = ''

  const created = await createWechatQr()
  if (!created.ok) {
    wxState.value = 'error'
    wxMessage.value = created.message
    return
  }

  ticket.value = created.ticket
  qrcodeUrl.value = created.qrcodeUrl
  wxState.value = 'pending'

  expireTimer = setTimeout(() => {
    clearWechatTimers()
    wxState.value = 'expired'
  }, Math.max(30, created.expireSeconds) * 1000)

  pollTimer = setInterval(async () => {
    if (!ticket.value) return
    const st = await pollWechatQr(ticket.value)
    if (st.status === 'scanned') {
      wxState.value = 'scanned'
      return
    }
    if (st.status === 'expired') {
      clearWechatTimers()
      wxState.value = 'expired'
      return
    }
    if (st.status === 'confirmed' && st.accessToken) {
      clearWechatTimers()
      const ok = await loginWithToken(st.accessToken, st.account || '微信用户', st.brands)
      if (ok === true) {
        close()
        goDash()
      } else {
        wxState.value = 'error'
        wxMessage.value = ok
      }
    }
  }, 2000)
}

watch(isOpen, (open) => {
  if (open) {
    account.value = ''
    password.value = ''
    error.value = ''
    if (tab.value === 'wechat') refreshWechat()
  } else {
    clearWechatTimers()
    wxState.value = 'idle'
    qrcodeUrl.value = ''
    ticket.value = ''
  }
})

watch(tab, (next) => {
  if (!isOpen.value) return
  if (next === 'wechat') refreshWechat()
  else clearWechatTimers()
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
  clearWechatTimers()
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
  background: rgba(22, 22, 26, 0.48);
  backdrop-filter: blur(4px);
}
.auth-card {
  position: relative;
  width: min(100%, 400px);
  padding: 1.75rem 1.5rem 1.35rem;
  border-radius: 16px;
  border: 1px solid #ececef;
  background: #fff;
  color: #16161a;
  box-shadow: 0 20px 50px rgba(22, 22, 26, 0.16);
  font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif;
}
.auth-close {
  position: absolute;
  top: 0.75rem;
  right: 0.85rem;
  border: 0;
  background: transparent;
  font-size: 1.35rem;
  line-height: 1;
  color: #9b97a3;
  cursor: pointer;
}
.auth-title {
  margin: 0 0 0.35rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.auth-sub {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  color: #6e6a76;
  line-height: 1.5;
}
.auth-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 1.1rem;
  border-radius: 12px;
  background: #f7f7f8;
}
.auth-tabs button {
  flex: 1;
  border: 0;
  border-radius: 10px;
  padding: 0.55rem 0.5rem;
  background: transparent;
  color: #6e6a76;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 650;
  cursor: pointer;
}
.auth-tabs button.on {
  background: #fff;
  color: #16161a;
  box-shadow: inset 0 0 0 1px #f0c9b0;
}
.wx-pane {
  text-align: center;
}
.wx-frame {
  display: grid;
  place-items: center;
  width: 196px;
  height: 196px;
  margin: 0 auto 0.85rem;
  border-radius: 14px;
  background: #f7f7f8;
  box-shadow: inset 0 0 0 1px #ececef;
  overflow: hidden;
}
.wx-frame.dim { opacity: 0.55; }
.wx-frame img {
  width: 180px;
  height: 180px;
  object-fit: contain;
  background: #fff;
}
.wx-placeholder {
  color: #07c160;
}
.wx-hint {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #6e6a76;
  line-height: 1.5;
}
.auth-link {
  border: 0;
  background: transparent;
  color: #c2410c;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 650;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  margin-bottom: 0.75rem;
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
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #ececef;
  background: #fff;
  font-size: 0.875rem;
  outline: none;
  box-sizing: border-box;
}
.auth-input:focus {
  border-color: #f0c9b0;
  box-shadow: 0 0 0 3px rgba(194, 65, 12, 0.1);
}
.auth-error {
  margin: -0.35rem 0 0.75rem;
  font-size: 0.8125rem;
  color: #dc2626;
}
.auth-submit {
  width: 100%;
  margin-top: 0.15rem;
  height: 42px;
  border-radius: 999px;
  background: #16161a;
  color: #fff;
  border: 0;
}
.auth-submit:hover { background: #2a2a30; }
.auth-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.auth-agree {
  margin: 0.9rem 0 0;
  font-size: 0.6875rem;
  color: #9b97a3;
  line-height: 1.5;
  text-align: center;
}
.auth-agree a {
  color: #c2410c;
  text-decoration: none;
}
.auth-agree a:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
