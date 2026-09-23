'use strict';

/**
 * 本地开发种子：localhost 域名 + 首页(home) + 栏目页(hub=/learn)
 * 用法：cd apps/server && node scripts/seed-cms-localhost.js
 */
const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/site_manage';
const DOMAIN = process.env.CMS_DOMAIN || 'localhost';

const homeHubContent = {
  version: 1,
  hero: {
    eyebrow: 'GEO 优化 · AI 搜索可见性',
    badge: 'CMS',
    title: 'GEO优化工具：让品牌被',
    titleAccent: 'AI 看见',
    description:
      'HANYUAI GEO 面向品牌与增长团队，监测豆包、DeepSeek、通义、元宝、Kimi 等 AI 搜索中的品牌提及率、推荐位与引用源，并把 GEO（生成式引擎优化）问题变成可执行、可复测的路线图。免费诊断只读访问，约 3 分钟出基线。',
    primaryCta: { label: '免费跑一次诊断', to: '/diagnose' },
    secondaryCta: { label: '先看什么是 GEO', to: '/learn/what-is-geo' },
    formPlaceholder: '例如 HANYUAI 或 https://example.com',
    helper: '可输入品牌名称或官网 · 无需登录 · 3 分钟出结果 · 只读访问',
    quickTries: [ '小鹏汽车', '完美日记', 'B2B 软件' ],
  },
  sections: [
    {
      id: 'stats',
      enabled: true,
      layout: 'stats',
      eyebrow: '一套基线，持续回答增长问题',
      items: [
        { value: '8', label: '主流 AI 引擎覆盖' },
        { value: '42', label: '行业问题模板' },
        { value: '126', label: 'GEO 信号检查' },
        { value: '1', label: '从诊断到执行的路线图' },
      ],
    },
    {
      id: 'workflow',
      enabled: true,
      layout: 'steps',
      eyebrow: '从发现问题，到验证结果',
      title: 'GEO 工作流：不只告诉你哪里不对，还告诉你先改什么',
      description: '把分散指标串成数据驱动闭环。每一步给出证据、优先级和下一步动作，让生成式引擎优化可执行、可复盘。',
      items: [
        { badge: 'Visibility', title: '中立监测', description: '模拟真实用户问题，记录不同 AI 引擎如何提及、推荐和描述你的品牌。' },
        { badge: 'Understand', title: 'AI 理解体检', description: '检查品牌实体、产品事实、场景证据与可提取性，排除影响理解与推荐的内容障碍。' },
        { badge: 'Prioritize', title: '机会排序', description: '把问题按影响、难度和证据强度排序，形成团队可以直接执行的清单。' },
        { badge: 'Action', title: '内容行动', description: '生成问题集、内容 brief 和引用源建议，并持续监测每一次改动是否有效。' },
      ],
    },
    {
      id: 'capabilities',
      enabled: true,
      layout: 'cards',
      eyebrow: '一个底座，两个增长面',
      title: 'GEO 优化做什么：把品牌在 AI 搜索中的表现放进一张增长地图',
      description: 'GEO 回答三件事：AI 会不会推荐我、为什么推荐别人、引用了谁。可见性监测、理解体检与内容引用优化统一成可对比、可追踪的指标。',
      items: [
        {
          kicker: 'GEO / AI Visibility',
          title: 'AI 可见性监测',
          description: '追踪品牌在豆包、DeepSeek、通义、元宝等引擎中的出现率、推荐位、描述倾向和引用来源。',
          to: '/tools/visibility',
          points: [ '问题集可按行业自定义', '保留原始回答与引用证据', '按品牌、竞品、引擎交叉分析' ],
        },
        {
          kicker: 'GEO / Understanding',
          title: 'AI 理解度体检',
          description: '从品牌实体到产品事实，检查场景证据和内容可提取性，识别影响 AI 理解与引用的障碍。',
          to: '/tools/brand',
          points: [ '126 项 GEO 信号检查', '问题按影响和引用机会排序', '输出团队可执行的优化建议' ],
        },
        {
          kicker: 'Content / Citation',
          title: '内容与引用优化',
          description: '发现 AI 真实引用的信源、竞品占位的内容和用户高频问题，生成可交付的内容 brief。',
          to: '/tools/citation',
          points: [ '引用源类型与缺口分析', '问题意图和答案结构建议', '发布后可回流验证效果' ],
        },
      ],
    },
    {
      id: 'tools',
      enabled: true,
      layout: 'cards',
      eyebrow: '四个工具，覆盖一个完整循环',
      title: '从一次 GEO 诊断，到持续 AI 搜索优化',
      description: '先用免费诊断看清问题，再用工作台把监测、修复、写作和复盘串在一起。',
      items: [
        { badge: '01', title: 'AI 可见性检测', description: '输入品牌和问题集，查看不同引擎是否提及、如何排序、引用了谁。', to: '/diagnose', points: [ '品牌提及率', '推荐位', '描述词' ] },
        { badge: '02', title: 'AI 理解度扫描', description: '扫描公开内容，定位影响 AI 理解、引用和推荐的问题。', to: '/diagnose', points: [ '品牌实体', '产品事实', '可引用性' ] },
        { badge: '03', title: '问题集生成', description: '根据行业、产品和决策链路，生成可持续监测的问题集。', to: '/learn/content-brief', points: [ '购买前问题', '对比型问题', '场景长尾' ] },
        { badge: '04', title: '方法报告', description: '用可复核的方法读基线：引擎、题集版本、采样窗口与证据样例。', to: '/reports/ai-visibility-baseline-2026-q3', points: [ '方法公开', '证据可引用', '不含无法审计的总分' ] },
      ],
    },
    {
      id: 'insights',
      enabled: true,
      layout: 'links',
      eyebrow: '方法论与实战',
      title: '先理解 AI 如何选答案，再决定写什么',
      description: '把 AI 搜索拆成可执行方法。下列入口都是可编辑的样例页，复制后改词即可。',
      items: [
        { badge: '学习', title: '什么是 GEO', description: '工作定义、与 SEO 的边界、可复核指标与四步起步。', to: '/learn/what-is-geo' },
        { badge: '对比', title: 'GEO vs SEO', description: '入口、成功单位、内容形态与验证方式对照。', to: '/compare/geo-vs-seo' },
        { badge: '术语', title: '品牌提及率', description: '公式、分母、未出现率，以及为什么不能跨品类比绝对值。', to: '/glossary/mention-rate' },
        { badge: '实战', title: 'DeepSeek 检查清单', description: '先锁高意图题，再补可抽取事实，用同题集复测。', to: '/insights/deepseek-geo-checklist' },
        { badge: '方案', title: 'B2B SaaS 怎么做 GEO', description: '选型题密集场景下的 90 天节奏。', to: '/solutions/b2b-saas' },
        { badge: '报告', title: '2026 Q3 基线观察', description: '公开方法、引擎名单与脱敏证据样例。', to: '/reports/ai-visibility-baseline-2026-q3' },
      ],
    },
  ],
  faq: [
    { q: 'GEO 是什么？', a: '生成式引擎优化：提高品牌在 AI 答案中被提及、被正确描述、被引用为信源的概率，并用固定问题集验证。它建立在 SEO 之上，不互相替代。' },
    { q: '和 SEO 有什么区别？', a: 'SEO 看结果页排名与点击；GEO 看答案中的提及、推荐位和引用。可抓取、权威和清晰结构两边共用。' },
    { q: '免费诊断会改我的网站吗？', a: '不会。只读采样，不改代码、不索取服务器凭据。约 3 分钟给出基线。' },
    { q: '先看哪些指标？', a: '分引擎提及率、平均推荐位、未出现的高意图题、引用源类型。不要只用一个综合分。' },
    { q: '覆盖哪些引擎？', a: '样例口径包含豆包、DeepSeek、通义、元宝、Kimi 等。实际上线以你配置的引擎名单为准。' },
    { q: '内容写多长才有用？', a: '长度不是目标。答案前置、事实表、对比维度和可核对 FAQ 比堆字更利于被引用。' },
    { q: '多久复测一次？', a: '内容或信源有实质变更后，用同一问题集版本复测。常规观察可用双周窗口。' },
    { q: '完整监测在哪里做？', a: '本站负责获客、教育和免费诊断入口；持续监测、竞品与发稿在产品工作台完成。' },
  ],
  cta: {
    title: '你的品牌，今天在 AI 答案里排第几？',
    description: '输入官网或品牌名，免费获取 GEO 快速诊断。看见可见性与引用缺口，才知道预算该放在哪里。',
    button: { label: '免费开始诊断', to: '/diagnose' },
  },
};

