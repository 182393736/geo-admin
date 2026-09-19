<template>
  <div class="space-y-5">
    <!-- 识别词 -->
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium">识别词（品牌名称 / 产品名称）</span>
        <Badge variant="secondary">必填</Badge>
        <span class="text-xs text-muted-foreground">
          剩余修改 <span class="font-semibold text-foreground">{{ renameRemaining }}</span> 次
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="ml-auto h-7"
          :disabled="renameRemaining <= 0"
          @click="openRename"
        >
          <Pencil class="h-3.5 w-3.5" />
          修改
        </Button>
      </div>
      <Input :model-value="name" readonly class="bg-muted/40" />
    </div>

    <!-- 相似识别词 -->
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium">相似识别词</span>
        <span class="text-xs text-muted-foreground">
          已登记
          <span class="font-semibold text-foreground">{{ (aliasEditing ? draftAliases : aliases).length }}</span>
          个 · 监控时合并为「{{ name || '品牌' }}」
        </span>
        <Button
          v-if="!aliasEditing"
          type="button"
          variant="outline"
          size="sm"
          class="ml-auto h-7"
          @click="startAliasEdit"
        >
          <Pencil class="h-3.5 w-3.5" />
          修改
        </Button>
      </div>

      <div
        v-if="!aliasEditing"
        class="flex min-h-11 flex-wrap gap-2 rounded-lg border bg-muted/20 px-3 py-2.5"
      >
        <Badge v-for="alias in aliases" :key="alias" variant="secondary">{{ alias }}</Badge>
        <span v-if="!aliases.length" class="text-sm text-muted-foreground">暂无别名，点「修改」添加其它写法</span>
      </div>

      <div v-else class="space-y-3">
        <div class="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border px-3 py-2">
          <Badge
            v-for="alias in draftAliases"
            :key="alias"
            variant="outline"
            class="gap-1 pr-1"
          >
            {{ alias }}
            <button
              type="button"
              class="rounded px-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="移除"
              @click="removeDraftAlias(alias)"
            >
              ×
            </button>
          </Badge>
          <input
            v-model="aliasInput"
            type="text"
            class="min-w-[160px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="输入别名后按回车或逗号添加…"
            @keydown="onAliasKeydown"
          />
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" :disabled="aliasSaving" @click="cancelAliasEdit">
            取消
          </Button>
          <Button type="button" size="sm" :disabled="aliasSaving" @click="saveAliases">
            {{ aliasSaving ? '保存中…' : '保存修改' }}
          </Button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="renameOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeRename"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bi-rename-title"
          class="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg"
        >
          <h3 id="bi-rename-title" class="text-base font-semibold">确定要修改品牌名吗？</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            每个品牌仅有 <span class="font-semibold text-foreground">3 次</span> 修改机会，本次后剩余
            <span class="font-semibold text-destructive">{{ remainingAfterRename }}</span> 次。
          </p>
          <ul class="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li>历史监控数据的品牌识别一致性</li>
            <li>已生成的客户汇报中的品牌引用</li>
            <li>AI 模型对品牌识别的稳定性</li>
          </ul>
          <div class="mt-4 space-y-2">
            <label class="text-sm font-medium">新的品牌名</label>
            <Input
              v-model="renameDraft"
              :placeholder="`当前：${name}`"
              maxlength="60"
              @keydown="onRenameKeydown"
            />
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" :disabled="renameSaving" @click="closeRename">取消</Button>
            <Button type="button" :disabled="!canConfirmRename || renameSaving" @click="confirmRename">
              {{ renameSaving ? '提交中…' : '确认修改' }}
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Pencil } from 'lucide-vue-next'
import { brandApi } from '@/api/modules/brand'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/lib/toast'
import { Badge, Button, Input } from '@/components/ui'

const props = defineProps<{
  name: string
  aliases: string[]
  renameRemaining: number
}>()

