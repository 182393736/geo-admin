<script setup lang="ts">
import { computed, watch } from 'vue'
import type { PageKind } from '@site-manage/shared'

const props = defineProps<{
  pageKind: PageKind
  modelValue: Record<string, any>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
}>()

const hub = computed({
  get: () => props.modelValue || {},
  set: (v) => emit('update:modelValue', v),
})

function patch(partial: Record<string, any>) {
  hub.value = { ...hub.value, ...partial }
}

function ensureArray(key: string) {
  if (!Array.isArray(hub.value[key])) {
    patch({ [key]: [] })
  }
}

function addSection() {
  ensureArray('sections')
  const sections = [ ...(hub.value.sections || []), { heading: '新章节', paragraphs: [ '' ] } ]
  patch({ sections })
}

function removeSection(i: number) {
  const sections = [ ...(hub.value.sections || []) ]
  sections.splice(i, 1)
  patch({ sections })
}

function addFaq() {
  ensureArray('faq')
  patch({ faq: [ ...(hub.value.faq || []), { q: '', a: '' } ] })
}

function updateSection(si: number, partial: Record<string, unknown>) {
  const sections = [ ...(hub.value.sections || []) ]
  sections[si] = { ...sections[si], ...partial }
  patch({ sections })
}

function updateItem(si: number, ii: number, partial: Record<string, unknown>) {
  const sections = [ ...(hub.value.sections || []) ]
  const items = [ ...(sections[si].items || []) ]
  items[ii] = { ...items[ii], ...partial }
  sections[si] = { ...sections[si], items }
  patch({ sections })
}

function addHomeItem(si: number) {
  const sections = [ ...(hub.value.sections || []) ]
  const items = [ ...(sections[si].items || []), { title: '', description: '' } ]
  sections[si] = { ...sections[si], items }
  patch({ sections })
}

function removeHomeItem(si: number, ii: number) {
  const sections = [ ...(hub.value.sections || []) ]
  const items = [ ...(sections[si].items || []) ]
  items.splice(ii, 1)
  sections[si] = { ...sections[si], items }
  patch({ sections })
}

function removeFaq(i: number) {
  const faq = [ ...(hub.value.faq || []) ]
  faq.splice(i, 1)
  patch({ faq })
}

function addCard() {
  ensureArray('cards')
  patch({ cards: [ ...(hub.value.cards || []), { title: '', description: '', to: '/' } ] })
}

function removeCard(i: number) {
  const cards = [ ...(hub.value.cards || []) ]
  cards.splice(i, 1)
  patch({ cards })
}

function addDimension() {
  ensureArray('dimensions')
  patch({
    dimensions: [ ...(hub.value.dimensions || []), { name: '', left: '', right: '' } ],
  })
}

function removeDimension(i: number) {
  const dimensions = [ ...(hub.value.dimensions || []) ]
  dimensions.splice(i, 1)
  patch({ dimensions })
}

function addStringList(key: string) {
  ensureArray(key)
  patch({ [key]: [ ...(hub.value[key] || []), '' ] })
}

function setStringListItem(key: string, i: number, val: string) {
  const list = [ ...(hub.value[key] || []) ]
  list[i] = val
  patch({ [key]: list })
}

function removeStringListItem(key: string, i: number) {
  const list = [ ...(hub.value[key] || []) ]
  list.splice(i, 1)
  patch({ [key]: list })
}

watch(
  () => props.pageKind,
  () => {
    /* parent resets model on kind change */
  }
)

const showHero = computed(() => props.pageKind === 'home')
const showHubShell = computed(() => props.pageKind === 'hub')
const showLearnLike = computed(() =>
  [ 'learn', 'insight', 'report', 'product', 'solution', 'glossary', 'compare' ].includes(props.pageKind)
)
const showGlossary = computed(() => props.pageKind === 'glossary')
const showProduct = computed(() => props.pageKind === 'product')
const showSolution = computed(() => props.pageKind === 'solution')
const showCompare = computed(() => props.pageKind === 'compare')
const showReport = computed(() => props.pageKind === 'report')
const showPricing = computed(() => props.pageKind === 'pricing')
const showContact = computed(() => props.pageKind === 'contact')

