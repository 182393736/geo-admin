import type { HubReportContent } from '@site-manage/shared'

/** 可分享脱敏报告（由控制台回流；无敏感字段） */
export type SharedReport = {
  id: string
  title: string
  industry: string
  datePublished: string
  dateModified: string
  engines: string[]
  method: string
  highlights: string[]
  sections: { heading: string; paragraphs: string[] }[]
  sourceNote: string
}

/** 与 shared HubReportContent 对齐，供静态种子与 CMS 合并 */
export type HubReport = HubReportContent

export const GEO_SHARED_REPORTS: SharedReport[] = [
  {
    id: 'demo-consumer-2026q3',
    title: '脱敏示例：消费品品牌 GEO 基线摘要（方法展示）',
    industry: '消费品',
    datePublished: '2026-09-18',
    dateModified: '2026-09-20',
    engines: ['DeepSeek', '豆包', '通义千问'],
    method: '固定 40 条高意图问题；只读采样；保留引用类型分布；数字未授权故不展示。',
    highlights: [
      '对比题引用更依赖第三方测评',
      '别名未覆盖导致部分题「未识别」',
      '建议先实体治理再扩内容产量',
    ],
    sections: [
      {
        heading: '这份摘要能说明什么？',
        paragraphs: [
          '用于展示控制台回流流量站的脱敏形态：有方法、有引擎、有定性结论，无客户机密与未授权分数。',
        ],
      },
      {
        heading: '如何申请回流？',
        paragraphs: [
          '在工作台导出脱敏摘要并授权公开后，可生成 /reports/shared/[id] 链接，供销售与内容引用。',
        ],
      },
    ],
    sourceNote: '示例数据，非真实客户成绩单。',
  },
]

export function getSharedReport(id: string) {
  return GEO_SHARED_REPORTS.find((r) => r.id === id)
}

/**
 * 首份可引用季度报告模板（2026 Q3）
 * 必含：方法、引擎、采样周期、问题集版本、样本量、指标定义、证据样例、局限、dateModified
 * 禁止：未授权精确分数 / 虚构排行榜
 */
