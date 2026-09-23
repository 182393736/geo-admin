<template>
  <div class="bi-fields">
    <!-- 识别词 -->
    <div class="bi-field">
      <div class="bi-field-row">
        <span class="bi-field-name">识别词（品牌名称 / 产品名称）</span>
        <span class="bi-badge-req">必填</span>
        <span class="bi-field-hint">剩余修改次数 <strong>{{ renameRemaining }}</strong> 次</span>
        <button
          type="button"
          class="bi-field-edit"
          :disabled="renameRemaining <= 0"
          @click="openRename"
        >
          <icon-edit :size="11" />
          修改
        </button>
      </div>
      <input type="text" class="bi-input-ro" :value="name" readonly />
    </div>

    <!-- 相似识别词 -->
    <div class="bi-field">
      <div class="bi-field-row">
        <span class="bi-field-name">相似识别词</span>
        <span class="bi-field-hint">
          已登记 <strong>{{ (aliasEditing ? draftAliases : aliases).length }}</strong> 个别名 · 监控统计时合并为「{{ name || '品牌' }}」
        </span>
        <button
          v-if="!aliasEditing"
          type="button"
          class="bi-field-edit"
          @click="startAliasEdit"
        >
          <icon-edit :size="11" />
          修改
        </button>
      </div>

      <div v-if="!aliasEditing" class="bi-aliases-box">
        <span v-for="alias in aliases" :key="alias" class="bi-alias-tag">
          <span>{{ alias }}</span>
        </span>
        <span v-if="!aliases.length" class="bi-aliases-empty">暂无别名，点「修改」添加其它写法</span>
      </div>

      <div v-else class="bi-aliases-edit">
        <div class="bi-aliases-box bi-aliases-box--edit">
          <span v-for="alias in draftAliases" :key="alias" class="bi-alias-tag bi-alias-tag--edit">
            <span>{{ alias }}</span>
            <button type="button" class="bi-alias-remove" aria-label="移除" @click="removeDraftAlias(alias)">×</button>
          </span>
          <input
            v-model="aliasInput"
            type="text"
            class="bi-alias-input"
            placeholder="输入别名后按回车或逗号添加..."
            @keydown="onAliasKeydown"
          />
        </div>
        <div class="bi-alias-actions">
          <button type="button" class="bi-btn bi-btn--ghost" :disabled="aliasSaving" @click="cancelAliasEdit">
            取消
          </button>
          <button type="button" class="bi-btn bi-btn--primary" :disabled="aliasSaving" @click="saveAliases">
            {{ aliasSaving ? '保存中…' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 识别词修改弹窗（对标 brand-library 居中弹层） -->
    <Teleport to="body">
      <div v-if="renameOpen" class="bi-rename-mask" @click.self="closeRename">
        <div class="bi-rename-card" role="dialog" aria-modal="true" aria-labelledby="bi-rename-title">
          <div class="bi-rename-body">
            <div class="bi-rename-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <h3 id="bi-rename-title" class="bi-rename-title">确定要修改品牌名吗?</h3>
            <p class="bi-rename-desc">
              每个品牌仅有 <strong class="bi-rename-strong">3 次</strong> 修改机会,本次修改后剩余
              <strong class="bi-rename-strong bi-rename-strong--danger">{{ remainingAfterRename }}</strong> 次。<br />
              品牌名是数据归属与历史报告引用的核心标识,频繁修改可能影响:
            </p>
            <ul class="bi-rename-list">
              <li>历史监控数据的品牌识别一致性</li>
              <li>已生成的客户汇报中的品牌引用</li>
              <li>AI 模型对品牌识别的稳定性</li>
            </ul>
            <div class="bi-rename-field">
              <span class="bi-rename-label">新的品牌名</span>
              <input
                v-model="renameDraft"
                type="text"
                class="bi-rename-input"
                :placeholder="`当前:${name}`"
                maxlength="60"
                @keydown="onRenameKeydown"
              />
            </div>
          </div>
          <div class="bi-rename-foot">
            <button type="button" class="bi-rename-cancel" :disabled="renameSaving" @click="closeRename">
              取消
            </button>
            <button
              type="button"
              class="bi-rename-confirm"
              :disabled="!canConfirmRename || renameSaving"
              @click="confirmRename"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                <path d="m15 5 4 4" />
              </svg>
              {{ renameSaving ? '提交中…' : '确认修改(消耗 1 次机会)' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IconEdit } from '@arco-design/web-vue/es/icon';
import { brandApi } from '@/api/modules/brand';
import { useAuthStore } from '@/stores/auth';
import { toast } from '@/lib/toast';

const props = defineProps<{
  name: string;
  aliases: string[];
  renameRemaining: number;
}>();

const emit = defineEmits<{
  'update:name': [string];
  'update:aliases': [string[]];
  'update:renameRemaining': [number];
}>();

const auth = useAuthStore();

const renameOpen = ref(false);
const renameDraft = ref('');
const renameSaving = ref(false);

const aliasEditing = ref(false);
const draftAliases = ref<string[]>([]);
const aliasInput = ref('');
const aliasSaving = ref(false);

const remainingAfterRename = computed(() => Math.max(0, props.renameRemaining - 1));

const canConfirmRename = computed(() => {
  const next = renameDraft.value.trim();
  return !!next && next !== props.name.trim() && props.renameRemaining > 0;
});

function openRename() {
  if (props.renameRemaining <= 0) {
    toast.error('修改次数已用尽');
    return;
  }
  aliasEditing.value = false;
  // 对标：打开时输入为空，placeholder 显示「当前:xxx」，确认按钮禁用
  renameDraft.value = '';
  renameOpen.value = true;
}

function closeRename() {
  if (renameSaving.value) return;
  renameOpen.value = false;
}

function onRenameKeydown(e: KeyboardEvent) {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === 'Enter') {
    e.preventDefault();
    void confirmRename();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeRename();
  }
}

async function confirmRename() {
  if (!canConfirmRename.value || renameSaving.value) return;
  const next = renameDraft.value.trim();
  const oldName = props.name;
  renameSaving.value = true;
  try {
    const data = await brandApi.rename(next);
    emit('update:name', data.name);
    emit('update:renameRemaining', data.rename_remaining);
    const nextAliases = props.aliases.filter(a => a.toLowerCase() !== next.toLowerCase());
    if (oldName && !nextAliases.some(a => a.toLowerCase() === oldName.toLowerCase())) {
      nextAliases.unshift(oldName);
    }
    emit('update:aliases', nextAliases);
    renameOpen.value = false;
    toast.success('品牌名已更新');
    try { await auth.refreshBrands(); } catch { /* ignore */ }
  } catch (e: any) {
    toast.error(e?.message || '修改失败');
  } finally {
    renameSaving.value = false;
  }
}

function startAliasEdit() {
  renameOpen.value = false;
  draftAliases.value = [...props.aliases];
  aliasInput.value = '';
  aliasEditing.value = true;
}

function cancelAliasEdit() {
  if (aliasSaving.value) return;
  aliasEditing.value = false;
  aliasInput.value = '';
  draftAliases.value = [];
}

function removeDraftAlias(alias: string) {
  draftAliases.value = draftAliases.value.filter(a => a !== alias);
}

function addDraftAlias(raw: string) {
  const parts = String(raw || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
  if (!parts.length) return;
  const brandLower = props.name.trim().toLowerCase();
  const seen = new Set(draftAliases.value.map(a => a.toLowerCase()));
  let added = 0;
  for (const p of parts) {
    const key = p.toLowerCase();
    if (key === brandLower) {
      toast.info('与识别词相同，无需再加为相似识别词');
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    draftAliases.value.push(p);
    added++;
  }
  aliasInput.value = '';
  if (!added && parts.length) {
    /* 全是重复时静默清空输入即可 */
  }
}

function onAliasKeydown(e: KeyboardEvent) {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addDraftAlias(aliasInput.value);
  } else if (e.key === 'Backspace' && !aliasInput.value && draftAliases.value.length) {
    draftAliases.value.pop();
  }
}

async function saveAliases() {
  if (aliasSaving.value) return;
  if (aliasInput.value.trim()) addDraftAlias(aliasInput.value);
  aliasSaving.value = true;
  try {
    const data = await brandApi.updateAliases(draftAliases.value);
    emit('update:aliases', (data.aliases || []).map(a => a.alias));
    aliasEditing.value = false;
    aliasInput.value = '';
    toast.success('相似识别词已保存');
  } catch (e: any) {
    toast.error(e?.message || '保存失败');
  } finally {
    aliasSaving.value = false;
  }
}
</script>

<style lang="scss" scoped>
.bi-fields {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bi-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bi-field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12.5px;
}

.bi-field-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f1115;
}

.bi-badge-req {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
}

.bi-field-hint {
  font-size: 11.5px;
  color: #8a8f9b;

  strong {
    font-weight: 700;
    color: #2a2d36;
  }
}

.bi-field-edit {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11.5px;
  font-weight: 600;
  color: #5b606a;
  background: transparent;
  border: 1px solid #e6e8ee;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover:not(:disabled) {
    background: #fafafe;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.bi-input-ro {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #f5f6fa;
  font-size: 14px;
  font-weight: 600;
  color: #0f1115;
  cursor: default;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.bi-aliases-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #f5f6fa;
  min-height: 40px;

  &--edit {
    background: #fff;
    align-items: center;
  }
}

.bi-aliases-empty {
  font-size: 12px;
  color: #9ca3af;
  padding: 2px 4px;
}

.bi-alias-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #efecff;
  color: #4a38e0;
  height: 24px;
  box-sizing: border-box;

  &--edit {
    padding-right: 6px;
  }
}

.bi-alias-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #4a38e0;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  padding: 0;

  &:hover {
    background: rgba(74, 56, 224, 0.12);
  }
}

