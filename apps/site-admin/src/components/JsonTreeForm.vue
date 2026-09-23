<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: unknown
  fieldKey?: string
}>(), {
  fieldKey: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const FIELD_LABELS: Record<string, string> = {
  layout: '版式',
  version: '版本',
  page: '页面正文',
  consolePath: '控制台路径',
  startPlaceholder: '输入框占位',
  startFill: '示例填充',
  startButton: '开始按钮',
  startChips: '快速填入',
  insightSlugs: '文章 slug',
  heroTitle: '主标题',
  heroLead: '导语',
  heroTrust: '信任说明',
  stats: '数据条',
  loopTitle: '闭环标题',
  loopDeck: '闭环说明',
  tabsLabel: '步骤区标签',
  windowBrand: '窗口品牌',
  windowPill: '窗口角标',
  steps: '步骤',
  tableHead: '表头',
  tableRows: '表格行',
  advice: '建议',
  draft: '草稿示意',
  publish: '发布',
  attrib: '归因',
  effectsTitle: '效果标题',
  effectsDeck: '效果说明',
  effects: '效果',
  watchTitle: '监测标题',
  watchDeck: '监测说明',
  monitors: '监测项',
  panelK: '面板眉题',
  panelItems: '面板条目',
  panelFoot: '面板脚注',
  writeTitle: '写作标题',
  writeDeck: '写作说明',
  agentSteps: '写作步骤',
  writeLinks: '写作链接',
  manuscript: '稿件示意',
  citeTitle: '引用标题',
  citeDeck: '引用说明',
  citeDims: '引用维度',
  sampleK: '样例眉题',
  sampleTitle: '样例标题',
  sampleNote: '样例注释',
  citeMore: '引用更多',
  channelTitle: '渠道标题',
  channelDeck: '渠道说明',
  channels: '渠道',
  channelFine: '渠道补充',
  channelMore: '渠道更多',
  diagTitle: '诊断标题',
  diagDeck: '诊断说明',
  reportBits: '报告要点',
  diagLinks: '诊断链接',
  agencyTitle: '代理标题',
  agencyText: '代理说明',
  agencyMore: '代理链接',
  railsTitle: '导览标题',
  rails: '导览',
  inviteTitle: '邀请标题',
  inviteText: '邀请说明',
  inviteLinks: '邀请链接',
  postsTitle: '文章标题',
  postsDeck: '文章说明',
  postsMore: '文章更多',
  faqTitle: '问答标题',
  faqDeck: '问答说明',
  faqs: '问答',
  text: '文字',
  key: '强调',
  br: '换行',
  value: '数值',
  unit: '单位',
  label: '标签',
  n: '序号',
  title: '标题',
  sub: '副标题',
  body: '正文',
  q: '问题',
  a: '回答',
  question: '问题',
  answer: '回答',
  cells: '单元格',
  t: '文案',
  miss: '未出现',
  b: '标题',
  s: '说明',
  h: '标题',
  p: '段落',
  items: '条目',
  path: '路径',
  to: '链接',
  name: '名称',
  note: '备注',
  factLabel: '事实标签',
  fact: '事实',
  bar: '顶栏',
  k: '名称',
  v: '内容',
  kind: '样式',
  cta: '按钮',
  kicker: '眉题',
  seo: 'SEO',
  description: '描述',
  keywords: '关键词',
  canonical: '规范链接',
  schema: '网页',
  hero: '首屏',
  workflow: '优化闭环',
  effects: '效果',
  watch: '监测',
  write: '写作',
  cite: '引用源',
  channel: '渠道',
  diagnosis: '诊断',
  rails: '导览',
  invite: '邀请',
  posts: '文章列表',
  faq: '常见问题',
  header: '头部',
  start: '网页',
  hubContent: '结构化正文',
  blocks: '区块',
  qa: '问答',
  howto: '操作步骤',
  tabVisible: '其他分区显示',
  visible: '显示',
  status: '状态',
  template: '模板',
  pageKind: '页面类型',
  sort: '排序',
  parentId: '父级',
  id: 'ID',
  content: '内容',
  props: '属性',
  type: '类型',
  ogImage: '分享图',
}

const LONG_KEYS = new Set([
  'body', 'text', 'a', 'answer', 'description', 'p', 'note', 'fact', 'content',
  'agencyText', 'inviteText', 'channelFine', 'effectsDeck', 'diagDeck', 'faqDeck',
  'postsDeck', 'sampleNote', 'keywords', 'metaDescription',
])

const ITEM_SHAPES: Record<string, unknown> = {
  faqs: { q: '', a: '' },
  qa: { id: '', question: '', answer: '' },
  heroTitle: { text: '' },
  heroLead: { text: '' },
  heroTrust: { text: '' },
  loopTitle: { text: '' },
  loopDeck: { text: '' },
  effectsTitle: { text: '' },
  watchTitle: { text: '' },
  watchDeck: { text: '' },
  writeTitle: { text: '' },
  writeDeck: { text: '' },
  citeTitle: { text: '' },
  citeDeck: { text: '' },
  sampleTitle: { text: '' },
  channelTitle: { text: '' },
  channelDeck: { text: '' },
  inviteTitle: { text: '' },
  stats: { value: '', unit: '', label: '' },
  steps: { n: '', title: '', sub: '', body: '' },
  howto: { id: '', title: '', content: '' },
  tableRows: { q: '', cells: [] },
  advice: { b: '', s: '' },
  publish: { b: '', s: '' },
  attrib: { b: '', s: '' },
  effects: { title: '', path: '', text: '' },
  monitors: { title: '', text: '', to: '' },
  agentSteps: { title: '', text: '' },
  writeLinks: { to: '', label: '' },
  citeDims: { title: '', text: '' },
  channels: { name: '', note: '' },
  reportBits: { k: '', v: '' },
  diagLinks: { to: '', label: '', kind: 'go' },
  inviteLinks: { to: '', label: '', kind: 'go' },
  rails: { kicker: '', title: '', text: '', to: '', cta: '' },
  cells: { t: '', miss: false },
  blocks: { id: '', type: 'richtext', props: {} },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isRichPart(value: unknown) {
  if (!isRecord(value)) return false
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every(key => key === 'text' || key === 'key' || key === 'br')
}

const kind = computed(() => {
  if (Array.isArray(props.modelValue)) return 'array'
  if (props.modelValue === null) return 'null'
  return typeof props.modelValue
})

const record = computed(() => (isRecord(props.modelValue) ? props.modelValue : {}))
const list = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))
const fieldKeys = computed(() => Object.keys(record.value))
const richList = computed(() => list.value.length > 0 && list.value.every(isRichPart))

