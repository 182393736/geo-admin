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
      <div class="bs-avatar">{{ initial }}</div>
    </button>

    <teleport to="body">
      <div v-if="open" class="bs-mask" @click="open = false" />
      <transition name="bs-pop">
        <div v-if="open" ref="panelRef" class="bs-panel" role="listbox">
          <div class="bs-panel-title">我的品牌</div>
          <button
            v-for="b in auth.brands"
            :key="b.brand_id"
            type="button"
            class="bs-item"
            :class="{ 'bs-item--active': b.brand_id === auth.activeBrandId }"
            role="option"
            :aria-selected="b.brand_id === auth.activeBrandId"
            @click="onSelect(b.brand_id)"
          >
            <span class="bs-item-av">{{ (b.name || '?').slice(0, 1) }}</span>
            <span class="bs-item-text">
              <span class="bs-item-name">{{ b.name }}</span>
              <span v-if="b.industry" class="bs-item-sub">{{ b.industry }}</span>
            </span>
            <span v-if="b.brand_id === auth.activeBrandId" class="bs-check">✓</span>
          </button>
          <div class="bs-divider" />
          <button type="button" class="bs-item bs-item--add" @click="onAdd">
            <span class="bs-item-av bs-item-av--add">+</span>
            <span class="bs-item-text">
              <span class="bs-item-name">添加品牌</span>
              <span class="bs-item-sub">前往试用页建档</span>
            </span>
          </button>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { siteTrialUrl } from '@/utils/site';

const auth = useAuthStore();
const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const currentName = computed(() => auth.activeBrand?.name || auth.brands[0]?.name || '品牌');
const initial = computed(() => (currentName.value || '?').slice(0, 1));

function positionPanel() {
  const trigger = rootRef.value?.querySelector('.bs-trigger') as HTMLElement | null;
  const panel = panelRef.value;
  if (!trigger || !panel) return;
  const r = trigger.getBoundingClientRect();
  panel.style.left = `${Math.max(8, r.left)}px`;
  panel.style.top = `${r.bottom + 8}px`;
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

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false;
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
.brand-switcher { position: relative; }
.bs-trigger {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
}
.bs-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(145deg, #1f2937, #111827);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.02em;
}
.bs-trigger:hover .bs-avatar { outline: 2px solid #94a3b8; outline-offset: 2px; }
</style>

<style>
.bs-mask {
  position: fixed;
  inset: 0;
  z-index: 1990;
}
.bs-panel {
  position: fixed;
  z-index: 2000;
  width: 260px;
  max-height: min(420px, 70vh);
  overflow: auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.14);
  padding: 8px;
}
.bs-panel-title {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 6px 10px 8px;
}
.bs-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: transparent;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}
.bs-item:hover { background: #f3f4f6; }
.bs-item--active { background: #eff6ff; }
.bs-item-av {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #111827;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bs-item-av--add {
  background: #f3f4f6;
  color: #111827;
  font-size: 18px;
  font-weight: 500;
}
.bs-item-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.bs-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bs-item-sub {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bs-check { color: #2563eb; font-size: 13px; font-weight: 700; }
.bs-divider { height: 1px; background: #e5e7eb; margin: 6px 4px; }
.bs-pop-enter-active, .bs-pop-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.bs-pop-enter-from, .bs-pop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
