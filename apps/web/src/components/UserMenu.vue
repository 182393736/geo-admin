<template>
  <!-- 目标站 geo.timus.cn 左下角用户菜单（像素级复刻） -->
  <teleport to="body">
    <transition name="um-pop">
      <div v-if="open" ref="popoverRef" class="um-popover" role="menu">
        <!-- 头部：品牌名 + 账号 + 服务品牌数 + 状态徽标 -->
        <div class="um-head">
          <div class="um-avatar">{{ brandInitial }}</div>
          <div class="um-head-text">
            <div class="um-brand-name">{{ brandName }}</div>
            <div class="um-account-line">{{ accountText }}</div>
          </div>
          <span v-if="statusBadge" class="um-badge" :class="`um-badge--${statusBadge.tone}`">
            {{ statusBadge.text }}
          </span>
        </div>

        <!-- 菜单组 1 -->
        <div class="um-group">
          <button class="um-item" type="button" @click="goBilling">
            <span class="um-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </span>
            <span class="um-label">计费与套餐</span>
          </button>
          <button class="um-item" type="button" @click="goProfile">
            <span class="um-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="um-label">个人资料</span>
          </button>
          <button class="um-item" type="button" @click="contactSupport">
            <span class="um-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            </span>
            <span class="um-label">联系客服</span>
          </button>
        </div>

        <!-- 菜单组 2：退出 -->
        <div class="um-group um-group--divider">
          <button class="um-item um-item--danger" type="button" @click="doLogout">
            <span class="um-icon um-icon--danger">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </span>
            <span class="um-label um-label--danger">退出登录</span>
          </button>
        </div>
      </div>
    </transition>
    <!-- 遮罩：点击空白关闭 -->
    <div v-if="open" class="um-mask" @click="open = false" />
  </teleport>

  <!-- 触发按钮（内嵌侧边栏底部） -->
  <button
    ref="triggerRef"
    class="avatar-btn"
    type="button"
    :aria-expanded="open"
    aria-label="用户菜单"
    @click="toggle"
  >
    <div class="avatar-circle">{{ avatarText }}</div>
  </button>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const open = ref(false);
const popoverRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

/* ===== 数据 ===== */
const brand = computed(() => auth.activeBrand ?? auth.brands?.[0] ?? null);
const brandName = computed(() => brand.value?.name || '我的账户');
const brandInitial = computed(() =>
  (brand.value?.name || '账号').replace(/\s+/g, '').slice(0, 1) || '账号');
const accountText = computed(() => {
  const acc = auth.user?.username || auth.user?.id || '';
  const n = auth.brands?.length ?? 0;
  return n > 0 ? `${acc} · 服务 ${n} 个品牌` : acc || '账号';
});
const avatarText = computed(() => {
  // 目标站显示账号前两位数字（如 18）；字母首字符退化
  const u = (auth.user?.username || '').trim();
  if (/^\d/.test(u)) return u.slice(0, 2);
  return (u.slice(0, 2) || '我').toUpperCase();
});
const statusBadge = computed(() => {
  const status = (brand.value as any)?.status;
  if (!status || status === 'active') return null;
  if (status === 'expired') return { text: '过期', tone: 'red' };
  if (status === 'building') return { text: '初始化', tone: 'amber' };
  return { text: '已停用', tone: 'gray' };
});

/* ===== 行为 ===== */
function toggle() { open.value = !open.value; }
function close() { open.value = false; }

function goBilling() { close(); router.push('/dashboard/plan-upgrade'); }
function goProfile() { close(); router.push('/dashboard/profile'); }
function contactSupport() { close(); router.push('/dashboard/support'); }
async function doLogout() {
  close();
  try { await auth.logout(); } finally { router.push('/login'); }
}

/* 点击外部 / Esc 关闭 */
function onDocClick(e: MouseEvent) {
  const t = e.target as Node;
  if (popoverRef.value?.contains(t) || triggerRef.value?.contains(t)) return;
  close();
}
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
onMounted(() => {
  document.addEventListener('mousedown', onDocClick, true);
  document.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick, true);
  document.removeEventListener('keydown', onKey);
});
</script>

<style scoped lang="scss">
/* ============ 触发按钮（左下角 40px 圆按钮） ============ */
.avatar-btn {
  width: 40px; height: 40px; padding: 4px;
  border-radius: 10px;
  border: none; background: transparent; cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: #f9fafb; }
}
.avatar-circle {
  width: 32px; height: 32px; border-radius: 9999px;
  /* 目标站 from-gray-200 to-gray-300（lucide 渐变） */
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  color: #4b5563;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  font-variant-numeric: tabular-nums;
}

/* ============ 弹框 ============ */
.um-mask { position: fixed; inset: 0; z-index: 999; }   /* 空遮罩用于点外关闭 */

.um-popover {
  position: fixed;
  left: 92px;          /* 目标站 class: fixed left-[92px] */
  bottom: 16px;        /* bottom-4 */
  width: 260px;        /* w-[260px] */
  background: #fff;
  border: 1px solid #e5e7eb;      /* border-gray-200 */
  border-radius: 12px;            /* rounded-xl */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.10),
              0 8px 10px -6px rgba(0, 0, 0, 0.10);   /* shadow-xl */
  overflow: hidden;
  z-index: 1000;
}

/* ---------- 头部 ---------- */
.um-head {
  padding: 14px 16px;                       /* px-4 py-3.5 = 14px 16px */
  border-bottom: 1px solid #f3f4f6;          /* border-gray-100 */
  display: flex; align-items: center; gap: 12px;
}
.um-avatar {
  width: 36px; height: 36px;                 /* w-9 h-9 */
  border-radius: 9px;                        /* rounded-[9px] */
  background: linear-gradient(to top right, #6366f1, #8b5cf6);  /* from-indigo-500 to-violet-500 */
  color: #fff; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.um-head-text { flex: 1; min-width: 0; }
.um-brand-name {
  font-size: 13px; font-weight: 700; color: #111827;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.um-account-line {
  font-size: 11px; color: #9ca3af;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.um-badge {
  font-size: 10px; font-weight: 700;
  padding: 1px 6px;                          /* px-1.5 py-[1px] */
  border-radius: 4px; border: 1px solid;
  line-height: 1; flex-shrink: 0;
}
.um-badge--red    { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.um-badge--amber  { background: #fffbeb; color: #d97706; border-color: #fde68a; }
.um-badge--gray   { background: #f3f4f6; color: #6b7280; border-color: #e5e7eb; }

/* ---------- 菜单组 ---------- */
.um-group { padding: 8px 0; }                          /* py-2 */
.um-group--divider { border-top: 1px solid #f3f4f6; }  /* border-t border-gray-100 */

.um-item {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 6px 14px;                                    /* px-3.5 py-1.5 */
  background: transparent; border: none; cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;
  &:hover { background: #f9fafb; }
}
.um-icon {
  width: 24px; height: 24px; border-radius: 6px;
  background: #f3f4f6; color: #6b7280;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.um-label { font-size: 12.5px; font-weight: 600; color: #111827; line-height: 1.2; }

.um-item--danger:hover { background: #fef2f2; }
.um-icon--danger { background: #fef2f2; color: #ef4444; }
.um-label--danger { color: #dc2626; }

/* ---------- 弹入动画（对齐 animate-in fade-in slide-in-from-left-*） ---------- */
.um-pop-enter-active,
.um-pop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.um-pop-enter-from,
.um-pop-leave-to     { opacity: 0; transform: translateX(-4px); }
</style>
