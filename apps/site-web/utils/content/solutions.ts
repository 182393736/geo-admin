/** 结构化内容模块：便于批量扩词与 pageKind 对齐 */

export type ContentKind = 'learn' | 'report' | 'glossary' | 'product' | 'insight' | 'solution' | 'compare' | 'customer'

export type SolutionPage = {
  slug: string
  kind: 'persona' | 'industry'
  title: string
  description: string
  keywords: string
  definition: string
  painPoints: string[]
  plays: string[]
  relatedProduct: string
  relatedLearn: string
  faq: { q: string; a: string }[]
}

export const GEO_SOLUTIONS: SolutionPage[] = [
  {
    slug: 'brand-team',
    kind: 'persona',
    title: '品牌团队的 GEO 落地｜实体、口碑与误述纠偏',
    description: '品牌团队如何用 GEO 统一实体表达、监测 AI 口碑描述，并优先修复高影响误述。',
    keywords: '品牌GEO,品牌实体,AI口碑,品牌团队',
    definition: '品牌团队的 GEO 重点不是发稿量，而是让 AI 正确识别品牌、产品与事实，并减少错误/过时描述。',
    painPoints: ['别名与英文名不一致', 'AI 把竞品功能安到自家身上', '负面旧闻被反复复述'],
    plays: ['完善品牌实体档案', '开启口碑与描述监测', '用事实页纠正误述并复测'],
    relatedProduct: '/tools/brand',
    relatedLearn: '/learn/what-is-geo',
    faq: [
      { q: '品牌团队要不要自己写 SEO 长文？', a: '可以协作，但优先保证实体事实与可验证证据；长文由内容团队按引用缺口生产。' },
    ],
  },
  {
    slug: 'growth-team',
    kind: 'persona',
    title: '增长团队的 GEO｜问题集、可见性与竞品差距',
    description: '增长团队用固定问题集追踪提及率与推荐位，把 GEO 做成可复测的获客实验。',
    keywords: '增长GEO,AI搜索获客,提及率监测',
    definition: '增长团队把 GEO 当作获客漏斗上游：先看高意图问题有没有被提及，再决定内容与投放预算。',
    painPoints: ['只看综合分掩盖引擎盲区', '竞品在对比题占优', '优化动作无法归因'],
    plays: ['锁定 30–50 条高意图问题', '分引擎看未出现风险', '与竞品同口径对比后排 P0'],
    relatedProduct: '/tools/visibility',
    relatedLearn: '/learn/geo-metrics',
    faq: [
      { q: 'GEO 能直接带来线索吗？', a: 'GEO 优化的是 AI 答案占位；线索仍依赖官网转化。二者串联才有完整漏斗。' },
    ],
  },
  {
    slug: 'content-team',
    kind: 'persona',
    title: '内容团队的 GEO｜Brief、信源与发稿回流',
    description: '内容团队按引用缺口写 brief、选择信源平台，并用同一问题集验证是否进入引用池。',
    keywords: '内容GEO,GEO brief,引用源优化',
    definition: '内容团队的 GEO 工作是「为可被 AI 抽取与引用而写」，而不是只为传播情绪写。',
    painPoints: ['产量高但不可引用', '缺少第三方测评', '发稿后无复测'],
    plays: ['从引用缺口生成 brief', '补测评/案例/对比表', '发稿记录入库并双周复测'],
    relatedProduct: '/tools/optimize',
    relatedLearn: '/learn/content-brief',
    faq: [
      { q: '软文还能不能发？', a: '可以，但高价值对比题通常需要事实密度更高的结构与第三方证据。' },
    ],
  },
  {
    slug: 'agency',
    kind: 'persona',
    title: '代理商与咨询的 GEO 交付｜可验证口径与客户汇报',
    description: '代理商用统一采样口径交付 GEO 基线与复测，避免换题刷分，提升客户信任。',
    keywords: 'GEO代理,GEO咨询,GEO交付',
    definition: '代理交付的核心是可复核方法：固定问题集、引擎与周期，用证据汇报而不是截图故事。',
    painPoints: ['客户质疑结果波动', '多品牌口径不一致', '难以证明优化有效'],
    plays: ['用公开方法论文档对齐预期', '按品牌建独立问题集', '季度报告 + 证据包交付'],
    relatedProduct: '/tools/diagnosis',
    relatedLearn: '/learn/measurement',
    faq: [
      { q: '能否白标？', a: '深度能力在控制台履约；对外汇报可用脱敏摘要回流流量站报告页（需授权）。' },
    ],
  },
  {
    slug: 'consumer-goods',
    kind: 'industry',
    title: '消费品行业 GEO｜种草对比题与测评信源',
    description: '消费品在 AI 答案中的推荐高度依赖测评、对比与场景种草证据。',
    keywords: '消费品GEO,美妆GEO,种草AI搜索',
    definition: '消费品 GEO 优先抢占「怎么选 / 对比 / 适合谁」类问题，并用测评与用户场景证据支撑引用。',
    painPoints: ['对比题被竞品占据', '官方内容不被引用', '口碑描述偏负面或过时'],
    plays: ['建设测评与对比页', '监测口碑描述词', '补场景长尾问题证据'],
    relatedProduct: '/tools/citation',
    relatedLearn: '/learn/citation-strategy',
    faq: [
      { q: '直播切片有用吗？', a: '对传播有用；对 AI 引用通常弱于可索引、可抽取的测评与结构化对比文。' },
    ],
  },
  {
    slug: 'b2b-saas',
    kind: 'industry',
    title: 'B2B / SaaS 的 GEO｜方案对比与案例证据',
    description: 'B2B 决策者越来越多向 AI 询问方案对比；需要案例指标、部署周期与场景事实。',
    keywords: 'B2B GEO,SaaS GEO,AI方案对比',
    definition: 'B2B GEO 以高意图方案题为主：谁适合、如何选型、实施周期与风险，用可验证案例支撑。',
    painPoints: ['官网功能堆砌不可抽取', '缺行业案例指标', '竞品在「替代」问题占优'],
    plays: ['结构化产品事实页', '发布含结果指标的案例', '监控替代/对比问题集'],
    relatedProduct: '/tools/competitor',
    relatedLearn: '/learn/measurement',
    faq: [
      { q: '技术文档算信源吗？', a: '算，尤其对功能事实；但选型题仍常需要第三方评测与客户结果。' },
    ],
  },
  {
    slug: 'ecommerce',
    kind: 'industry',
    title: '电商 GEO｜购物决策问题中的品牌占位',
    description: '电商品牌在「买什么 / 哪家好」类 AI 回答中的占位与引用策略。',
    keywords: '电商GEO,购物AI搜索,电商品牌可见性',
    definition: '电商 GEO 关注购物决策问题中的提及、排序与可信任证据（参数、售后、测评）。',
    painPoints: ['参数页不可抽取', '售后与口碑被误述', '平台测评未沉淀到可索引页'],
    plays: ['参数与适用人群结构化', '沉淀平台测评到官网/媒体', '固定购物问题集复测'],
    relatedProduct: '/tools/visibility',
    relatedLearn: '/learn/ai-engines',
    faq: [
      { q: '只做详情页够不够？', a: '不够。AI 更常引用可公开检索的测评与对比，而不仅是商城详情。' },
    ],
  },
  {
    slug: 'local-service',
    kind: 'industry',
    title: '本地生活与服务 GEO｜区域意图与口碑描述',
    description: '本地服务在 AI 推荐中需同时经营区域意图、服务范围与口碑事实。',
    keywords: '本地GEO,服务品牌AI推荐',
    definition: '本地服务 GEO 强调区域修饰词、服务边界与真实口碑，避免被竞品或错误地址信息覆盖。',
    painPoints: ['区域词覆盖不足', '营业信息过时', '负面评价被放大'],
    plays: ['补齐区域问题集', '统一 NAP 与服务范围事实', '监测口碑并纠偏'],
    relatedProduct: '/tools/sentiment',
    relatedLearn: '/learn/geo-metrics',
    faq: [
      { q: '和本地 SEO 冲突吗？', a: '不冲突。地图/蓝链仍重要；GEO 额外覆盖 AI 问答推荐场景。' },
    ],
  },
]