const learnHubContent = {
  version: 1,
  eyebrow: '学习中心',
  title: 'GEO 学习中心（CMS）',
  description:
    '本栏目页由后台 pageKind=hub 配置。可改标题、卡片列表、正文区块与 FAQ；后续其它栏目复用同一结构。',
  diagnoseCta: true,
  sections: [
    {
      heading: '本页回答什么？',
      paragraphs: [
        '栏目页是入口：聚合子文、术语与产品，而不是单篇长文。',
        '改 cards 即可调整入口卡片；改 sections 补充栏目说明。',
      ],
    },
  ],
  cards: [
    {
      title: '什么是 GEO',
      description: '生成式引擎优化的定义与边界（示例卡片，可改 to）。',
      to: '/learn/what-is-geo',
    },
    {
      title: 'GEO 指标',
      description: '提及率、推荐位、引用源等核心指标。',
      to: '/learn/geo-metrics',
    },
    {
      title: '术语表',
      description: '权威释义入口。',
      to: '/glossary',
    },
  ],
  faq: [
    {
      q: '栏目页和详情页有什么区别？',
      a: '栏目页用 pageKind=hub；详情页后续用 learn/report 等专用 kind。',
    },
  ],
  relatedLinks: [
    { label: '工具总览', to: '/tools' },
    { label: '免费诊断', to: '/diagnose' },
  ],
};

