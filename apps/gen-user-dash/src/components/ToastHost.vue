<template>
  <!-- 主题玻璃风 Toast 容器（顶部居中，按下堆叠） -->
  <teleport to="body">
    <div class="toast-host">
      <transition-group name="toast" tag="div" class="toast-stack">
        <div v-for="t in toastState.list" :key="t.id" class="toast" :class="`toast--${t.type}`" role="status">
          <span class="toast-icon" :class="`toast-icon--${t.type}`">
            <svg v-if="t.type === 'success'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="t.type === 'error'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </span>
          <div class="toast-body">
            <div class="toast-text">{{ t.text }}</div>
            <div v-if="t.desc" class="toast-desc">{{ t.desc }}</div>
          </div>
          <button class="toast-close" type="button" aria-label="关闭" @click="dismissToast(t.id)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { toastState, dismissToast } from '@/lib/toast';
</script>

<style scoped lang="scss">
.toast-host {
  position: fixed; top: 20px; left: 0; right: 0;
  display: flex; justify-content: center;
  z-index: 3000; pointer-events: none;   /* 容器不拦点击，toast 自身可点 */
}
.toast-stack { display: flex; flex-direction: column; gap: 8px; align-items: center; }

.toast {
  pointer-events: auto;
  display: flex; align-items: flex-start; gap: 10px;
  min-width: 260px; max-width: 420px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10);
}

/* 主题渐变紫 —— 成功/info 统一品牌色 */
.toast-icon {
  width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.toast-icon--success {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
}
.toast-icon--error   { background: #fef2f2; color: #ef4444; }
.toast-icon--info    {
  background: linear-gradient(135deg, #818cf8, #a78bfa);
  color: #fff;
}

.toast-body { flex: 1; min-width: 0; }
.toast-text { font-size: 13.5px; font-weight: 600; color: #111827; line-height: 1.35; }
.toast-desc { font-size: 12px; color: #6b7280; margin-top: 2px; line-height: 1.4; }

.toast-close {
  margin-left: 4px; flex-shrink: 0;
  width: 22px; height: 22px; border-radius: 6px;
  border: none; background: transparent; color: #9ca3af; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease;
  &:hover { background: #f3f4f6; color: #374151; }
}

/* 动画：顶部滑入 + 淡出 */
.toast-enter-active, .toast-leave-active { transition: opacity .18s ease, transform .18s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(-8px); }
.toast-move { transition: transform .18s ease; }
</style>