.bi-alias-input {
  flex: 1;
  min-width: 160px;
  height: 28px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12.5px;
  color: #0f1115;

  &::placeholder {
    color: #9ca3af;
  }
}

.bi-alias-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.bi-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color 0.15s, opacity 0.15s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--ghost {
    background: #fff;
    border-color: #e6e8ee;
    color: #5b606a;

    &:hover:not(:disabled) {
      background: #fafafe;
    }
  }

  &--primary {
    background: #6452ff;
    color: #fff;

    &:hover:not(:disabled) {
      background: #5644f0;
    }
  }

  &--danger {
    background: #ef4444;
    color: #fff;

    &:hover:not(:disabled) {
      background: #dc2626;
    }
  }
}

/* —— 修改品牌名弹窗（对标 geo.timus.cn /dashboard/brand-library） —— */
.bi-rename-mask {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: bi-rename-fade-in 0.15s ease;
}

@keyframes bi-rename-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.bi-rename-card {
  width: 480px;
  max-width: 96vw;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #f3f4f6;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: bi-rename-fade-in 0.15s ease;
}

.bi-rename-body {
  padding: 28px 28px 24px;
}

.bi-rename-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 9999px;
  background: #fff5e3;
  color: #b67900;
  border: 1px solid #fde6b3;
}

