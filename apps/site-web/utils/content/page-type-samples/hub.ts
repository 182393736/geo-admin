/** PT08 枢纽首页 — 短枢纽：品牌 + 一句 + CTA + 入口，不堆长文 FAQ */
export const SAMPLE_HUB = {
  intent: 'commercial' as const,
  brand: 'HANYUAI GEO',
  title: '让品牌在 AI 答案里被正确看见',
  lead:
    '学习方法、查阅可引用报告，或用约 3 分钟只读诊断建立基线。持续监测与竞品同口径分析在工作台完成。',
  primaryCta: { label: '免费 GEO 诊断', to: '/diagnose' },
  secondaryCta: { label: '什么是 GEO', to: '/learn/what-is-geo' },
  proofPoints: [
    '公开方法与引擎口径，不做无法审计的排行榜',
    '诊断只读，不改网站、不索取服务器凭据',
    '指标与控制台模块对齐',
  ],
  capabilities: [
    { title: '可见性监测', to: '/tools/visibility', blurb: '固定问题集下的趋势' },
    { title: '引用源分析', to: '/tools/citation', blurb: '信源类型缺口' },
    { title: '竞品透视', to: '/tools/competitor', blurb: '同题同口径差距' },
    { title: 'GEO Agent', to: '/tools/agent', blurb: '缺口变任务' },
  ],
  learnRail: [
    { title: '什么是 GEO', to: '/learn/what-is-geo' },
    { title: 'GEO vs SEO', to: '/compare/geo-vs-seo' },
    { title: '术语表', to: '/glossary' },
  ],
  reportRail: [
    { title: '2026 Q3 方法观察', to: '/reports/ai-visibility-baseline-2026-q3' },
  ],
  /** 首页不放长 FAQ；细节去 learn / report */
  faq: [
    { q: '诊断会改站吗？', a: '不会，只读。' },
    { q: '完整监测在哪？', a: '登录工作台。' },
  ],
}
