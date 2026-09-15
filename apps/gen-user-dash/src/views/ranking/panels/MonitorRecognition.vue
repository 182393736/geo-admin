<template>
  <div class="geo-page">
    <header class="geo-page-header">
      <div class="geo-page-header__text">
        <h1 class="geo-page-title">监控识别管理</h1>
        <p class="geo-page-desc">告诉 AI 哪些说法算「你」、哪些算「对手」，榜单与统计口径由此决定</p>
      </div>
    </header>

    <div class="min-w-0 animate-fade-in">
      <div
        class="mb-5 inline-flex w-full rounded-lg border border-gray-200 bg-white p-[3px] sm:w-auto"
        role="tablist"
        aria-label="监控识别类型"
      >
        <button
          type="button"
          role="tab"
          class="h-8 flex-1 rounded-md px-5 text-[13px] transition-colors sm:flex-none"
          :class="tab === 'alias'
            ? 'bg-gray-950 font-bold text-white shadow-sm'
            : 'font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800'"
          :aria-selected="tab === 'alias'"
          @click="tab = 'alias'"
        >识别词</button>
        <button
          type="button"
          role="tab"
          class="h-8 flex-1 rounded-md px-5 text-[13px] transition-colors sm:flex-none"
          :class="tab === 'competitor'
            ? 'bg-gray-950 font-bold text-white shadow-sm'
            : 'font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800'"
          :aria-selected="tab === 'competitor'"
          @click="tab = 'competitor'"
        >竞品名</button>
      </div>

      <!-- 识别词 -->
      <template v-if="tab === 'alias'">
        <p class="mb-4 text-[13px] leading-5 text-gray-500">
          AI 回答中出现以下任一说法，都算作提到你 —— 可以是品牌名称、产品名称、系列名或门店名
        </p>

        <section class="mr-card mr-card--primary">
          <BrandIdentityFields
            v-model:name="form.name"
            :aliases="form.aliases"
            v-model:rename-remaining="renameRemaining"
            @update:aliases="onAliasesUpdate"
          />
        </section>

        <section class="mr-card mr-card--secondary">
          <BrandProfileFields
            v-model:industry="form.industry"
            v-model:protocol="form.protocol"
            v-model:url-path="form.urlPath"
            v-model:description="form.description"
          />
        </section>
      </template>

      <!-- 竞品名 -->
      <template v-else>
        <p class="mb-4 text-[13px] leading-5 text-gray-500">
          哪些名称算作你的竞争对手 —— 用于竞品透视与对比统计的口径
        </p>

        <div class="mr-comp-wrap">
          <header class="mr-comp-header">
            <div class="mr-comp-header__text">
              <h2 class="mr-comp-title">竞品名单</h2>
              <p class="mr-comp-desc">主要竞争对手 · 监控分析、对比稿件、竞争洞察时作为对照</p>
            </div>
            <button
              v-if="!adding"
              type="button"
              class="mr-add-btn"
              @click="openAdd"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              添加竞品
            </button>
          </header>

          <!-- 新增表单 -->
          <div v-if="adding" class="mr-add-form">
            <div class="mr-add-form__title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              新增竞品
            </div>
            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-[#2a2d36]">
                  竞品名 <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="draft.name"
                  type="text"
                  class="mr-input"
                  placeholder="例如:海信"
                  maxlength="60"
                  @keydown.enter.prevent="submitAdd"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-[#2a2d36]">主要竞争点</label>
                <textarea
                  v-model="draft.compet_point"
                  rows="3"
                  class="mr-textarea"
                  placeholder="一段话描述这个竞品的主要竞争维度..."
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-semibold text-[#2a2d36]">相似名称 / 别名</label>
                <div class="mr-alias-box mr-alias-box--focus">
                  <span
                    v-for="alias in draft.aliases"
                    :key="alias"
                    class="mr-alias-tag mr-alias-tag--edit"
                  >
                    <span>{{ alias }}</span>
                    <button type="button" class="mr-alias-x" aria-label="移除" @click="removeDraftAlias(alias)">×</button>
                  </span>
                  <input
                    v-model="draft.aliasInput"
                    type="text"
                    class="mr-alias-input"
                    placeholder="同一竞品的中文名 / 英文名 / 拼音 / 错拼,回车或逗号添加…"
                    @keydown="onDraftAliasKey"
                  />
                </div>
              </div>
              <div class="flex justify-end items-center gap-2 mt-1">
                <button type="button" class="mr-btn-ghost" :disabled="savingAdd" @click="cancelAdd">取消</button>
                <button type="button" class="mr-btn-primary" :disabled="savingAdd || !draft.name.trim()" @click="submitAdd">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  {{ savingAdd ? '添加中…' : '添加' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 空态 -->
          <div v-if="!competitors.length" class="mr-empty">
            <div class="mr-empty__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <div class="mr-empty__title">还没有添加竞品</div>
            <div class="mr-empty__hint">维护竞品和它们的别名 · 把同一竞品的不同写法归一,排名榜单不再重复进榜</div>
            <button type="button" class="mr-empty__btn" @click="openAdd">添加竞品</button>
          </div>

          <!-- 列表 -->
          <div v-else class="mr-comp-list">
            <div v-for="comp in competitors" :key="comp.id" class="mr-comp-card group">
              <div class="mr-comp-card__head">
                <input
                  v-model="comp.name"
                  type="text"
                  class="mr-comp-name"
                  maxlength="60"
                  @blur="saveCompName(comp)"
                  @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
                />
                <button
                  type="button"
                  class="mr-comp-del"
                  title="删除竞品"
                  @click="removeComp(comp)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>

              <div class="mr-comp-field">
                <span class="mr-comp-label">主要竞争点</span>
                <textarea
                  v-model="comp.compet_point"
                  class="mr-comp-point"
                  rows="2"
                  placeholder="描述这个竞品的主要竞争维度..."
                  @blur="saveCompPoint(comp)"
                />
              </div>

              <div class="mr-comp-aliases">
                <div class="mr-comp-aliases__row">
                  <span class="mr-comp-label">相似名称 / 别名</span>
                  <span class="mr-comp-aliases__hint">
                    已登记 <strong>{{ (comp.aliasEditing ? comp.draftAliases : comp.aliases).length }}</strong> 个 · 监控 / 排名统计时合并识别
                  </span>
                  <button
                    v-if="!comp.aliasEditing"
                    type="button"
                    class="mr-comp-edit"
                    @click="startCompAliasEdit(comp)"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                    修改
                  </button>
                </div>

                <div v-if="!comp.aliasEditing" class="mr-alias-box mr-alias-box--ro">
                  <span v-if="!comp.aliases.length" class="mr-alias-empty">暂无别名,点「修改」添加同一竞品的其它写法</span>
                  <span v-for="alias in comp.aliases" :key="alias" class="mr-alias-tag">{{ alias }}</span>
                </div>
                <div v-else>
                  <div class="mr-alias-box mr-alias-box--focus">
                    <span
                      v-for="alias in comp.draftAliases"
                      :key="alias"
                      class="mr-alias-tag mr-alias-tag--edit"
                    >
                      <span>{{ alias }}</span>
                      <button type="button" class="mr-alias-x" aria-label="移除" @click="removeCompDraftAlias(comp, alias)">×</button>
                    </span>
                    <input
                      v-model="comp.aliasInput"
                      type="text"
                      class="mr-alias-input"
                      placeholder="输入别名后按回车或逗号添加..."
                      @keydown="(e) => onCompAliasKey(e, comp)"
                    />
                  </div>
                  <div class="flex gap-2 mt-2">
                    <button type="button" class="mr-btn-ghost" :disabled="comp.aliasSaving" @click="cancelCompAliasEdit(comp)">取消</button>
                    <button type="button" class="mr-btn-primary" :disabled="comp.aliasSaving" @click="saveCompAliases(comp)">
                      {{ comp.aliasSaving ? '保存中…' : '保存修改' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { brandApi, type CompetitorItem } from '@/api/modules/brand';
import BrandIdentityFields from '@/components/brand/BrandIdentityFields.vue';
import BrandProfileFields from '@/components/brand/BrandProfileFields.vue';
import { toast } from '@/lib/toast';

type CompRow = CompetitorItem & {
  aliases: string[];
  compet_point: string;
  aliasEditing?: boolean;
  draftAliases?: string[];
  aliasInput?: string;
  aliasSaving?: boolean;
  _savedName?: string;
  _savedPoint?: string;
};

const tab = ref<'alias' | 'competitor'>('alias');
const renameRemaining = ref(0);
const form = reactive({
  name: '',
  industry: '',
  protocol: 'https://',
  urlPath: '',
  description: '',
  aliases: [] as string[],
});

const competitors = reactive<CompRow[]>([]);
const adding = ref(false);
const savingAdd = ref(false);
const draft = reactive({
  name: '',
  compet_point: '',
  aliases: [] as string[],
  aliasInput: '',
});

function onAliasesUpdate(list: string[]) {
  form.aliases.splice(0, form.aliases.length, ...list);
}

function splitWebsite(website: string) {
  if (website.startsWith('http://')) {
    form.protocol = 'http://';
    form.urlPath = website.slice('http://'.length);
  } else if (website.startsWith('https://')) {
    form.protocol = 'https://';
    form.urlPath = website.slice('https://'.length);
  } else {
    form.protocol = 'https://';
    form.urlPath = website;
  }
}

function openAdd() {
  adding.value = true;
  draft.name = '';
  draft.compet_point = '';
  draft.aliases = [];
  draft.aliasInput = '';
}

function cancelAdd() {
  if (savingAdd.value) return;
  adding.value = false;
}

function addDraftAlias(raw: string) {
  const parts = String(raw || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
  if (!parts.length) return;
  const nameLower = draft.name.trim().toLowerCase();
  const seen = new Set(draft.aliases.map(a => a.toLowerCase()));
  for (const p of parts) {
    const key = p.toLowerCase();
    if (nameLower && key === nameLower) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    draft.aliases.push(p);
  }
  draft.aliasInput = '';
}

function removeDraftAlias(alias: string) {
  draft.aliases = draft.aliases.filter(a => a !== alias);
}

function onDraftAliasKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addDraftAlias(draft.aliasInput);
  } else if (e.key === 'Backspace' && !draft.aliasInput && draft.aliases.length) {
    draft.aliases.pop();
  }
}

async function submitAdd() {
  if (savingAdd.value) return;
  if (draft.aliasInput.trim()) addDraftAlias(draft.aliasInput);
  const name = draft.name.trim();
  if (!name) {
    toast.error('请填写竞品名');
    return;
  }
  savingAdd.value = true;
  try {
    const row = await brandApi.createCompetitor({
      name,
      compet_point: draft.compet_point.trim(),
      aliases: [...draft.aliases],
    });
    competitors.unshift(toRow(row));
    adding.value = false;
    toast.success('竞品已添加');
  } catch (e: any) {
    toast.error(e?.message || '添加失败');
  } finally {
    savingAdd.value = false;
  }
}

function toRow(c: CompetitorItem | any): CompRow {
  const name = String(c.name || '');
  const point = String(c.compet_point || '');
  const aliases = Array.isArray(c.aliases) ? c.aliases.map((a: any) => String(a || '').trim()).filter(Boolean) : [];
  return {
    id: String(c.id || ''),
    name,
    compet_point: point,
    aliases,
    source: c.source,
    _savedName: name,
    _savedPoint: point,
  };
}

async function saveCompName(comp: CompRow) {
  const next = comp.name.trim();
  if (!next) {
    comp.name = comp._savedName || '';
    toast.error('竞品名不能为空');
    return;
  }
  if (next === comp._savedName) return;
  try {
    const row = await brandApi.updateCompetitor({ id: comp.id, name: next });
    Object.assign(comp, toRow(row));
    toast.success('竞品名已更新');
  } catch (e: any) {
    comp.name = comp._savedName || '';
    toast.error(e?.message || '保存失败');
  }
}

async function saveCompPoint(comp: CompRow) {
  const next = comp.compet_point.trim();
  if (next === (comp._savedPoint || '')) return;
  try {
    const row = await brandApi.updateCompetitor({ id: comp.id, compet_point: next });
    Object.assign(comp, toRow(row));
  } catch (e: any) {
    comp.compet_point = comp._savedPoint || '';
    toast.error(e?.message || '保存失败');
  }
}

async function removeComp(comp: CompRow) {
  try {
    await brandApi.deleteCompetitor(comp.id);
    const idx = competitors.findIndex(c => c.id === comp.id);
    if (idx >= 0) competitors.splice(idx, 1);
    toast.success('已删除竞品');
  } catch (e: any) {
    toast.error(e?.message || '删除失败');
  }
}

function startCompAliasEdit(comp: CompRow) {
  comp.aliasEditing = true;
  comp.draftAliases = [...comp.aliases];
  comp.aliasInput = '';
}

function cancelCompAliasEdit(comp: CompRow) {
  if (comp.aliasSaving) return;
  comp.aliasEditing = false;
  comp.draftAliases = [];
  comp.aliasInput = '';
}

function removeCompDraftAlias(comp: CompRow, alias: string) {
  comp.draftAliases = (comp.draftAliases || []).filter(a => a !== alias);
}

function addCompDraftAlias(comp: CompRow, raw: string) {
  const parts = String(raw || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
  if (!parts.length) return;
  const nameLower = comp.name.trim().toLowerCase();
  const list = comp.draftAliases || (comp.draftAliases = []);
  const seen = new Set(list.map(a => a.toLowerCase()));
  for (const p of parts) {
    const key = p.toLowerCase();
    if (key === nameLower) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(p);
  }
  comp.aliasInput = '';
}

function onCompAliasKey(e: KeyboardEvent, comp: CompRow) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addCompDraftAlias(comp, comp.aliasInput || '');
  } else if (e.key === 'Backspace' && !comp.aliasInput && (comp.draftAliases || []).length) {
    comp.draftAliases!.pop();
  }
}

async function saveCompAliases(comp: CompRow) {
  if (comp.aliasSaving) return;
  if (comp.aliasInput?.trim()) addCompDraftAlias(comp, comp.aliasInput);
  comp.aliasSaving = true;
  try {
    const row = await brandApi.updateCompetitor({ id: comp.id, aliases: [...(comp.draftAliases || [])] });
    Object.assign(comp, toRow(row));
    comp.aliasEditing = false;
    toast.success('别名已保存');
  } catch (e: any) {
    toast.error(e?.message || '保存失败');
  } finally {
    comp.aliasSaving = false;
  }
}

onMounted(async () => {
  try {
    const s = await brandApi.summary();
    if (!s) return;
    form.name = s.brand?.name || '';
    form.industry = s.brand?.industry || '';
    form.description = s.profile?.description || s.brand?.business_desc || '';
    form.aliases = (s.aliases || []).map((a: any) => a.alias);
    renameRemaining.value = s.brand?.rename_remaining ?? 0;
    splitWebsite(s.brand?.website || '');
    competitors.splice(
      0,
      competitors.length,
      ...(s.competitors || []).map((c: any) => toRow(c)),
    );
  } catch { /* 空态 */ }
});
</script>

<style lang="scss" scoped>
.mr-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 16px;
  padding: 20px 22px 22px;
  transition: all 0.15s;

  &:hover {
    border-color: rgba(100, 82, 255, 0.25);
    box-shadow: 0 8px 24px rgba(20, 20, 40, 0.06);
  }

  &--primary {
    margin: 0 0 28px;
  }

  &--secondary {
    margin: 18px 0 0;
  }
}

/* 对标：嵌入竞品名单时隐藏标题区，仅保留右侧添加按钮 */
.mr-comp-wrap {
  :deep(.mr-comp-header) {
    margin-bottom: 16px;
    justify-content: flex-end;
  }

  :deep(.mr-comp-header__text) {
    display: none;
  }
}

.mr-comp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.mr-comp-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.55px;
  color: #0f1115;
  line-height: 33px;
}

.mr-comp-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #5b606a;
  line-height: 19.5px;
}

.mr-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  background: #6452ff;
  border: none;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.02);
  }
}

