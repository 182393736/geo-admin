'use strict';

/**
 * 各类 pageKind 完整样例（CMS hubContent）
 * 供 seed 与后台「从样例复制」参考；先人工改，再批量。
 */

const faq = (pairs) => pairs.map(([q, a]) => ({ q, a }));

const learnWhatIsGeo = {
  slug: 'what-is-geo',
  title: '什么是 GEO？生成式引擎优化与 SEO 的区别',
  description:
    'GEO（生成式引擎优化）工作定义、与 SEO 的边界、可复核指标与四步起步法。含一级出处与 FAQ。',
  keywords: '什么是GEO,生成式引擎优化,GEO和SEO区别',
  answerBox:
    'GEO（Generative Engine Optimization，生成式引擎优化）是通过改进内容结构、可访问性与权威信号，提高品牌或页面在生成式 AI 答案中被提及、正确描述或引用为信源的概率的实践。它建立在 SEO 基础之上，衡量重点从蓝链排名扩展到答案可见度与引用。',
  lead:
    '当用户向豆包、DeepSeek、通义、Kimi 等直接提问时，可见性不再只等于搜索结果页排名。GEO 关注：在锁定问题集与引擎名单下，品牌是否出现、描述是否正确、信源是否健康，并用同一口径复测。',
  primarySources: [
    {
      label: 'Aggarwal et al., GEO (KDD 2024)',
      href: 'https://arxiv.org/abs/2311.09735',
      note: '学术上系统提出 GEO 与 GEO-bench；论文场景提升有上限。',
    },
    {
      label: 'Google · 针对生成式 AI 功能的优化指南',
      href: 'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide',
      note: 'Google 立场：为 AI 搜索体验优化仍属 SEO。',
    },
  ],
  takeaways: [
    'GEO 优化答案中的提及与引用；SEO 优化结果页排名——基础共用。',
    '至少分项看：提及率、推荐位、描述倾向、引用类型——不要只用综合分。',
    '可复核优先：固定 questionSetVersion、引擎名单与采样窗口。',
  ],
  sections: [
    {
      heading: 'GEO 是什么？工作定义',
      paragraphs: [
        '一句话：在生成式引擎给出的答案里，提高品牌被提及、被正确描述、被引用为信源的概率，并用固定问题集验证效果。',
        '从业视角可拆成三层：测量（锁定问题列表与引擎，只读采样）；内容与信源（按缺口补可抽取事实）；闭环（同口径复测）。',
      ],
      bullets: [
        '成功单位：答案中的一次提及或引用',
        '共用基线：可抓取、E-E-A-T、清晰结构',
        '差异点：指标与采信方法',
      ],
    },
    {
      heading: 'GEO 和 SEO：区别与共用',
      paragraphs: [
        'SEO：优化搜索结果页上的排名与点击。GEO：优化生成式答案中的占位与信源结构。用户可能先搜再问 AI，应并行。',
        '必须共用：品牌实体与事实底座。表达可分流：SEO 做主题集群；GEO 做问题—证据映射。',
      ],
    },
    {
      heading: 'GEO 不是什么',
      paragraphs: [
        '不是训练语料操控；不是提示词工程；不是「发得越多越好」；不是无法复核的排行榜营销。',
      ],
    },
    {
      heading: '可执行起步（四步）',
      paragraphs: [ '目标是两到四周内跑通可复核闭环。' ],
      steps: [
        '锁定 30–50 题问题集与引擎名单，写下版本号',
        '跑基线采样，保留证据包',
        '按未出现的高意图题补内容与第三方信源',
        '同口径复测，只改一类变量',
      ],
    },
  ],
  faq: faq([
    [ 'GEO 能保证进入 AI 答案第一吗？', '不能。公开材料应给方法与证据结构，而非无法审计的排名承诺。' ],
    [ '只做 SEO 够不够？', 'SEO 仍是基础；若目标用户大量直接问 AI，需要并行看答案占位指标。' ],
    [ '从哪几个引擎开始？', '先选业务上真实决策入口的 3–5 个，而不是追求「全覆盖」。' ],
    [ '和传统口碑监测有何不同？', 'GEO 绑定固定问题集与生成式引擎采样，不是全网舆情声量。' ],
    [ '内容怎么写更易被引用？', '答案前置、事实表、对比维度、可核对结果；避免空泛堆词。' ],
    [ '多久复测一次？', '内容或信源有实质变更后，用同一 questionSetVersion 复测；常规可双周。' ],
  ]),
  relatedProduct: '/tools/visibility',
  relatedLinks: [
    { label: 'GEO 指标', to: '/learn/geo-metrics' },
    { label: '术语：提及率', to: '/glossary/mention-rate' },
    { label: '免费诊断', to: '/diagnose' },
  ],
};