export const GEO_QUARTERLY_REPORT_2026_Q3: HubReportContent = {
  slug: 'ai-visibility-baseline-2026-q3',
  title: 'AI 搜索可见性：可复核基线方法（2026 Q3）',
  description:
    '方法说明书而非行业排行榜：公开问题集版本、主流生成式引擎名单、采样窗口、指标定义与脱敏证据结构。不与全球「亿级 prompt 指数」比体量；不发布未授权精确名次。',
  datePublished: '2026-09-20',
  dateModified: '2026-09-25',
  method:
    '按行业模板抽取固定问题集；对列入引擎名单的入口做只读提问；记录是否提及、推荐位区间、引用源类型；保留原始回答与引用列表作为证据包。禁止换题刷分；问题集变更必须升版本。本窗口用于方法演示与结构观察，不声称全量普查。',
  engines: ['DeepSeek', '豆包', '通义千问', '元宝', 'Kimi'],
  samplingPeriod: {
    start: '2026-09-01',
    end: '2026-09-15',
    cadence: '双周（本报告为窗口内聚合）',
  },
  questionSetVersion: 'geo-qset-cn-core-v1',
  sampleSize: {
    prompts: 120,
    answers: 600,
    brands: 0,
  },
  authors: ['HANYUAI GEO 方法与产品团队'],
  limitations: [
    '本报告以方法与结构观察为主；品类分册数值将在后续季度同口径追加。',
    '不跨品类直接比较提及率绝对值。',
    '不展示未获客户授权的精确分数或「排行榜名次」。',
    '生成式答案存在日内波动，结论基于窗口内聚合与证据留存，而非单次截图。',
    '引用类型识别依赖可见链接/站点；无链接的口头提及不计入「有效引用源」。',
  ],
  metricsDefinitions: [
    {
      name: '品牌提及率',
      definition: '在固定问题集与引擎下，品牌出现在答案中的次数占比。',
    },
    {
      name: '平均推荐位',
      definition: '品牌进入推荐列表时的平均位置；数值越小越好。未进入列表不记入平均，另计未出现率。',
    },
    {
      name: '有效引用源',
      definition: '答案中可识别的信源条目，按类型（官网/测评/媒体/社区/白皮书等）归类。',
    },
    {
      name: '引擎未覆盖',
      definition: '在目标引擎名单中，该品牌在核心问题上完全未出现的引擎数量。',
    },
  ],
  evidenceSamples: [
    {
      id: 'ev-q3-01',
      engine: 'DeepSeek',
      question: '中小团队做生成式引擎优化（GEO）应该先看哪些指标？',
      excerpt:
        '……应同时观察提及率、推荐位与引用源，而不是只看是否出现。固定问题集与采样周期后再比较……',
      citationTypes: ['方法说明', '行业文章'],
      sampledAt: '2026-09-08',
      note: '方法型问题示例；摘录已脱敏，用于展示证据字段结构。',
    },
    {
      id: 'ev-q3-02',
      engine: '豆包',
      question: '为什么官网文章很多，AI 还是更常引用测评？',
      excerpt:
        '……高价值对比题往往依赖第三方测评与案例。仅堆软文难以进入引用池……',
      citationTypes: ['测评', '社区'],
      sampledAt: '2026-09-10',
      note: '引用结构观察示例；不对应某一真实客户成绩。',
    },
    {
      id: 'ev-q3-03',
      engine: '通义千问',
      question: 'GEO 和 SEO 有什么区别？可以一起做吗？',
      excerpt:
        '……SEO 优化蓝链排名；GEO 优化 AI 答案中的提及与引用。二者互补，建议共用品牌实体与事实底座……',
      citationTypes: ['官网', '百科'],
      sampledAt: '2026-09-12',
      note: '概念澄清题；用于校验实体一致性与答案前置写作是否被引用。',
    },
  ],
  sections: [
    {
      heading: '本报告回答什么问题？',
      paragraphs: [
        '它回答「如何用可复核的方法读 GEO 基线」，而不是发布无法审计的行业第一名榜单。',
        '你可以用同一口径理解自家诊断、评估供应商是否换题刷分，并为内容团队设立可验证 KPI。学术上 GEO 一词见 Aggarwal 等人工作（arXiv:2311.09735）；本报告讨论的是可落地的监测与引用口径，而非复现其实验。',
        '相关入门：[什么是 GEO](/learn/what-is-geo)、[核心指标](/learn/geo-metrics)、[如何验证效果](/learn/measurement)。',
      ],
    },
    {
      heading: '采样设计',
      paragraphs: [
        '问题集版本 geo-qset-cn-core-v1：覆盖认知、对比、场景与风险四层；本窗口 prompts=120，按 5 引擎只读采样得到 answers=600。',
        '引擎名单：DeepSeek、豆包、通义千问、元宝、Kimi。名单服务于方法演示；生产监测应以你的真实用户入口为准，并保持稳定以便时间序列可比。',
        '变更引擎名单或问题集时必须升版本，并更新 dateModified；旧版本归档，不与新版混比。',
      ],
    },
    {
      heading: '指标怎么读（禁止只看综合分）',
      paragraphs: [
        '先看高意图子集（选型/对比/替代）的提及与未出现率，再看平均推荐位，再看 citationTypes 是否缺测评/问答等类型。',
        '竞品对照必须同题同引擎。跨品类直接比提及率绝对值没有意义。',
        '对外沟通应同时给出：questionSetVersion、engines、samplingPeriod、dateModified，并保留证据包索引。',
      ],
    },
    {
      heading: '如何阅读证据样例',
      paragraphs: [
        '证据样例展示「问题—引擎—摘录—引用类型—采样时间」。生产环境应保留完整证据包供审计；公开页仅展示脱敏摘录。',
        '若某类 citationTypes 长期缺失（如测评=0），应优先补该类内容，而不是增加同质软文产量。行动映射见 [引用策略](/learn/citation-strategy)。',
      ],
    },
    {
      heading: '引用本报告时请写清',
      paragraphs: [
        '标题 + questionSetVersion（geo-qset-cn-core-v1）+ engines + samplingPeriod（2026-09-01～2026-09-15）+ dateModified（以本页为准）+ canonical URL。',
        '禁止把本页改写成「GEO 排行榜」或伪造精确名次。',
      ],
    },
    {
      heading: '下一步',
      paragraphs: [
        '品牌侧：用免费诊断建基线，再把高意图题转入持续监测。',
        '研究侧：下一季度在同一问题集版本上追加品类分册（仍禁止无方法排行榜）。',
        '站长侧：权威页更新后可配合 IndexNow 与 sitemap；发现辅助不能替代题集复测。',
      ],
    },
  ],
  faq: [
    {
      q: '为什么没有排行榜分数？',
      a: '未获授权或无法复核的精确分会损害权威性。本报告优先公开方法、引擎、周期与证据结构。',
    },
    {
      q: '如何引用本报告？',
      a: '注明标题、questionSetVersion、engines、samplingPeriod 与 dateModified，并链接到本页 canonical URL。',
    },
    {
      q: '能否把客户诊断直接公开？',
      a: '需脱敏并授权后走 /reports/shared/* 回流；禁止带出机密与未授权分数。',
    },
    {
      q: '和学术 GEO 论文是什么关系？',
      a: '论文提供术语与研究问题；本报告提供面向品牌团队的监测与引用口径。二者互补，不互相替代实验结果。',
    },
  ],
}

