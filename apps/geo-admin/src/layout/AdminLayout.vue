<template>
  <a-layout class="admin-layout">
    <a-layout-sider :collapsed="collapsed" :width="208" collapsible @collapse="collapsed = !collapsed" class="sider">
      <div class="brand">
        <span class="brand-icon">◉</span>
        <span v-if="!collapsed" class="brand-text">GEO 管理总后台</span>
      </div>
      <a-menu :selected-keys="[activeKey]" @menu-item-click="onMenu" class="menu">
        <a-menu-item v-for="m in menus" :key="m.path">{{ m.icon }} {{ m.label }}</a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <span class="crumb">GEO 平台 · {{ currentTitle }}</span>
        </div>
        <div class="header-right">
          <a-tag color="arcoblue" v-if="auth.admin">管理员 · {{ auth.admin.account }}</a-tag>
          <a-button size="small" @click="logout">退出登录</a-button>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const collapsed = ref(false);

const menus = [
  { path: '/overview', label: '运营驾驶舱', icon: '📊' },
  { path: '/users', label: '用户管理', icon: '👥' },
  { path: '/brands', label: '品牌管理', icon: '🏷️' },
  { path: '/collect', label: '采集监控', icon: '📡' },
  { path: '/parse', label: '解析监控', icon: '🧩' },
  { path: '/pipeline', label: '流水线时间轴', icon: '⏱️' },
  { path: '/llm', label: 'LLM 调用', icon: '🤖' },
  { path: '/billing', label: '计费中心', icon: '💰' },
  { path: '/content', label: '内容与发稿', icon: '📰' },
  { path: '/reports', label: '报告中心', icon: '📄' },
  { path: '/onboarding', label: '首登漏斗', icon: '🛬' },
  { path: '/behavior', label: '行为埋点', icon: '🖱️' },
  { path: '/diagnosis', label: '诊断任务', icon: '🔬' },
  { path: '/agent', label: 'Agent 会话', icon: '💬' },
  { path: '/reminders', label: '站内消息', icon: '🔔' },
  { path: '/system', label: '系统观测', icon: '🛠️' },
];

const activeKey = computed(() => '/' + (route.path.split('/')[1] || 'overview'));
const currentTitle = computed(() => (route.meta.title as string) || '');

function onMenu(key: string) {
  router.push(key);
}

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped lang="scss">
.admin-layout { height: 100vh; }
.sider {
  background: #fff;
  border-right: 1px solid #eef0f5;
}
.brand {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 18px; font-weight: 700; color: #1f2430; font-size: 15px;
  white-space: nowrap; overflow: hidden;
}
.brand-icon { color: #4338ca; font-size: 18px; }
.menu {
  background: transparent;
  width: 100%;
}
.header {
  height: 52px; background: #fff; border-bottom: 1px solid #eef0f5;
  display: flex; align-items: center; justify-content: space-between; padding: 0 20px;
}
.header-left .crumb { font-size: 14px; color: #6b7280; }
.header-right { display: flex; align-items: center; gap: 10px; }
.content {
  padding: 0; overflow: auto; background: #f4f6fb;
}
</style>
