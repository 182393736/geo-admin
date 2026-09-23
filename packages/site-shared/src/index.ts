/** 网站 */
export interface Site {
  _id?: string;
  name: string;
  /** 主域名，如 www.example.com */
  domain: string;
  /** 额外绑定域名 */
  aliases?: string[];
  /** 站点状态（兼容旧字段） */
  status: 'active' | 'inactive';
  /** SEO / 站点级配置 */
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
    favicon?: string;
    logo?: string;
  };

  /** 图床域名 */
  imageHost?: string;
  /** 图床 key */
  imageKey?: string;
  /** 备案号 */
  beian?: string;
  /** 中文品牌 */
  brandZh?: string;
  /** 英文品牌 */
  brandEn?: string;
  /** 公司中文 */
  companyZh?: string;
  /** 公司英文 */
  companyEn?: string;
  /** 排序 */
  sort?: number;
  /** 是否有效 */
  enabled?: boolean;
  /** 是否有搜索 */
  hasSearch?: boolean;
  /** 谷歌广告账户 */
  googleAdsAccount?: string;
  /** 谷歌广告脚本 */
  googleAdsScript?: string;
  /** 腾讯广告验证 */
  tencentAdsVerify?: string;
  /** 谷歌统计 id */
  googleAnalyticsId?: string;
  /** 百度统计 id */
  baiduAnalyticsId?: string;
  /** 必应统计 id */
  bingAnalyticsId?: string;
  /** 必应推送 key */
  bingPushKey?: string;
  /** 百度推送 token */
  baiduPushToken?: string;

  createdAt?: string;
  updatedAt?: string;
}

/**
 * CMS pageKind：决定 hubContent 结构与前台渲染器。
 * 扩展新类型：1) 加 union  2) PAGE_KIND_OPTIONS  3) Hub*Content  4) 前台 renderer
 */
export type PageKind =
  | 'default'
  | 'home'
  | 'hub'
  | 'learn'
  | 'report'
  | 'glossary'
  | 'insight'
  | 'solution'
  | 'product'
  | 'compare'
  | 'pricing'
  | 'contact';

export const PAGE_KIND_OPTIONS: { value: PageKind; label: string; pathHint: string }[] = [
  { value: 'home', label: '首页 Home', pathHint: '/' },
  { value: 'hub', label: '栏目页 Hub', pathHint: '/learn' },
  { value: 'learn', label: '学习 Learn', pathHint: '/learn/slug' },
  { value: 'glossary', label: '术语 Glossary', pathHint: '/glossary/term' },
  { value: 'insight', label: '实战 Insight', pathHint: '/insights/slug' },
  { value: 'report', label: '报告 Report', pathHint: '/reports/slug' },
  { value: 'product', label: 'GEO工具 Tool', pathHint: '/tools/slug' },
  { value: 'solution', label: '方案 Solution', pathHint: '/solutions/slug' },
  { value: 'compare', label: '对比 Compare', pathHint: '/compare/slug' },
  { value: 'pricing', label: '价格 Pricing', pathHint: '/pricing' },
  { value: 'contact', label: '联系我们 Contact', pathHint: '/contact' },
  { value: 'default', label: '默认（通用 blocks）', pathHint: '/about' },
];

/** 允许通过 /api/ssr/hub 批量拉取的 kind */
export const HUB_LISTABLE_KINDS: PageKind[] = [
  'home',
  'hub',
  'learn',
  'report',
  'glossary',
  'insight',
  'solution',
  'product',
  'compare',
  'pricing',
  'contact',
];

export interface HubCtaLink {
  label: string;
  to: string;
}

/** 首页 Hero（pageKind=home） */
export interface HubHomeHero {
  eyebrow?: string;
  badge?: string;
  title: string;
  /** 标题中高亮片段 */
  titleAccent?: string;
  description: string;
  primaryCta: HubCtaLink;
  secondaryCta?: HubCtaLink;
  formPlaceholder?: string;
  helper?: string;
  quickTries?: string[];
}

export interface HubHomeItem {
  title?: string;
  description?: string;
  /** stats 布局的数字 */
  value?: string;
  label?: string;
  badge?: string;
  kicker?: string;
  to?: string;
  points?: string[];
}

/** 首页可开关区块。layout 决定前台排版，新增布局只加 renderer */
export interface HubHomeSection {
  id: string;
  enabled?: boolean;
  layout?: 'stats' | 'steps' | 'cards' | 'links' | 'text';
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: HubHomeItem[];
}

export interface HubHomeContent {
  version: 1;
  hero: HubHomeHero;
  sections?: HubHomeSection[];
  faq?: { q: string; a: string }[];
  cta?: {
    title: string;
    description: string;
    button: HubCtaLink;
  };
}

/** 栏目落地页卡片（pageKind=hub） */
export interface HubColumnCard {
  title: string;
  description: string;
  to: string;
}

