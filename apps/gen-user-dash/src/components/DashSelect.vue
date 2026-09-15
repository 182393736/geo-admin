<template>
  <div class="relative" :style="wrapStyle" ref="root">
    <button
      type="button"
      class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-gray-700 shadow-sm transition-all hover:border-indigo-300"
      :class="btnClass"
      @click.stop="toggle"
    >
      <span class="flex min-w-0 items-center gap-2 truncate">
        <span
          v-if="activeColor"
          class="h-2 w-2 shrink-0 rounded-full"
          :style="{ background: activeColor }"
        />
        <span class="truncate">{{ activeLabel }}</span>
      </span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <Teleport to="body">
      <template v-if="open">
        <div class="fixed inset-0 z-[2000]" @click="open = false" />
        <div
          class="fixed z-[2001] max-h-72 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg"
          :class="menuClass"
          :style="menuStyle"
          @click.stop
        >
          <button
            v-for="opt in options"
            :key="String(opt.value)"
            type="button"
            class="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-indigo-50"
            :class="String(opt.value) === String(modelValue) ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-gray-700'"
            @click="pick(opt)"
          >
            <span
              v-if="opt.color"
              class="h-2 w-2 shrink-0 rounded-full"
              :style="{ background: opt.color }"
            />
            <span class="truncate">{{ opt.label }}</span>
          </button>
        </div>
      </template>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';

export type DashSelectOption = {
  value: string | number;
  label: string;
  color?: string;
};

const props = withDefaults(defineProps<{
  modelValue: string | number;
  options: DashSelectOption[];
  minWidth?: string;
  btnClass?: string;
  menuClass?: string;
}>(), {
  minWidth: '130px',
  btnClass: '',
  menuClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [string | number];
  change: [string | number];
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const menuStyle = ref<Record<string, string>>({});

const wrapStyle = computed(() => ({ minWidth: props.minWidth }));
const active = computed(() => props.options.find(o => String(o.value) === String(props.modelValue)));
const activeLabel = computed(() => active.value?.label || String(props.modelValue));
const activeColor = computed(() => active.value?.color);

async function toggle() {
  if (open.value) {
    open.value = false;
    return;
  }
  open.value = true;
  await nextTick();
  const rect = root.value?.getBoundingClientRect();
  if (!rect) return;
  const width = Math.max(rect.width, 160);
  const left = Math.min(rect.left, window.innerWidth - width - 8);
  const menuMax = 288; // max-h-72
  const spaceBelow = window.innerHeight - rect.bottom - 8;
  const spaceAbove = rect.top - 8;
  const openUp = spaceBelow < Math.min(menuMax, 160) && spaceAbove > spaceBelow;
  menuStyle.value = openUp
    ? {
        bottom: `${window.innerHeight - rect.top + 4}px`,
        top: 'auto',
        left: `${Math.max(8, left)}px`,
        width: `${width}px`,
      }
    : {
        top: `${rect.bottom + 4}px`,
        bottom: 'auto',
        left: `${Math.max(8, left)}px`,
        width: `${width}px`,
      };
}

function pick(opt: DashSelectOption) {
  open.value = false;
  if (String(opt.value) === String(props.modelValue)) return;
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
}
</script>