.bi-rename-title {
  margin: 0 0 10px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  font-size: 17px;
  font-weight: 800;
  line-height: 25.5px;
  text-align: center;
  color: #0f1115;
}

.bi-rename-desc {
  margin: 0 0 16px;
  font-size: 12.5px;
  font-weight: 400;
  line-height: 20.3125px;
  text-align: center;
  color: #5b606a;
}

.bi-rename-strong {
  font-weight: 700;
  color: #0f1115;

  &--danger {
    color: #dc2626;
  }
}

.bi-rename-list {
  margin: 0 0 20px 16px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #fde6b3;
  background: #fff8e6;
  list-style: disc outside;
  font-size: 12px;
  font-weight: 400;
  line-height: 22.8px;
  color: #2a2d36;

  li + li {
    margin-top: 0;
  }
}

.bi-rename-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;
}

.bi-rename-label {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 18.75px;
  color: #2a2d36;
}

.bi-rename-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 13.5px;
  font-weight: 400;
  line-height: 20.25px;
  color: #0f1115;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.bi-rename-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 28px;
  background: #f5f6fa;
}

.bi-rename-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 18.75px;
  color: #2a2d36;
  cursor: pointer;
  transition: background-color 0.15s, opacity 0.15s;

  &:hover:not(:disabled) {
    background: #fafafe;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.bi-rename-confirm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #dc2626;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 12.5px;
  font-weight: 700;
  line-height: 18.75px;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.15s, background-color 0.15s;

  &:hover:not(:disabled) {
    background: #b91c1c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