.mr-add-form {
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  background: #fff;
  border: 1.5px solid #6452ff;
  box-shadow: 0 8px 24px rgba(100, 82, 255, 0.08);
}

.mr-add-form__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 700;
  color: #6452ff;
}

.mr-input {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 13px;
  color: #0f1115;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.mr-textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 13px;
  line-height: 1.625;
  color: #0f1115;
  outline: none;
  resize: none;
  min-height: 72px;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.mr-btn-ghost {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #5b606a;
  background: #fff;
  border: 1px solid #e6e8ee;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
}

.mr-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: #6452ff;
  border: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
}

.mr-empty {
  padding: 48px 16px;
  text-align: center;
  border-radius: 16px;
  background: #fff;
  border: 1px dashed #e6e8ee;
}

.mr-empty__icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: #efecff;
  color: #6452ff;
}

.mr-empty__title {
  font-size: 14px;
  font-weight: 700;
  color: #0f1115;
  margin-bottom: 4px;
}

.mr-empty__hint {
  font-size: 12px;
  color: #8a8f9b;
  margin-bottom: 16px;
}

.mr-empty__btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  background: #6452ff;
  border: none;
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.02);
  }
}

.mr-comp-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mr-comp-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.15s;

  &:hover .mr-comp-del {
    opacity: 1;
  }
}

