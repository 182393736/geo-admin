<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: unknown
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const mode = defineModel<'form' | 'json'>('mode', { default: 'form' })

const jsonText = ref('')
const jsonError = ref('')
const dirty = ref(false)

function reload() {
  jsonText.value = JSON.stringify(props.modelValue ?? null, null, 2)
  jsonError.value = ''
  dirty.value = false
}

function flush() {
  if (mode.value !== 'json') return true
  try {
    const text = jsonText.value.trim()
    emit('update:modelValue', text ? JSON.parse(text) : null)
    jsonError.value = ''
    dirty.value = false
    return true
  } catch {
    jsonError.value = 'JSON 格式不正确'
    return false
  }
}

function onModeChange(next: string | number | boolean) {
  if (next === mode.value) return
  if (next === 'json') {
    reload()
    mode.value = 'json'
    return
  }
  if (!flush()) return
  mode.value = 'form'
}

watch(
  () => props.modelValue,
  () => {
    if (mode.value === 'json' && !dirty.value) reload()
  },
)

onMounted(() => {
  if (mode.value === 'json') reload()
})

defineExpose({ flush, reload })
</script>

<template>
  <div class="form-json-switch">
    <div class="mode-bar">
      <el-radio-group :model-value="mode" size="small" @change="onModeChange">
        <el-radio-button label="form">可视化</el-radio-button>
        <el-radio-button label="json">JSON</el-radio-button>
      </el-radio-group>
      <slot name="actions" :mode="mode" />
    </div>

    <p v-if="jsonError" class="json-error">{{ jsonError }}</p>

    <div v-show="mode === 'form'">
      <slot />
    </div>
    <el-input
      v-show="mode === 'json'"
      :model-value="jsonText"
      type="textarea"
      :rows="22"
      class="json-input"
      placeholder="JSON"
      @update:model-value="(v: string) => { jsonText = v; dirty = true; jsonError = '' }"
    />
  </div>
</template>

<style scoped>
.mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.json-error {
  margin: 0 0 8px;
  color: var(--el-color-danger);
  font-size: 12px;
}

.json-input :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
}
</style>