export function getSolution(slug: string) {
  return GEO_SOLUTIONS.find((s) => s.slug === slug)
}

export type ComparePage = {
  slug: string
  title: string
  description: string
  keywords: string
  summary: string
  rows: { dimension: string; left: string; right: string }[]
  leftLabel: string
  rightLabel: string
  verdict: string
  faq: { q: string; a: string }[]
}

export const GEO_COMPARE_PAGES: ComparePage[] = [
  {
    slug: 'geo-vs-seo',
    title: 'GEO vs SEO｜生成式引擎优化与搜索引擎优化对比',
    description: '对比 GEO 与 SEO 的目标、指标、内容形态与验证方式，说明二者如何互补。',
    keywords: 'GEO vs SEO,GEO和SEO区别,生成式引擎优化对比',
    summary: 'SEO 优化蓝链排名与点击；GEO 优化 AI 答案中的提及、排序与引用。团队应并行经营，而不是二选一。',
    leftLabel: 'SEO',
    rightLabel: 'GEO',
    rows: [
      { dimension: '优化对象', left: '搜索结果页（蓝链）', right: '生成式 AI 答案' },
      { dimension: '核心指标', left: '排名、点击、自然流量', right: '提及率、推荐位、引用源' },
      { dimension: '内容形态', left: '关键词覆盖与外链', right: '可抽取事实、测评与第三方证据' },
      { dimension: '验证方式', left: '排名监控与分析工具', right: '固定问题集多引擎采样' },
    ],
    verdict: '有搜索流量的品牌仍需 SEO；用户已向 AI 提问选型时，必须补 GEO。',
    faq: [
      { q: '先做哪个？', a: '已有官网与基础 SEO 的团队，可用免费诊断快速建 GEO 基线，再并行投入。' },
    ],
  },
  {
    slug: 'monitoring-vs-one-off',
    title: '持续监测 vs 单次诊断｜何时用哪种 GEO 能力',
    description: '单次诊断适合建基线与汇报；持续监测适合验证优化与发现引擎盲区。',
    keywords: 'GEO监测,GEO诊断对比,持续监测',
    summary: '单次诊断回答「现在怎样」；持续监测回答「变好了没有、哪里又掉了」。',
    leftLabel: '单次诊断',
    rightLabel: '持续监测',
    rows: [
      { dimension: '目的', left: '基线与优先级', right: '趋势与告警' },
      { dimension: '频率', left: '一次性或按需', right: '周/双周固定' },
      { dimension: '问题集', left: '可较宽探索', right: '必须锁定可比' },
      { dimension: '适合角色', left: '首次评估、对外汇报', right: '增长与内容闭环' },
    ],
    verdict: '先诊断建基线，再把高价值问题集转入持续监测。',
    faq: [
      { q: '可以只做诊断吗？', a: '可以起步；若要证明内容 ROI，需要同一口径的复测。' },
    ],
  },
  {
    slug: 'platform-vs-manual',
    title: 'GEO 平台 vs 人工抽样｜效率、口径与证据',
    description: '对比用平台做多引擎采样与纯人工截图的差异，以及何时仍需人工研判。',
    keywords: 'GEO工具对比,人工抽样,GEO平台',
    summary: '人工截图难规模化且口径易漂；平台适合固定问题集与证据留存，策略研判仍需人。',
    leftLabel: '人工抽样',
    rightLabel: 'GEO 平台',
    rows: [
      { dimension: '规模', left: '题量与引擎受限', right: '可周更大规模采样' },
      { dimension: '口径', left: '易换题、难复现', right: '问题集与引擎可锁定' },
      { dimension: '证据', left: '截图易丢失上下文', right: '原始回答与引用可归档' },
      { dimension: '研判', left: '强依赖个人经验', right: '人机结合：平台出数、人定优先级' },
    ],
    verdict: '用平台承载采样与证据，用专家做策略，而不是互相替代。',
    faq: [
      { q: '平台会不会编造排名？', a: '合格平台应保留原始回答。选供应商时要求可导出证据。' },
    ],
  },
]

export function getComparePage(slug: string) {
  return GEO_COMPARE_PAGES.find((c) => c.slug === slug)
}