const glossaryMention = {
  slug: 'mention-rate',
  term: '品牌提及率',
  short: '固定问题采样中，品牌出现在 AI 答案里的比例',
  title: '品牌提及率是什么？如何计算与解读',
  answerBox:
    '品牌提及率 = 锁定问题集与引擎下，答案中出现目标品牌（含别名）的有效回答数 ÷ 有效回答总数。须与推荐位、未出现率、引用类型一起读。',
  alsoKnownAs: [ 'Mention Rate', 'AI 提及率' ],
  definition:
    '在预先锁定的问题列表（questionSetVersion）、引擎名单、地域与语言下，对有效采样回答做品牌命中判定。提及率 = 命中数 ÷ 有效回答数。规则变更必须升版本。',
  howMeasured:
    '分子：命中品牌或别名的有效回答。分母：该引擎该问题集该窗口内的有效回答。建议分引擎、分意图子集输出，并保留原始证据。',
  formula: '提及率 = Σ 1[命中] / Σ 有效回答',
  sections: [
    {
      heading: '在 GEO 里怎么用',
      paragraphs: [
        '提及率是可见性入门指标，不是效果充分条件。健康增长：高意图选题提及与推荐位同步改善。',
      ],
    },
    {
      heading: '常见误区',
      paragraphs: [
        '未配置别名导致低估；把未出现从分母剔除却不报未出现率；跨品类比绝对值做排行榜。',
      ],
    },
  ],
  related: [ 'ai-visibility', 'recommendation-rank', 'question-set' ],
  faq: faq([
    [ '提及率多少算好？', '没有跨品类标准；同品类同题集同引擎比较相对差距。' ],
    [ '没出现算 0 还是剔除？', '计入分母并单独报未出现率；不要悄悄剔除。' ],
    [ '和搜索曝光能比吗？', '不能直接比；入口与口径不同。' ],
  ]),
};

const insightDeepseek = {
  slug: 'deepseek-geo-checklist',
  category: '引擎实战',
  title: 'DeepSeek 场景下的 GEO 检查清单',
  description: '面向 DeepSeek 决策入口的选题、内容结构与复测清单。',
  datePublished: '2026-09-01',
  dateModified: '2026-09-20',
  readingMinutes: 8,
  keywords: [ 'DeepSeek GEO', 'AI搜索优化清单' ],
  answerBox:
    '在 DeepSeek 上做 GEO：先锁高意图题，再补可抽取事实与第三方信源，用同题集复测提及与推荐位；不要用宣传向长尾题刷综合分。',
  sections: [
    {
      heading: '先锁题，再写内容',
      paragraphs: [
        '列出用户在 DeepSeek 上会问的「如何选择 / 对比 / 替代」题，而不是品牌软文题。',
        '每题对应：现状答案里有谁、引用了谁、你们缺什么事实。',
      ],
    },
    {
      heading: '内容结构清单',
      paragraphs: [
        '首段给结论；用表格对比维度；给出可核对数字或案例边界；FAQ 覆盖异议。',
      ],
    },
    {
      heading: '复测口径',
      paragraphs: [
        '同一 questionSetVersion；记录采样窗口；保留脱敏证据摘录。',
      ],
    },
  ],
  faq: faq([
    [ '只优化 DeepSeek 够吗？', '先覆盖主决策入口；再扩展到其它引擎，避免平均用力。' ],
    [ '多久能看到变化？', '取决于内容是否被采信与题集是否稳定；用双周窗口观察趋势。' ],
  ]),
};