function isComplex(value: unknown) {
  return !!value && typeof value === 'object'
}

/** 这些区块会进 Schema.org，标题统一加 schema。 */
const SCHEMA_SECTIONS = new Set([ 'schema', 'faq' ])

/** 页面根上可切换显示的平铺模块。 */
const PANEL_KEYS = new Set([
  'schema', 'hero', 'workflow', 'effects', 'watch', 'write',
  'cite', 'channel', 'diagnosis', 'rails', 'invite', 'posts', 'faq',
])

const isPageRoot = computed(() => !props.fieldKey)

const displayKeys = computed(() => {
  if (PANEL_KEYS.has(props.fieldKey)) {
    return fieldKeys.value.filter(key => key !== 'visible')
  }
  return fieldKeys.value
})

const complexDisplayKeys = computed(() => displayKeys.value.filter(key => isComplex(record.value[key])))

function labelOf(key: string) {
  const base = FIELD_LABELS[key] || key
  const inSchemaBlock = props.fieldKey === 'schema'
  if ((SCHEMA_SECTIONS.has(key) || inSchemaBlock) && !/^schema/i.test(base)) return `schema ${base}`
  return base
}

function summary(key: string, value: unknown) {
  const label = labelOf(key)
  if (Array.isArray(value)) return `${label}（${value.length}）`
  return label
}

