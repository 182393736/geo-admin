<template>
  <div class="ml-page geo-page">
    <div class="ml-header geo-page-header">
      <div class="ml-title-block">
        <div class="ml-title-row">
          <h2 class="ml-title geo-page-title">信源库</h2>
          <span class="ml-total-chip">全库 {{ formatNum(libraryTotal) }} 家</span>
        </div>
        <p class="ml-desc geo-page-desc">在这些源上发的内容，更容易被 AI 引用 · 引用数据来自透镜GEO监测底座</p>
      </div>
      <div class="ml-header-actions">
        <button class="ml-btn-dark" type="button" @click="goPublish()">
          去发布稿件
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <div class="geo-page-stack">
      <div class="ml-card">
        <!-- 筛选 -->
        <div class="ml-filter-bar">
          <div class="ml-filter-group">
            <span class="ml-filter-label">AI 引擎</span>
            <select v-model="filters.engine" class="ml-select" @change="reload(1)">
              <option value="all">全部</option>
              <option value="doubao">豆包</option>
              <option value="deepseek">DeepSeek</option>
              <option value="wenxin">文心一言</option>
              <option value="qwen">千问</option>
              <option value="yuanbao">元宝</option>
            </select>
          </div>

          <div class="ml-filter-group">
            <span class="ml-filter-label">监控问题</span>
            <button type="button" class="ml-select ml-select--btn" @click="queryOpen = !queryOpen">
              <span>{{ queryLabel }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>

          <div class="ml-filter-group">
            <span class="ml-filter-label">媒体类型</span>
            <select v-model="filters.category" class="ml-select" @change="reload(1)">
              <option value="">不限</option>
              <option value="portal">新闻门户</option>
              <option value="selfmedia">自媒体</option>
            </select>
          </div>

          <div class="ml-filter-group">
            <span class="ml-filter-label">收录类型</span>
            <div class="ml-seg">
              <button type="button" :class="segCls(filters.inclusion === 'all')" @click="setInclusion('all')">不限</button>
              <button type="button" :class="segCls(filters.inclusion === 'news')" @click="setInclusion('news')">新闻源</button>
              <button type="button" :class="segCls(filters.inclusion === 'web')" @click="setInclusion('web')">网页</button>
            </div>
          </div>

          <div class="ml-filter-group">
            <span class="ml-filter-label">积分消耗</span>
            <div class="ml-range-group">
              <input v-model.number="filters.price_min" class="ml-range-input" type="number" placeholder="最低" min="0" @keydown.enter="reload(1)" />
              <span class="ml-range-sep">—</span>
              <input v-model.number="filters.price_max" class="ml-range-input" type="number" placeholder="最高" min="0" @keydown.enter="reload(1)" />
              <span class="ml-filter-label">积分</span>
            </div>
          </div>

          <div class="ml-filter-group">
            <span class="ml-filter-label">账号认证</span>
            <select v-model="filters.auth" class="ml-select" @change="reload(1)">
              <option value="all">全部</option>
              <option value="yes">认证</option>
              <option value="no">未认证</option>
            </select>
          </div>

          <div class="ml-filter-group relative" ref="taxRoot">
            <button type="button" class="ml-select ml-select--btn" @click.stop="taxOpen = !taxOpen">
              <span>{{ taxLabel }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div v-if="taxOpen" class="ml-tax-panel" @click.stop>
              <button type="button" class="ml-tax-item" :class="{ active: !filters.taxonomy }" @click="pickTaxonomy('')">全部地区 / 分类</button>
              <button
                v-for="t in taxonomy"
                :key="t.value"
                type="button"
                class="ml-tax-item"
                :class="{ active: filters.taxonomy === t.value }"
                @click="pickTaxonomy(t.value)"
              >{{ t.value }} <em>{{ t.count }}</em></button>
            </div>
          </div>

          <div class="ml-search-wrap">
            <svg class="ml-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
            <input
              v-model="filters.q"
              class="ml-search-input"
              type="text"
              placeholder="搜索信源平台 / 媒体账号 / 投放位，按回车查询"
              @keydown.enter="reload(1)"
            />
            <button v-if="filters.q" type="button" class="ml-search-clear" @click="filters.q = ''; reload(1)">×</button>
          </div>

          <div class="ml-filter-group">
            <span class="ml-filter-label">维度</span>
            <div class="ml-view-toggle">
              <button type="button" class="ml-view-tab" :class="{ 'ml-view-tab--active': displayMode === 'account' }" @click="setMode('account')">媒体账号</button>
              <button type="button" class="ml-view-tab" :class="{ 'ml-view-tab--active': displayMode === 'platform' }" @click="setMode('platform')">信源平台</button>
            </div>
          </div>

          <button v-if="hasFilters" type="button" class="ml-clear-link" @click="clearFilters">清空全部条件</button>
        </div>

        <!-- 工具栏 -->
        <div class="ml-toolbar">
          <div class="ml-toolbar-left">
            <div class="ml-count-tabs">
              <button type="button" class="ml-count-tab" :class="{ 'ml-count-tab--active': tab === 'all' }" @click="setTab('all')">
                全部 <b class="ml-count-num">{{ formatNum(total) }}</b>
              </button>
              <button type="button" class="ml-count-tab" :class="{ 'ml-count-tab--active': tab === 'fav' }" @click="setTab('fav')">
                我的收藏 <b class="ml-count-num">{{ favTotal }}</b>
              </button>
              <button type="button" class="ml-count-tab" :class="{ 'ml-count-tab--active': tab === 'selected' }" @click="setTab('selected')">
                已选 <b class="ml-count-num">{{ selectedKeys.length }}</b>
              </button>
            </div>
            <span class="ml-filter-hint">筛选出 {{ pageRows.length }} 家</span>
          </div>
          <div class="ml-toolbar-right">
            <span class="ml-filter-label">排序</span>
            <select v-model="filters.sort" class="ml-select ml-sort-select" @change="reload(1)">
              <option value="verdict">综合推荐</option>
              <option value="cite-desc">引用指数 ↓</option>
              <option value="succ-desc">出稿率 ↓</option>
              <option value="price-asc">价格 低→高</option>
              <option value="price-desc">价格 高→低</option>
            </select>
          </div>
        </div>

        <!-- 表格：媒体账号 -->
        <div v-if="displayMode === 'account'" class="ml-table-wrap">
          <table class="ml-table">
            <thead>
              <tr>
                <th class="ml-th ml-th--check"><input type="checkbox" class="ml-checkbox" :checked="allChecked" @change="toggleAll(($event.target as HTMLInputElement).checked)" /></th>
                <th class="ml-th">媒体 · 信源</th>
                <th class="ml-th">类型</th>
                <th class="ml-th">收录情况</th>
                <th class="ml-th">出稿率</th>
                <th class="ml-th">引用指数</th>
                <th class="ml-th">价格</th>
                <th class="ml-th">备注</th>
                <th class="ml-th">操作</th>
                <th class="ml-th">收藏</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pageRows" :key="item.media_key" class="ml-tr">
                <td class="ml-td ml-td--check">
                  <input type="checkbox" class="ml-checkbox" :checked="selectedSet.has(item.media_key)" @change="toggleSelect(item.media_key)" />
                </td>
                <td class="ml-td">
                  <div class="ml-media-cell">
                    <div class="ml-media-logo" :style="{ background: logoColor(item.name) }">{{ logoText(item.name) }}</div>
                    <div class="ml-media-info">
                      <div class="ml-media-name">{{ item.name }}</div>
                      <a
                        v-if="item.case_url || item.site_url"
                        class="ml-case-link"
                        :href="item.case_url || item.site_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        @click.stop
                      >稿件案例</a>
                      <span v-else class="ml-case-muted">稿件案例</span>
                    </div>
                  </div>
                </td>
                <td class="ml-td"><span class="ml-type-pill">{{ item.platform || item.type || '—' }}</span></td>
                <td class="ml-td ml-muted">{{ item.inclusion || '—' }}</td>
                <td class="ml-td">{{ item.success_rate != null ? `${item.success_rate}%` : '0%' }}</td>
                <td class="ml-td">
                  <div class="ml-cite-cell">
                    <b class="ml-cite-num">{{ item.cite_count || item.ref_count || 0 }}</b>
                    <div class="ml-cite-bar"><i :style="{ width: citePct(item) + '%' }" /></div>
                  </div>
                </td>
                <td class="ml-td">
                  <span class="ml-price-stack">
                    <s v-if="item.list_price">✦{{ item.list_price }}</s>
                    <b>✦{{ item.sell_price }}积分</b>
                  </span>
                </td>
                <td class="ml-td ml-note">{{ item.note || '—' }}</td>
                <td class="ml-td">
                  <button type="button" class="ml-action-btn" @click="goPublish(item)">发稿</button>
                </td>
                <td class="ml-td">
                  <button type="button" class="ml-star" :class="{ on: item.fav }" title="收藏" @click="toggleFav(item)">
                    <svg width="16" height="16" viewBox="0 0 24 24" :fill="item.fav ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.069 4.192a.53.53 0 0 0 .399.29l4.626.672a.53.53 0 0 1 .294.904l-3.347 3.261a.53.53 0 0 0-.152.469l.79 4.607a.53.53 0 0 1-.771.56l-4.137-2.175a.53.53 0 0 0-.494 0l-4.137 2.175a.53.53 0 0 1-.771-.56l.79-4.607a.53.53 0 0 0-.152-.469L2.98 8.353a.53.53 0 0 1 .294-.904l4.626-.672a.53.53 0 0 0 .399-.29z"/></svg>
                  </button>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="10" class="ml-empty">加载中…</td>
              </tr>
              <tr v-else-if="!pageRows.length">
                <td colspan="10" class="ml-empty">暂无匹配信源</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 表格：信源平台 -->
        <div v-else class="ml-table-wrap">
          <table class="ml-table">
            <thead>
              <tr>
                <th class="ml-th ml-th--check"><input type="checkbox" class="ml-checkbox" :checked="allChecked" @change="toggleAll(($event.target as HTMLInputElement).checked)" /></th>
                <th class="ml-th">媒体 · 信源</th>
                <th class="ml-th">类型</th>
                <th class="ml-th">引用平台</th>
                <th class="ml-th">引用指数</th>
                <th class="ml-th">价格</th>
                <th class="ml-th">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pageRows" :key="item.media_key" class="ml-tr">
                <td class="ml-td ml-td--check">
                  <input type="checkbox" class="ml-checkbox" :checked="selectedSet.has(item.media_key)" @change="toggleSelect(item.media_key)" />
                </td>
                <td class="ml-td">
                  <div class="ml-media-cell">
                    <div class="ml-media-logo" :style="{ background: logoColor(item.name) }">{{ logoText(item.name) }}</div>
                    <div class="ml-media-info">
                      <div class="ml-media-name">{{ item.name }}</div>
                      <div class="ml-media-sub">{{ item.area || '全国' }} · 可投媒体号 {{ item.account_count || 1 }} 家</div>
                    </div>
                  </div>
                </td>
                <td class="ml-td"><span class="ml-type-pill">{{ item.category_label || item.type || '自媒体' }}</span></td>
                <td class="ml-td">
                  <div v-if="(item.geo_engines || item.indexed_engines || []).length" class="ml-engine-tags">
                    <span v-for="e in (item.geo_engines || item.indexed_engines)" :key="e" class="ml-engine-tag" :class="engineClass(e)">{{ engineLabel(e) }}</span>
                  </div>
                  <span v-else class="ml-muted">—</span>
                </td>
                <td class="ml-td">
                  <div class="ml-cite-cell">
                    <b class="ml-cite-num">{{ item.cite_count || item.ref_count || 0 }}</b>
                    <div class="ml-cite-bar"><i :style="{ width: citePct(item) + '%' }" /></div>
                  </div>
                </td>
                <td class="ml-td">
                  <span class="ml-price-stack">
                    <s v-if="item.list_price">✦{{ item.list_price }}</s>
                    <b>✦{{ item.sell_price }}积分起</b>
                  </span>
                </td>
                <td class="ml-td">
                  <button type="button" class="ml-action-btn" @click="goPublish(item)">详情</button>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="7" class="ml-empty">加载中…</td>
              </tr>
              <tr v-else-if="!pageRows.length">
                <td colspan="7" class="ml-empty">暂无匹配信源</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="ml-pagination">
          <span class="ml-page-info">共 {{ formatNum(total) }} 条</span>
          <div class="ml-page-btns">
            <button type="button" class="ml-page-btn ml-page-btn--nav" :disabled="page <= 1" @click="reload(page - 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              v-for="p in pageButtons"
              :key="p"
              type="button"
              class="ml-page-btn"
              :class="{ 'ml-page-btn--active': p === page }"
              @click="reload(p)"
            >{{ p }}</button>
            <button type="button" class="ml-page-btn ml-page-btn--nav" :disabled="page >= totalPages" @click="reload(page + 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <input v-model.number="jumpPage" class="ml-jump-input" type="number" min="1" :placeholder="String(page)" @keydown.enter="doJump" />
            <button type="button" class="ml-page-btn" :disabled="!jumpPage" @click="doJump">跳转</button>
          </div>
        </div>
      </div>

      <!-- 已选悬浮条 -->
      <div v-if="selectedKeys.length" class="ml-selected-bar">
        <span>已选 <b>{{ selectedKeys.length }}</b> 家</span>
        <div class="ml-selected-actions">
          <button type="button" class="ml-clear-link" @click="clearSelected">清空</button>
          <button type="button" class="ml-btn-dark" @click="goPublish()">去发布稿件</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { publishApi } from '@/api/modules/report';

type MediaItem = {
  media_key: string;
  name: string;
  platform?: string;
  type?: string;
  category_label?: string;
  area?: string;
  account_count?: number;
  cite_count?: number;
  ref_count?: number;
  list_price?: number;
  sell_price?: number;
  note?: string;
  fav?: boolean;
  case_url?: string | null;
  site_url?: string;
  inclusion?: string | null;
  success_rate?: number | null;
  indexed_engines?: string[];
  geo_engines?: string[];
};

const router = useRouter();
const PAGE_SIZE = 20;

const filters = reactive({
  engine: 'all',
  category: '',
  inclusion: 'all' as 'all' | 'news' | 'web',
  price_min: null as number | null,
  price_max: null as number | null,
  auth: 'all',
  taxonomy: '',
  q: '',
  sort: 'cite-desc',
});

const displayMode = ref<'account' | 'platform'>('account');
const tab = ref<'all' | 'fav' | 'selected'>('all');
const rows = ref<MediaItem[]>([]);
const total = ref(0);
const libraryTotal = ref(0);
const favTotal = ref(0);
const page = ref(1);
const loading = ref(false);
const selectedKeys = ref<string[]>([]);
const selectedMap = ref<Record<string, MediaItem>>({});
const jumpPage = ref<number | null>(null);
const taxonomy = ref<{ value: string; count: number }[]>([]);
const taxOpen = ref(false);
const taxRoot = ref<HTMLElement | null>(null);
const queryOpen = ref(false);
const queryLabel = ref('全部');

const selectedSet = computed(() => new Set(selectedKeys.value));
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
const pageRows = computed(() => {
  if (tab.value === 'selected') {
    return selectedKeys.value.map(k => selectedMap.value[k]).filter(Boolean);
  }
  return rows.value;
});
const allChecked = computed(() => pageRows.value.length > 0 && pageRows.value.every(r => selectedSet.value.has(r.media_key)));
const maxCite = computed(() => Math.max(1, ...rows.value.map(r => r.cite_count || r.ref_count || 0)));
const hasFilters = computed(() =>
  filters.engine !== 'all'
  || !!filters.category
  || filters.inclusion !== 'all'
  || filters.price_min != null
  || filters.price_max != null
  || filters.auth !== 'all'
  || !!filters.taxonomy
  || !!filters.q.trim(),
);
const taxLabel = computed(() => (filters.taxonomy ? `分类 · ${filters.taxonomy}` : '地区 / 媒体分类'));
const pageButtons = computed(() => {
  const n = totalPages.value;
  const cur = page.value;
  if (n <= 5) return Array.from({ length: n }, (_, i) => i + 1);
  const set = new Set([1, n, cur, cur - 1, cur + 1].filter(p => p >= 1 && p <= n));
  return [...set].sort((a, b) => a - b);
});

const ENGINE_META: Record<string, { label: string; cls: string }> = {
  doubao: { label: '豆包', cls: 'eng-doubao' },
  deepseek: { label: 'DeepSeek', cls: 'eng-deepseek' },
  wenxin: { label: '文心一言', cls: 'eng-wenxin' },
  qwen: { label: '千问', cls: 'eng-qwen' },
  yuanbao: { label: '元宝', cls: 'eng-yuanbao' },
};

function engineLabel(e: string) { return ENGINE_META[e]?.label || e; }
function engineClass(e: string) { return ENGINE_META[e]?.cls || ''; }
function formatNum(n: number) { return Number(n || 0).toLocaleString('zh-CN'); }
function logoText(name: string) { return (name || '?').replace(/\s/g, '').slice(0, 1); }
function logoColor(name: string) {
  const colors = [ '#2d7fd0', '#7c3aed', '#0f9d6b', '#e11d48', '#ea580c', '#4f46e5', '#0891b2' ];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % colors.length;
  return colors[h];
}
function citePct(item: MediaItem) {
  const n = item.cite_count || item.ref_count || 0;
  return Math.max(4, Math.min(100, Math.round((n / maxCite.value) * 100)));
}
function segCls(on: boolean) {
  return [ 'ml-seg-btn', on ? 'ml-seg-btn--on' : '' ];
}

function buildPayload(pageNo: number) {
  return {
    page: pageNo,
    size: PAGE_SIZE,
    sort: filters.sort,
    display_mode: displayMode.value,
    fav: tab.value === 'fav',
    ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
    ...(filters.engine !== 'all' ? { engine: filters.engine } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.taxonomy ? { taxonomy: filters.taxonomy } : {}),
    ...(filters.auth !== 'all' ? { auth: filters.auth } : {}),
    ...(filters.price_min != null && filters.price_min !== ('' as any) ? { price_min: filters.price_min } : {}),
    ...(filters.price_max != null && filters.price_max !== ('' as any) ? { price_max: filters.price_max } : {}),
  };
}

async function reload(pageNo = page.value) {
  if (tab.value === 'selected') {
    page.value = 1;
    return;
  }
  loading.value = true;
  page.value = pageNo;
  try {
    const resp: any = await publishApi.mediaList(buildPayload(pageNo));
    rows.value = resp?.list || [];
    total.value = Number(resp?.total || 0);
    favTotal.value = Number(resp?.fav_total || 0);
    if (!hasFilters.value && tab.value === 'all' && displayMode.value === 'account') {
      libraryTotal.value = total.value;
    }
  } catch (e: any) {
    rows.value = [];
    Message.error(e?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function setMode(mode: 'account' | 'platform') {
  if (displayMode.value === mode) return;
  displayMode.value = mode;
  reload(1);
}
function setTab(t: 'all' | 'fav' | 'selected') {
  tab.value = t;
  if (t !== 'selected') reload(1);
}
function setInclusion(v: 'all' | 'news' | 'web') {
  filters.inclusion = v;
  // 无独立字段时：新闻源≈门户，网页≈不限自媒体粗滤
  if (v === 'news') filters.category = 'portal';
  else if (v === 'web') filters.category = 'selfmedia';
  else if (filters.category === 'portal' || filters.category === 'selfmedia') filters.category = '';
  reload(1);
}
function pickTaxonomy(v: string) {
  filters.taxonomy = v;
  taxOpen.value = false;
  reload(1);
}
function clearFilters() {
  filters.engine = 'all';
  filters.category = '';
  filters.inclusion = 'all';
  filters.price_min = null;
  filters.price_max = null;
  filters.auth = 'all';
  filters.taxonomy = '';
  filters.q = '';
  reload(1);
}
function toggleSelect(key: string) {
  const i = selectedKeys.value.indexOf(key);
  if (i >= 0) {
    selectedKeys.value.splice(i, 1);
    delete selectedMap.value[key];
    return;
  }
  selectedKeys.value.push(key);
  const found = rows.value.find(r => r.media_key === key);
  if (found) selectedMap.value[key] = found;
}
function toggleAll(on: boolean) {
  if (!on) {
    const drop = new Set(pageRows.value.map(r => r.media_key));
    selectedKeys.value = selectedKeys.value.filter(k => !drop.has(k));
    for (const k of drop) delete selectedMap.value[k];
    return;
  }
  const set = new Set(selectedKeys.value);
  for (const r of pageRows.value) {
    set.add(r.media_key);
    selectedMap.value[r.media_key] = r;
  }
  selectedKeys.value = [...set];
}
async function toggleFav(item: MediaItem) {
  const next = !item.fav;
  try {
    const resp: any = await publishApi.mediaFav(item.media_key, next);
    item.fav = next;
    favTotal.value = Number(resp?.fav_total ?? favTotal.value + (next ? 1 : -1));
    if (tab.value === 'fav' && !next) await reload(page.value);
  } catch (e: any) {
    Message.error(e?.message || '收藏失败');
  }
}
function clearSelected() {
  selectedKeys.value = [];
  selectedMap.value = {};
}
function goPublish(item?: MediaItem) {
  const keys = item ? [ item.media_key ] : selectedKeys.value;
  router.push({
    path: '/dashboard/media-library/publish',
    query: keys.length ? { media_keys: keys.join(',') } : {},
  });
}
function doJump() {
  const p = Number(jumpPage.value);
  if (!Number.isFinite(p) || p < 1) return;
  reload(Math.min(totalPages.value, Math.floor(p)));
  jumpPage.value = null;
}

function onDocClick(e: MouseEvent) {
  if (taxRoot.value && !taxRoot.value.contains(e.target as Node)) taxOpen.value = false;
}

onMounted(async () => {
  document.addEventListener('click', onDocClick);
  try {
    const facets: any = await publishApi.mediaFacets();
    taxonomy.value = facets?.taxonomy || [];
  } catch { /* ignore */ }
  await reload(1);
  if (!libraryTotal.value) libraryTotal.value = total.value;
});
onUnmounted(() => document.removeEventListener('click', onDocClick));

watch(displayMode, () => {
  selectedKeys.value = [];
  selectedMap.value = {};
});
</script>

<style lang="scss" scoped>
.ml-page {
  background: #f8fafc;
  color: #0f1115;
  font-size: 16px;
  padding-bottom: 72px;
}
.ml-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.ml-title-block { min-width: 0; flex: 1; }
.ml-title-row { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.ml-total-chip { font-size: 13px; color: #8a8f9b; font-weight: 600; }
.ml-header-actions { display: flex; align-items: center; gap: 12px; }
.ml-btn-dark {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; background: #0f1115; color: #fff; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  &:hover { background: #1f2330; }
}
.ml-card {
  background: #fff; border: 1px solid #e6e8ee; border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0 2px 10px; overflow: hidden;
}
.ml-filter-bar {
  padding: 11px 16px; border-bottom: 1px solid #f0f1f6;
  display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center;
}
.ml-filter-group { display: flex; align-items: center; gap: 8px; position: relative; }
.ml-filter-label { font-size: 12px; color: #5b606a; font-weight: 500; white-space: nowrap; }
.ml-select {
  height: 32px; border: 1px solid #e6e8ee; border-radius: 8px; padding: 0 8px;
  font-size: 12.5px; color: #2a2d36; background: #fff; cursor: pointer;
  &:hover { border-color: #c7d2fe; }
}
.ml-select--btn {
  display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 8px;
  border: 1px solid #e6e8ee; border-radius: 8px; background: #fff; font-size: 12.5px; color: #2a2d36; cursor: pointer;
}
.ml-range-group { display: flex; align-items: center; gap: 4px; }
.ml-range-input {
  width: 64px; height: 32px; padding: 0 7px; border: 1px solid #e6e8ee; border-radius: 7px; font-size: 12px;
  &:focus { outline: none; border-color: #6452ff; }
  &::-webkit-outer-spin-button, &::-webkit-inner-spin-button { -webkit-appearance: none; }
}
.ml-range-sep { color: #8a8f9b; }
.ml-seg { display: inline-flex; background: #f5f6fa; border-radius: 8px; padding: 2px; gap: 2px; }
.ml-seg-btn {
  border: none; background: transparent; padding: 4px 10px; border-radius: 6px;
  font-size: 12px; font-weight: 600; color: #5b606a; cursor: pointer;
  &--on { background: #0f1115; color: #fff; }
}
.ml-search-wrap {
  position: relative; flex: 1 1 280px; min-width: 220px; max-width: 420px;
}
.ml-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #8a8f9b; }
.ml-search-input {
  width: 100%; height: 32px; padding: 0 28px 0 30px; border: 1px solid #e6e8ee; border-radius: 8px; font-size: 12.5px;
  &:focus { outline: none; border-color: #6452ff; }
}
.ml-search-clear {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  border: none; background: transparent; color: #8a8f9b; cursor: pointer; font-size: 16px;
}
.ml-view-toggle { display: inline-flex; background: #f5f6fa; border-radius: 8px; padding: 2px; }
.ml-view-tab {
  border: none; background: transparent; padding: 5px 12px; border-radius: 6px;
  font-size: 12px; font-weight: 600; color: #5b606a; cursor: pointer;
  &--active { background: #6452ff; color: #fff; }
}
.ml-clear-link { border: none; background: transparent; color: #6452ff; font-size: 12px; font-weight: 600; cursor: pointer; }
.ml-tax-panel {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 50; width: 240px; max-height: 280px; overflow: auto;
  background: #fff; border: 1px solid #e6e8ee; border-radius: 12px; box-shadow: 0 12px 32px rgba(16,18,30,.12); padding: 6px;
}
.ml-tax-item {
  display: flex; justify-content: space-between; width: 100%; border: none; background: transparent;
  padding: 8px 10px; border-radius: 8px; font-size: 12.5px; color: #2a2d36; cursor: pointer; text-align: left;
  em { font-style: normal; color: #8a8f9b; }
  &:hover, &.active { background: #eef2ff; color: #4338ca; }
}
.ml-toolbar {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 10px 16px; border-bottom: 1px solid #f0f1f6;
}
.ml-toolbar-left, .ml-toolbar-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ml-count-tabs { display: flex; align-items: center; gap: 18px; }
.ml-count-tab {
  border: none; background: transparent; padding: 6px 0; font-size: 13px; font-weight: 600; color: #8a8f9b;
  border-bottom: 2px solid transparent; cursor: pointer;
  &--active { color: #0f1115; border-bottom-color: #0f1115; }
}
.ml-count-num { margin-left: 4px; font-weight: 800; }
.ml-filter-hint { font-size: 12px; color: #8a8f9b; }
.ml-table-wrap { overflow-x: auto; min-height: 320px; }
.ml-table { width: 100%; border-collapse: collapse; min-width: 1100px; }
.ml-th {
  text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; color: #8a8f9b;
  background: #f5f6fa; border-bottom: 1px solid #e6e8ee; white-space: nowrap;
  &--check { width: 40px; }
}
.ml-td { padding: 14px 12px; border-bottom: 1px solid #f0f1f6; font-size: 12.5px; color: #2a2d36; vertical-align: middle; }
.ml-tr:hover { background: #fafbff; }
.ml-checkbox { width: 14px; height: 14px; accent-color: #6452ff; }
.ml-media-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ml-media-logo {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: grid; place-items: center; color: #fff; font-size: 13px; font-weight: 700;
}
.ml-media-name { font-size: 13.5px; font-weight: 700; color: #0f1115; }
.ml-media-sub { font-size: 11.5px; color: #8a8f9b; margin-top: 2px; }
.ml-case-link { display: inline-block; margin-top: 2px; font-size: 12px; color: #6452ff; font-weight: 600; text-decoration: none; }
.ml-case-muted { display: inline-block; margin-top: 2px; font-size: 12px; color: #c4c8d4; }
.ml-type-pill {
  display: inline-block; font-size: 11.5px; padding: 2px 8px; border-radius: 6px;
  background: #f5f6fa; color: #2a2d36; font-weight: 500; white-space: nowrap;
}
.ml-muted { color: #5b606a; }
.ml-note { color: #5b606a; max-width: 220px; white-space: normal; word-break: break-word; }
.ml-cite-cell { display: flex; flex-direction: column; gap: 3px; min-width: 64px; }
.ml-cite-num { color: #0f9d6b; font-size: 12px; font-weight: 700; }
.ml-cite-bar { height: 5px; border-radius: 3px; background: #f0f1f6; overflow: hidden;
  i { display: block; height: 100%; background: linear-gradient(90deg, #34d399, #0f9d6b); border-radius: 3px; }
}
.ml-price-stack {
  display: inline-flex; flex-direction: column; align-items: flex-start; line-height: 1.16; white-space: nowrap;
  s { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #8a8f9b; opacity: .7; }
  b { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #ea580c; font-weight: 800; }
}
.ml-action-btn {
  background: #fff; color: #6452ff; border: 1px solid #6452ff; border-radius: 6px;
  font-size: 12px; font-weight: 600; padding: 4px 10px; cursor: pointer; white-space: nowrap;
  &:hover { background: #6452ff; color: #fff; }
}
.ml-star {
  border: none; background: transparent; color: #8a8f9b; cursor: pointer; display: inline-flex;
  &.on { color: #f59e0b; }
}
.ml-engine-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.ml-engine-tag {
  font-size: 10.5px; padding: 2px 6px; border-radius: 4px; color: #fff; font-weight: 600;
  &.eng-doubao { background: #f59e0b; }
  &.eng-deepseek { background: #0ea5e9; }
  &.eng-wenxin { background: #ec4899; }
  &.eng-qwen { background: #9333ea; }
  &.eng-yuanbao { background: #6366f1; }
}
.ml-empty { text-align: center; padding: 48px 16px; color: #8a8f9b; font-size: 13px; }
.ml-pagination {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 12px 16px; border-top: 1px solid #f0f1f6;
}
.ml-page-info { font-size: 12px; color: #8a8f9b; }
.ml-page-btns { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ml-page-btn {
  min-width: 32px; height: 32px; padding: 0 8px; border: 1px solid #e6e8ee; border-radius: 8px;
  background: #fff; color: #2a2d36; font-size: 12px; font-weight: 600; cursor: pointer;
  &:disabled { opacity: .4; cursor: not-allowed; }
  &--active { background: #6452ff; border-color: #6452ff; color: #fff; }
  &--nav { display: inline-flex; align-items: center; justify-content: center; }
}
.ml-jump-input {
  width: 48px; height: 32px; border: 1px solid #e6e8ee; border-radius: 8px; text-align: center; font-size: 12px;
}
.ml-selected-bar {
  position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 40;
  display: flex; align-items: center; gap: 16px; padding: 10px 16px;
  background: #0f1115; color: #fff; border-radius: 12px; box-shadow: 0 12px 32px rgba(16,18,30,.28);
  b { color: #a5b4fc; }
}
.ml-selected-actions { display: flex; align-items: center; gap: 10px;
  .ml-clear-link { color: #c7d2fe; }
}
</style>