const emit = defineEmits<{
  'update:name': [string]
  'update:aliases': [string[]]
  'update:renameRemaining': [number]
}>()

const auth = useAuthStore()
const renameOpen = ref(false)
const renameDraft = ref('')
const renameSaving = ref(false)
const aliasEditing = ref(false)
const draftAliases = ref<string[]>([])
const aliasInput = ref('')
const aliasSaving = ref(false)

const remainingAfterRename = computed(() => Math.max(0, props.renameRemaining - 1))
const canConfirmRename = computed(() => {
  const next = renameDraft.value.trim()
  return !!next && next !== props.name.trim() && props.renameRemaining > 0
})

function openRename() {
  if (props.renameRemaining <= 0) {
    toast.error('修改次数已用尽')
    return
  }
  aliasEditing.value = false
  renameDraft.value = ''
  renameOpen.value = true
}

function closeRename() {
  if (renameSaving.value) return
  renameOpen.value = false
}

function onRenameKeydown(e: KeyboardEvent) {
  if (e.isComposing || e.keyCode === 229) return
  if (e.key === 'Enter') {
    e.preventDefault()
    void confirmRename()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeRename()
  }
}

async function confirmRename() {
  if (!canConfirmRename.value || renameSaving.value) return
  const next = renameDraft.value.trim()
  const oldName = props.name
  renameSaving.value = true
  try {
    const data = await brandApi.rename(next)
    emit('update:name', data.name)
    emit('update:renameRemaining', data.rename_remaining)
    const nextAliases = props.aliases.filter((a) => a.toLowerCase() !== next.toLowerCase())
    if (oldName && !nextAliases.some((a) => a.toLowerCase() === oldName.toLowerCase())) {
      nextAliases.unshift(oldName)
    }
    emit('update:aliases', nextAliases)
    renameOpen.value = false
    toast.success('品牌名已更新')
    try {
      await auth.refreshBrands()
    } catch { /* ignore */ }
  } catch (e: any) {
    toast.error(e?.message || '修改失败')
  } finally {
    renameSaving.value = false
  }
}

function startAliasEdit() {
  renameOpen.value = false
  draftAliases.value = [...props.aliases]
  aliasInput.value = ''
  aliasEditing.value = true
}

function cancelAliasEdit() {
  if (aliasSaving.value) return
  aliasEditing.value = false
  aliasInput.value = ''
  draftAliases.value = []
}

function removeDraftAlias(alias: string) {
  draftAliases.value = draftAliases.value.filter((a) => a !== alias)
}

function addDraftAlias(raw: string) {
  const parts = String(raw || '')
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (!parts.length) return
  const brandLower = props.name.trim().toLowerCase()
  const seen = new Set(draftAliases.value.map((a) => a.toLowerCase()))
  for (const p of parts) {
    const key = p.toLowerCase()
    if (key === brandLower) {
      toast.info('与识别词相同，无需再加为相似识别词')
      continue
    }
    if (seen.has(key)) continue
    seen.add(key)
    draftAliases.value.push(p)
  }
  aliasInput.value = ''
}

function onAliasKeydown(e: KeyboardEvent) {
  if (e.isComposing || e.keyCode === 229) return
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addDraftAlias(aliasInput.value)
  } else if (e.key === 'Backspace' && !aliasInput.value && draftAliases.value.length) {
    draftAliases.value.pop()
  }
}

async function saveAliases() {
  if (aliasSaving.value) return
  if (aliasInput.value.trim()) addDraftAlias(aliasInput.value)
  aliasSaving.value = true
  try {
    const data = await brandApi.updateAliases(draftAliases.value)
    emit(
      'update:aliases',
      (data.aliases || []).map((a) => a.alias),
    )
    aliasEditing.value = false
    aliasInput.value = ''
    toast.success('相似识别词已保存')
  } catch (e: any) {
    toast.error(e?.message || '保存失败')
  } finally {
    aliasSaving.value = false
  }
}
</script>
