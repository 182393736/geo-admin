import type { Component } from 'vue'
import {
  Activity,
  BookOpen,
  Bot,
  ChartColumn,
  ChartPie,
  CircleHelp,
  Database,
  FileText,
  Gem,
  HardDriveDownload,
  LayoutGrid,
  Lightbulb,
  Link2,
  List,
  MessageSquare,
  MonitorCheck,
  PenLine,
  PieChart,
  Radar,
  Search,
  Swords,
  Upload,
} from 'lucide-vue-next'

/** 一级 rail key → 图标 */
export const railIcons: Record<string, Component> = {
  brand: BookOpen,
  overview: LayoutGrid,
  ranking: ChartColumn,
  sentiment: ChartPie,
  optimize: PenLine,
  agent: MessageSquare,
  diagnosis: Activity,
  pricing: Gem,
}

/** 二级菜单 path（含 query）→ 图标 */
export const subIcons: Record<string, Component> = {
  '/dashboard/ai-index': ChartColumn,
  '/dashboard/competitor-insight': Swords,
  '/dashboard/citation-sources': Link2,
  '/dashboard/citation-sources?type=brand': Link2,
  '/dashboard/source-preference': List,
  '/dashboard/source-intelligence': Lightbulb,
  '/dashboard/topic-management': CircleHelp,
  '/dashboard/topic-management?type=brand': CircleHelp,
  '/dashboard/monitor-recognition': MonitorCheck,
  '/dashboard/monitor-recognition?type=brand': MonitorCheck,
  '/dashboard/downloads': HardDriveDownload,
  '/dashboard/downloads?type=brand': HardDriveDownload,
  '/dashboard/sentiment': PieChart,
  '/dashboard/media-library': Database,
  '/dashboard/media-library/publish': Upload,
  '/dashboard/media-library/records': FileText,
  '/dashboard/media-library/tracking': Radar,
  '/dashboard/new-agent': Bot,
  '/dashboard/new-agent/articles': FileText,
  '/dashboard/report-center': Search,
}

export function subIconFor(path: string): Component {
  return subIcons[path] || FileText
}
