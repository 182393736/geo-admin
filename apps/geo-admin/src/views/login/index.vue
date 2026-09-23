<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">
        <span class="logo-icon">◉</span>
        <span class="logo-text">GEO 管理总后台</span>
      </div>
      <h1 class="title">管理员登录</h1>
      <p class="subtitle">仅限平台运营管理员账号（is_superuser）</p>
      <form @submit.prevent="handleSubmit">
        <a-input v-model="account" placeholder="管理员账号" size="large" allow-clear class="field" />
        <a-input-password v-model="password" placeholder="密码" size="large" class="field" />
        <p v-if="errMsg" class="err-msg">{{ errMsg }}</p>
        <a-button type="primary" html-type="submit" long size="large" :loading="submitting" class="submit">
          登录
        </a-button>
      </form>
      <p class="hint">本地默认管理员：123456 / 123456</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();
const account = ref('');
const password = ref('');
const errMsg = ref('');
const submitting = ref(false);

async function handleSubmit() {
  if (!account.value || !password.value) return;
  errMsg.value = '';
  submitting.value = true;
  try {
    await auth.login(account.value.trim(), password.value);
    router.push('/overview');
  } catch (e: any) {
    errMsg.value = e?.message || '登录失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.login-page {
  height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #eef2ff 0%, #f4f6fb 60%, #e0e7ff 100%);
}
.login-card {
  width: 380px; background: #fff; border-radius: 14px; padding: 32px 34px;
  box-shadow: 0 8px 40px rgba(67, 56, 202, 0.12);
}
.logo { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
.logo-icon { color: #4338ca; font-size: 22px; }
.logo-text { font-weight: 700; color: #1f2430; }
.title { font-size: 22px; margin: 0 0 4px; color: #1f2430; }
.subtitle { font-size: 13px; color: #6b7280; margin: 0 0 20px; }
.field { margin-bottom: 14px; }
.err-msg { color: #ef4444; font-size: 13px; margin: 4px 0 8px; }
.submit { margin-top: 4px; }
.hint { font-size: 12px; color: #9ca3af; margin: 14px 0 0; text-align: center; }
</style>
