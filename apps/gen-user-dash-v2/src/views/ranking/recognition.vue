<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader
      title="监控识别管理"
      description="告诉 AI 哪些说法算「你」、哪些算「对手」，榜单与统计口径由此决定"
    />

    <div
      class="inline-flex w-full rounded-lg border bg-muted/40 p-1 sm:w-auto"
      role="tablist"
      aria-label="监控识别类型"
    >
      <button
        type="button"
        role="tab"
        class="h-8 flex-1 rounded-md px-5 text-[13px] transition-colors sm:flex-none"
        :class="tab === 'alias'
          ? 'bg-background font-semibold text-foreground shadow-sm'
          : 'font-medium text-muted-foreground hover:text-foreground'"
        :aria-selected="tab === 'alias'"
        @click="tab = 'alias'"
      >识别词</button>
      <button
        type="button"
        role="tab"
        class="h-8 flex-1 rounded-md px-5 text-[13px] transition-colors sm:flex-none"
        :class="tab === 'competitor'
          ? 'bg-background font-semibold text-foreground shadow-sm'
          : 'font-medium text-muted-foreground hover:text-foreground'"
        :aria-selected="tab === 'competitor'"
        @click="tab = 'competitor'"
      >竞品名</button>
    </div>

    <!-- 识别词 -->
    <template v-if="tab === 'alias'">
      <p class="text-sm text-muted-foreground">
        AI 回答中出现以下任一说法，都算作提到你 —— 可以是品牌名称、产品名称、系列名或门店名
      </p>

      <Card>
        <CardContent class="p-5">
          <BrandIdentityFields
            v-model:name="form.name"
            :aliases="form.aliases"
            v-model:rename-remaining="renameRemaining"
            @update:aliases="onAliasesUpdate"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-5">
          <BrandProfileFields
            v-model:industry="form.industry"
            v-model:protocol="form.protocol"
            v-model:url-path="form.urlPath"
            v-model:description="form.description"
          />
        </CardContent>
      </Card>
    </template>

    <!-- 竞品名 -->
    <template v-else>
      <p class="text-sm text-muted-foreground">
        哪些名称算作你的竞争对手 —— 用于竞品透视与对比统计的口径
      </p>

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Swords class="h-4 w-4" />
          </div>
          <div>
            <div class="text-sm font-semibold">竞品名单</div>
            <div class="text-xs text-muted-foreground">主要竞争对手 · 监控分析、对比稿件时作为对照</div>
          </div>
        </div>
        <Button v-if="!adding" size="sm" @click="openAdd">
          <Plus class="h-3.5 w-3.5" />
          添加竞品
        </Button>
      </div>

      <!-- 新增表单 -->
      <Card v-if="adding" class="border-primary/40">
        <CardContent class="space-y-4 p-5">
          <div class="flex items-center gap-2 text-sm font-semibold text-primary">
            <Plus class="h-4 w-4" />
            新增竞品
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium">
              竞品名 <span class="text-destructive">*</span>
            </label>
            <Input
              v-model="draft.name"
              placeholder="例如:海信"
              maxlength="60"
              @keydown.enter.prevent="submitAdd"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium">主要竞争点</label>
            <textarea
              v-model="draft.compet_point"
              rows="3"
              class="flex min-h-[72px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="一段话描述这个竞品的主要竞争维度..."
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium">相似名称 / 别名</label>
            <div class="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border px-3 py-2">
              <Badge
                v-for="alias in draft.aliases"
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
                >×</button>
              </Badge>
              <input
                v-model="draft.aliasInput"
                type="text"
                class="min-w-[160px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="同一竞品的中文名 / 英文名 / 拼音 / 错拼,回车或逗号添加…"
                @keydown="onDraftAliasKey"
              />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" size="sm" :disabled="savingAdd" @click="cancelAdd">取消</Button>
            <Button size="sm" :disabled="savingAdd || !draft.name.trim()" @click="submitAdd">
              <Plus class="h-3.5 w-3.5" />
              {{ savingAdd ? '添加中…' : '添加' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 空态 -->
      <Card v-if="!competitors.length" class="border-dashed">
        <CardContent class="flex flex-col items-center px-4 py-12 text-center">
          <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus class="h-5 w-5" />
          </div>
          <div class="mb-1 text-sm font-semibold">还没有添加竞品</div>
          <div class="mb-4 max-w-sm text-xs text-muted-foreground">
            维护竞品和它们的别名 · 把同一竞品的不同写法归一,排名榜单不再重复进榜
          </div>
          <Button size="sm" @click="openAdd">添加竞品</Button>
        </CardContent>
      </Card>

      <!-- 列表 -->
      <div v-else class="space-y-3">
        <Card v-for="comp in competitors" :key="comp.id" class="group">
          <CardContent class="space-y-4 p-5">
            <div class="flex items-center gap-2 border-b pb-3">
              <Input
                v-model="comp.name"
                class="border-transparent bg-transparent font-semibold shadow-none hover:bg-muted/40 focus-visible:border-input focus-visible:bg-background"
                maxlength="60"
                @blur="saveCompName(comp)"
                @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                class="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                title="删除竞品"
                @click="removeComp(comp)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </Button>
            </div>

            <div class="space-y-1.5">
              <span class="text-xs font-medium text-muted-foreground">主要竞争点</span>
              <textarea
                v-model="comp.compet_point"
                rows="2"
                class="flex min-h-[60px] w-full rounded-lg border border-input bg-muted/20 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="描述这个竞品的主要竞争维度..."
                @blur="saveCompPoint(comp)"
              />
            </div>

            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-medium text-muted-foreground">相似名称 / 别名</span>
                <span class="text-[11px] text-muted-foreground">
                  已登记
                  <span class="font-semibold text-foreground">{{ (comp.aliasEditing ? (comp.draftAliases || []) : (comp.aliases || [])).length }}</span>
                  个 · 监控 / 排名统计时合并识别
                </span>
                <Button
                  v-if="!comp.aliasEditing"
                  type="button"
                  variant="outline"
                  size="sm"
                  class="ml-auto h-7"
                  @click="startCompAliasEdit(comp)"
                >
                  <Pencil class="h-3 w-3" />
                  修改
                </Button>
              </div>

              <div
                v-if="!comp.aliasEditing"
                class="flex min-h-10 flex-wrap gap-2 rounded-lg border bg-muted/20 px-3 py-2"
              >
                <span v-if="!comp.aliases.length" class="text-sm text-muted-foreground">
                  暂无别名,点「修改」添加同一竞品的其它写法
                </span>
                <Badge v-for="alias in comp.aliases" :key="alias" variant="secondary">{{ alias }}</Badge>
              </div>
              <div v-else class="space-y-2">
                <div class="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border px-3 py-2">
                  <Badge
                    v-for="alias in comp.draftAliases"
                    :key="alias"
                    variant="outline"
                    class="gap-1 pr-1"
                  >
                    {{ alias }}
                    <button
                      type="button"
                      class="rounded px-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="移除"
                      @click="removeCompDraftAlias(comp, alias)"
                    >×</button>
                  </Badge>
                  <input
                    v-model="comp.aliasInput"
                    type="text"
                    class="min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="输入别名后按回车或逗号添加..."
                    @keydown="(e) => onCompAliasKey(e, comp)"
                  />
                </div>
                <div class="flex gap-2">
                  <Button variant="outline" size="sm" :disabled="comp.aliasSaving" @click="cancelCompAliasEdit(comp)">取消</Button>
                  <Button size="sm" :disabled="comp.aliasSaving" @click="saveCompAliases(comp)">
                    {{ comp.aliasSaving ? '保存中…' : '保存修改' }}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { Pencil, Plus, Swords, Trash2 } from 'lucide-vue-next';
import { brandApi, type CompetitorItem } from '@/api/modules/brand';
import BrandIdentityFields from '@/components/brand/BrandIdentityFields.vue';
import BrandProfileFields from '@/components/brand/BrandProfileFields.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Badge, Button, Card, CardContent, Input } from '@/components/ui';
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
  if (e.isComposing || e.keyCode === 229) return;
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
  if (e.isComposing || e.keyCode === 229) return;
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
