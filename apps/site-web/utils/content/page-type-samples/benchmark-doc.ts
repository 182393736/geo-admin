/** PT11 方法文档 */
export const SAMPLE_BENCHMARK_DOC = {
  intent: 'informational' as const,
  eyebrow: '方法',
  title: 'AI 引擎覆盖与采样方法',
  answerBox:
    '引擎名单优先覆盖真实决策入口并保持稳定；问题集与命中规则变更必须升版本；只读采样并保留证据。综合分只作总览，排期以分引擎、分意图为准。',
  lead:
    '本页与公开方法报告、控制台监测口径对齐，回答「你们怎么测」，便于客户与代理用同一语言讨论 GEO。',
  primarySources: [
    {
      label: 'Google · AI 功能与网站',
      href: 'https://developers.google.com/search/docs/appearance/ai-features',
      note: '可抓取与高质量内容仍是基础。',
    },
    {
      label: '本站 Q3 方法报告',
      href: '/reports/ai-visibility-baseline-2026-q3',
      note: '同一套版本与证据字段。',
    },
  ],
  principles: [
    '优先真实决策入口，而非监控数量最大化',
    '名单与题集稳定才可比；变更升版本并写 changelog',
    '只读；保留原始回答与引用列表',
    '固定地域语言；记录窗口聚合方式',
    '分引擎、分意图解读；综合分不作唯一 KPI',
    '对外区分方法结论与客户授权结果',
  ],
  catalog: [
    { name: 'DeepSeek', note: 'B2B/方案向常见；建议单列高意图子集。' },
    { name: '豆包', note: '消费与工具决策常见；注意对比/种草问法。' },
    { name: '通义千问', note: '关注引用结构与企业知识场景。' },
    { name: '元宝', note: '按真实使用决定是否入核心名单；纳入后保持稳定。' },
    { name: 'Kimi', note: '长文场景可作对照引擎。' },
  ],
  citeHow:
    '引用引擎名单时必须同时写 questionSetVersion 与 samplingPeriod，并标注 dateModified。',
  changePolicy:
    '增减引擎、改题集、改命中或位次口径 → 升版本 → changelog → 更新 dateModified → 新旧窗口分开展示。禁止同版本静默改口径。',
  sections: [
    {
      heading: '采样流程（摘要）',
      steps: [
        { title: '锁定输入', body: '实体别名、题集版本、引擎名单、地域语言、窗口。' },
        { title: '只读执行', body: '记录失败/空答；保存原文与引用。' },
        { title: '计算与披露', body: '分引擎输出提及、位次、未出现、引用类型。' },
        { title: '解读与动作', body: '高意图缺口映射 URL；禁用「单次最好结果」对外宣传。' },
      ],
    },
  ],
  faq: [
    { q: '为什么不监控所有引擎？', a: '先覆盖决策入口；名单过长且频繁变更会牺牲可比性。' },
    { q: '海外引擎？', a: '真实路径出现后再纳入，并单独版本化。' },
    { q: '和 IndexNow？', a: '收录利于被发现；采样口径本身不依赖 IndexNow。' },
    { q: '客户自定义名单？', a: '可以，但须自有版本号，且不可与公开默认名单直接混比。' },
  ],
}
