<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="shared-auth-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shared-auth-title"
      @click.self="close"
    >
      <div class="shared-auth-card">
        <button class="shared-auth-close" type="button" aria-label="关闭" @click="close">×</button>

        <aside class="shared-auth-promo" aria-hidden="true">
          <span class="shared-auth-promo-glow"></span>
          <div class="shared-auth-brand">透镜GEO</div>
          <h3>立即掌握你的品牌<br>在 <span>AI 助手</span>的表现</h3>
          <p class="shared-auth-promo-copy">全面监测品牌在大模型中的真实排名，掌握 AI 时代的品牌话语权。</p>
          <div class="shared-auth-benefits">
            <div class="shared-auth-benefit">
              <span class="shared-auth-benefit-icon">📊</span>
              <div><b>跨模型实时监测</b><p>豆包、文心一言、通义千问等主流大模型全覆盖</p></div>
            </div>
            <div class="shared-auth-benefit">
              <span class="shared-auth-benefit-icon">🔍</span>
              <div><b>竞品对比分析</b><p>洞察竞品在 AI 中的口碑与排名</p></div>
            </div>
            <div class="shared-auth-benefit">
              <span class="shared-auth-benefit-icon">🛡️</span>
              <div><b>绝对中立查询</b><p>海量账号模拟真实用户搜索</p></div>
            </div>
          </div>
        </aside>

        <div class="shared-auth-panel">
          <h2 class="shared-auth-title" id="shared-auth-title">免费开始分析</h2>
          <p class="shared-auth-subtitle">登录后，透镜营销智能体将立即为您启动品牌分析，全程免费。</p>

          <div class="shared-auth-tabs">
            <button type="button" :class="{ active: tab === 'phone' }" @click="tab = 'phone'">手机验证码</button>
            <button type="button" :class="{ active: tab === 'password' }" @click="tab = 'password'">账号密码</button>
          </div>

          <!-- 手机验证码 -->
          <template v-if="tab === 'phone'">
            <label class="shared-auth-label" for="shared-auth-phone">手机号</label>
            <div class="shared-auth-phone-field">
              <span class="shared-auth-country">🇨🇳 +86</span>
              <input
                id="shared-auth-phone"
                v-model="phone"
                class="shared-auth-input"
                type="tel"
                inputmode="numeric"
                maxlength="11"
                autocomplete="tel"
                placeholder="输入您的手机号"
                @keyup.enter="onSubmit"
              >
            </div>
            <p v-if="phoneNote" class="shared-auth-phone-note">{{ phoneNote }}</p>
            <p class="shared-auth-agree">
              继续即表示您同意<a href="/terms-of-service" target="_blank" rel="noopener noreferrer">《服务条款》</a>与<a href="/privacy" target="_blank" rel="noopener noreferrer">《隐私政策》</a>
            </p>
          </template>

          <!-- 账号密码（默认） -->
          <template v-else>
            <div class="shared-auth-password-field">
              <label class="shared-auth-label" for="shared-auth-account">账号</label>
              <input
                id="shared-auth-account"
                v-model="account"
                class="shared-auth-input"
                type="text"
                autocomplete="username"
                placeholder="输入账号 / 手机号"
                @keyup.enter="onSubmit"
              >
            </div>
            <div class="shared-auth-password-field">
              <label class="shared-auth-label" for="shared-auth-password">密码</label>
              <input
                id="shared-auth-password"
                v-model="password"
                class="shared-auth-input"
                type="password"
                autocomplete="current-password"
                placeholder="输入密码"
                @keyup.enter="onSubmit"
              >
            </div>
          </template>

          <p v-if="error" class="shared-auth-error">{{ error }}</p>

          <button
            class="shared-auth-submit"
            type="button"
            :disabled="!canSubmit || loading"
            @click="onSubmit"
          >{{ submitText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { isOpen, tab, source, close } = useAuthModal()
const { login } = useAuth()

const account = ref('')
const password = ref('')
const phone = ref('')
const error = ref('')
const loading = ref(false)
const phoneNote = ref('')

const phoneValid = computed(() => /^1\d{10}$/.test(phone.value))
const pwdValid = computed(() => account.value.trim().length > 0 && password.value.length >= 6)
const canSubmit = computed(() => (tab.value === 'phone' ? phoneValid.value : pwdValid.value))

const submitText = computed(() => {
  if (tab.value === 'phone') return '获取验证码 →'
  return loading.value ? '登录中...' : '登录 →'
})

// 每次打开重置输入与提示（tab 保持调用方指定的默认值，默认「账号密码」）
watch(isOpen, (open) => {
  if (open) {
    account.value = ''
    password.value = ''
    phone.value = ''
    error.value = ''
    phoneNote.value = ''
  }
})

async function onSubmit() {
  if (!canSubmit.value || loading.value) return
  error.value = ''

  if (tab.value === 'phone') {
    // 验证码流程：这里只做前端模拟，接真实接口时替换为发送验证码请求
    phoneNote.value = `验证码已发送至 +86 ${phone.value}，请注意查收。`
    return
  }

  loading.value = true
  const res = await login(account.value, password.value)
  loading.value = false
  if (res === true) {
    close()
  } else {
    error.value = res
  }
}

// Esc 关闭 + 打开时锁定滚动
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

// 供调试/埋点：当前唤起来源
defineExpose({ source })
</script>