export const GEO_REPORTS_EXTENDED: HubReportContent[] = [
  GEO_QUARTERLY_REPORT_2026_Q3,
  {
    slug: 'citation-source-mix-2026-q3',
    title: 'AI 引用源结构观察（2026 Q3）：类型分布怎么读',
    description: '解释官网、测评、媒体、社区、白皮书等引用类型如何解读，以及缺口如何映射内容动作。',
    datePublished: '2026-09-20',
    dateModified: '2026-09-20',
    method: '在固定问题集下统计回答中的引用类型（能识别 URL/站点时）；跨品类不直接比绝对值。',
    engines: ['DeepSeek', '豆包', '通义千问', '元宝'],
    samplingPeriod: {
      start: '2026-09-01',
      end: '2026-09-15',
      cadence: '双周',
    },
    questionSetVersion: 'geo-qset-cn-core-v1',
    sampleSize: { prompts: 80, answers: 320 },
    limitations: ['类型识别依赖可见引用；无链接的口头提及不计入有效引用源。'],
    authors: ['HANYUAI Research'],
    metricsDefinitions: [
      {
        name: '引用类型占比',
        definition: '某信源类型在有效引用条目中的占比。',
      },
    ],
    evidenceSamples: [
      {
        id: 'ev-cite-01',
        engine: '豆包',
        question: '选消费品牌时，AI 更常参考哪些信源？',
        excerpt: '……测评与种草对比内容出现频率更高……',
        citationTypes: ['测评', '社区'],
        sampledAt: '2026-09-11',
      },
    ],
    sections: [
      {
        heading: '类型分布的正确读法',
        paragraphs: [
          '第三方测评占比过低，通常预示高价值对比题易输给竞品；官网占比过高不一定差，但需配合可抽取事实。',
        ],
      },
      {
        heading: '映射到行动',
        paragraphs: [
          '缺口类型 → brief → 信源选择 → 发稿追踪 → 复测。不要只增加「又一篇品牌软文」。',
        ],
      },
    ],
    faq: [
      {
        q: '官网为零是否很糟？',
        a: '不一定。若第三方充足且描述准确，可接受；但实体事实页仍建议保留在官网。',
      },
    ],
  },
]

export const GEO_BENCHMARKS_EXTENDED = {
  title: 'GEO 行业基准｜品类可见性与引用结构参照',
  description:
    '提供解读 GEO 诊断结果时可用的参照框架。具体品类数值将随公开报告季度更新；此处先给解读规则与示例区间框架（非排名榜）。',
  points: [
    '同品类应使用同一问题集对比，避免跨品类直接比提及率。',
    '引用源中第三方测评与案例占比过低，通常是高价值问题输给竞品的主因。',
    '引擎间方差大于综合分时，应优先修复「未出现」的引擎，而不是追综合分。',
  ],
  frameworks: [
    {
      category: '消费品',
      notes: '对比/种草题权重大；关注测评与社区高质量回答占比。',
      watch: ['对比题提及', '测评类引用', '口碑描述词'],
    },
    {
      category: 'B2B SaaS',
      notes: '选型/替代题权重大；关注案例指标与第三方评测。',
      watch: ['替代题占位', '案例类引用', '功能事实一致性'],
    },
    {
      category: '电商',
      notes: '购物决策题；参数可抽取性与售后误述风险。',
      watch: ['参数结构化', '测评沉淀页', '售后描述准确性'],
    },
  ],
}

export const GEO_ENGINES_DOC_EXTENDED = {
  title: 'AI 引擎覆盖与采样方法',
  description: 'HANYUAI GEO 如何选择引擎、组织问题采样，以及结果如何解读。',
  engines: [
    { name: 'DeepSeek', note: '偏工具与方案讨论，适合 B2B/效率场景问题集。' },
    { name: '豆包', note: '生活与消费决策常见，注意种草与对比题。' },
    { name: '通义千问', note: '关注引用结构与企业知识场景。' },
    { name: '元宝', note: '按目标用户实际使用决定是否纳入核心名单。' },
    { name: 'Kimi', note: '长文阅读场景可作对照引擎。' },
    { name: 'ChatGPT', note: '涉海外或双语决策时纳入；配合 Bing 收录与 IndexNow。' },
  ],
  sections: [
    {
      heading: '覆盖原则',
      paragraphs: [
        '优先覆盖目标用户真实使用的生成式入口，并保持名单稳定，以便时间序列可比。',
      ],
    },
    {
      heading: '采样原则',
      paragraphs: [
        '只读访问；保留原始回答与引用证据；固定地域与语言设置；记录采样时间。',
      ],
    },
    {
      heading: '站长自动化',
      paragraphs: [
        '流量站通过 sitemap index 分栏目提交；重要 URL 变更可调用 IndexNow（发布流水线确认后再启用）。',
      ],
    },
  ],
}