function addChannel() {
  ensureArray('channels')
  patch({
    channels: [
      ...(hub.value.channels || []),
      { id: `ch-${Date.now()}`, label: '', value: '', kind: 'text', note: '' },
    ],
  })
}

function updateChannel(i: number, partial: Record<string, unknown>) {
  const channels = [ ...(hub.value.channels || []) ]
  channels[i] = { ...channels[i], ...partial }
  patch({ channels })
}

function removeChannel(i: number) {
  const channels = [ ...(hub.value.channels || []) ]
  channels.splice(i, 1)
  patch({ channels })
}
</script>

<template>
  <div class="hub-editor">
    <!-- Home hero -->
    <template v-if="showHero">
      <el-divider content-position="left">Hero</el-divider>
      <el-form label-width="100px" size="small">
        <el-form-item label="眉题">
          <el-input :model-value="hub.hero?.eyebrow" @update:model-value="(v: string) => patch({ hero: { ...hub.hero, eyebrow: v } })" />
        </el-form-item>
        <el-form-item label="角标">
          <el-input :model-value="hub.hero?.badge" @update:model-value="(v: string) => patch({ hero: { ...hub.hero, badge: v } })" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input :model-value="hub.hero?.title" @update:model-value="(v: string) => patch({ hero: { ...hub.hero, title: v } })" />
        </el-form-item>
        <el-form-item label="高亮词">
          <el-input :model-value="hub.hero?.titleAccent" @update:model-value="(v: string) => patch({ hero: { ...hub.hero, titleAccent: v } })" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" :rows="3" :model-value="hub.hero?.description" @update:model-value="(v: string) => patch({ hero: { ...hub.hero, description: v } })" />
        </el-form-item>
        <el-form-item label="主 CTA 文案">
          <el-input :model-value="hub.hero?.primaryCta?.label" @update:model-value="(v: string) => patch({ hero: { ...hub.hero, primaryCta: { ...hub.hero?.primaryCta, label: v, to: hub.hero?.primaryCta?.to || '/diagnose' } } })" />
        </el-form-item>
        <el-form-item label="主 CTA 链接">
          <el-input :model-value="hub.hero?.primaryCta?.to" @update:model-value="(v: string) => patch({ hero: { ...hub.hero, primaryCta: { ...hub.hero?.primaryCta, label: hub.hero?.primaryCta?.label || '', to: v } } })" />
        </el-form-item>
      </el-form>
      <el-divider content-position="left">首页区块</el-divider>
      <div v-for="(sec, si) in (hub.sections || [])" :key="sec.id || si" class="block-card">
        <el-form label-width="80px" size="small">
          <el-form-item label="显示">
            <el-switch :model-value="sec.enabled !== false" @update:model-value="(v: boolean) => updateSection(si, { enabled: v })" />
          </el-form-item>
          <el-form-item label="布局">
            <el-select :model-value="sec.layout || 'text'" @update:model-value="(v: string) => updateSection(si, { layout: v })">
              <el-option label="数字条 stats" value="stats" />
              <el-option label="步骤 steps" value="steps" />
              <el-option label="卡片 cards" value="cards" />
              <el-option label="入口 links" value="links" />
              <el-option label="纯文本 text" value="text" />
            </el-select>
          </el-form-item>
          <el-form-item label="眉题">
            <el-input :model-value="sec.eyebrow" @update:model-value="(v: string) => updateSection(si, { eyebrow: v })" />
          </el-form-item>
          <el-form-item label="标题">
            <el-input :model-value="sec.title" @update:model-value="(v: string) => updateSection(si, { title: v })" />
          </el-form-item>
          <el-form-item label="说明">
            <el-input type="textarea" :rows="2" :model-value="sec.description" @update:model-value="(v: string) => updateSection(si, { description: v })" />
          </el-form-item>
        </el-form>
        <div v-for="(item, ii) in (sec.items || [])" :key="ii" class="block-card">
          <el-input size="small" class="mb" placeholder="标题 / 标签" :model-value="item.title || item.label" @update:model-value="(v: string) => updateItem(si, ii, { title: v, label: item.label ? v : item.label })" />
          <el-input v-if="sec.layout === 'stats'" size="small" class="mb" placeholder="数字" :model-value="item.value" @update:model-value="(v: string) => updateItem(si, ii, { value: v })" />
          <el-input size="small" type="textarea" :rows="2" class="mb" placeholder="描述" :model-value="item.description" @update:model-value="(v: string) => updateItem(si, ii, { description: v })" />
          <el-input size="small" class="mb" placeholder="链接" :model-value="item.to" @update:model-value="(v: string) => updateItem(si, ii, { to: v })" />
          <el-button size="small" type="danger" link @click="removeHomeItem(si, ii)">删除条目</el-button>
        </div>
        <el-button size="small" @click="addHomeItem(si)">+ 条目</el-button>
      </div>
    </template>

    <!-- Hub column shell -->
    <template v-if="showHubShell">
      <el-form label-width="100px" size="small">
        <el-form-item label="眉题">
          <el-input :model-value="hub.eyebrow" @update:model-value="(v: string) => patch({ eyebrow: v })" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input :model-value="hub.title" @update:model-value="(v: string) => patch({ title: v })" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" :rows="2" :model-value="hub.description" @update:model-value="(v: string) => patch({ description: v })" />
        </el-form-item>
        <el-form-item label="诊断 CTA">
          <el-switch :model-value="hub.diagnoseCta !== false" @update:model-value="(v: boolean) => patch({ diagnoseCta: v })" />
        </el-form-item>
      </el-form>
      <el-divider content-position="left">入口卡片</el-divider>
      <div v-for="(card, i) in (hub.cards || [])" :key="'c'+i" class="block-card">
        <el-input size="small" placeholder="标题" :model-value="card.title" class="mb" @update:model-value="(v: string) => { const cards=[...hub.cards]; cards[i]={...cards[i],title:v}; patch({cards}) }" />
        <el-input size="small" type="textarea" :rows="2" placeholder="描述" :model-value="card.description" class="mb" @update:model-value="(v: string) => { const cards=[...hub.cards]; cards[i]={...cards[i],description:v}; patch({cards}) }" />
        <el-input size="small" placeholder="链接" :model-value="card.to" class="mb" @update:model-value="(v: string) => { const cards=[...hub.cards]; cards[i]={...cards[i],to:v}; patch({cards}) }" />
        <el-button size="small" type="danger" link @click="removeCard(i)">删除卡片</el-button>
      </div>
      <el-button size="small" @click="addCard">+ 卡片</el-button>
    </template>

    <!-- Glossary -->
    <template v-if="showGlossary">
      <el-form label-width="100px" size="small">
        <el-form-item label="术语">
          <el-input :model-value="hub.term" @update:model-value="(v: string) => patch({ term: v })" />
        </el-form-item>
        <el-form-item label="短定义">
          <el-input :model-value="hub.short" @update:model-value="(v: string) => patch({ short: v })" />
        </el-form-item>
        <el-form-item label="完整定义">
          <el-input type="textarea" :rows="4" :model-value="hub.definition" @update:model-value="(v: string) => patch({ definition: v })" />
        </el-form-item>
        <el-form-item label="公式">
          <el-input :model-value="hub.formula" @update:model-value="(v: string) => patch({ formula: v })" />
        </el-form-item>
        <el-form-item label="如何测量">
          <el-input type="textarea" :rows="3" :model-value="hub.howMeasured" @update:model-value="(v: string) => patch({ howMeasured: v })" />
        </el-form-item>
      </el-form>
    </template>

    <!-- Common article fields -->
    <template v-if="showLearnLike && !showHubShell">
      <el-divider content-position="left">主文案</el-divider>
      <el-form label-width="100px" size="small">
        <el-form-item v-if="!showGlossary" label="slug">
          <el-input :model-value="hub.slug" @update:model-value="(v: string) => patch({ slug: v })" />
        </el-form-item>
        <el-form-item v-if="!showGlossary" label="标题">
          <el-input :model-value="hub.title" @update:model-value="(v: string) => patch({ title: v })" />
        </el-form-item>
        <el-form-item v-if="!showGlossary" label="摘要">
          <el-input type="textarea" :rows="2" :model-value="hub.description" @update:model-value="(v: string) => patch({ description: v })" />
        </el-form-item>
        <el-form-item label="答案前置">
          <el-input type="textarea" :rows="3" :model-value="hub.answerBox" @update:model-value="(v: string) => patch({ answerBox: v })" />
        </el-form-item>
        <el-form-item v-if="hub.lead !== undefined || pageKind === 'learn'" label="导语">
          <el-input type="textarea" :rows="2" :model-value="hub.lead" @update:model-value="(v: string) => patch({ lead: v })" />
        </el-form-item>
      </el-form>
    </template>

    <!-- Product -->
    <template v-if="showProduct">
      <el-form label-width="100px" size="small">
        <el-form-item label="定义">
          <el-input type="textarea" :rows="2" :model-value="hub.definition" @update:model-value="(v: string) => patch({ definition: v })" />
        </el-form-item>
        <el-form-item label="控制台路径">
          <el-input :model-value="hub.consolePath" @update:model-value="(v: string) => patch({ consolePath: v })" />
        </el-form-item>
      </el-form>
      <el-divider content-position="left">指标列表</el-divider>
      <div v-for="(m, i) in (hub.metrics || [])" :key="'m'+i" class="row-line">
        <el-input size="small" :model-value="m" @update:model-value="(v: string) => setStringListItem('metrics', i, v)" />
        <el-button size="small" link type="danger" @click="removeStringListItem('metrics', i)">删</el-button>
      </div>
      <el-button size="small" @click="addStringList('metrics')">+ 指标</el-button>
      <el-divider content-position="left">用法步骤</el-divider>
      <div v-for="(u, i) in (hub.usage || [])" :key="'u'+i" class="row-line">
        <el-input size="small" :model-value="u" @update:model-value="(v: string) => setStringListItem('usage', i, v)" />
        <el-button size="small" link type="danger" @click="removeStringListItem('usage', i)">删</el-button>
      </div>
      <el-button size="small" @click="addStringList('usage')">+ 步骤</el-button>
    </template>

    <!-- Solution -->
    <template v-if="showSolution">
      <el-form label-width="100px" size="small">
        <el-form-item label="定义">
          <el-input type="textarea" :rows="2" :model-value="hub.definition" @update:model-value="(v: string) => patch({ definition: v })" />
        </el-form-item>
      </el-form>
      <el-divider content-position="left">痛点</el-divider>
      <div v-for="(p, i) in (hub.painPoints || [])" :key="'p'+i" class="row-line">
        <el-input size="small" :model-value="p" @update:model-value="(v: string) => setStringListItem('painPoints', i, v)" />
        <el-button size="small" link type="danger" @click="removeStringListItem('painPoints', i)">删</el-button>
      </div>
      <el-button size="small" @click="addStringList('painPoints')">+ 痛点</el-button>
      <el-divider content-position="left">打法</el-divider>
      <div v-for="(p, i) in (hub.plays || [])" :key="'pl'+i" class="row-line">
        <el-input size="small" :model-value="p" @update:model-value="(v: string) => setStringListItem('plays', i, v)" />
        <el-button size="small" link type="danger" @click="removeStringListItem('plays', i)">删</el-button>
      </div>
      <el-button size="small" @click="addStringList('plays')">+ 打法</el-button>
    </template>

    <!-- Compare -->
    <template v-if="showCompare">
      <el-form label-width="100px" size="small">
        <el-form-item label="左侧">
          <el-input :model-value="hub.left" @update:model-value="(v: string) => patch({ left: v })" />
        </el-form-item>
        <el-form-item label="右侧">
          <el-input :model-value="hub.right" @update:model-value="(v: string) => patch({ right: v })" />
        </el-form-item>
      </el-form>
      <el-divider content-position="left">对比维度</el-divider>
      <div v-for="(d, i) in (hub.dimensions || [])" :key="'d'+i" class="block-card">
        <el-input size="small" placeholder="维度名" class="mb" :model-value="d.name" @update:model-value="(v: string) => { const dimensions=[...hub.dimensions]; dimensions[i]={...dimensions[i],name:v}; patch({dimensions}) }" />
        <el-input size="small" placeholder="左侧" class="mb" :model-value="d.left" @update:model-value="(v: string) => { const dimensions=[...hub.dimensions]; dimensions[i]={...dimensions[i],left:v}; patch({dimensions}) }" />
        <el-input size="small" placeholder="右侧" class="mb" :model-value="d.right" @update:model-value="(v: string) => { const dimensions=[...hub.dimensions]; dimensions[i]={...dimensions[i],right:v}; patch({dimensions}) }" />
        <el-button size="small" type="danger" link @click="removeDimension(i)">删除</el-button>
      </div>
      <el-button size="small" @click="addDimension">+ 维度</el-button>
    </template>

    <!-- Report extras -->
    <template v-if="showReport">
      <el-form label-width="100px" size="small">
        <el-form-item label="方法">
          <el-input type="textarea" :rows="2" :model-value="hub.method" @update:model-value="(v: string) => patch({ method: v })" />
        </el-form-item>
        <el-form-item label="引擎(逗号)">
          <el-input
            :model-value="(hub.engines || []).join(',')"
            @update:model-value="(v: string) => patch({ engines: v.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean) })"
          />
        </el-form-item>
        <el-form-item label="题集版本">
          <el-input :model-value="hub.questionSetVersion" @update:model-value="(v: string) => patch({ questionSetVersion: v })" />
        </el-form-item>
        <el-form-item label="发布日">
          <el-input :model-value="hub.datePublished" @update:model-value="(v: string) => patch({ datePublished: v })" />
        </el-form-item>
        <el-form-item label="修改日">
          <el-input :model-value="hub.dateModified" @update:model-value="(v: string) => patch({ dateModified: v })" />
        </el-form-item>
      </el-form>
    </template>

    <!-- Pricing -->
    <template v-if="showPricing">
      <el-divider content-position="left">价格页文案</el-divider>
      <el-form label-width="100px" size="small">
        <el-form-item label="眉题">
          <el-input :model-value="hub.eyebrow" @update:model-value="(v: string) => patch({ eyebrow: v })" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input :model-value="hub.title" @update:model-value="(v: string) => patch({ title: v })" />
        </el-form-item>
        <el-form-item label="高亮词">
          <el-input :model-value="hub.titleAccent" @update:model-value="(v: string) => patch({ titleAccent: v })" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" :rows="3" :model-value="hub.description" @update:model-value="(v: string) => patch({ description: v })" />
        </el-form-item>
        <el-form-item label="计费说明">
          <el-input type="textarea" :rows="2" :model-value="hub.billingNote" @update:model-value="(v: string) => patch({ billingNote: v })" />
        </el-form-item>
        <el-form-item label="页脚备注">
          <el-input type="textarea" :rows="2" :model-value="hub.note" @update:model-value="(v: string) => patch({ note: v })" />
        </el-form-item>
      </el-form>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="套餐档位（免费 / 79 / 199 / 499 / 定制）与折扣周期由站点代码 geo-pricing 提供，与 geo-admin 对齐；此处只改文案与 FAQ。"
        class="mb"
      />
    </template>

    <!-- Contact -->
    <template v-if="showContact">
      <el-divider content-position="left">联系页文案</el-divider>
      <el-form label-width="100px" size="small">
        <el-form-item label="眉题">
          <el-input :model-value="hub.eyebrow" @update:model-value="(v: string) => patch({ eyebrow: v })" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input :model-value="hub.title" @update:model-value="(v: string) => patch({ title: v })" />
        </el-form-item>
        <el-form-item label="高亮词">
          <el-input :model-value="hub.titleAccent" @update:model-value="(v: string) => patch({ titleAccent: v })" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" :rows="3" :model-value="hub.description" @update:model-value="(v: string) => patch({ description: v })" />
        </el-form-item>
        <el-form-item label="页脚备注">
          <el-input type="textarea" :rows="2" :model-value="hub.note" @update:model-value="(v: string) => patch({ note: v })" />
        </el-form-item>
      </el-form>
      <el-divider content-position="left">联系渠道</el-divider>
      <div v-for="(ch, i) in (hub.channels || [])" :key="ch.id || i" class="block-card">
        <el-input size="small" class="mb" placeholder="渠道标题" :model-value="ch.label" @update:model-value="(v: string) => updateChannel(i, { label: v })" />
        <el-input size="small" class="mb" placeholder="展示文案 / 邮箱" :model-value="ch.value" @update:model-value="(v: string) => updateChannel(i, { value: v })" />
        <el-input size="small" class="mb" placeholder="链接（mailto: / 路径 / console:/login）" :model-value="ch.href" @update:model-value="(v: string) => updateChannel(i, { href: v })" />
        <el-select size="small" class="mb" :model-value="ch.kind || 'text'" @update:model-value="(v: string) => updateChannel(i, { kind: v })">
          <el-option label="邮箱 email" value="email" />
          <el-option label="链接 link" value="link" />
          <el-option label="纯文本 text" value="text" />
        </el-select>
        <el-input size="small" type="textarea" :rows="2" class="mb" placeholder="说明" :model-value="ch.note" @update:model-value="(v: string) => updateChannel(i, { note: v })" />
        <el-button size="small" type="danger" link @click="removeChannel(i)">删除渠道</el-button>
      </div>
      <el-button size="small" @click="addChannel">+ 渠道</el-button>
    </template>

    <!-- Sections -->
    <template v-if="pageKind !== 'default' && pageKind !== 'home' && pageKind !== 'pricing' && pageKind !== 'contact'">
      <el-divider content-position="left">正文章节</el-divider>
      <div v-for="(sec, i) in (hub.sections || [])" :key="'s'+i" class="block-card">
        <el-input size="small" class="mb" placeholder="章节标题" :model-value="sec.heading || sec.title" @update:model-value="(v: string) => { const sections=[...hub.sections]; sections[i]={...sections[i], heading: v, title: sections[i].title}; patch({sections}) }" />
        <el-input
          size="small"
          type="textarea"
          :rows="4"
          class="mb"
          placeholder="段落（每行一段）"
          :model-value="(sec.paragraphs || []).join('\n')"
          @update:model-value="(v: string) => { const sections=[...hub.sections]; sections[i]={...sections[i], paragraphs: v.split('\n').filter((x: string) => x.length)}; patch({sections}) }"
        />
        <el-button size="small" type="danger" link @click="removeSection(i)">删除章节</el-button>
      </div>
      <el-button size="small" @click="addSection">+ 章节</el-button>
    </template>

    <!-- FAQ -->
    <template v-if="pageKind !== 'default' && pageKind !== 'home'">
      <el-divider content-position="left">FAQ</el-divider>
      <div v-for="(item, i) in (hub.faq || [])" :key="'f'+i" class="block-card">
        <el-input size="small" class="mb" placeholder="问题" :model-value="item.q" @update:model-value="(v: string) => { const faq=[...hub.faq]; faq[i]={...faq[i],q:v}; patch({faq}) }" />
        <el-input size="small" type="textarea" :rows="2" class="mb" placeholder="回答" :model-value="item.a" @update:model-value="(v: string) => { const faq=[...hub.faq]; faq[i]={...faq[i],a:v}; patch({faq}) }" />
        <el-button size="small" type="danger" link @click="removeFaq(i)">删除</el-button>
      </div>
      <el-button size="small" @click="addFaq">+ FAQ</el-button>
    </template>
  </div>
</template>

<style scoped>
.hub-editor { padding-bottom: 24px; }
.block-card {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  background: #fafafa;
}
.mb { margin-bottom: 8px; }
.row-line {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}
</style>
