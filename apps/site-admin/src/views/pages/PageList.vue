<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderPageDoc, type Site, type PageData, type PageKind } from '@site-manage/shared'
import { fetchSites } from '@/api/site'
import { fetchPages, createPage, updatePage, deletePage, copyPage } from '@/api/page'
import FormJsonSwitch from '@/components/FormJsonSwitch.vue'
import JsonTreeForm from '@/components/JsonTreeForm.vue'

const HIDDEN_KEYS = new Set([ '_id', 'siteId', 'children', 'createdAt', 'updatedAt', '__v' ])

const sites = ref<Site[]>([])
const siteId = ref('')
const loading = ref(false)
const list = ref<PageData[]>([])
const saving = ref(false)

const currentSite = computed(() => sites.value.find(s => s._id === siteId.value) || null)
const domainLabel = computed(() => {
  if (!currentSite.value) return ''
  return `${currentSite.value.name}（${currentSite.value.domain}）`
})

const panelOpen = ref(false)
const panelTitle = ref('编辑页面')
const editingId = ref<string | null>(null)
const editorMode = ref<'form' | 'json'>('json')
const pageDoc = ref<Record<string, unknown>>({})
const pageSwitch = ref<{ flush: () => boolean; reload: () => void } | null>(null)

function toDoc(row: Partial<PageData>) {
  const doc: Record<string, unknown> = {}
  for (const [ key, value ] of Object.entries(row)) {
    if (!HIDDEN_KEYS.has(key)) doc[key] = value
  }
  return orderPageDoc(JSON.parse(JSON.stringify(doc)) as Record<string, unknown>)
}

function onPageDoc(value: unknown) {
  pageDoc.value = value && typeof value === 'object' && !Array.isArray(value)
    ? orderPageDoc(value as Record<string, unknown>)
    : {}
}

async function showPage(partial: Partial<PageData>, title: string) {
  pageDoc.value = toDoc(partial)
  panelTitle.value = title
  panelOpen.value = true
  await nextTick()
  pageSwitch.value?.reload()
}

async function loadSites() {
  const data = await fetchSites({ page: 1, pageSize: 100 })
  sites.value = data.list
  if (!siteId.value && data.list.length) {
    siteId.value = data.list[0]._id!
  }
  if (siteId.value && !data.list.some(s => s._id === siteId.value)) {
    siteId.value = data.list[0]?._id || ''
  }
}

async function loadPages() {
  if (!siteId.value) {
    list.value = []
    return
  }
  loading.value = true
  try {
    list.value = await fetchPages(siteId.value)
  } finally {
    loading.value = false
  }
}

function childPathFromParent(parentPath?: string | null) {
  if (!parentPath || parentPath === '/') return '/learn'
  return parentPath.endsWith('/') ? `${parentPath}slug` : `${parentPath}/slug`
}

function normalizePath(path?: string | null) {
  const raw = String(path || '').trim()
  if (!raw || raw === '/') return '/'
  return raw.replace(/\/+$/, '') || '/'
}

function flattenPages(items: PageData[]): PageData[] {
  const result: PageData[] = []
  for (const item of items) {
    result.push(item)
    if (item.children?.length) result.push(...flattenPages(item.children))
  }
  return result
}

function isPathDuplicated(path: string, excludeId?: string | null) {
  const normalized = normalizePath(path)
  return flattenPages(list.value).some(item => {
    if (excludeId && item._id === excludeId) return false
    return normalizePath(item.path) === normalized
  })
}

function ensureSiteSelected() {
  if (!siteId.value || !currentSite.value) {
    ElMessage.warning('请先选择所属域名')
    return false
  }
  return true
}

function openCreate(parent: PageData | null = null) {
  if (!ensureSiteSelected()) return
  editingId.value = null
  const isRoot = !parent
  const pageKind: PageKind = isRoot ? 'home' : 'product'
  showPage(
    {
      title: isRoot ? '首页' : '新页面',
      path: isRoot ? '/' : childPathFromParent(parent?.path),
      parentId: parent?._id || null,
      sort: 0,
      visible: true,
      template: 'flagship',
      pageKind,
      status: 'draft',
      seo: { title: '', description: '', keywords: '', canonical: '' },
      schema: { visible: true, schemaType: 'WebPage', name: '', headline: '', description: '' },
    },
    parent ? `新建子页面（${parent.title}）` : '新建页面',
  )
}

function openEdit(row: PageData) {
  if (!ensureSiteSelected()) return
  editingId.value = row._id!
  showPage(row, `编辑：${row.title}`)
}

function closePanel() {
  panelOpen.value = false
  editingId.value = null
}

async function submit() {
  if (!ensureSiteSelected()) return
  if (!pageSwitch.value?.flush()) {
    ElMessage.error('JSON 格式不正确')
    return
  }
  const title = String(pageDoc.value.title || '').trim()
  const path = normalizePath(String(pageDoc.value.path || ''))
  if (!title || !path) {
    ElMessage.warning('请填写标题和路径')
    return
  }
  if (isPathDuplicated(path, editingId.value)) {
    ElMessage.error(`路径「${path}」已存在，不能重复添加`)
    return
  }
  pageDoc.value = { ...pageDoc.value, title, path }
  const payload = { ...pageDoc.value, siteId: siteId.value, path } as Partial<PageData>

  saving.value = true
  try {
    if (editingId.value) {
      const updated = await updatePage(editingId.value, payload)
      ElMessage.success('更新成功')
      await showPage(updated, `编辑：${updated.title}`)
    } else {
      const created = await createPage(payload)
      ElMessage.success('创建成功')
      editingId.value = created._id!
      await showPage(created, `编辑：${created.title}`)
    }
    await loadPages()
  } finally {
    saving.value = false
  }
}

