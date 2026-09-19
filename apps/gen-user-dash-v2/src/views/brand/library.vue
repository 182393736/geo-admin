<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Pencil, Tags, Search } from 'lucide-vue-next'
import { brandApi } from '@/api/modules/brand'
import BrandIdentityFields from '@/components/brand/BrandIdentityFields.vue'
import BrandProfileFields from '@/components/brand/BrandProfileFields.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

type PanelMode = 'none' | 'alias' | 'edit'

const brandName = ref('')
const industry = ref('')
const protocol = ref('https://')
const urlPath = ref('')
const description = ref('')
const website = ref('')
const products = reactive<{ name: string }[]>([])
const aliases = reactive<string[]>([])
const renameRemaining = ref(0)
const panelMode = ref<PanelMode>('none')
const search = ref('')
const activeTab = ref<'all' | 'doc' | 'link' | 'text'>('all')
const loading = ref(true)

const tabs = [
  { key: 'all' as const, label: '全部' },
  { key: 'doc' as const, label: '文档' },
  { key: 'link' as const, label: '链接' },
  { key: 'text' as const, label: '文本' },
]

const brandMark = computed(() => {
  const n = (brandName.value || '').trim()
  return n ? n.slice(0, 1) : '品'
})

const heroDesc = computed(() => {
  if (products.length) return products.map((p) => p.name).filter(Boolean).join('、')
  return '完善品牌档案，让 AI 更准确地理解你的品牌与业务。'
})

function togglePanel(mode: Exclude<PanelMode, 'none'>) {
  panelMode.value = panelMode.value === mode ? 'none' : mode
}

function onAliasesUpdate(list: string[]) {
  aliases.splice(0, aliases.length, ...list)
}

function splitWebsite(wRaw: string) {
  const w = (wRaw || '').trim()
  website.value = w
  if (w.startsWith('http://')) {
    protocol.value = 'http://'
    urlPath.value = w.slice('http://'.length)
  } else if (w.startsWith('https://')) {
    protocol.value = 'https://'
    urlPath.value = w.slice('https://'.length)
  } else {
    protocol.value = 'https://'
    urlPath.value = w
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const s = await brandApi.summary()
    if (!s) return
    brandName.value = s.brand?.name || ''
    industry.value = s.brand?.industry || ''
    description.value = s.profile?.description || s.brand?.business_desc || ''
    renameRemaining.value = s.brand?.rename_remaining ?? 0
    splitWebsite(s.brand?.website || '')
    products.splice(0, products.length, ...(s.products || []).map((p) => ({ name: p.name })))
    aliases.splice(0, aliases.length, ...(s.aliases || []).map((a) => a.alias))
  } catch { /* 空态兜底 */ }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-[1120px] space-y-6 px-6 py-8">
    <PageHeader title="品牌档案" description="品牌档案与参考资料 · 写稿、问答、洞察分析时 AI 自动调用">
      <template #actions>
        <Button>
          <Plus class="h-4 w-4" />
          添加资料
        </Button>
      </template>
    </PageHeader>

    <Card class="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/[0.07] via-card to-sky-50/80 shadow-sm">
      <CardContent class="relative p-5">
        <div
          class="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-primary/[0.06] blur-2xl"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-sky-400/[0.06] blur-2xl"
          aria-hidden="true"
        />
        <div class="relative flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20"
          >
            {{ brandMark }}
          </div>
          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-lg font-semibold">{{ brandName || (loading ? '加载中…' : '未命名品牌') }}</span>
              <Badge class="border-transparent bg-emerald-100 text-emerald-800">已认证</Badge>
            </div>
            <div class="flex flex-wrap gap-2">
              <Badge v-if="industry" variant="secondary">{{ industry }}</Badge>
              <Badge v-if="website" variant="outline">{{ website.replace(/^https?:\/\//, '') }}</Badge>
              <Badge variant="outline">{{ aliases.length }} 个识别词</Badge>
              <Badge variant="outline">{{ products.length }} 个产品</Badge>
            </div>
            <p class="text-sm text-muted-foreground">{{ heroDesc }}</p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              :variant="panelMode === 'alias' ? 'default' : 'outline'"
              @click="togglePanel('alias')"
            >
              <Tags class="h-3.5 w-3.5" />
              {{ panelMode === 'alias' ? '收起识别名' : '识别名管理' }}
            </Button>
            <Button
              type="button"
              size="sm"
              :variant="panelMode === 'edit' ? 'default' : 'outline'"
              @click="togglePanel('edit')"
            >
              <Pencil class="h-3.5 w-3.5" />
              {{ panelMode === 'edit' ? '收起编辑' : '编辑档案' }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card v-if="panelMode === 'alias'">
      <CardHeader class="pb-3">
        <CardTitle class="text-base">识别名管理</CardTitle>
        <CardDescription>维护识别词与相似说法，决定 AI 回答里哪些算作你的品牌</CardDescription>
      </CardHeader>
      <CardContent>
        <BrandIdentityFields
          v-model:name="brandName"
          :aliases="aliases"
          v-model:rename-remaining="renameRemaining"
          @update:aliases="onAliasesUpdate"
        />
      </CardContent>
    </Card>

    <Card v-else-if="panelMode === 'edit'">
      <CardHeader class="pb-3">
        <CardTitle class="text-base">编辑档案</CardTitle>
        <CardDescription>行业、官网与简介失焦后自动保存</CardDescription>
      </CardHeader>
      <CardContent>
        <BrandProfileFields
          v-model:industry="industry"
          v-model:protocol="protocol"
          v-model:url-path="urlPath"
          v-model:description="description"
        />
      </CardContent>
    </Card>

    <Card>
      <CardContent class="space-y-4 p-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="inline-flex rounded-lg bg-secondary p-0.5">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              :class="
                cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm transition-colors',
                  activeTab === tab.key
                    ? 'bg-background font-medium text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )
              "
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
              <span class="text-xs tabular-nums text-muted-foreground">0</span>
            </button>
          </div>
          <div class="relative ml-auto w-full max-w-xs">
            <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="search" class="pl-8" placeholder="搜索资料…" />
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            class="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center transition-colors hover:bg-accent"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-lg border bg-background">
              <Plus class="h-4 w-4 text-muted-foreground" />
            </div>
            <div class="text-sm font-medium">添加更多资料</div>
            <div class="text-xs text-muted-foreground">PDF / URL / 文本</div>
          </button>
        </div>

        <div class="rounded-lg border border-dashed px-4 py-10 text-center">
          <div class="text-sm font-medium">品牌资料还是空的</div>
          <div class="mt-1 text-sm text-muted-foreground">点右上角「添加资料」开始上传</div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