.mr-comp-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f1f6;
}

.mr-comp-name {
  flex: 1;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: 1px solid transparent;
  color: #0f1115;
  outline: none;

  &:hover {
    background: #f9fafb;
  }

  &:focus {
    background: #fff;
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.mr-comp-del {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: #8a8f9b;
  background: transparent;
  border: 1px solid #e6e8ee;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;

  &:hover {
    background: #fef2f2;
    color: #ef4444;
  }
}

.mr-comp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mr-comp-label {
  font-size: 11.5px;
  font-weight: 600;
  color: #5b606a;
}

.mr-comp-point {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.625;
  background: #f5f6fa;
  border: 1px solid #e6e8ee;
  color: #0f1115;
  outline: none;
  resize: none;
  min-height: 60px;
  font-family: inherit;

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.mr-comp-aliases {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 14px;
}

.mr-comp-aliases__row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mr-comp-aliases__hint {
  font-size: 11px;
  color: #8a8f9b;

  strong {
    font-weight: 700;
    color: #2a2d36;
  }
}

.mr-comp-edit {
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

  &:hover {
    background: #fafafe;
  }
}

.mr-alias-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px;
  border-radius: 8px;
  min-height: 40px;
  border: 1px solid #e6e8ee;
  background: #f5f6fa;

  &--ro {
    background: #f5f6fa;
  }

  &--focus {
    background: #fff;
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.mr-alias-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #efecff;
  color: #4a38e0;

  &--edit {
    padding-right: 4px;
  }
}

.mr-alias-x {
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  line-height: 1;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
}

.mr-alias-input {
  flex: 1;
  min-width: 120px;
  padding: 0 4px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #0f1115;
}

.mr-alias-empty {
  font-size: 12px;
  color: #9ca3af;
}
</style>