function panelTabKey(fieldKey: string) {
  return isPageRoot.value && PANEL_KEYS.has(fieldKey) ? fieldKey : ''
}

function panelVisible(fieldKey: string) {
  const mod = record.value[fieldKey]
  if (!isRecord(mod)) return true
  return mod.visible !== false
}

function setPanelVisible(fieldKey: string, on: boolean) {
  const mod = isRecord(record.value[fieldKey]) ? { ...record.value[fieldKey] } : {}
  emitRecord({ ...record.value, [fieldKey]: { ...mod, visible: on } })
}

function itemTitle(item: unknown, index: number) {
  if (isRecord(item)) {
    const text = item.title || item.q || item.question || item.name || item.h || item.b || item.n || item.label
    if (typeof text === 'string' && text.trim()) return text
  }
  if (typeof item === 'string' && item.trim()) return item.slice(0, 32)
  return `第 ${index + 1} 项`
}

function emitRecord(next: Record<string, unknown>) {
  emit('update:modelValue', next)
}

function setKey(key: string, value: unknown) {
  emitRecord({ ...record.value, [key]: value })
}

function setRich(index: number, partial: Record<string, unknown>) {
  const next = list.value.map((item, i) => (i === index && isRecord(item) ? { ...item, ...partial } : item))
  emit('update:modelValue', next)
}

function setAt(index: number, value: unknown) {
  const next = list.value.slice()
  next[index] = value
  emit('update:modelValue', next)
}

function blankItem() {
  const sample = list.value[list.value.length - 1]
  if (sample !== undefined) return JSON.parse(JSON.stringify(sample))
  if (props.fieldKey in ITEM_SHAPES) return JSON.parse(JSON.stringify(ITEM_SHAPES[props.fieldKey]))
  return ''
}

function addItem() {
  emit('update:modelValue', [...list.value, blankItem()])
}

function removeAt(index: number) {
  emit('update:modelValue', list.value.filter((_, i) => i !== index))
}

function useTextarea(key: string, value: unknown) {
  if (typeof value !== 'string') return false
  return LONG_KEYS.has(key) || value.length > 42 || value.includes('\n')
}
</script>

