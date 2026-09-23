<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Site } from '@site-manage/shared'
import { fetchSites, createSite, updateSite, deleteSite } from '@/api/site'

const emptyForm = (): Partial<Site> => ({
  name: '',
  domain: '',
  aliases: [],
  status: 'active',
  meta: { title: '', description: '' },
  imageHost: '',
  imageKey: '',
  beian: '',
  brandZh: '',
  brandEn: '',
  companyZh: '',
  companyEn: '',
  sort: 0,
  enabled: true,
  hasSearch: false,
  googleAdsAccount: '',
  googleAdsScript: '',
  tencentAdsVerify: '',
  googleAnalyticsId: '',
  baiduAnalyticsId: '',
  bingAnalyticsId: '',
  bingPushKey: '',
  baiduPushToken: '',
})

const loading = ref(false)
const saving = ref(false)
const list = ref<Site[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, keyword: '' })

const panelOpen = ref(false)
const panelTitle = ref('新建网站')
const form = reactive<Partial<Site>>(emptyForm())
const editingId = ref<string | null>(null)
const aliasInput = ref('')

async function load() {
  loading.value = true
  try {
    const data = await fetchSites({ ...query })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function resetForm(partial: Partial<Site> = {}) {
  Object.assign(form, emptyForm(), partial, {
    meta: { title: '', description: '', ...(partial.meta || {}) },
  })
}

function openCreate() {
  editingId.value = null
  panelTitle.value = '新建网站'
  resetForm()
  aliasInput.value = ''
  panelOpen.value = true
}

function openEdit(row: Site) {
  editingId.value = row._id!
  panelTitle.value = `编辑：${row.name}`
  resetForm({
    ...row,
    aliases: [ ...(row.aliases || []) ],
    meta: { ...(row.meta || {}) },
    enabled: row.enabled !== false,
    hasSearch: !!row.hasSearch,
    sort: row.sort ?? 0,
  })
  aliasInput.value = (row.aliases || []).join(',')
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
  editingId.value = null
}

async function submit() {
  if (!form.name || !form.domain) {
    ElMessage.warning('请填写名称和域名')
    return
  }
  const payload = {
    ...form,
    aliases: aliasInput.value
      ? aliasInput.value.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    enabled: form.enabled !== false,
    status: form.enabled !== false ? 'active' as const : 'inactive' as const,
  }

  saving.value = true
  try {
    if (editingId.value) {
      await updateSite(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await createSite(payload)
      ElMessage.success('创建成功')
    }
    closePanel()
    await load()
  } finally {
    saving.value = false
  }
}

async function onDelete(row: Site) {
  await ElMessageBox.confirm(
    `确认删除网站「${row.name}」（${row.domain}）？其下菜单和页面也会一并删除。`,
    '提示',
    { type: 'warning' }
  )
  await deleteSite(row._id!)
  ElMessage.success('已删除')
  if (editingId.value === row._id) closePanel()
  load()
}

onMounted(load)
</script>

<template>
  <div class="page-layout">
    <el-card class="pane pane-left" shadow="never">
      <template #header>
        <div class="toolbar">
          <span>网站管理</span>
          <div class="actions">
            <el-input
              v-model="query.keyword"
              placeholder="搜索名称/域名"
              clearable
              style="width: 160px"
              @keyup.enter="load"
              @clear="load"
            />
            <el-button type="primary" @click="load">搜索</el-button>
            <el-button type="success" @click="openCreate">新建</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        stripe
        :highlight-current-row="panelOpen"
        height="100%"
        @row-click="openEdit"
      >
        <el-table-column prop="sort" label="排序" width="60" />
        <el-table-column prop="name" label="名称" min-width="100" />
        <el-table-column prop="domain" label="主域名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="brandZh" label="中文品牌" min-width="100" show-overflow-tooltip />
        <el-table-column label="有效" width="70">
          <template #default="{ row }">
            <el-tag :type="row.enabled !== false ? 'success' : 'info'" size="small">
              {{ row.enabled !== false ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click.stop="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="load"
        />
      </div>
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

      <el-form v-if="panelOpen" class="edit-form" label-width="110px">
        <div class="form-section">基础信息</div>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="网站名称" />
        </el-form-item>
        <el-form-item label="主域名" required>
          <el-input v-model="form.domain" placeholder="如 www.example.com" />
        </el-form-item>
        <el-form-item label="别名域名">
          <el-input v-model="aliasInput" placeholder="多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="中文品牌">
          <el-input v-model="form.brandZh" />
        </el-form-item>
        <el-form-item label="英文品牌">
          <el-input v-model="form.brandEn" />
        </el-form-item>
        <el-form-item label="公司中文">
          <el-input v-model="form.companyZh" />
        </el-form-item>
        <el-form-item label="公司英文">
          <el-input v-model="form.companyEn" />
        </el-form-item>
        <el-form-item label="备案号">
          <el-input v-model="form.beian" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="是否有效">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="是否有搜索">
          <el-switch v-model="form.hasSearch" />
        </el-form-item>

        <div class="form-section">图床</div>
        <el-form-item label="图床域名">
          <el-input v-model="form.imageHost" placeholder="https://img.example.com" />
        </el-form-item>
        <el-form-item label="图床key">
          <el-input v-model="form.imageKey" />
        </el-form-item>

        <div class="form-section">广告</div>
        <el-form-item label="谷歌广告账户">
          <el-input v-model="form.googleAdsAccount" />
        </el-form-item>
        <el-form-item label="谷歌广告脚本">
          <el-input v-model="form.googleAdsScript" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="腾讯广告验证">
          <el-input v-model="form.tencentAdsVerify" type="textarea" :rows="2" />
        </el-form-item>

        <div class="form-section">统计与推送</div>
        <el-form-item label="谷歌统计id">
          <el-input v-model="form.googleAnalyticsId" />
        </el-form-item>
        <el-form-item label="百度统计id">
          <el-input v-model="form.baiduAnalyticsId" />
        </el-form-item>
        <el-form-item label="必应统计id">
          <el-input v-model="form.bingAnalyticsId" />
        </el-form-item>
        <el-form-item label="必应推送key">
          <el-input v-model="form.bingPushKey" />
        </el-form-item>
        <el-form-item label="百度推送token">
          <el-input v-model="form.baiduPushToken" />
        </el-form-item>
      </el-form>

      <div v-else class="pane-placeholder">
        <el-empty description="从左侧选择或新建网站进行编辑" />
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
  display: flex;
  flex-direction: column;
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

.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.edit-form {
  max-width: 100%;
  padding-bottom: 16px;
}

.form-section {
  margin: 8px 0 12px;
  padding-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}

.pane-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
