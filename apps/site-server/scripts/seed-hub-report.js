'use strict';

/**
 * 旗舰站 pageKind 种子：季度报告模板（CMS 可覆盖静态）
 * 用法：cd apps/server && node scripts/seed-hub-report.js
 */
const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/site_manage';
const FLAGSHIP_DOMAIN = process.env.FLAGSHIP_DOMAIN || 'www.hanyuai.com';

const hubContent = {
  slug: 'ai-visibility-baseline-2026-q3',
  title: '中国 AI 搜索可见性基线观察（2026 Q3）',
  description:
    '首份可引用季度方法报告：公开问题集版本、引擎名单、采样周期与脱敏证据样例。不含未授权精确排名分数。',
  datePublished: '2026-09-20',
  dateModified: '2026-09-20',
  method:
    '按行业模板抽取固定问题集；对列入引擎名单的入口做只读提问；记录提及、推荐位、引用源类型；保留证据包。',
  engines: [ 'DeepSeek', '豆包', '通义千问', '元宝', 'Kimi' ],
  samplingPeriod: {
    start: '2026-09-01',
    end: '2026-09-15',
    cadence: '双周（本报告为窗口内聚合）',
  },
  questionSetVersion: 'geo-qset-cn-core-v1',
  sampleSize: { prompts: 120, answers: 600, brands: 0 },
  authors: [ 'HANYUAI Research' ],
  limitations: [
    '本报告以方法与结构观察为主',
    '不跨品类直接比较提及率绝对值',
    '不展示未获授权的精确分数',
  ],
  metricsDefinitions: [
    { name: '品牌提及率', definition: '固定问题集下品牌出现次数占比' },
    { name: '平均推荐位', definition: '进入推荐列表时的平均位置' },
  ],
  evidenceSamples: [
    {
      id: 'ev-seed-1',
      engine: 'DeepSeek',
      question: '中小团队做 GEO 应该先看哪些指标？',
      excerpt: '……应同时观察提及率、推荐位与引用源……',
      citationTypes: [ '方法说明' ],
      sampledAt: '2026-09-08',
      note: '种子证据，可在后台替换',
    },
  ],
  sections: [
    {
      heading: '本报告回答什么问题？',
      paragraphs: [
        '如何用可复核的方法读 GEO 基线，而不是发布无法审计的排行榜。',
      ],
    },
  ],
  faq: [
    {
      q: '如何引用本报告？',
      a: '注明标题、questionSetVersion、engines、samplingPeriod 与 dateModified。',
    },
  ],
};

async function main() {
  await mongoose.connect(MONGODB_URL);
  const Site = mongoose.connection.collection('sites');
  const Page = mongoose.connection.collection('pages');
  const now = new Date();

  let site = await Site.findOne({ domain: FLAGSHIP_DOMAIN });
  if (!site) {
    const inserted = await Site.insertOne({
      name: 'HANYUAI GEO 旗舰站',
      domain: FLAGSHIP_DOMAIN,
      aliases: [ 'hanyuai.com', 'localhost' ],
      status: 'active',
      meta: {
        title: 'HANYUAI GEO',
        description: 'GEO 行业获客与权威站',
      },
      createdAt: now,
      updatedAt: now,
    });
    site = { _id: inserted.insertedId };
    console.log('Created flagship site:', FLAGSHIP_DOMAIN);
  }

  const path = '/reports/ai-visibility-baseline-2026-q3';
  await Page.updateOne(
    { siteId: site._id, path },
    {
      $set: {
        siteId: site._id,
        path,
        title: hubContent.title,
        parentId: null,
        sort: 10,
        visible: true,
        template: 'default',
        pageKind: 'report',
        hubContent,
        status: 'published',
        blocks: [],
        qa: (hubContent.faq || []).map((item, i) => ({
          id: `qa-${i + 1}`,
          question: item.q,
          answer: item.a,
        })),
        howto: [],
        steps: [],
        seo: {
          title: hubContent.title,
          description: hubContent.description,
          keywords: 'GEO报告,AI搜索可见性,季度报告',
        },
        start: {
          schemaType: 'Article',
          name: hubContent.title,
          headline: hubContent.title,
          description: hubContent.description,
          datePublished: hubContent.datePublished,
          dateModified: hubContent.dateModified,
          inLanguage: 'zh-CN',
          keywords: 'GEO,生成式引擎优化',
        },
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );

  console.log('Seed hub report OK:', FLAGSHIP_DOMAIN, path, 'pageKind=report');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