const reportQ3 = {
  slug: 'ai-visibility-baseline-2026-q3',
  title: '中国 AI 搜索可见性基线观察（2026 Q3）',
  description:
    '可引用季度方法报告：公开问题集版本、引擎名单、采样周期与脱敏证据样例。不含未授权精确排名分。',
  datePublished: '2026-09-20',
  dateModified: '2026-09-20',
  method:
    '按行业模板抽取固定问题集；对列入引擎名单的入口做只读提问；记录提及、推荐位、引用源类型；保留证据包。',
  engines: [ 'DeepSeek', '豆包', '通义千问', '元宝', 'Kimi' ],
  samplingPeriod: { start: '2026-09-01', end: '2026-09-15', cadence: '双周' },
  questionSetVersion: 'geo-qset-cn-core-v1',
  sampleSize: { prompts: 120, answers: 600, brands: 0 },
  authors: [ 'HANYUAI Research' ],
  limitations: [
    '以方法与结构观察为主',
    '不跨品类直接比较提及率绝对值',
    '不展示未获授权的精确分数',
  ],
  metricsDefinitions: [
    { name: '品牌提及率', definition: '固定问题集下品牌出现次数占比' },
    { name: '平均推荐位', definition: '进入推荐列表时的平均位置' },
  ],
  evidenceSamples: [
    {
      id: 'ev-1',
      engine: 'DeepSeek',
      question: '中小团队做 GEO 应该先看哪些指标？',
      excerpt: '……应同时观察提及率、推荐位与引用源……',
      citationTypes: [ '方法说明' ],
      sampledAt: '2026-09-08',
      note: '样例证据，可在后台替换',
    },
  ],
  sections: [
    {
      heading: '本报告回答什么？',
      paragraphs: [
        '如何用可复核的方法读 GEO 基线，而不是发布无法审计的排行榜。',
        '读者可按 questionSetVersion、engines、samplingPeriod 复述与引用。',
      ],
    },
    {
      heading: '方法摘要',
      paragraphs: [
        '问题集版本 geo-qset-cn-core-v1；五引擎只读采样；双周窗口聚合。',
      ],
    },
  ],
  faq: faq([
    [ '如何引用本报告？', '注明标题、questionSetVersion、engines、samplingPeriod 与 dateModified。' ],
    [ '为什么没有品牌排名总分？', '避免未授权精确分与跨品类误导；公开方法与结构观察。' ],
  ]),
};

const productVisibility = {
  slug: 'visibility',
  title: 'AI 可见性监测｜HANYUAI GEO',
  description: '按问题集与引擎监测品牌提及、推荐位与趋势，支撑 GEO 决策。',
  keywords: 'AI可见性监测,品牌提及率监测',
  consolePath: '/dashboard/visibility',
  answerBox:
    '可见性监测把「AI 会不会提到我」变成可对比指标：分引擎提及率、推荐位、未出现高意图题清单，并保留证据便于复盘。',
  definition:
    '在锁定问题集与引擎名单下，持续采样生成式答案，计算提及与推荐位，输出缺口清单与趋势。',
  metrics: [ '分引擎提及率', '平均推荐位', '未出现高意图题数', '周环比变化' ],
  usage: [
    '导入或选择问题集版本',
    '配置品牌实体与别名',
    '查看分引擎看板与缺口',
    '导出证据包给内容团队',
  ],
  sections: [
    {
      heading: '适合谁',
      paragraphs: [ '品牌与增长团队需要把 AI 搜索表现纳入周会指标，而不是凭截图决策。' ],
    },
  ],
  faq: faq([
    [ '和舆情监测有何不同？', '绑定固定问题集与生成式引擎，不是全网声量。' ],
    [ '能否看竞品？', '可在竞品透视模块对比同一题集下的相对差距（需授权与合规）。' ],
  ]),
};

const solutionB2b = {
  slug: 'b2b-saas',
  kind: 'industry',
  title: 'B2B SaaS 的 GEO 方案',
  description: '选型题密集场景下，如何用可见性监测 + 内容证据提升 AI 答案占位。',
  keywords: 'B2B SaaS GEO,AI搜索获客',
  definition:
    'B2B SaaS 用户大量通过「如何选择 / vs 竞品」提问决策。方案聚焦高意图题覆盖、对比页与可引用案例，而不是品牌软文。',
  painPoints: [
    '选型题上未出现或被竞品占据推荐位',
    '官网有功能说明但缺少可抽取对比维度',
    '案例不能对外引用或缺少第三方测评',
  ],
  plays: [
    '锁 40 题高意图集并分引擎基线',
    '补齐对比页与事实表',
    '沉淀可脱敏案例与方法报告外链',
    '双周复测只改一类变量',
  ],
  relatedProduct: '/tools/visibility',
  relatedLearn: '/learn/what-is-geo',
  sections: [
    {
      heading: '90 天节奏建议',
      paragraphs: [
        '第 1–2 周：基线与题集；第 3–6 周：内容与信源；第 7–12 周：复测与排期。',
      ],
    },
  ],
  faq: faq([
    [ '一定要从监测开始吗？', '是。没有同口径基线，内容投入无法证明有效。' ],
    [ '要不要覆盖所有引擎？', '先覆盖主决策入口，再扩展。' ],
  ]),
};

