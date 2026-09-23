export type PreviewTypeId =
  | 'learn'
  | 'glossary'
  | 'insight'
  | 'report'
  | 'product'
  | 'solution'
  | 'compare'
  | 'hub'
  | 'tool_shell'
  | 'ecosystem'
  | 'benchmark_doc'
  | 'default'

export type PreviewMeta = {
  id: PreviewTypeId
  label: string
  pathExample: string
  seoJob: string
  /** 样例预估汉字量（用于预览页展示丰富度） */
  approxChars: number
  readingMinutes: number
}

export const PREVIEW_TYPES: PreviewMeta[] = [
  { id: 'learn', label: 'PT01 学习支柱', pathExample: '/learn/what-is-geo', seoJob: '主词定义与方法', approxChars: 3200, readingMinutes: 10 },
  { id: 'glossary', label: 'PT02 术语', pathExample: '/glossary/mention-rate', seoJob: '实体短定义', approxChars: 1700, readingMinutes: 6 },
  { id: 'insight', label: 'PT03 实战长文', pathExample: '/insights/deepseek-geo-checklist', seoJob: '场景/引擎长尾', approxChars: 1400, readingMinutes: 8 },
  { id: 'report', label: 'PT04 方法报告', pathExample: '/reports/ai-visibility-baseline-2026-q3', seoJob: '可引用方法权威', approxChars: 2200, readingMinutes: 12 },
  { id: 'product', label: 'PT05 GEO工具', pathExample: '/tools/visibility', seoJob: '能力实体+转化', approxChars: 1050, readingMinutes: 8 },
  { id: 'solution', label: 'PT06 解决方案', pathExample: '/solutions/b2b-saas', seoJob: '角色/行业意图', approxChars: 1100, readingMinutes: 9 },
  { id: 'compare', label: 'PT07 对比', pathExample: '/compare/geo-vs-seo', seoJob: 'A vs B 决策', approxChars: 1200, readingMinutes: 7 },
  { id: 'hub', label: 'PT08 枢纽首页', pathExample: '/', seoJob: '品牌+短枢纽', approxChars: 350, readingMinutes: 2 },
  { id: 'tool_shell', label: 'PT09 工具壳', pathExample: '/diagnose', seoJob: '短文案+FixedSlot', approxChars: 450, readingMinutes: 3 },
  { id: 'ecosystem', label: 'PT10 生态案例', pathExample: '/customers/b2b-saas-competitor', seoJob: '信任与方法', approxChars: 1100, readingMinutes: 7 },
  { id: 'benchmark_doc', label: 'PT11 方法文档', pathExample: '/engines', seoJob: '口径权威', approxChars: 900, readingMinutes: 6 },
  { id: 'default', label: 'PT12 客户站通用', pathExample: '/about', seoJob: '客户 CMS 浅结构', approxChars: 380, readingMinutes: 3 },
]

export { SAMPLE_LEARN } from './learn'
export { SAMPLE_GLOSSARY } from './glossary'
export { SAMPLE_INSIGHT } from './insight'
export { SAMPLE_REPORT } from './report'
export { SAMPLE_PRODUCT } from './product'
export { SAMPLE_SOLUTION } from './solution'
export { SAMPLE_COMPARE } from './compare'
export { SAMPLE_HUB } from './hub'
export { SAMPLE_TOOL_SHELL } from './tool-shell'
export { SAMPLE_ECOSYSTEM } from './ecosystem'
export { SAMPLE_BENCHMARK_DOC } from './benchmark-doc'
export { SAMPLE_DEFAULT } from './default'
