<template>
  <div class="app-layout">
    <!-- 第一栏: 窄图标栏 -->
    <aside class="sidebar-icon">
      <!-- 折叠后悬浮在右侧边线上的展开按钮 -->
      <button
        v-if="subPanelCollapsed && currentGroups.length > 0"
        class="expand-tab-btn"
        title="展开菜单"
        aria-label="展开菜单"
        @click="subPanelCollapsed = false"
      >
        <icon-expand :size="12" />
      </button>
      <div class="logo-area">
        <div class="logo-icon">佛</div>
      </div>

      <!-- 品牌 -->
      <div
        class="nav-item"
        :class="{ 'nav-item--active': activeGroup === 'brand' }"
        @click="handleMainMenu('brand', '/dashboard/brand-card')"
      >
        <div class="nav-icon"><icon-share-alt /></div>
        <span class="nav-text">品牌</span>
      </div>

      <!-- 主菜单 -->
      <nav class="menu-list">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="nav-item"
          :class="[
            `nav-item--${item.key}`,
            { 'nav-item--active': activeGroup === item.key },
          ]"
          @click="handleMainMenu(item.key, item.path)"
        >
          <div class="nav-icon">
            <component :is="item.icon" />
          </div>
          <span class="nav-text">{{ item.label }}</span>
        </div>
      </nav>

      <!-- 底部 -->
      <div class="sidebar-footer">
        <div class="footer-item footer-date">{{ appStore.currentDate }}</div>
        <div class="footer-item footer-credits">
          <span class="credits-icon">G</span>
          <span class="credits-num">{{ appStore.credits }}</span>
        </div>
        <div class="collapse-btn" @click="appStore.toggleSidebar()">
          <icon-expand v-if="appStore.collapsed" :size="16" />
          <icon-shrink v-else :size="16" />
        </div>
      </div>
    </aside>

    <!-- 第二栏: 子菜单面板 -->
    <aside v-if="currentGroups.length > 0" class="sidebar-sub" :class="{ 'sidebar-sub--collapsed': subPanelCollapsed }">
      <!-- 面板标题 + 折叠按钮 -->
      <div class="sub-panel-header-row">
        <span class="sub-panel-header">{{ activeMenuLabel }}</span>
        <button
          class="sub-collapse-btn"
          :title="subPanelCollapsed ? '展开侧边栏' : '收起侧边栏'"
          :aria-label="subPanelCollapsed ? '展开侧边栏' : '收起侧边栏'"
          @click="subPanelCollapsed = !subPanelCollapsed"
        >
          <icon-expand v-if="subPanelCollapsed" :size="16" />
          <icon-shrink v-else :size="16" />
        </button>
      </div>
      <nav class="sub-menu-list">
        <template v-for="(group, gi) in currentGroups" :key="gi">
          <!-- 分组标题 -->
          <div v-if="group.label" class="sub-group-title">{{ group.label }}</div>
          <!-- 分组内的菜单项 -->
          <div
            v-for="sub in group.items"
            :key="sub.path"
            class="sub-item"
            :class="{ 'sub-item--active': route.path === sub.path }"
            @click="navigate(sub.path)"
          >
            <span class="sub-item-icon"><component :is="sub.icon" /></span>
            <span>{{ sub.label }}</span>
          </div>
        </template>
      </nav>
      <!-- AGENT 最近记录 -->
      <div v-if="activeGroup === 'agent'" class="sub-recent">
        <div class="sub-recent-title">最近记录</div>
        <div class="sub-recent-empty">暂无记录</div>
      </div>
    </aside>

    <!-- 第三栏: 内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }" :key="route.path">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import {
  IconDashboard,
  IconBarChart,
  IconThumbUp,
  IconLayers,
  IconRobot,
  IconSearch,
  IconGift,
  IconExpand,
  IconShrink,
  IconShareAlt,
  IconDownload,
  IconSettings,
  IconIdcard,
  IconApps,
  IconLaunch,
  IconBook,
  IconEye,
  IconLink,
  IconCompass,
  IconBulb,
  IconQuestionCircle,
  IconCheckCircle,
  IconCamera,
  IconFile,
  IconStorage,
  IconEdit,
  IconCommon,
} from '@arco-design/web-vue/es/icon';

// IconDownload 和 IconSettings 用于底部特殊按钮

const appStore = useAppStore();
const route = useRoute();
const router = useRouter();

// 二级菜单面板折叠状态
const subPanelCollapsed = ref(false);

interface SubItem {
  path: string;
  label: string;
  icon: typeof IconDashboard;
}

interface SubGroup {
  label?: string;
  items: SubItem[];
}

interface MenuItem {
  path: string;
  label: string;
  icon: typeof IconDashboard;
  key: string;
  groups?: SubGroup[];
}