const compareGeoSeo = {
  slug: 'geo-vs-seo',
  title: 'GEO vs SEO：区别、共用与怎么一起做',
  description: '用对比维度说明 GEO 与 SEO 的目标、指标与内容策略差异，以及如何并行。',
  left: 'SEO',
  right: 'GEO',
  answerBox:
    'SEO 优化结果页排名与点击；GEO 优化生成式答案中的提及与引用。基础（可抓取、权威、清晰结构）共用，指标与内容形态分流。',
  dimensions: [
    { name: '用户入口', left: '搜索结果页', right: '生成式答案 / 对话' },
    { name: '成功单位', left: '排名与点击', right: '提及、推荐位、引用' },
    { name: '内容形态', left: '主题集群与落地页', right: '问题—证据映射、事实表、FAQ' },
    { name: '验证方式', left: '排名/流量', right: '固定题集采样 + 证据包' },
  ],
  sections: [
    {
      heading: '为什么要并行',
      paragraphs: [
        '同一用户可能先搜再问 AI。只做一侧会在另一入口失明。',
      ],
    },
    {
      heading: '落地建议',
      paragraphs: [
        '共用实体与事实库；SEO 负责主题覆盖，GEO 负责高意图问答与可引用证据。',
      ],
    },
  ],
  faq: faq([
    [ 'GEO 会取代 SEO 吗？', '不会。Google 也强调生成式体验优化仍建立在 SEO 基础上。' ],
    [ '团队怎么分工？', '内容与 SEO 共建事实底座；增长看 GEO 题集指标。' ],
  ]),
  relatedLinks: [
    { label: '什么是 GEO', to: '/learn/what-is-geo' },
    { label: '学习中心', to: '/learn' },
  ],
};

/** @type {Array<{ path: string, title: string, pageKind: string, template: string, hubContent: any, seo: any, blocks?: any[] }>} */
const SAMPLE_PAGES = [
  {
    path: '/learn/what-is-geo',
    title: '什么是 GEO',
    pageKind: 'learn',
    template: 'geo-learn',
    hubContent: learnWhatIsGeo,
    seo: {
      title: learnWhatIsGeo.title,
      description: learnWhatIsGeo.description,
      keywords: learnWhatIsGeo.keywords,
    },
  },
  {
    path: '/glossary/mention-rate',
    title: '品牌提及率',
    pageKind: 'glossary',
    template: 'geo-glossary',
    hubContent: glossaryMention,
    seo: {
      title: glossaryMention.title,
      description: glossaryMention.answerBox,
      keywords: '品牌提及率,Mention Rate,GEO',
    },
  },
  {
    path: '/insights/deepseek-geo-checklist',
    title: 'DeepSeek GEO 检查清单',
    pageKind: 'insight',
    template: 'geo-insight',
    hubContent: insightDeepseek,
    seo: {
      title: insightDeepseek.title,
      description: insightDeepseek.description,
      keywords: insightDeepseek.keywords.join(','),
    },
  },
  {
    path: '/reports/ai-visibility-baseline-2026-q3',
    title: '2026 Q3 可见性基线报告',
    pageKind: 'report',
    template: 'geo-report',
    hubContent: reportQ3,
    seo: {
      title: reportQ3.title,
      description: reportQ3.description,
      keywords: 'GEO报告,AI搜索可见性',
    },
  },
  {
    path: '/tools/visibility',
    title: 'AI 可见性监测',
    pageKind: 'product',
    template: 'geo-product',
    hubContent: productVisibility,
    seo: {
      title: productVisibility.title,
      description: productVisibility.description,
      keywords: productVisibility.keywords,
    },
  },
  {
    path: '/solutions/b2b-saas',
    title: 'B2B SaaS GEO 方案',
    pageKind: 'solution',
    template: 'geo-solution',
    hubContent: solutionB2b,
    seo: {
      title: solutionB2b.title,
      description: solutionB2b.description,
      keywords: solutionB2b.keywords,
    },
  },
  {
    path: '/compare/geo-vs-seo',
    title: 'GEO vs SEO',
    pageKind: 'compare',
    template: 'geo-compare',
    hubContent: compareGeoSeo,
    seo: {
      title: compareGeoSeo.title,
      description: compareGeoSeo.description,
      keywords: 'GEO vs SEO,生成式引擎优化对比',
    },
  },
  {
    path: '/about',
    title: '关于我们',
    pageKind: 'default',
    template: 'default',
    hubContent: null,
    blocks: [
      {
        id: 'hero-about',
        type: 'hero',
        props: {
          heading: '关于 HANYUAI GEO',
          subtitle: 'GEO 行业可索引权威层与获客站（样例页，可复制后改）',
        },
      },
      {
        id: 'rich-about',
        type: 'richtext',
        props: {
          html: '<p>我们提供生成式引擎优化的知识、方法报告与免费诊断入口。深度履约在产品控制台完成。</p><p>本页为 <code>pageKind=default</code> 样例，使用 blocks 渲染。</p>',
        },
      },
    ],
    seo: {
      title: '关于 HANYUAI GEO',
      description: '品牌与分工说明',
      keywords: 'HANYUAI GEO,关于',
    },
  },
];

module.exports = { SAMPLE_PAGES, learnWhatIsGeo, glossaryMention };
