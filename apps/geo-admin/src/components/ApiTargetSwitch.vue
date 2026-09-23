<template>
  <div class="api-target" :title="`当前 API：${store.displayUrl}`">
    <span class="api-target-label">API</span>
    <a-radio-group
      type="button"
      size="small"
      :model-value="store.targetId"
      @change="onChange"
    >
      <a-radio v-for="t in store.targets" :key="t.id" :value="t.id">{{ t.label }}</a-radio>
    </a-radio-group>
  </div>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
import { useApiTargetStore, type ApiTargetId } from '@/stores/apiTarget';
import { useAuthStore } from '@/stores/auth';

const store = useApiTargetStore();
const auth = useAuthStore();
const router = useRouter();

function apply(id: ApiTargetId) {
  store.setTarget(id);
  Message.success(`已切换到${store.target.label}：${store.displayUrl}`);
}

function onChange(id: string | number | boolean) {
  const next = String(id) as ApiTargetId;
  if (next === store.targetId) return;

  if (auth.isAuthenticated) {
    Modal.confirm({
      title: '切换 API 环境',
      content: `切换到「${store.targets.find(t => t.id === next)?.label || next}」后需重新登录（token 不跨环境）。确定继续？`,
      okText: '切换并退出登录',
      onOk: () => {
        apply(next);
        auth.logout();
        router.push('/login');
      },
    });
    return;
  }
  apply(next);
}
</script>

<style scoped lang="scss">
.api-target {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.api-target-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}
</style>
