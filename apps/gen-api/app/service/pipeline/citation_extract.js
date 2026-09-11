'use strict';
/**
 * 流水线C：引用源归一化
 * 读 raw_answers.cited_urls → upsert cited_articles/canonical_sources → 写 citation_edges
 * 自有归因：canonical_url 命中本品牌 publish_orders.published_url → citation_edges.is_own=true
 */
const { Service } = require('egg');

/**
 * 域名 → 信源站点主名映射（域名小写、去 www；含精确域名优先于注册域）
 * 覆盖：SEED_MEDIA 渠道库站点 + AI 回答里常见的中文信源 + 家具/采购行业常见 B2B/招标站点
 */
const DOMAIN_SOURCE_MAP = {
  // 视频 / 社交 / UGC
  'douyin.com': { name: '抖音', category: '视频' },
  'bilibili.com': { name: 'B站', category: '视频' },
  'xiaohongshu.com': { name: '小红书', category: '社交' },
  'weibo.com': { name: '微博', category: '社交' },
  'zhihu.com': { name: '知乎', category: '问答社区' },
  'zhuanlan.zhihu.com': { name: '知乎专栏', category: '问答社区' },
  'douban.com': { name: '豆瓣', category: '社交' },
  'dianping.com': { name: '大众点评', category: '生活' },
  // 自媒体 / 资讯 / 门户
  'mp.weixin.qq.com': { name: '微信公众号', category: '自媒体' },
  'weixin.qq.com': { name: '微信公众号', category: '自媒体' },
  'baijiahao.baidu.com': { name: '百家号', category: '自媒体' },
  'toutiao.com': { name: '今日头条', category: '自媒体' },
  'csdn.net': { name: 'CSDN', category: '技术' },
  'sspai.com': { name: '少数派', category: '自媒体' },
  'sohu.com': { name: '搜狐', category: '新闻门户' },
  '163.com': { name: '网易', category: '新闻门户' },
  'qq.com': { name: '腾讯新闻', category: '新闻门户' },
  '36kr.com': { name: '36氪', category: '新闻门户' },
  'huxiu.com': { name: '虎嗅', category: '新闻门户' },
  'tmtpost.com': { name: '钛媒体', category: '新闻门户' },
  'geekpark.net': { name: '极客公园', category: '新闻门户' },
  'thepaper.cn': { name: '澎湃新闻', category: '官方网媒' },
  'xinhuanet.com': { name: '新华网', category: '官方网媒' },
  'people.com.cn': { name: '人民网', category: '官方网媒' },
  'chinanews.com': { name: '中国新闻网', category: '官方网媒' },
  'chinanews.com.cn': { name: '中国新闻网', category: '官方网媒' },
  // 搜索 / 百科 / 问答
  'baidu.com': { name: '百度', category: '搜索引擎' },
  'baike.baidu.com': { name: '百度百科', category: '百科' },
  'zhidao.baidu.com': { name: '百度知道', category: '问答' },
  'wikipedia.org': { name: '维基百科', category: '百科' },
  // 企业信息
  'tianyancha.com': { name: '天眼查', category: '企业服务' },
  'qcc.com': { name: '企查查', category: '企业服务' },
  // B2B / 电商 / 采购 / 招标（家具与工业品行业常见引用源）
  '1688.com': { name: '1688', category: '电商' },
  'ccgp.gov.cn': { name: '中国政府采购网', category: '招标采购' },
  'chinabidding.cn': { name: '中国采购与招标网', category: '招标采购' },
  'made-in-china.com': { name: '中国制造网', category: 'B2B' },
  'b2b168.com': { name: '八方资源网', category: 'B2B' },
  '11467.com': { name: '顺企网', category: 'B2B' },
  'dzwww.com': { name: '大众网', category: '新闻门户' },
  'qianzhan.com': { name: '前瞻网', category: '门户' },
  'china.cn': { name: '中国网', category: '新闻门户' },
  'ebdoor.com': { name: '企业库', category: 'B2B' },
  'hc360.com': { name: '慧聪网', category: 'B2B' },
};

class CitationExtractService extends Service {
  /** 归一 URL：去 utm/跟踪参数、去锚点、去尾斜杠、host 小写 */
  normalizeUrl(raw) {
    try {
      const u = new URL(String(raw || '').trim());
      u.hash = '';
      for (const k of [...u.searchParams.keys()]) {
        if (/^(utm_|spm$|from$|source$|share_|scene$|channel$|click_id$|_ga$)/i.test(k)) u.searchParams.delete(k);
      }
      u.hostname = u.hostname.toLowerCase();
      u.pathname = u.pathname.replace(/\/+$/, '') || '/';
      return u.toString();
    } catch {
      return String(raw || '').trim();
    }
  }

  /** 域名 → 站点主名/类目：精确域名命中 → 注册域命中 → 兜底用注册域名 */
  normalizeSource(canonicalUrl) {
    let domain = '';
    try { domain = new URL(String(canonicalUrl || '')).hostname.toLowerCase().replace(/^www\./, ''); } catch { /* ignore */ }
    if (!domain) return { name: String(canonicalUrl || '').slice(0, 60) || '未知信源', category: '未分类', domains: [] };
    if (DOMAIN_SOURCE_MAP[domain]) {
      const m = DOMAIN_SOURCE_MAP[domain];
      return { name: m.name, category: m.category, domains: [domain] };
    }
    const parts = domain.split('.');
    const root = parts.length > 2 ? parts.slice(-2).join('.') : domain;
    if (DOMAIN_SOURCE_MAP[root]) {
      const m = DOMAIN_SOURCE_MAP[root];
      return { name: m.name, category: m.category, domains: [domain] };
    }
    return { name: root, category: '未分类', domains: [domain] };
  }

  async run(answer) {
    const { ctx } = this;
    // 自有归因基准：本品牌 ok 发稿的收录链接（归一后）
    const mine = new Set(
      (await ctx.model.PublishOrder.find({ brand_id: answer.brand_id, status: 'ok' }).lean())
        .map(o => this.normalizeUrl(o.published_url))
        .filter(Boolean)
    );
    for (const c of answer.cited_urls || []) {
      const canon = this.normalizeUrl(c.url);
      const srcMeta = this.normalizeSource(canon);
      const source = await ctx.model.CanonicalSource.findOneAndUpdate(
        { canonical_source: srcMeta.name },
        {
          $setOnInsert: { source_id: ctx.helper.uuid(), category: srcMeta.category, first_cited_at: answer.date },
          $addToSet: { domains: { $each: srcMeta.domains } },
          $set: { last_cited_at: answer.date },
        },
        { upsert: true, new: true }
      );
      const article = await ctx.model.CitedArticle.findOneAndUpdate(
        { canonical_url: canon },
        {
          $setOnInsert: { article_id: ctx.helper.uuid(), url: c.url, title: c.title, source_id: source.source_id, first_cited_at: answer.date },
          $set: { last_cited_at: answer.date, is_brand_published: mine.has(canon) },
        },
        { upsert: true, new: true }
      );
      await ctx.model.CitationEdge.create({
        slot_id: answer.slot_id, date: answer.date, brand_id: answer.brand_id,
        query_id: answer.query_id, query_type: answer.query_type, platform: answer.platform,
        article_id: article.article_id, source_id: source.source_id,
        is_own: mine.has(canon), mentioned_entity: null,
      });
    }
  }
}
module.exports = CitationExtractService;
