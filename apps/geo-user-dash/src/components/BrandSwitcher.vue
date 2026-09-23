<template>
  <div class="brand-switcher" ref="rootRef">
    <button
      type="button"
      class="bs-trigger"
      :title="currentName"
      :aria-expanded="open"
      aria-haspopup="listbox"
      aria-label="切换品牌"
      @click.stop="open = !open"
    >
      <div class="bs-avatar" :style="{ background: avatarColor(currentName) }">
        {{ initial }}
        <span class="bs-avatar-shine" aria-hidden="true" />
      </div>
      <svg
        class="bs-chevron"
        :class="{ 'bs-chevron--open': open }"
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <teleport to="body">
      <div v-if="open" class="bs-mask" @click="open = false" />
      <transition name="bs-pop">
        <div v-if="open" ref="panelRef" class="bs-panel" role="listbox">
          <div class="bs-actions">
            <button type="button" class="bs-action" @click="onAdd">
              <span class="bs-action-ic bs-action-ic--add">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </span>
              <span class="bs-action-label">添加新品牌</span>
              <svg class="bs-action-arrow bs-action-arrow--add" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <button type="button" class="bs-action" @click="onEdit">
              <span class="bs-action-ic bs-action-ic--edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
              </span>
              <span class="bs-action-label">编辑品牌信息</span>
              <svg class="bs-action-arrow bs-action-arrow--edit" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>

          <div class="bs-list">
            <button
              v-for="b in auth.brands"
              :key="b.brand_id"
              type="button"
              class="bs-item"
              :class="{
                'bs-item--active': b.brand_id === auth.activeBrandId,
                'bs-item--expired': isExpired(b),
              }"
              role="option"
              :aria-selected="b.brand_id === auth.activeBrandId"
              @click="onSelect(b.brand_id)"
            >
              <span
                class="bs-item-av"
                :class="{ 'bs-item-av--expired': isExpired(b) }"
                :style="{ background: avatarColor(b.name) }"
              >{{ (b.name || '?').slice(0, 1) }}</span>
              <span class="bs-item-text">
                <span class="bs-item-row">
                  <span class="bs-item-name" :class="{ 'bs-item-name--muted': isExpired(b) }">{{ b.name }}</span>
                  <span class="bs-badge" :class="badgeClass(b)">{{ badgeText(b) }}</span>
                </span>
                <span v-if="!isExpired(b) && remainDays(b) != null" class="bs-remain" :class="{ 'bs-remain--urgent': (remainDays(b) ?? 99) <= 7 }">
                  还剩{{ remainDays(b) }}天
                </span>
              </span>
            </button>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { siteTrialUrl } from '@/utils/site';
import type { BrandBrief } from '@/api/types';

const auth = useAuthStore();
const router = useRouter();
const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const currentName = computed(() => auth.activeBrand?.name || auth.brands[0]?.name || '品牌');
const initial = computed(() => (currentName.value || '?').slice(0, 1));

const AVATAR_PALETTE = [
  '#1f4fb7', '#0f6e56', '#1a1a2e', '#7c3aed', '#b45309',
  '#0e7490', '#be123c', '#4338ca', '#047857', '#9a3412',
];

function avatarColor(name: string) {
  const s = String(name || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function remainDays(b: BrandBrief): number | null {
  const raw = b.vip_expire_date;
  if (!raw) return null;
  const t = new Date(raw).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

function isExpired(b: BrandBrief) {
  if (b.status === 'expired') return true;
  const d = remainDays(b);
  return d != null && d < 0;
}

const PLAN_SHORT: Record<string, string> = {
  free: '入门',
  starter: '入门',
  basic: '基础',
  pro: '专业',
  custom: '定制',
};

function badgeText(b: BrandBrief) {
  if (isExpired(b)) return '过期';
  return PLAN_SHORT[b.vip_level] || PLAN_SHORT[b.vip_plan_code] || '入门';
}

function badgeClass(b: BrandBrief) {
  if (isExpired(b)) return 'bs-badge--expired';
  const lv = b.vip_level || 'free';
  if (lv === 'pro') return 'bs-badge--pro';
  if (lv === 'custom') return 'bs-badge--custom';
  return 'bs-badge--starter';
}

function positionPanel() {
  const panel = panelRef.value;
  if (!panel) return;
  // 对标站: fixed left-[92px] top-4 w-[280px]（第一栏 80px + 间隙）
  panel.style.left = '92px';
  panel.style.top = '16px';
}

watch(open, async (v) => {
  if (!v) return;
  await nextTick();
  positionPanel();
});

function onSelect(brandId: string) {
  open.value = false;
  if (brandId === auth.activeBrandId) return;
  auth.switchBrand(brandId);
}

function onAdd() {
  open.value = false;
  window.location.assign(siteTrialUrl(auth.token, { from: 'add_brand' }));
}

function onEdit() {
  open.value = false;
  router.push('/dashboard/brand-card');
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false;
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
.brand-switcher {
  position: relative;
}

.bs-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.bs-trigger:hover {
  background: #f9fafb;
}

.bs-avatar {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  transition: transform 0.15s;
  overflow: hidden;
}

.bs-trigger:hover .bs-avatar {
  transform: scale(1.05);
}

.bs-avatar-shine {
  position: absolute;
  inset: 0;
  border-radius: 9px;
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
}

.bs-chevron {
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.15s;
}

.bs-chevron--open {
  transform: rotate(180deg);
}
</style>

<style>
.bs-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.bs-panel {
  position: fixed;
  z-index: 1000;
  width: 280px;
  max-height: min(480px, 80vh);
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.bs-actions {
  padding: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.bs-action {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s;
}

.bs-action:hover {
  background: #f9fafb;
}

.bs-action-ic {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bs-action-ic--add {
  background: #ecfdf5;
  color: #047857;
}

.bs-action-ic--edit {
  background: #eef2ff;
  color: #4f46e5;
}

.bs-action-label {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  text-align: left;
}

.bs-action-arrow {
  flex-shrink: 0;
  color: #d1d5db;
  transition: color 0.15s, transform 0.15s;
}

.bs-action:hover .bs-action-arrow--add {
  color: #059669;
  transform: translateX(2px);
}

.bs-action:hover .bs-action-arrow--edit {
  color: #4f46e5;
  transform: translateX(2px);
}

.bs-list {
  padding: 4px;
  max-height: 360px;
  overflow-y: auto;
}

.bs-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s;
}

.bs-item:hover {
  background: #f9fafb;
}

.bs-item--active {
  background: rgba(238, 242, 255, 0.8);
}

.bs-item--expired {
  opacity: 0.75;
}

.bs-item-av {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.bs-item-av--expired {
  filter: grayscale(50%);
}

.bs-item-text {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.bs-item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.bs-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.bs-item-name--muted {
  color: #9ca3af;
}

.bs-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid;
  line-height: 1;
  flex-shrink: 0;
}

.bs-badge--starter {
  background: #f0fdfa;
  color: #0f766e;
  border-color: #99f6e4;
}

.bs-badge--pro {
  background: #eef2ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.bs-badge--custom {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.bs-badge--expired {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.bs-remain {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  line-height: 1.2;
}

.bs-remain--urgent {
  color: #ef4444;
}

.bs-pop-enter-active,
.bs-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.bs-pop-enter-from,
.bs-pop-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