/**
 * 栏目页：学习中心 / 产品总览 / 报告列表等入口页。
 * 后续 learn 详情等可继续用专用 kind，栏目壳统一用 hub。
 */
export interface HubColumnContent {
  version: 1;
  eyebrow?: string;
  title: string;
  description: string;
  diagnoseCta?: boolean;
  consolePath?: string;
  sections?: { heading: string; paragraphs: string[] }[];
  cards?: HubColumnCard[];
  faq?: { q: string; a: string }[];
  relatedLinks?: HubCtaLink[];
}

/** 报告证据样例（可引用、可复核；禁止未授权精确排名分） */
export interface HubEvidenceSample {
  id: string;
  engine: string;
  question: string;
  /** 脱敏摘录，不含客户机密 */
  excerpt: string;
  citationTypes: string[];
  sampledAt: string;
  note?: string;
}

export interface HubMetricDefinition {
  name: string;
  definition: string;
}

export interface HubReportContent {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  method: string;
  engines: string[];
  samplingPeriod?: {
    start: string;
    end: string;
    cadence: string;
  };
  questionSetVersion?: string;
  sampleSize?: {
    prompts: number;
    answers: number;
    brands?: number;
  };
  limitations?: string[];
  authors?: string[];
  metricsDefinitions?: HubMetricDefinition[];
  evidenceSamples?: HubEvidenceSample[];
  sections: { heading: string; paragraphs: string[] }[];
  faq?: { q: string; a: string }[];
}

export interface HubLearnContent {
  slug: string;
  title: string;
  description: string;
  keywords?: string;
  /** 答案前置（AI/摘要可摘） */
  answerBox?: string;
  lead?: string;
  primarySources?: { label: string; href: string; note?: string }[];
  takeaways?: string[];
  sections: {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
    steps?: string[];
  }[];
  faq?: { q: string; a: string }[];
  relatedProduct?: string;
  relatedLinks?: HubCtaLink[];
}

export interface HubGlossaryContent {
  slug: string;
  term: string;
  short: string;
  definition: string;
  related?: string[];
  title?: string;
  answerBox?: string;
  alsoKnownAs?: string[];
  howMeasured?: string;
  formula?: string;
  faq?: { q: string; a: string }[];
  sections?: { heading: string; paragraphs: string[] }[];
}

export interface HubInsightContent {
  slug: string;
  category: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  readingMinutes?: number;
  keywords?: string[];
  answerBox?: string;
  sections: { heading: string; paragraphs: string[] }[];
  faq?: { q: string; a: string }[];
}

export interface HubSolutionContent {
  slug: string;
  kind: 'persona' | 'industry';
  title: string;
  description: string;
  keywords?: string;
  definition: string;
  painPoints: string[];
  plays: string[];
  relatedProduct?: string;
  relatedLearn?: string;
  faq?: { q: string; a: string }[];
  sections?: { heading: string; paragraphs: string[] }[];
}

export interface HubProductContent {
  slug: string;
  title: string;
  description: string;
  keywords?: string;
  consolePath?: string;
  definition: string;
  metrics: string[];
  usage: string[];
  faq?: { q: string; a: string }[];
  answerBox?: string;
  sections?: { heading: string; paragraphs: string[] }[];
}

/** 对比页 */
export interface HubCompareContent {
  slug: string;
  title: string;
  description: string;
  left: string;
  right: string;
  answerBox?: string;
  dimensions: { name: string; left: string; right: string }[];
  sections?: { heading: string; paragraphs: string[] }[];
  faq?: { q: string; a: string }[];
  relatedLinks?: HubCtaLink[];
}

/** 价格页（pageKind=pricing）：套餐目录可写在 hubContent，也可用代码内 geo-admin 策略表 */
export interface HubPricingPlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface HubPricingPlan {
  id: string;
  name: string;
  icon?: string;
  /** 月付标价；null 表示按需/定制 */
  monthlyPrice: number | null;
  priceText?: string;
  unit?: string;
  subtitle?: string;
  banner?: string;
  highlighted?: boolean;
  queryLimit?: number;
  hasAiScope?: boolean;
  features: HubPricingPlanFeature[];
  customFeatures?: string[];
  ctaLabel: string;
  ctaKind: 'console' | 'demo' | 'disabled';
}

export interface HubPricingContent {
  version: 1;
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description: string;
  billingNote?: string;
  plans?: HubPricingPlan[];
  faq?: { q: string; a: string }[];
  note?: string;
}

/** 联系我们（pageKind=contact） */
export interface HubContactChannel {
  id: string;
  label: string;
  value: string;
  /** mailto: / 站内路径 / 外链；空则纯展示 */
  href?: string;
  kind: 'email' | 'link' | 'text';
  note?: string;
}

export interface HubContactContent {
  version: 1;
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description: string;
  channels: HubContactChannel[];
  faq?: { q: string; a: string }[];
  note?: string;
}

