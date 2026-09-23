<template>
  <input
    ref="el"
    type="date"
    :value="modelValue ?? ''"
    :min="min"
    :max="max"
    class="dash-date-input cursor-pointer"
    @input="onInput"
    @change="onChange"
    @click="openPicker"
    @keydown.enter.prevent="openPicker"
    @keydown.space.prevent="openPicker"
  />
</template>

<script setup lang="ts">
/**
 * 原生 date input：点击日期文字也会展开日历。
 * - Chromium/WebKit：用 ::-webkit-calendar-picker-indicator 铺满整框
 * - 其它浏览器：click 时调 showPicker()
 */
import { ref } from 'vue';

defineProps<{ modelValue?: string; min?: string; max?: string }>();
const emit = defineEmits<{
  'update:modelValue': [string];
  change: [Event];
}>();
const el = ref<HTMLInputElement | null>(null);

function onInput(ev: Event) {
  emit('update:modelValue', (ev.target as HTMLInputElement).value);
}

function onChange(ev: Event) {
  emit('change', ev);
}

function openPicker() {
  const input = el.value;
  if (!input || input.disabled || input.readOnly) return;
  const anyInput = input as HTMLInputElement & { showPicker?: () => void };
  try {
    if (typeof anyInput.showPicker === 'function') anyInput.showPicker();
  } catch {
    // 已由原生 indicator 打开时可能抛错，忽略
  }
}
</script>

<style scoped>
.dash-date-input {
  position: relative;
}
/* 把右侧小图标的可点区域扩到整个输入框，点文字也能弹出 */
.dash-date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: auto;
  height: auto;
  color: transparent;
  background: transparent;
  cursor: pointer;
}
</style>