async function onCopy(row: PageData) {
  if (!ensureSiteSelected()) return
  let nextPath = ''
  try {
    const { value } = await ElMessageBox.prompt(
      `将复制「${row.title}」（${row.pageKind || 'default'}）。请输入新路径：`,
      '复制为同类型新页面',
      {
        inputValue: row.path === '/' ? '/home-copy' : `${String(row.path).replace(/\/$/, '')}-copy`,
        confirmButtonText: '复制',
        cancelButtonText: '取消',
      },
    )
    nextPath = String(value || '').trim()
  } catch {
    return
  }
  if (!nextPath) {
    ElMessage.warning('路径不能为空')
    return
  }
  try {
    const created = await copyPage(row._id!, {
      path: nextPath,
      title: `${row.title}（副本）`,
      status: 'draft',
    })
    ElMessage.success('已复制为草稿')
    await loadPages()
    openEdit(created)
  } catch (e: any) {
    ElMessage.error(e?.message || '复制失败')
  }
}

async function onDelete(row: PageData) {
  if (row.children?.length) {
    ElMessage.warning('请先删除子页面')
    return
  }
  await ElMessageBox.confirm(
    `确认删除「${row.title}」（${row.path}）？导航与页面内容将一并移除。`,
    '提示',
    { type: 'warning' },
  )
  await deletePage(row._id!)
  ElMessage.success('已删除')
  if (editingId.value === row._id) closePanel()
  loadPages()
}

watch(siteId, () => {
  closePanel()
  loadPages()
})

onMounted(async () => {
  await loadSites()
  await loadPages()
})
</script>

<template>
  <div class="page-layout">
    <el-card class="pane pane-left" shadow="never">
      <template #header>
        <div class="toolbar">
          <span>页面 / 菜单</span>
          <div class="actions">
            <el-select
              v-model="siteId"
              placeholder="选择所属域名"
              style="width: 200px"
              filterable
              :disabled="!sites.length"
            >
              <el-option
                v-for="s in sites"
                :key="s._id"
                :label="`${s.name}（${s.domain}）`"
                :value="s._id!"
              />
            </el-select>
            <el-button type="success" :disabled="!siteId" @click="openCreate()">新建</el-button>
          </div>
        </div>
      </template>

      <el-empty v-if="!sites.length" description="请先在「网站管理」创建域名" />

      <template v-else-if="siteId">
        <div class="domain-bar">当前域名：{{ domainLabel }}</div>

        <el-table
          v-loading="loading"
          :data="list"
          row-key="_id"
          default-expand-all
          :tree-props="{ children: 'children' }"
          :highlight-current-row="panelOpen"
          stripe
          height="100%"
          @row-click="openEdit"
        >
          <el-table-column prop="title" label="标题" min-width="100" />
          <el-table-column label="域名" min-width="110" show-overflow-tooltip>
            <template #default>
              {{ currentSite?.domain || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路径" min-width="100" show-overflow-tooltip />
          <el-table-column prop="pageKind" label="pageKind" width="100">
            <template #default="{ row }">{{ row.pageKind || 'default' }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'published' ? 'success' : 'warning'" size="small">
                {{ row.status === 'published' ? '已发布' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="openCreate(row)">加子级</el-button>
              <el-button link type="primary" @click.stop="openEdit(row)">编辑</el-button>
              <el-button link type="success" @click.stop="onCopy(row)">复制</el-button>
              <el-button link type="danger" @click.stop="onDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>

    <el-card class="pane pane-right" shadow="never">
      <template v-if="panelOpen" #header>
        <div class="toolbar">
          <span>{{ panelTitle }}</span>
          <div class="actions">
            <el-button @click="closePanel">取消</el-button>
            <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
          </div>
        </div>
      </template>

      <div v-if="panelOpen" class="editor-main">
        <FormJsonSwitch
          ref="pageSwitch"
          v-model:mode="editorMode"
          :model-value="pageDoc"
          @update:model-value="onPageDoc"
        >
          <JsonTreeForm :model-value="pageDoc" @update:model-value="onPageDoc" />
        </FormJsonSwitch>
      </div>

      <div v-else class="pane-placeholder">
        <el-empty description="从左侧选择或新建页面进行编辑" />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.page-layout {
  display: flex;
  gap: 12px;
  height: calc(100vh - 72px);
  min-height: 480px;
}

.pane {
  flex: 1 1 50%;
  width: 50%;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pane :deep(.el-card__body) {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.pane-right :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.domain-bar {
  margin-bottom: 12px;
  font-size: 12px;
  color: #606266;
}

.editor-main {
  flex: 1;
  overflow: auto;
  padding: 12px 16px 20px;
  min-width: 0;
}

.pane-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
