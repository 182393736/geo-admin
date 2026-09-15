<template>
  <div class="app-layout">
    <!-- 第一栏: 窄图标栏 84px —— 对标 geo.timus.cn -->
    <aside class="sidebar-icon">
      <button
        v-if="subPanelCollapsed && currentGroups.length > 0"
        class="expand-tab-btn"
        title="展开菜单"
        aria-label="展开菜单"
        @click="subPanelCollapsed = false"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
      </button>

      <div class="logo-area">
        <BrandSwitcher />
      </div>

      <nav class="menu-list">
        <button
          type="button"
          class="nav-item"
          :class="{ 'nav-item--active': activeGroup === 'brand' }"
          title="品牌"
          @click="handleMainMenu('brand', '/dashboard/brand-library')"
        >
          <span class="nav-icon" v-html="ICONS.bookOpen" />
          <span class="nav-text">品牌</span>
        </button>

        <button
          v-for="item in mainMenuItems"
          :key="item.key"
          type="button"
          class="nav-item"
          :class="{ 'nav-item--active': activeGroup === item.key }"
          :title="item.label"
          @click="handleMainMenu(item.key, item.path)"
        >
          <span class="nav-icon" v-html="item.svg" />
          <span class="nav-text">{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="footer-nav">
          <button
            type="button"
            class="nav-item nav-item--diagnosis"
            :class="{ 'nav-item--diagnosis-active': activeGroup === 'diagnosis' }"
            title="单次品牌诊断"
            @click="handleMainMenu('diagnosis', '/dashboard/report-center')"
          >
            <span class="nav-icon" v-html="ICONS.activity" />
            <span class="nav-text">诊断</span>
          </button>
        </div>
        <div class="footer-nav">
          <button
            type="button"
            class="nav-item nav-item--pricing"
            :class="{ 'nav-item--pricing-active': activeGroup === 'pricing' }"
            title="升级套餐"
            @click="handleMainMenu('pricing', '/dashboard/plan-upgrade')"
          >
            <span class="nav-icon" v-html="ICONS.gem" />
            <span class="nav-text">套餐</span>
          </button>
        </div>
        <div class="footer-avatar">
          <UserMenu />
        </div>
      </div>
    </aside>

    <!-- 第二栏: 子菜单面板 240px -->
    <aside v-if="currentGroups.length > 0" class="sidebar-sub" :class="{ 'sidebar-sub--collapsed': subPanelCollapsed }">
      <div class="sub-panel-header-row">
        <span class="sub-panel-header">{{ activeMenuLabel }}</span>
        <button
          type="button"
          class="sub-collapse-btn"
          :title="subPanelCollapsed ? '展开侧边栏' : '收起侧边栏'"
          :aria-label="subPanelCollapsed ? '展开侧边栏' : '收起侧边栏'"
          @click="subPanelCollapsed = !subPanelCollapsed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>
        </button>
      </div>

      <nav class="sub-menu-list">
        <div v-for="(group, gi) in currentGroups" :key="gi" class="sub-group">
          <div v-if="group.label" class="sub-group-title">{{ group.label }}</div>
          <button
            v-for="sub in group.items"
            :key="sub.path"
            type="button"
            class="sub-item"
            :class="{ 'sub-item--active': isSubActive(sub.path) }"
            @click="navigate(sub.path)"
          >
            <span class="sub-item-icon" v-html="sub.svg || ICONS.dot" />
            <span class="sub-item-label">{{ sub.label }}</span>
          </button>
        </div>

        <!-- AGENT 最近记录 -->
        <div v-if="activeGroup === 'agent'" class="sub-recent">
          <div class="sub-recent-title">最近记录</div>
          <div v-if="!recentSessions.length" class="sub-recent-empty">暂无记录</div>
          <div v-else class="sub-recent-list">
            <div
              v-for="item in recentSessions"
              :key="item.session_id"
              class="sub-recent-item"
              :class="{ 'sub-recent-item--active': route.path === `/dashboard/writing/${item.session_id}` }"
            >
              <button
                type="button"
                class="sub-recent-btn"
                :title="item.title"
                @click="router.push(`/dashboard/writing/${item.session_id}`)"
              >
                <span class="sub-recent-kind">{{ item.kind_label || '聊' }}</span>
                <span class="sub-recent-text">{{ item.title }}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div v-if="showDataStatus" class="sub-status-wrap">
        <button type="button" class="sub-status" title="查看各引擎采集状态">
          <span class="sub-status-row">
            <span class="sub-status-title">
              <span class="sub-status-dot" />
              数据状态
            </span>
            <span class="sub-status-pill">全部正常</span>
          </span>
          <span class="sub-status-row">
            <span class="sub-status-meta">数据更新至 <strong>{{ dataStatusDate }}</strong></span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <router-view v-slot="{ Component }" :key="`${route.fullPath}::${auth.activeBrandId}`">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { agentApi, type AgentChatListItem } from '@/api/modules/agent';
import UserMenu from '@/components/UserMenu.vue';
import BrandSwitcher from '@/components/BrandSwitcher.vue';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const subPanelCollapsed = ref(false);

/** Lucide 风格线标（stroke 1.8 / 20×20），内联避免引入依赖 */
const ICONS = {
  bookOpen: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
  layoutGrid: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
  chartColumn: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
  chartPie: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/></svg>',
  penLine: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>',
  messageSquare: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" width="18" height="18"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  gem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" width="18" height="18"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
  // 二级 16×16
  chartColumn16: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
  swords: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>',
  link2: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>',
  list: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
  lightbulb: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  circleHelp: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
  monitorCheck: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 10 2 2 4-4"/><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>',
  hardDriveDownload: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 18h.01"/><path d="M10 18h.01"/></svg>',
  pie16: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/></svg>',
  database: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>',
  pen16: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>',
  file: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  radar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><circle cx="12" cy="12" r="2"/></svg>',
  bot: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  dot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/></svg>',
};

interface SubItem {
  path: string;
  label: string;
  svg?: string;
}

interface SubGroup {
  label?: string;
  items: SubItem[];
}

interface MenuItem {
  path: string;
  label: string;
  key: string;
  svg: string;
  groups?: SubGroup[];
}

const mainMenuItems: MenuItem[] = [
  { path: '/dashboard/overview', label: '报告', key: 'overview', svg: ICONS.layoutGrid },
  {
    path: '/dashboard/ai-index',
    label: '排名',
    key: 'ranking',
    svg: ICONS.chartColumn,
    groups: [
      {
        items: [
          { path: '/dashboard/ai-index', label: 'AI排名透视', svg: ICONS.chartColumn16 },
          { path: '/dashboard/competitor-insight', label: 'AI竞品透视', svg: ICONS.swords },
          { path: '/dashboard/citation-sources', label: '引用源追溯', svg: ICONS.link2 },
        ],
      },
      {
        label: '分析',
        items: [
          { path: '/dashboard/source-preference', label: '信源平台偏好', svg: ICONS.list },
          { path: '/dashboard/source-intelligence', label: '引用源洞察', svg: ICONS.lightbulb },
        ],
      },
      {
        label: '管理',
        items: [
          { path: '/dashboard/topic-management', label: '监控问题管理', svg: ICONS.circleHelp },
          { path: '/dashboard/monitor-recognition', label: '监控识别管理', svg: ICONS.monitorCheck },
          { path: '/dashboard/downloads', label: '搜索快照下载', svg: ICONS.hardDriveDownload },
        ],
      },
    ],
  },
  {
    path: '/dashboard/sentiment',
    label: '口碑',
    key: 'sentiment',
    svg: ICONS.chartPie,
    groups: [
      {
        items: [
          { path: '/dashboard/sentiment', label: 'AI口碑分析', svg: ICONS.pie16 },
          { path: '/dashboard/citation-sources?type=brand', label: '引用源追溯', svg: ICONS.link2 },
        ],
      },
      {
        label: '管理',
        items: [
          { path: '/dashboard/topic-management?type=brand', label: '监控问题管理', svg: ICONS.circleHelp },
          { path: '/dashboard/monitor-recognition?type=brand', label: '监控识别管理', svg: ICONS.monitorCheck },
          { path: '/dashboard/downloads?type=brand', label: '搜索快照下载', svg: ICONS.hardDriveDownload },
        ],
      },
    ],
  },
  {
    path: '/dashboard/media-library',
    label: '优化',
    key: 'optimize',
    svg: ICONS.penLine,
    groups: [
      {
        label: '发稿',
        items: [
          { path: '/dashboard/media-library', label: '信源库', svg: ICONS.database },
          { path: '/dashboard/media-library/publish', label: '发布稿件', svg: ICONS.pen16 },
          { path: '/dashboard/media-library/records', label: '发稿记录', svg: ICONS.file },
        ],
      },
      {
        label: '内容资产',
        items: [
          { path: '/dashboard/media-library/tracking', label: '稿件追踪', svg: ICONS.radar },
        ],
      },
    ],
  },
  {
    path: '/dashboard/new-agent',
    label: 'AGENT',
    key: 'agent',
    svg: ICONS.messageSquare,
    groups: [
      {
        items: [
          { path: '/dashboard/new-agent', label: '新建对话', svg: ICONS.bot },
          { path: '/dashboard/new-agent/articles', label: '稿件库', svg: ICONS.file },
        ],
      },
    ],
  },
];

const diagnosisItem: MenuItem = {
  path: '/dashboard/report-center',
  label: '诊断',
  key: 'diagnosis',
  svg: ICONS.activity,
  groups: [
    {
      items: [
        { path: '/dashboard/report-center', label: '单次品牌诊断', svg: ICONS.search },
      ],
    },
  ],
};

const pricingItem: MenuItem = {
  path: '/dashboard/plan-upgrade',
  label: '套餐',
  key: 'pricing',
  svg: ICONS.gem,
};

const allMenuItems = computed(() => [ ...mainMenuItems, diagnosisItem, pricingItem ]);

const activeGroup = computed(() => {
  const path = route.path;
  const shared = [ '/dashboard/citation-sources', '/dashboard/topic-management', '/dashboard/monitor-recognition', '/dashboard/downloads' ];
  if (path.startsWith('/dashboard/brand-library') || path.startsWith('/dashboard/brand-card')) return 'brand';
  if (path.startsWith('/dashboard/sentiment')) return 'sentiment';
  if (shared.some(p => path.startsWith(p))) return route.query.type === 'brand' ? 'sentiment' : 'ranking';
  if (path.startsWith('/dashboard/ai-index') || path.startsWith('/dashboard/competitor-insight') || path.startsWith('/dashboard/source-preference') || path.startsWith('/dashboard/source-intelligence')) return 'ranking';
  if (path.startsWith('/dashboard/media-library')) return 'optimize';
  if (path.startsWith('/dashboard/overview')) return 'overview';
  if (path.startsWith('/dashboard/new-agent') || path.startsWith('/dashboard/writing')) return 'agent';
  if (path.startsWith('/dashboard/report-center')) return 'diagnosis';
  if (path.startsWith('/dashboard/plan-upgrade')) return 'pricing';
  return '';
});

const recentSessions = ref<AgentChatListItem[]>([]);

async function loadRecentSessions() {
  if (activeGroup.value !== 'agent') return;
  try {
    const data: any = await agentApi.list();
    recentSessions.value = data?.list || [];
  } catch {
    recentSessions.value = [];
  }
}

function isSubActive(path: string) {
  if (route.fullPath === path || route.path === path) return true;
  if (path === '/dashboard/new-agent' && route.path.startsWith('/dashboard/writing')) return true;
  return false;
}

watch(() => [ activeGroup.value, auth.activeBrandId ], () => { loadRecentSessions(); });
watch(() => route.path, (p) => {
  if (p.startsWith('/dashboard/new-agent') || p.startsWith('/dashboard/writing')) loadRecentSessions();
});

onMounted(() => {
  loadRecentSessions();
  window.addEventListener('agent-sessions-changed', loadRecentSessions);
});
onUnmounted(() => {
  window.removeEventListener('agent-sessions-changed', loadRecentSessions);
});

const activeMenuLabel = computed(() => {
  if (activeGroup.value === 'brand') return '品牌';
  if (activeGroup.value === 'diagnosis') return '单次品牌诊断';
  const item = allMenuItems.value.find((m) => m.key === activeGroup.value);
  return item?.label ?? '';
});

const currentGroups = computed<SubGroup[]>(() => {
  if (activeGroup.value === 'brand') return [];
  const item = allMenuItems.value.find((m) => m.key === activeGroup.value);
  return item?.groups ?? [];
});

const showDataStatus = computed(() =>
  [ 'ranking', 'sentiment', 'optimize', 'overview' ].includes(activeGroup.value),
);

const dataStatusDate = computed(() => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}`;
});

function handleMainMenu(key: string, path: string) {
  const item = allMenuItems.value.find((m) => m.key === key);
  if (item?.groups && item.groups.length > 0) {
    router.push(item.groups[0].items[0].path);
  } else if (key === 'brand') {
    router.push('/dashboard/brand-library');
  } else {
    router.push(path);
  }
  if (item?.groups && item.groups.length > 0) subPanelCollapsed.value = false;
}

function navigate(path: string) {
  router.push(path);
}
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
  display: flex;
  background: #f8fafc;
}

/* ===== 第一栏: 84px 图标栏 ===== */
.sidebar-icon {
  position: relative;
  width: 84px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  z-index: 30;
}

.expand-tab-btn {
  position: absolute;
  right: 0;
  top: 18px;
  transform: translateX(50%);
  z-index: 40;
  width: 20px;
  height: 40px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0 6px 6px 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    color: #4338ca;
    background: #eef2ff;
    border-color: #c7d2fe;
  }
}

.logo-area {
  padding: 0 14px 10px;
  display: flex;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.menu-list {
  flex: 1;
  overflow-y: auto;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.25;
  color: #6b7280;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  user-select: none;

  &:hover {
    background: #f9fafb;
    color: #111827;
  }

  &--active {
    background: #eef2ff;
    color: #4338ca;
    font-weight: 600;
    &:hover {
      background: #eef2ff;
      color: #4338ca;
    }
  }

  &--diagnosis {
    color: #0d9488;
    &:hover {
      background: #f0fdfa;
      color: #0f766e;
    }
  }

  &--diagnosis-active {
    background: #f0fdfa;
    color: #0f766e;
    font-weight: 600;
  }

  &--pricing {
    color: #d97706;
    &:hover {
      background: #fffbeb;
      color: #b45309;
    }
  }

  &--pricing-active {
    background: #fffbeb;
    color: #b45309;
    font-weight: 600;
  }
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  :deep(svg) {
    display: block;
  }
}

.nav-text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.sidebar-footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.footer-nav {
  padding: 0 8px 4px;
}

.footer-avatar {
  padding: 10px 14px 4px;
  display: flex;
  justify-content: center;
  position: relative;
}

/* ===== 第二栏: 240px ===== */
.sidebar-sub {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 240ms ease-in-out, opacity 240ms ease-in-out, border 240ms ease-in-out;
  z-index: 20;
}

.sidebar-sub--collapsed {
  width: 0;
  opacity: 0;
  border-right: 0;
  pointer-events: none;
}

.sub-panel-header-row {
  padding: 18px 18px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
  flex-shrink: 0;
}

.sub-panel-header {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-collapse-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
  color: #9ca3af;
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;

  &:hover {
    background: #f9fafb;
    color: #374151;
  }
}

.sub-menu-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 14px 22px;
  display: flex;
  flex-direction: column;
}

.sub-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.sub-group-title {
  padding: 12px 12px 8px;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.025em;
}

.sub-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-size: 13.5px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  line-height: 20px;
  font-family: inherit;
  text-align: left;

  &:hover {
    background: #f9fafb;
    color: #111827;

    .sub-item-icon {
      color: #4b5563;
    }
  }

  &--active {
    background: rgba(238, 242, 255, 0.9);
    color: #4338ca;
    font-weight: 600;

    &:hover {
      background: rgba(238, 242, 255, 0.9);
      color: #4338ca;
    }

    .sub-item-icon {
      color: #4f46e5;
    }
  }
}

.sub-item-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #9ca3af;
  transition: color 0.15s;

  :deep(svg) {
    display: block;
  }
}

.sub-item-label {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* AGENT 最近记录 */
.sub-recent {
  padding: 18px 0 8px;
  border-top: 1px solid #f0f1f6;
  margin-top: 8px;
}

.sub-recent-title {
  padding: 0 12px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sub-recent-empty {
  font-size: 12.5px;
  color: #c5c8d0;
  padding: 6px 12px;
}

.sub-recent-list {
  display: flex;
  flex-direction: column;
}

.sub-recent-item {
  position: relative;
  margin-top: 2px;
  border-radius: 8px;
  transition: background 0.15s;

  &--active {
    background: rgba(238, 242, 255, 0.8);
  }
}

.sub-recent-btn {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 12.5px;
  line-height: 1.35;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  cursor: pointer;
  font-family: inherit;
  color: #4b5563;

  .sub-recent-item--active & {
    color: #4a38e0;
    font-weight: 600;
  }

  &:hover {
    background: #f8fafc;
  }
}

.sub-recent-kind {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  background: #f0f9ff;
  color: #0284c7;
}

.sub-recent-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 数据状态卡 */
.sub-status-wrap {
  flex-shrink: 0;
  padding: 8px 14px 16px;
}

.sub-status {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px 8px;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
  background: rgba(249, 250, 251, 0.6);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    border-color: #e5e7eb;
    background: #fff;
  }
}

.sub-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #d1d5db;
}

.sub-status-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #111827;
}

.sub-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #10b981;
  flex-shrink: 0;
}

.sub-status-pill {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  background: #ecfdf5;
  color: #047857;
}

.sub-status-meta {
  font-size: 11px;
  color: #9ca3af;

  strong {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 600;
    color: #4b5563;
  }
}

/* ===== 内容区 ===== */
.main-content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  background: #f8fafc;
  min-width: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
