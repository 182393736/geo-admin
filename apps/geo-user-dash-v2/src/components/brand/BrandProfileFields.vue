<template>
  <div class="grid gap-4 md:grid-cols-2">
    <div class="space-y-2">
      <label class="text-sm font-medium">所属行业</label>
      <Input
        v-model="industryLocal"
        placeholder="例如：家电 · 空调"
        @blur="saveIndustry"
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">官网 / 主链接</label>
      <div class="flex gap-2">
        <select
          v-model="protocolLocal"
          class="h-9 rounded-lg border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @change="saveWebsite"
        >
          <option value="https://">https://</option>
          <option value="http://">http://</option>
        </select>
        <Input
          v-model="urlPathLocal"
          class="flex-1"
          placeholder="example.com/path"
          @blur="saveWebsite"
        />
      </div>
    </div>

    <div class="space-y-2 md:col-span-2">
      <label class="text-sm font-medium">品牌简介</label>
      <textarea
        v-model="descriptionLocal"
        rows="4"
        placeholder="一段话描述品牌的背景与定位…"
        class="flex min-h-[96px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @blur="saveDescription"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { brandApi } from '@/api/modules/brand'
import { toast } from '@/lib/toast'
import { Input } from '@/components/ui'

const props = defineProps<{
  industry: string
  protocol: string
  urlPath: string
  description: string
}>()

const emit = defineEmits<{
  'update:industry': [string]
  'update:protocol': [string]
  'update:urlPath': [string]
  'update:description': [string]
}>()

const industryLocal = ref(props.industry)
const protocolLocal = ref(props.protocol || 'https://')
const urlPathLocal = ref(props.urlPath)
const descriptionLocal = ref(props.description)

const savedIndustry = ref(props.industry.trim())
const savedWebsite = ref(joinWebsite(props.protocol, props.urlPath))
const savedDescription = ref(props.description.trim())

let saving = false

watch(
  () => props.industry,
  (v) => {
    if (saving) return
    industryLocal.value = v
    savedIndustry.value = v.trim()
  },
)
watch(
  () => props.protocol,
  (v) => {
    if (saving) return
    protocolLocal.value = v || 'https://'
    savedWebsite.value = joinWebsite(protocolLocal.value, urlPathLocal.value)
  },
)
watch(
  () => props.urlPath,
  (v) => {
    if (saving) return
    urlPathLocal.value = v
    savedWebsite.value = joinWebsite(protocolLocal.value, urlPathLocal.value)
  },
)
watch(
  () => props.description,
  (v) => {
    if (saving) return
    descriptionLocal.value = v
    savedDescription.value = v.trim()
  },
)

function joinWebsite(protocol: string, path: string) {
  const p = (path || '').trim()
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  return `${protocol || 'https://'}${p}`
}

function splitIndustry(raw: string): string[] {
  return String(raw || '')
    .split(/[·•、,，|/]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatIndustry(list: string[]) {
  return list.join(' · ')
}

async function persist(patch: { industry?: string[]; website?: string; description?: string }) {
  saving = true
  try {
    const data = await brandApi.patchIntro(patch)
    if (patch.industry) {
      const next = formatIndustry(data.industry || patch.industry)
      industryLocal.value = next
      savedIndustry.value = next
      emit('update:industry', next)
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'website')) {
      const website = data.website || ''
      savedWebsite.value = website
      if (website.startsWith('http://')) {
        protocolLocal.value = 'http://'
        urlPathLocal.value = website.slice('http://'.length)
      } else if (website.startsWith('https://')) {
        protocolLocal.value = 'https://'
        urlPathLocal.value = website.slice('https://'.length)
      } else {
        urlPathLocal.value = website
      }
      emit('update:protocol', protocolLocal.value)
      emit('update:urlPath', urlPathLocal.value)
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'description')) {
      const next = data.description || ''
      descriptionLocal.value = next
      savedDescription.value = next.trim()
      emit('update:description', next)
    }
  } catch (e: any) {
    toast.error(e?.message || '保存失败')
  } finally {
    saving = false
  }
}

async function saveIndustry() {
  const next = industryLocal.value.trim()
  emit('update:industry', industryLocal.value)
  if (next === savedIndustry.value) return
  await persist({ industry: splitIndustry(next) })
}

async function saveWebsite() {
  emit('update:protocol', protocolLocal.value)
  emit('update:urlPath', urlPathLocal.value)
  const next = joinWebsite(protocolLocal.value, urlPathLocal.value)
  if (next === savedWebsite.value) return
  await persist({ website: next })
}

async function saveDescription() {
  const next = descriptionLocal.value.trim()
  emit('update:description', descriptionLocal.value)
  if (next === savedDescription.value) return
  await persist({ description: next })
}
</script>
