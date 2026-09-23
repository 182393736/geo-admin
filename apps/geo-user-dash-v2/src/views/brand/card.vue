<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { brandApi } from '@/api/modules/brand'
import BrandIdentityFields from '@/components/brand/BrandIdentityFields.vue'
import BrandProfileFields from '@/components/brand/BrandProfileFields.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

const form = reactive({
  name: '',
  industry: '',
  protocol: 'https://',
  urlPath: '',
  description: '',
  aliases: [] as string[],
})
const renameRemaining = ref(0)
const loading = ref(true)

function onAliasesUpdate(list: string[]) {
  form.aliases.splice(0, form.aliases.length, ...list)
}

onMounted(async () => {
  loading.value = true
  try {
    const s = await brandApi.summary()
    if (!s) return
    form.name = s.brand?.name || ''
    form.industry = s.brand?.industry || ''
    form.description = s.profile?.description || s.brand?.business_desc || ''
    form.aliases = (s.aliases || []).map((a) => a.alias)
    renameRemaining.value = s.brand?.rename_remaining ?? 0
    const website = s.brand?.website || ''
    if (website.startsWith('http://')) {
      form.protocol = 'http://'
      form.urlPath = website.slice('http://'.length)
    } else if (website.startsWith('https://')) {
      form.protocol = 'https://'
      form.urlPath = website.slice('https://'.length)
    } else {
      form.protocol = 'https://'
      form.urlPath = website
    }
  } catch { /* 拉取失败保持空态 */ }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-[1120px] space-y-6 px-6 py-8">
    <PageHeader
      title="品牌名片"
      :description="loading ? '加载中…' : '品牌身份与基础信息 · 监控统计、AI 写稿、洞察分析时调用'"
    />

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">识别词</CardTitle>
        <CardDescription>正式名与相似识别词，决定监控与统计如何归并</CardDescription>
      </CardHeader>
      <CardContent>
        <BrandIdentityFields
          v-model:name="form.name"
          :aliases="form.aliases"
          v-model:rename-remaining="renameRemaining"
          @update:aliases="onAliasesUpdate"
        />
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">基础信息</CardTitle>
        <CardDescription>行业、官网与简介失焦后自动保存</CardDescription>
      </CardHeader>
      <CardContent>
        <BrandProfileFields
          v-model:industry="form.industry"
          v-model:protocol="form.protocol"
          v-model:url-path="form.urlPath"
          v-model:description="form.description"
        />
      </CardContent>
    </Card>
  </div>
</template>