/** pageKind 对应的结构化正文（与 blocks/qa 并存） */
export type HubContent =
  | HubHomeContent
  | HubColumnContent
  | HubReportContent
  | HubLearnContent
  | HubGlossaryContent
  | HubInsightContent
  | HubSolutionContent
  | HubProductContent
  | HubCompareContent
  | HubPricingContent
  | HubContactContent
  | Record<string, unknown>;

/** 问答条目 */
export interface QaItem {
  id: string;
  question: string;
  answer: string;
}

/** HowTo 条目 */
export interface HowToItem {
  id: string;
  title: string;
  content: string;
}

/** Steps 条目 */
export interface StepItem {
  id: string;
  title: string;
  content: string;
}

/** 结构化内容类型（管理端右侧竖向切换） */
export type StructuredTab =
  | 'main'
  | 'header'
  | 'hero'
  | 'start'
  | 'why'
  | 'steps'
  | 'cases'
  | 'features'
  | 'qa'
  | 'examples'
  | 'search'
  | 'article'
  | 'softwareApp'
  | 'webApp'
  | 'breadcrumb'
  | 'posts'
  | 'hub'
  | 'raw';

/** 各 tab 区块是否在前台显示 */
export type TabVisibleMap = Partial<Record<StructuredTab, boolean>>;

/** 头部 tab 内容 */
export interface PageHeaderContent {
  titleCenter?: string;
  metaTitle?: string;
  canonical?: string;
  metaKeywords?: string;
  metaDescription?: string;
}

/** 开始 tab：标准谷歌结构化数据（Schema.org / JSON-LD） */
export interface PageStartContent {
  schemaType?: string;
  name?: string;
  headline?: string;
  description?: string;
  image?: string;
  url?: string;
  author?: string;
  publisher?: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
  keywords?: string;
  mainEntityOfPage?: string;
}

/**
 * 页面 = 菜单节点 + pageData
 * 前台导航与 SSR 渲染共用同一份数据
 */
export interface PageData {
  _id?: string;
  siteId: string;
  path: string;
  title: string;
  parentId?: string | null;
  sort: number;
  visible: boolean;
  /** @deprecated 旗舰平铺页用各模块自己的 visible */
  tabVisible?: TabVisibleMap;
  template: string;
  pageKind?: PageKind;
  /** @deprecated 旗舰页已平铺为 hero/workflow/… 模块 */
  hubContent?: HubContent;
  /** @deprecated 并入 seo.canonical / seo 字段 */
  header?: PageHeaderContent;
  /** @deprecated 改用 schema */
  start?: PageStartContent;
  /** 网页级 Schema.org 字段 */
  schema?: PageStartContent & { visible?: boolean };
  /** 旗舰可见区块（平铺） */
  hero?: Record<string, unknown> & { visible?: boolean };
  workflow?: Record<string, unknown> & { visible?: boolean };
  effects?: Record<string, unknown> & { visible?: boolean };
  watch?: Record<string, unknown> & { visible?: boolean };
  write?: Record<string, unknown> & { visible?: boolean };
  cite?: Record<string, unknown> & { visible?: boolean };
  channel?: Record<string, unknown> & { visible?: boolean };
  diagnosis?: Record<string, unknown> & { visible?: boolean };
  rails?: Record<string, unknown> & { visible?: boolean };
  invite?: Record<string, unknown> & { visible?: boolean };
  posts?: Record<string, unknown> & { visible?: boolean };
  faq?: Record<string, unknown> & { visible?: boolean };
  blocks?: PageBlock[];
  /** @deprecated 旗舰 FAQ 在 faq.faqs */
  qa?: QaItem[];
  /** @deprecated */
  howto?: HowToItem[];
  /** @deprecated 旗舰步骤在 workflow.steps */
  steps?: StepItem[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    canonical?: string;
  };
  status: 'draft' | 'published';
  children?: PageData[];
  createdAt?: string;
  updatedAt?: string;
}

/** @deprecated 使用 PageData，保留别名兼容前台导航渲染 */
export type MenuItem = Pick<PageData, '_id' | 'siteId' | 'title' | 'path' | 'parentId' | 'sort' | 'visible' | 'children'> & {
  children?: MenuItem[];
};

/** 页面内容块 */
export interface PageBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

/** SSR 接口返回：某域名某路径的完整渲染数据 */
export interface SitePagePayload {
  site: Site;
  /** 该路径无 CMS 页时为 null；页脚等仍可用 site */
  page: PageData | null;
  menus: MenuItem[];
}

/** 按 pageKind 批量拉取旗舰内容 */
export interface HubKindPayload {
  site: Site;
  pageKind: PageKind;
  pages: PageData[];
}

/** 通用 API 响应 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export { orderPageDoc } from './page-order'
export {
  FLAGSHIP_MODULE_KEYS,
  flagshipToModules,
  modulesToFlagship,
  isFlatFlagshipDoc,
  flattenLegacyFlagshipPage,
  getModuleFields,
} from './flagship-modules'
export type { FlagshipModuleKey } from './flagship-modules'