<template>
  <div class="json-tree">
    <el-input
      v-if="kind === 'string'"
      :model-value="String(modelValue ?? '')"
      :type="useTextarea(fieldKey, modelValue) ? 'textarea' : 'text'"
      :rows="useTextarea(fieldKey, modelValue) ? 3 : undefined"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <el-input-number
      v-else-if="kind === 'number'"
      :model-value="Number(modelValue)"
      @update:model-value="emit('update:modelValue', $event ?? 0)"
    />
    <el-switch
      v-else-if="kind === 'boolean'"
      :model-value="Boolean(modelValue)"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <el-input
      v-else-if="kind === 'null'"
      model-value=""
      disabled
      placeholder="空"
    />

    <template v-else-if="kind === 'array'">
      <div v-if="richList" class="rich-list">
        <div v-for="(item, index) in list" :key="index" class="rich-row">
          <el-input
            :model-value="isRecord(item) ? String(item.text || '') : ''"
            placeholder="文字"
            @update:model-value="setRich(index, { text: $event })"
          />
          <el-checkbox
            :model-value="isRecord(item) ? item.key === true : false"
            @update:model-value="setRich(index, { key: $event === true })"
          >
            强调
          </el-checkbox>
          <el-checkbox
            :model-value="isRecord(item) ? item.br === true : false"
            @update:model-value="setRich(index, { br: $event === true })"
          >
            换行
          </el-checkbox>
          <el-button link type="danger" @click="removeAt(index)">删除</el-button>
        </div>
      </div>
      <div v-else class="array-list">
        <el-collapse>
          <el-collapse-item v-for="(item, index) in list" :key="index" :name="String(index)">
            <template #title>
              <div class="item-title">
                <span>{{ itemTitle(item, index) }}</span>
                <el-button link type="danger" @click.stop="removeAt(index)">删除</el-button>
              </div>
            </template>
            <el-input
              v-if="typeof item === 'string' || typeof item === 'number'"
              :model-value="String(item)"
              :type="typeof item === 'string' && useTextarea(fieldKey, item) ? 'textarea' : 'text'"
              :rows="3"
              @update:model-value="setAt(index, typeof item === 'number' ? Number($event) : $event)"
            />
            <JsonTreeForm
              v-else
              :model-value="item"
              @update:model-value="setAt(index, $event)"
            />
          </el-collapse-item>
        </el-collapse>
      </div>
      <el-button size="small" class="add-btn" @click="addItem">添加一项</el-button>
    </template>

    <template v-else-if="kind === 'object'">
      <el-form label-position="top" size="small" class="object-form" @submit.prevent>
        <template v-for="key in displayKeys" :key="key">
          <el-form-item v-if="!isComplex(record[key])">
            <template #label>
              <span>{{ labelOf(key) }}</span>
              <span v-if="labelOf(key) !== key" class="key-name">{{ key }}</span>
            </template>
            <JsonTreeForm
              :field-key="key"
              :model-value="record[key]"
              @update:model-value="setKey(key, $event)"
            />
          </el-form-item>
        </template>
        <el-collapse v-if="complexDisplayKeys.length" class="complex-collapse">
          <el-collapse-item v-for="key in complexDisplayKeys" :key="key" :name="key">
            <template #title>
              <div class="panel-title">
                <span class="panel-label">
                  <span>{{ summary(key, record[key]) }}</span>
                  <span v-if="labelOf(key) !== key" class="key-name">{{ key }}</span>
                </span>
                <el-switch
                  v-if="panelTabKey(key)"
                  size="small"
                  :model-value="panelVisible(key)"
                  @click.stop
                  @update:model-value="setPanelVisible(key, $event)"
                />
              </div>
            </template>
            <JsonTreeForm
              :field-key="key"
              :model-value="record[key]"
              @update:model-value="setKey(key, $event)"
            />
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </template>
  </div>
</template>