const menuItems: MenuItem[] = [
  { path: '/dashboard/overview', label: '报告', icon: IconDashboard, key: 'overview' },
  {
    path: '/dashboard/ai-index',
    label: '排名',
    icon: IconBarChart,
    key: 'ranking',
    groups: [
      {
        items: [
          { path: '/dashboard/ai-index', label: 'AI排名透视', icon: IconBarChart },
          { path: '/dashboard/ai-index/competitor', label: 'AI竞品透视', icon: IconEye },
          { path: '/dashboard/ai-index/citation', label: '引用源追溯', icon: IconLink },
        ],
      },
      {
        label: '分析',
        items: [
          { path: '/dashboard/ai-index/source-pref', label: '信源平台偏好', icon: IconCompass },
          { path: '/dashboard/ai-index/source-intel', label: '引用源洞察', icon: IconBulb },
        ],
      },
      {
        label: '管理',
        items: [
          { path: '/dashboard/ai-index/question-mgmt', label: '监控问题管理', icon: IconQuestionCircle },
          { path: '/dashboard/ai-index/recognition-mgmt', label: '监控识别管理', icon: IconCheckCircle },
          { path: '/dashboard/ai-index/snapshot', label: '搜索快照下载', icon: IconCamera },
        ],
      },
    ],
  },
  {
    path: '/dashboard/sentiment',
    label: '口碑',
    icon: IconThumbUp,
    key: 'sentiment',
    groups: [
      {
        items: [
          { path: '/dashboard/sentiment', label: 'AI口碑分析', icon: IconThumbUp },
          { path: '/dashboard/sentiment/citation', label: '引用源追溯', icon: IconLink },
          { path: '/dashboard/sentiment/question-mgmt', label: '监控问题管理', icon: IconQuestionCircle },
          { path: '/dashboard/sentiment/recognition-mgmt', label: '监控识别管理', icon: IconCheckCircle },
          { path: '/dashboard/sentiment/snapshot', label: '搜索快照下载', icon: IconCamera },
        ],
      },
    ],
  },
  {
    path: '/dashboard/media-library',
    label: '优化',
    icon: IconLayers,
    key: 'optimize',
    groups: [
      {
        label: '发稿',
        items: [
          { path: '/dashboard/media-library', label: '信源库', icon: IconStorage },
          { path: '/dashboard/media-library/publish', label: '发布稿件', icon: IconEdit },
          { path: '/dashboard/media-library/records', label: '发稿记录', icon: IconFile },
        ],
      },
      {
        label: '内容资产',
        items: [
          { path: '/dashboard/media-library/tracking', label: '稿件追踪', icon: IconCommon },
        ],
      },
    ],
  },
  {
    path: '/dashboard/new-agent',
    label: 'AGENT',
    icon: IconRobot,
    key: 'agent',
    groups: [
      {
        items: [
          { path: '/dashboard/new-agent', label: '新建对话', icon: IconRobot },
          { path: '/dashboard/new-agent/knowledge', label: 'Agent知识库', icon: IconBook },
          { path: '/dashboard/new-agent/articles', label: '稿件库', icon: IconFile },
        ],
      },
    ],
  },
  { path: '/dashboard/report-center', label: '诊断', icon: IconSearch, key: 'diagnosis' },
  { path: '/dashboard/plan-upgrade', label: '套餐', icon: IconGift, key: 'pricing' },
];

const brandGroups: SubGroup[] = [
  {
    label: '品牌信息',
    items: [
      { path: '/dashboard/brand-card', label: '名片', icon: IconIdcard },
      { path: '/dashboard/brand-card/products', label: '产品', icon: IconApps },
      { path: '/dashboard/brand-card/competitors', label: '竞品', icon: IconLaunch },
    ],
  },
  {
    label: '品牌知识库',
    items: [
      { path: '/dashboard/brand-card/wiki', label: '知识库', icon: IconBook },
    ],
  },
];

const activeGroup = computed(() => {
  const path = route.path;
  if (path.startsWith('/dashboard/brand-card')) return 'brand';
  if (path.startsWith('/dashboard/ai-index')) return 'ranking';
  if (path.startsWith('/dashboard/sentiment')) return 'sentiment';
  if (path.startsWith('/dashboard/media-library')) return 'optimize';
  if (path.startsWith('/dashboard/overview')) return 'overview';
  if (path.startsWith('/dashboard/new-agent')) return 'agent';
  if (path.startsWith('/dashboard/report-center')) return 'diagnosis';
  if (path.startsWith('/dashboard/plan-upgrade')) return 'pricing';
  return '';
});

const activeMenuLabel = computed(() => {
  if (activeGroup.value === 'brand') return '品牌';
  const item = menuItems.find((m) => m.key === activeGroup.value);
  return item?.label ?? '';
});

const currentGroups = computed<SubGroup[]>(() => {
  if (activeGroup.value === 'brand') return brandGroups;
  const item = menuItems.find((m) => m.key === activeGroup.value);
  return item?.groups ?? [];
});

