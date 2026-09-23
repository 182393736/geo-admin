/** PT09 工具壳 — 短文案 + FixedSlot；个性化结果宜 noindex */
export const SAMPLE_TOOL_SHELL = {
  intent: 'commercial' as const,
  eyebrow: '免费工具',
  title: '免费 GEO 诊断',
  lead:
    '输入品牌或官网，约 3 分钟拿到可见性基线关注点。公开页给方向；完整多引擎证据与持续监测需登录。只读，不改网站。',
  howItWorks: [
    '输入品牌名或官网',
    '只读理解公开信息，按模板提示关注点',
    '给出公开摘要与下一步方向',
    '登录后查看完整采样并开启监测',
  ],
  whatYouGet: {
    public: ['基线关注点', '高意图方向提示', '升级路径'],
    loggedIn: ['多引擎证据', '问题集保存', '持续监测与导出'],
  },
  privacy:
    '不索取服务器凭据、不改站。含个性化完整结果的页面建议 noindex，勿把私有诊断当泛化内容收录。',
  fixedSlotNote:
    '下方为 FixedSlot：行为由 /diagnose 与 API 决定；CMS 只改文案区。',
  faq: [
    { q: '要多久？', a: '约 3 分钟量级，视上游 API。' },
    { q: '会改网站吗？', a: '不会。' },
    { q: '为什么要登录？', a: '完整采样与监测属控制台履约。' },
    { q: '能当广告「第一名」素材吗？', a: '不建议。对外引用请用公开方法报告的口径。' },
  ],
}
