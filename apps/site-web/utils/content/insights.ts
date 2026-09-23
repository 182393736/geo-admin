export type GeoInsight = {
  slug: string
  category: string
  title: string
  description: string
  datePublished: string
  dateModified: string
  readingMinutes: number
  keywords: string[]
  sections: { heading: string; paragraphs: string[] }[]
}

function insight(
  partial: Omit<GeoInsight, 'datePublished' | 'dateModified' | 'readingMinutes'> & {
    datePublished?: string
    dateModified?: string
    readingMinutes?: number
  },
): GeoInsight {
  return {
    datePublished: partial.datePublished || '2026-09-01',
    dateModified: partial.dateModified || '2026-09-20',
    readingMinutes: partial.readingMinutes || 8,
    ...partial,
  }
}

/** 15+ 实战长文：扩量主词/场景词/引擎词 */
export const GEO_INSIGHTS_EXTENDED: GeoInsight[] = [
  insight({
    slug: 'geo-core-metrics',
    category: '指南',
    title: 'GEO 的核心指标，应该如何一起看？',
    description:
      'GEO 不只是看品牌有没有出现。要同时观察提及率、推荐位、品牌描述、引用来源和问题覆盖，才能知道下一步应该优化什么。',
    keywords: ['GEO指标', '品牌提及率', 'AI推荐位', '引用源分析', 'GEO优化'],
    sections: [
      {
        heading: 'GEO 核心指标到底有哪些？',
        paragraphs: [
          '做 GEO 优化时，至少同时看五类信号：品牌提及率、平均推荐位、品牌描述倾向、问题覆盖率，以及有效引用源数量与类型。只看提及率会漏掉「出现了但排很后」或「被负面描述」的情况。',
          '推荐把同一组行业问题固定下来，按周或双周采样，保留原始回答与引用证据，才能把波动和真实改进区分开。',
        ],
      },
      {
        heading: '为什么要把指标放在一张表里看？',
        paragraphs: [
          '单独升高的提及率，可能来自少数低价值长尾问题；若高价值对比题仍未进入推荐名单，整体增长并不健康。把引擎、问题意图、推荐位和信源类型交叉看，才能排出真正的 P0。',
          '竞品差距同样要用同一问题集对齐。否则「自己进步了」和「对手进步更快」无法同时判断。',
        ],
      },
      {
        heading: '下一步怎么做？',
        paragraphs: [
          '先选定 30–50 组核心问题，建立基线报告；再按影响 × 难度排序内容行动；每次发布后用同一口径复测。HANYUAI GEO 把监测、理解体检和行动清单放在同一工作流里，减少指标割裂。',
        ],
      },
    ],
  }),
  insight({
    slug: 'ai-brand-understanding-checklist',
    category: '技术',
    title: 'AI 能不能读懂你的品牌？从 10 个信号开始排查',
    description: '从品牌实体、产品事实、场景证据到引用来源，一份面向市场与内容团队的可执行检查清单。',
    readingMinutes: 12,
    datePublished: '2026-09-05',
    keywords: ['AI理解度', '品牌实体', 'GEO信号检查', '可引用内容', '生成式引擎优化'],
    sections: [
      {
        heading: 'AI 读不懂品牌，通常卡在哪里？',
        paragraphs: [
          '常见障碍包括：品牌别名不统一、产品事实缺失（价格区间、适用场景、客户规模）、缺少可抽取的对比表与结论句，以及权威第三方信源不足。这些都会降低被 AI 正确描述和推荐的概率。',
        ],
      },
      {
        heading: '10 个可执行排查信号',
        paragraphs: [
          '建议逐项检查：① 官网与百科实体一致；② 产品名与品类词共现清晰；③ 功能/场景列表可结构化抽取；④ 有可验证结果指标；⑤ 有客户案例与部署周期；⑥ 有对比页而非纯软文；⑦ FAQ 用真实问句；⑧ Schema 与正文事实一致；⑨ 被行业媒体或测评引用；⑩ 关键页面互相内链、无矛盾表述。',
          '把缺口按「影响推荐」优先修复，而不是先追求内容产量。',
        ],
      },
      {
        heading: '如何验证修复是否有效？',
        paragraphs: [
          '修复后继续用固定问题集采样，对比品牌描述准确度、提及率和有效引用源。若制造业等高价值场景仍「未出现」，优先补场景证据，而不是再发泛泛的品牌稿。',
        ],
      },
    ],
  }),
  insight({
    slug: 'why-ai-not-recommending',
    category: '实战',
    title: '为什么内容发了很多，AI 还是不推荐？',
    description: '不要只看产量。把问题集、引用源、事实证据和采样周期放进同一个实验设计里，才能知道哪一步真的有效。',
    readingMinutes: 10,
    datePublished: '2026-08-28',
    keywords: ['AI不推荐品牌', 'GEO内容优化', '引用缺口', '内容brief', 'AI搜索优化'],
    sections: [
      {
        heading: '产量高不等于可被引用',
        paragraphs: [
          'AI 更倾向引用事实密度高、结构清晰、有第三方背书的内容。大量同质软文会稀释主题权威，却补不上「对比型问题」和「场景长尾问题」上的证据缺口。',
        ],
      },
      {
        heading: '用实验而不是感觉做 GEO',
        paragraphs: [
          '固定问题集、引擎列表、地域与采样频率，每次只改一类变量（例如补第三方测评或补制造业案例），再观察提及率与推荐位变化。这样能回答「哪一步真的有效」。',
          '同时盯引用源类型分布：若第三方测评与客户白皮书占比过低，即使官网文章很多，AI 仍可能推荐竞品。',
        ],
      },
      {
        heading: '可立即执行的内容 brief 原则',
        paragraphs: [
          '每个 brief 应包含：目标问题句、必须出现的事实字段、证据类型（案例/测评/数据）、期望被引用的段落结构，以及发布后的复测窗口。HANYUAI GEO 可从引用缺口直接生成这类 brief。',
        ],
      },
    ],
  }),
  insight({
    slug: 'deepseek-geo-checklist',
    category: '引擎',
    title: 'DeepSeek 场景下的 GEO 检查清单',
    description: '面向 DeepSeek 用户决策路径，整理品牌在回答中的提及、引用与事实一致性检查项。',
    keywords: ['DeepSeek GEO', 'DeepSeek可见性', '生成式引擎优化'],
    sections: [
      {
        heading: '为什么要单独看 DeepSeek？',
        paragraphs: [
          '综合分会掩盖「某一引擎完全未出现」。若目标客户常用 DeepSeek 做选型，必须单列问题集与引用结构。',
        ],
      },
      {
        heading: '检查清单',
        paragraphs: [
          '确认品类词与品牌共现；对比题是否进入推荐；引用是否偏官网或第三方；描述是否过时。每项修复后用同一题复测。',
        ],
      },
    ],
  }),
  insight({
    slug: 'doubao-geo-playbook',
    category: '引擎',
    title: '豆包里的品牌可见性：一套可执行 Playbook',
    description: '针对豆包使用场景，说明如何建设问题集、补证据并验证提及率变化。',
    keywords: ['豆包GEO', '豆包AI搜索', '品牌可见性'],
    sections: [
      {
        heading: '豆包决策问题长什么样？',
        paragraphs: [
          '常见是生活消费与工具对比。问题集应覆盖「怎么选」「哪家好」「适合谁」，并保留地域/人群修饰。',
        ],
      },
      {
        heading: 'Playbook 三步',
        paragraphs: [
          '建基线 → 补测评/场景证据 → 双周复测。不要用单次截图宣布胜利。',
        ],
      },
    ],
  }),
  insight({
    slug: 'tongyi-citation-patterns',
    category: '引擎',
    title: '通义场景的引用源偏好观察',
    description: '讨论通义类回答中常见信源类型，以及官网与第三方如何组合布局。',
    keywords: ['通义千问GEO', 'AI引用源', '通义可见性'],
    sections: [
      {
        heading: '引用源观察怎么用？',
        paragraphs: [
          '把信源分成官网、媒体、测评、社区、白皮书。若某类长期为 0，优先补该类而不是再堆同质稿。',
        ],
      },
    ],
  }),
  insight({
    slug: 'chatgpt-bing-geo',
    category: '引擎',
    title: 'ChatGPT / Bing 检索与 GEO：为什么要重视收录',
    description: '说明 Bing 收录、IndexNow 与部分 ChatGPT 检索场景的关系，以及流量站侧要做什么。',
    keywords: ['ChatGPT GEO', 'Bing IndexNow', 'AI搜索收录'],
    sections: [
      {
        heading: '收录为什么重要？',
        paragraphs: [
          '许多生成式回答会检索公开网页。页面不可发现、无规范 sitemap，会削弱被引用机会。',
        ],
      },
      {
        heading: '流量站动作',
        paragraphs: [
          '维护 sitemap index、llms.txt，重要更新走 IndexNow；正文答案前置并保持实体一致。',
        ],
      },
    ],
  }),
  insight({
    slug: 'geo-question-set-design',
    category: '方法',
    title: '如何设计一套不会「换题刷分」的 GEO 问题集',
    description: '问题集是监测的基准输入。本文给出分层、锁定与迭代规则。',
    keywords: ['GEO问题集', '提示词采样', '可见性监测'],
    sections: [
      {
        heading: '分层结构',
        paragraphs: [
          '认知题、对比题、场景题、风险题分层；每层数量固定。调整时记录版本号，旧版本归档不再与新版混比。',
        ],
      },
    ],
  }),
  insight({
    slug: 'competitor-geo-analysis',
    category: '实战',
    title: 'GEO 竞品分析怎么做才可比',
    description: '同题、同引擎、同周期对比竞品占位，找出独有机会问题与引用结构差。',
    keywords: ['GEO竞品', 'AI竞品分析', '提及率对比'],
    sections: [
      {
        heading: '可比的前提',
        paragraphs: [
          '竞品应是用户决策时会同时提到的对象。财务对标对象不一定是 AI 答案里的对手。',
        ],
      },
      {
        heading: '输出物',
        paragraphs: [
          '差距最大的 10 题、竞品独有引用源类型、你方未出现的引擎列表——这三样直接进内容排期。',
        ],
      },
    ],
  }),
  insight({
    slug: 'geo-for-ecommerce',
    category: '行业',
    title: '电商品牌做 GEO：购物决策问题攻略',
    description: '围绕「买什么」类问题，说明参数页、测评沉淀与口碑纠偏的优先级。',
    keywords: ['电商GEO', '购物AI搜索', '电商品牌可见性'],
    sections: [
      {
        heading: '详情页不够',
        paragraphs: [
          'AI 更常引用可公开检索的测评与对比。把平台测评沉淀为可索引页，并结构化参数与适用人群。',
        ],
      },
    ],
  }),
  insight({
    slug: 'geo-for-b2b-saas',
    category: '行业',
    title: 'B2B SaaS 的 GEO：方案对比题怎么赢',
    description: '选型与替代问题需要案例指标、实施周期与风险说明，而不是功能清单堆砌。',
    keywords: ['B2B GEO', 'SaaS GEO', '方案对比'],
    sections: [
      {
        heading: '事实字段清单',
        paragraphs: [
          '适用规模、部署周期、集成方式、安全合规、可验证结果。用表格呈现，并在案例中引用真实指标（经客户授权）。',
        ],
      },
    ],
  }),
  insight({
    slug: 'build-citation-moat',
    category: '实战',
    title: '搭建引用护城河：第三方证据组合拳',
    description: '如何组合测评、媒体、白皮书与社区高质量回答，形成可持续的引用结构。',
    keywords: ['引用护城河', '第三方证据', 'GEO引用'],
    sections: [
      {
        heading: '不要押单一信源',
        paragraphs: [
          '单一官网或单一媒体被算法调整时风险高。按问题类型配置 2–3 类证据，并追踪进入引用池的比例。',
        ],
      },
    ],
  }),
  insight({
    slug: 'geo-kpi-for-executives',
    category: '指南',
    title: '给管理层的 GEO KPI：哪些数能上会',
    description: '避免用无法复核的「AI 排名」汇报。推荐可审计的基线、趋势与证据包。',
    keywords: ['GEO KPI', '管理层汇报', 'AI可见性指标'],
    sections: [
      {
        heading: '可上会的最小集合',
        paragraphs: [
          '高意图题提及率、平均推荐位、引擎未覆盖数、有效第三方引用占比、P0 关闭率。每项附采样周期与问题集版本。',
        ],
      },
    ],
  }),
  insight({
    slug: 'fix-ai-brand-misstatements',
    category: '技术',
    title: '如何纠正 AI 对品牌的错误描述',
    description: '误述常见来源与纠偏动作：事实页、别名、权威 sameAs 与复测闭环。',
    keywords: ['AI误述', '品牌纠偏', '实体一致性'],
    sections: [
      {
        heading: '纠偏顺序',
        paragraphs: [
          '先统一实体与别名，再发可验证事实页，再争取第三方转述；最后用口碑/描述监测确认误述下降。',
        ],
      },
    ],
  }),
  insight({
    slug: 'from-diagnose-to-monitor',
    category: '方法',
    title: '从免费诊断到持续监测：升级路径',
    description: '说明公开轻诊断与控制台持续监测的分工，以及登录回跳后如何锁定问题集。',
    keywords: ['GEO诊断', '持续监测', 'GEO工作流'],
    sections: [
      {
        heading: '分工',
        paragraphs: [
          '流量站诊断建立直觉与优先级；工作台保存品牌、固定问题集并周更。不要在两个系统维护两套口径。',
        ],
      },
    ],
  }),
  insight({
    slug: 'llms-txt-and-geo',
    category: '技术',
    title: 'llms.txt 对 GEO 有用吗？怎么写',
    description: '解释 llms.txt 的定位：帮助 AI 系统快速找到权威页，不能替代可引用正文。',
    keywords: ['llms.txt', 'GEO技术', 'AI爬虫'],
    sections: [
      {
        heading: '写什么',
        paragraphs: [
          '一句话产品定义、核心 URL、可引用事实、联系方式。避免堆砌营销口号与无法验证的第一名宣称。',
        ],
      },
    ],
  }),
  insight({
    slug: 'geo-content-calendar',
    category: '实战',
    title: 'GEO 内容日历：按引用缺口排期',
    description: '用缺口类型驱动周更：对比页、案例、测评、FAQ，并预留复测窗口。',
    keywords: ['GEO内容日历', '内容排期', '引用缺口'],
    sections: [
      {
        heading: '周节奏示例',
        paragraphs: [
          '周一看缺口看板；周二三写 brief 与初稿；周四发布；隔周同一问题集复测。产量服从缺口，而不是服从灵感。',
        ],
      },
    ],
  }),
]
