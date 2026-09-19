export type NavItem = {
  path: string
  label: string
}

export type NavGroup = {
  label?: string
  items: NavItem[]
}

export type RailItem = {
  key: string
  label: string
  path: string
  groups?: NavGroup[]
}

export const railItems: RailItem[] = [
  {
    key: 'brand',
    label: '品牌',
    path: '/dashboard/brand-library',
  },
  {
    key: 'overview',
    label: '报告',
    path: '/dashboard/overview',
  },
  {
    key: 'ranking',
    label: '排名',
    path: '/dashboard/ai-index',
    groups: [
      {
        items: [
          { path: '/dashboard/ai-index', label: 'AI排名透视' },
          { path: '/dashboard/competitor-insight', label: 'AI竞品透视' },
          { path: '/dashboard/citation-sources', label: '引用源追溯' },
        ],
      },
      {
        label: '分析',
        items: [
          { path: '/dashboard/source-preference', label: '信源平台偏好' },
          { path: '/dashboard/source-intelligence', label: '引用源洞察' },
        ],
      },
      {
        label: '管理',
        items: [
          { path: '/dashboard/topic-management', label: '监控问题管理' },
          { path: '/dashboard/monitor-recognition', label: '监控识别管理' },
          { path: '/dashboard/downloads', label: '搜索快照下载' },
        ],
      },
    ],
  },
  {
    key: 'sentiment',
    label: '口碑',
    path: '/dashboard/sentiment',
    groups: [
      {
        items: [
          { path: '/dashboard/sentiment', label: 'AI口碑分析' },
          { path: '/dashboard/citation-sources?type=brand', label: '引用源追溯' },
        ],
      },
      {
        label: '管理',
        items: [
          { path: '/dashboard/topic-management?type=brand', label: '监控问题管理' },
          { path: '/dashboard/monitor-recognition?type=brand', label: '监控识别管理' },
          { path: '/dashboard/downloads?type=brand', label: '搜索快照下载' },
        ],
      },
    ],
  },
  {
    key: 'optimize',
    label: '优化',
    path: '/dashboard/media-library',
    groups: [
      {
        label: '发稿',
        items: [
          { path: '/dashboard/media-library', label: '信源库' },
          { path: '/dashboard/media-library/publish', label: '发布稿件' },
          { path: '/dashboard/media-library/records', label: '发稿记录' },
        ],
      },
      {
        label: '内容资产',
        items: [{ path: '/dashboard/media-library/tracking', label: '稿件追踪' }],
      },
    ],
  },
  {
    key: 'agent',
    label: 'AGENT',
    path: '/dashboard/new-agent',
    groups: [
      {
        items: [
          { path: '/dashboard/new-agent', label: '新建对话' },
          { path: '/dashboard/new-agent/articles', label: '稿件库' },
        ],
      },
    ],
  },
]

export const bottomRailItems: RailItem[] = [
  {
    key: 'diagnosis',
    label: '诊断',
    path: '/dashboard/report-center',
    groups: [
      {
        items: [{ path: '/dashboard/report-center', label: '单次品牌诊断' }],
      },
    ],
  },
  {
    key: 'pricing',
    label: '套餐',
    path: '/dashboard/plan-upgrade',
  },
]

const SHARED_RANKING_SENTIMENT = [
  '/dashboard/citation-sources',
  '/dashboard/topic-management',
  '/dashboard/monitor-recognition',
  '/dashboard/downloads',
] as const

function isBrandMode(query?: Record<string, unknown> | { type?: unknown; from?: unknown }) {
  if (!query) return false
  const type = query.type
  const from = query.from
  return type === 'brand' || from === 'sentiment'
}

/** 侧栏主菜单高亮：共享页按 type=brand / from=sentiment 归属口碑 */
export function matchRailKey(
  path: string,
  query?: Record<string, unknown> | { type?: unknown; from?: unknown },
): string {
  if (path.startsWith('/dashboard/brand')) return 'brand'
  if (path.startsWith('/dashboard/overview') || path.startsWith('/dashboard/report-templates')) return 'overview'
  if (path.startsWith('/dashboard/sentiment')) return 'sentiment'
  if (path.startsWith('/dashboard/media-library')) return 'optimize'
  if (path.startsWith('/dashboard/new-agent') || path.startsWith('/dashboard/writing')) return 'agent'
  if (path.startsWith('/dashboard/report-center')) return 'diagnosis'
  if (path.startsWith('/dashboard/plan-upgrade')) return 'pricing'
  if (SHARED_RANKING_SENTIMENT.some((p) => path.startsWith(p))) {
    return isBrandMode(query) ? 'sentiment' : 'ranking'
  }
  if (
    path.startsWith('/dashboard/ai-index') ||
    path.startsWith('/dashboard/competitor') ||
    path.startsWith('/dashboard/source-')
  ) {
    return 'ranking'
  }
  return 'overview'
}