<style scoped>
.json-tree {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.object-form,
.array-list,
.rich-list {
  width: 100%;
}
.object-form :deep(.el-form-item) { margin-bottom: 10px; }
.object-form :deep(.el-form-item__content) {
  display: flex;
  width: 100%;
}
.object-form :deep(.el-form-item__content) > * {
  flex: 1;
  width: 100%;
  min-width: 0;
}
.json-tree :deep(.el-input),
.json-tree :deep(.el-textarea),
.json-tree :deep(.el-input-number) {
  width: 100%;
}
.json-tree :deep(.el-input__wrapper),
.json-tree :deep(.el-textarea__inner) {
  width: 100%;
  box-sizing: border-box;
}
.key-name {
  margin-left: 6px;
  color: var(--el-text-color-secondary);
  font-size: 11px;
  font-weight: 400;
}
.rich-row,
.item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.rich-row { margin-bottom: 8px; }
.rich-row :deep(.el-input) {
  flex: 1;
  width: auto;
  min-width: 0;
}
.item-title,
.panel-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-right: 8px;
  min-width: 0;
  width: 100%;
}
.item-title span,
.panel-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.panel-label {
  display: flex;
  align-items: center;
  min-width: 0;
}
.add-btn { margin-top: 8px; }
.complex-collapse,
.array-list :deep(.el-collapse) {
  width: 100%;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.complex-collapse :deep(.el-collapse-item),
.array-list :deep(.el-collapse-item) {
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  border: 1px solid #b8c4d4;
  border-radius: 8px;
  background: #dbe4f0;
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
}
.complex-collapse > :deep(.el-collapse-item:nth-child(even)),
.array-list :deep(.el-collapse > .el-collapse-item:nth-child(even)) {
  background: #d7ebe0;
  border-color: #a9cbb8;
}
.complex-collapse :deep(.el-collapse-item__header),
.array-list :deep(.el-collapse-item__header) {
  align-items: center;
  height: auto;
  min-height: 44px;
  line-height: 1.4;
  padding: 10px 12px;
  background: #c5d3e4;
  border-bottom: 1px solid transparent;
  color: #0f172a;
  font-weight: 600;
}
.complex-collapse > :deep(.el-collapse-item:nth-child(even) > .el-collapse-item__header),
.array-list :deep(.el-collapse > .el-collapse-item:nth-child(even) > .el-collapse-item__header) {
  background: #bfe0cc;
}
.complex-collapse :deep(.el-collapse-item.is-active > .el-collapse-item__header),
.array-list :deep(.el-collapse-item.is-active > .el-collapse-item__header) {
  border-bottom-color: rgba(15, 23, 42, 0.12);
}
.complex-collapse :deep(.el-collapse-item__wrap),
.array-list :deep(.el-collapse-item__wrap) {
  width: 100%;
  box-sizing: border-box;
  background: #f4f7fb;
  border: none;
}
.complex-collapse > :deep(.el-collapse-item:nth-child(even) .el-collapse-item__wrap),
.array-list :deep(.el-collapse > .el-collapse-item:nth-child(even) .el-collapse-item__wrap) {
  background: #f3faf6;
}
.complex-collapse :deep(.el-collapse-item__content),
.array-list :deep(.el-collapse-item__content) {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  background: #f4f7fb;
}
.complex-collapse > :deep(.el-collapse-item:nth-child(even) .el-collapse-item__content),
.array-list :deep(.el-collapse > .el-collapse-item:nth-child(even) .el-collapse-item__content) {
  background: #f3faf6;
}
/* 嵌套 panel：暖色底，和顶层蓝/绿错开 */
.complex-collapse :deep(.el-collapse-item__content) .complex-collapse > .el-collapse-item,
.complex-collapse :deep(.el-collapse-item__content) .array-list .el-collapse-item,
.array-list :deep(.el-collapse-item__content) .complex-collapse > .el-collapse-item,
.array-list :deep(.el-collapse-item__content) .el-collapse-item {
  background: #efe6d8;
  border-color: #d4c4a8;
}
.complex-collapse :deep(.el-collapse-item__content) .complex-collapse > .el-collapse-item > .el-collapse-item__header,
.complex-collapse :deep(.el-collapse-item__content) .array-list .el-collapse-item__header,
.array-list :deep(.el-collapse-item__content) .complex-collapse > .el-collapse-item > .el-collapse-item__header,
.array-list :deep(.el-collapse-item__content) .el-collapse-item__header {
  background: #e4d5bc;
}
.complex-collapse :deep(.el-collapse-item__content) .complex-collapse > .el-collapse-item .el-collapse-item__wrap,
.complex-collapse :deep(.el-collapse-item__content) .complex-collapse > .el-collapse-item .el-collapse-item__content,
.complex-collapse :deep(.el-collapse-item__content) .array-list .el-collapse-item__wrap,
.complex-collapse :deep(.el-collapse-item__content) .array-list .el-collapse-item__content,
.array-list :deep(.el-collapse-item__content) .complex-collapse > .el-collapse-item .el-collapse-item__wrap,
.array-list :deep(.el-collapse-item__content) .complex-collapse > .el-collapse-item .el-collapse-item__content,
.array-list :deep(.el-collapse-item__content) .el-collapse-item__wrap,
.array-list :deep(.el-collapse-item__content) .el-collapse-item__content {
  background: #fbf7f0;
}
</style>