async function upsertPage(Page, siteId, doc) {
  const now = new Date();
  await Page.updateOne(
    { siteId, path: doc.path },
    {
      $set: {
        ...doc,
        siteId,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
}

async function main() {
  await mongoose.connect(MONGODB_URL);
  const Site = mongoose.connection.collection('sites');
  const Page = mongoose.connection.collection('pages');
  const now = new Date();

  let site = await Site.findOne({ domain: DOMAIN });
  if (!site) {
    const inserted = await Site.insertOne({
      name: '本地 GEO 站',
      domain: DOMAIN,
      aliases: [ '127.0.0.1' ],
      status: 'active',
      enabled: true,
      meta: {
        title: 'HANYUAI GEO',
        description: '本地 CMS 驱动的 GEO 流量站',
      },
      brandZh: 'HANYUAI GEO',
      brandEn: 'HANYUAI GEO',
      createdAt: now,
      updatedAt: now,
    });
    site = { _id: inserted.insertedId };
    console.log('Created site:', DOMAIN);
  } else {
    await Site.updateOne(
      { _id: site._id },
      {
        $set: {
          name: '本地 GEO 站',
          aliases: [ '127.0.0.1' ],
          status: 'active',
          enabled: true,
          updatedAt: now,
        },
      }
    );
    console.log('Updated site:', DOMAIN);
  }

  const siteId = site._id;

  await upsertPage(Page, siteId, {
    path: '/',
    title: '首页',
    parentId: null,
    sort: 0,
    visible: true,
    template: 'geo-home',
    pageKind: 'home',
    hubContent: homeHubContent,
    status: 'published',
    blocks: [],
    qa: homeHubContent.faq.map((item, i) => ({
      id: `qa-home-${i + 1}`,
      question: item.q,
      answer: item.a,
    })),
    howto: [],
    steps: [],
    seo: {
      title: 'HANYUAI GEO｜GEO 优化与 AI 搜索可见性',
      description: homeHubContent.hero.description,
      keywords: 'GEO,生成式引擎优化,AI搜索',
    },
    start: {
      schemaType: 'WebPage',
      name: 'HANYUAI GEO',
      headline: homeHubContent.hero.title + (homeHubContent.hero.titleAccent || ''),
      description: homeHubContent.hero.description,
      inLanguage: 'zh-CN',
    },
  });

  await upsertPage(Page, siteId, {
    path: '/learn',
    title: '学习中心',
    parentId: null,
    sort: 10,
    visible: true,
    template: 'geo-hub',
    pageKind: 'hub',
    hubContent: learnHubContent,
    status: 'published',
    blocks: [],
    qa: learnHubContent.faq.map((item, i) => ({
      id: `qa-learn-${i + 1}`,
      question: item.q,
      answer: item.a,
    })),
    howto: [],
    steps: [],
    seo: {
      title: learnHubContent.title,
      description: learnHubContent.description,
      keywords: 'GEO学习,生成式引擎优化',
    },
    start: {
      schemaType: 'CollectionPage',
      name: learnHubContent.title,
      description: learnHubContent.description,
      inLanguage: 'zh-CN',
    },
  });

  console.log('Seed CMS localhost OK');
  console.log('  GET /api/ssr/page?domain=localhost&path=/');
  console.log('  GET /api/ssr/page?domain=localhost&path=/learn');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