function handleMainMenu(key: string, path: string) {
  const item = menuItems.find((m) => m.key === key);
  if (item?.groups && item.groups.length > 0) {
    router.push(item.groups[0].items[0].path);
  } else if (key === 'brand') {
    router.push('/dashboard/brand-card');
  } else {
    router.push(path);
  }
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
}

/* ===== 第一栏: 窄图标栏 (80px) ===== */
.sidebar-icon {
  position: relative;
  width: 80px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

/* 折叠后悬浮在第一栏右侧边线上的展开按钮 */
/* 目标站: absolute right-0 top-[18px] translate-x-1/2 z-40 w-5 h-10 bg-white border border-gray-200 rounded-r-md shadow-sm flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all */
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
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .logo-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: linear-gradient(135deg, #4338ca 0%, #818cf8 100%);
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px 10px;
  border-radius: 10px;
  margin: 2px 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  color: #6b7280;
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

  &--pricing {
    color: #d97706;
    &:hover {
      background: #fffbeb;
      color: #b45309;
    }
  }

  .nav-icon {
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-text {
    text-align: center;
    white-space: nowrap;
  }
}

.menu-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.sidebar-footer {
  flex-shrink: 0;
  border-top: 1px solid #f3f4f6;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .footer-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .footer-date {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

  .footer-credits {
    .credits-icon {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      color: #6b7280;
    }
    .credits-num {
      font-weight: 700;
      color: #ea580c;
    }
  }

  .collapse-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.15s ease;
    &:hover {
      background: #f9fafb;
      color: #374151;
    }
  }
}

/* ===== 第二栏: 子菜单面板 (240px) ===== */
/* 目标站: transition-[width,left,opacity,border] duration-[240ms] ease-in-out */
.sidebar-sub {
  width: 240px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: width 240ms ease-in-out, opacity 240ms ease-in-out, border 240ms ease-in-out;
}

.sub-menu-list {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
}

/* AGENT 最近记录 */
.sub-recent {
  padding: 12px 18px 16px;
  border-top: 1px solid #f0f1f6;
}

.sub-recent-title {
  font-size: 12px;
  font-weight: 600;
  color: #9a9aa6;
  margin-bottom: 8px;
}

.sub-recent-empty {
  font-size: 12.5px;
  font-weight: 400;
  color: #c5c8d0;
  padding: 6px 0;
}

/* 面板标题行 - 目标站: px-[18px] pt-[18px] pb-[10px] flex items-center justify-between gap-2.5 sticky top-0 bg-white z-[2] */
.sub-panel-header-row {
  padding: 18px 18px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 2;
}

/* 面板标题 (主菜单名称) - 目标站: text-[14px] font-bold text-gray-900 truncate */
.sub-panel-header {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 折叠按钮 - 目标站: w-[26px] h-[26px] rounded-md grid place-items-center transition-colors text-gray-400 hover:bg-gray-50 hover:text-gray-700 flex-shrink-0 */
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

  &:hover {
    background: #f9fafb;
    color: #374151;
  }
}

/* 折叠状态 - 目标站: w-0 border-r-0 opacity-0 pointer-events-none overflow-hidden */
.sidebar-sub--collapsed {
  width: 0;
  opacity: 0;
  border-right: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 分组标题 - 目标站: 11px/600/gray, padding 12px 12px 8px, margin 0 0 4px */
.sub-group-title {
  padding: 12px 12px 8px;
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 600;
  color: #909399;
}

/* 所有子菜单项统一样式 - 目标站: 13.5px/500/gray-600, padding 10px 12px, h=40 */
.sub-item {
  display: flex;
  align-items: center;
  gap: 12px;            /* gap-3 */
  padding: 10px 12px;   /* px-3 py-[10px] */
  border-radius: 10px;  /* rounded-[10px] */
  font-size: 13.5px;    /* text-[13.5px] */
  font-weight: 500;     /* font-medium */
  color: #4b5563;      /* text-gray-600 */
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  line-height: 20px;    /* 匹配目标站 h=40 (10+20+10) */

  &:hover {
    background: #f9fafb;   /* hover:bg-gray-50 */
    color: #111827;       /* hover:text-gray-900 */
  }

  &--active {
    background: rgba(238, 242, 255, 0.9);  /* bg-indigo-50/90 */
    color: #4338ca;       /* text-indigo-700 */
    font-weight: 600;     /* font-semibold */
    &:hover {
      background: rgba(238, 242, 255, 0.9);
      color: #4338ca;
    }
  }

  .sub-item-icon {
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
}

/* 特殊按钮组 */
.sub-action-group {
  margin-top: 8px;
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 4px;

  &:hover {
    background: #f9fafb;
  }

  &--primary {
    color: #4f46e5;
    border-color: #c7d2fe;
    &:hover {
      background: #eef2ff;
    }
  }
}

/* ===== 第三栏: 内容区 ===== */
.main-content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  background: #f8fafc;
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
