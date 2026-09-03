export const engines = [
  { key: 'doubao', label: '豆包', color: '#165dff' },
  { key: 'deepseek', label: 'DeepSeek', color: '#722ed1' },
  { key: 'wenxin', label: '文心一言', color: '#00b42a', locked: false },
  { key: 'qianwen', label: '通义千问', color: '#eb2f96', locked: false },
  { key: 'yuanbao', label: '元宝', color: '#f53f3f' },
];

export const metrics = {
  visibility: { value: 62.5, delta: 3.2, trend: 'up' },
  sentiment: { value: 0.68, delta: 0.05, trend: 'up' },
  relevance: { value: 0.85, delta: -0.02, trend: 'down' },
  overall: { value: 1.12, level: 'good' },
};

export const trendData = {
  visibility: [45, 48, 52, 49, 55, 58, 62.5],
  sentiment: [0.52, 0.55, 0.58, 0.62, 0.65, 0.66, 0.68],
  labels: ['08-20', '08-21', '08-22', '08-23', '08-24', '08-25', '08-26'],
};

export const aiSentiment = {
  distribution: [
    { value: 45, name: '正面', color: '#00b42a' },
    { value: 35, name: '中性', color: '#86909c' },
    { value: 20, name: '负面', color: '#f53f3f' },
  ],
};

export const brandMentions = [
  { engine: 'doubao', mentioned: true, position: 1, sentiment: 'positive' },
  { engine: 'deepseek', mentioned: true, position: 3, sentiment: 'neutral' },
  { engine: 'yuanbao', mentioned: false, position: 0, sentiment: 'neutral' },
];

export const competitors = [
  { id: 'c1', name: '美图云', mentionRate: 0.35, top3Rate: 0.18, firstRate: 0.05 },
  { id: 'c2', name: '可灵AI', mentionRate: 0.28, top3Rate: 0.12, firstRate: 0.03 },
  { id: 'c3', name: '即梦AI', mentionRate: 0.22, top3Rate: 0.08, firstRate: 0.02 },
  { id: 'c4', name: 'Runway', mentionRate: 0.15, top3Rate: 0.05, firstRate: 0.01 },
];

export const monitorQuestions = [
  { id: 'q1', type: '排名词', content: '采购礼堂椅厂家推荐', group: '未分组', date: '2026/07/30', status: '监控中' },
  { id: 'q2', type: '排名词', content: '课桌椅采购厂家推荐', group: '未分组', date: '2026/07/30', status: '监控中' },
  { id: 'q3', type: '排名词', content: '影院椅采购厂家推荐', group: '未分组', date: '2026/07/30', status: '监控中' },
  { id: 'q4', type: '排名词', content: '阶梯排椅采购厂家推荐', group: '未分组', date: '2026/07/30', status: '监控中' },
  { id: 'q5', type: '排名词', content: '采购会议室座椅厂家推荐', group: '未分组', date: '2026/07/30', status: '监控中' },
  { id: 'q6', type: '排名词', content: '采购学生课桌椅厂家推荐', group: '未分组', date: '2026/07/30', status: '监控中' },
  { id: 'q7', type: '排名词', content: '连排椅采购厂家推荐', group: '未分组', date: '2026/07/30', status: '监控中' },
];

// 监控识别管理
export const recognitionData = {
  brandName: '佛山市宏祥家具实业有限公司',
  remainingEdits: 3,
  aliases: ['宏祥盛誉', '宏祥家具'],
  industry: '公共家具制造',
  websiteProtocol: 'https://',
  websiteUrl: '',
  brandIntro:
    '佛山市宏祥家具实业有限公司，专注于公共空间家具的研发与制造，产品覆盖教育、办公、文化娱乐等公共场景。定价策略未公开。\n\n目标客群:学校及教育机构（课桌椅）、剧院/影院/礼堂（礼堂椅、影院椅、公共座椅）、企事业单位（办公家具）。',
};

// 搜索快照下载
export const snapshotList = [
  { id: 's1', name: 'Doubao_采购礼堂椅厂家推荐_c7917415.jpg', engine: '豆包', platform: '网页端', date: '2026-08-28', rank: '未提及', size: '672.33 KB' },
  { id: 's2', name: 'Wenxin_采购礼堂椅厂家推荐_8f668a01.jpg', engine: '文心一言', platform: '网页端', date: '2026-08-28', rank: '未提及', size: '270.40 KB' },
  { id: 's3', name: 'Qwen_采购礼堂椅厂家推荐_3c2d4036.jpg', engine: '通义千问', platform: '网页端', date: '2026-08-28', rank: '未提及', size: '469.67 KB' },
  { id: 's4', name: 'Yuanbao_采购礼堂椅厂家推荐_73ba2f4b.jpg', engine: '元宝', platform: '网页端', date: '2026-08-28', rank: '10', size: '325.03 KB' },
  { id: 's5', name: 'Deepseek_采购礼堂椅厂家推荐_e07fb10c.jpg', engine: 'DeepSeek', platform: '网页端', date: '2026-08-28', rank: '2', size: '210.89 KB' },
];

export const citationSources = [
  { url: 'https://zhuanlan.zhihu.com/p/123456', domain: 'zhuanlan.zhihu.com', title: '宏祥家具深度评测', sourceType: '自媒体', authority: 85, isBrandSource: true },
  { url: 'https://www.zhihu.com/question/123456', domain: 'zhihu.com', title: '宏祥家具怎么样？', sourceType: '问答', authority: 78, isBrandSource: true },
  { url: 'https://www.36kr.com/p/123456', domain: '36kr.com', title: '课桌椅采购赛道分析', sourceType: '门户', authority: 92, isBrandSource: false },
  { url: 'https://www.sohu.com/a/123456', domain: 'sohu.com', title: '宏祥家具使用教程', sourceType: '门户', authority: 65, isBrandSource: true },
  { url: 'https://baijiahao.baidu.com/s?id=123456', domain: 'baijiahao.baidu.com', title: '课桌椅厂家推荐', sourceType: '自媒体', authority: 55, isBrandSource: false },
];

// 引用源追溯 - 信源平台列表
export const citationPlatformList = [
  { id: 1, name: '1688', articleCount: '8 篇文章', category: '电商', totalCite: 8, pct: '1.4%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 6, color: '#f59e0b' }, { name: '文心一言', count: 2, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 2, name: '抖音', articleCount: '55 篇文章', category: '视频', totalCite: 61, pct: '10.8%', authority: '--', authorityColor: 'none', models: [{ name: '豆包', count: 52, color: '#f59e0b' }, { name: '文心一言', count: 3, color: '#ec4899' }], channel: '90 积分起', channelType: 'points' },
  { id: 3, name: '知乎', articleCount: '24 篇文章', category: '问答', totalCite: 33, pct: '5.8%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 21, color: '#f59e0b' }, { name: '文心一言', count: 8, color: '#ec4899' }, { name: 'DeepSeek', count: 4, color: '#722ed1' }], channel: '未开通', channelType: 'locked' },
  { id: 4, name: '百度百家号', articleCount: '47 篇文章', category: '自媒体', totalCite: 52, pct: '9.2%', authority: '高权威', authorityColor: 'green', models: [{ name: '豆包', count: 41, color: '#f59e0b' }, { name: '文心一言', count: 11, color: '#ec4899' }], channel: '120 积分起', channelType: 'points' },
  { id: 5, name: '微信公众号', articleCount: '12 篇文章', category: '自媒体', totalCite: 15, pct: '2.7%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 10, color: '#f59e0b' }, { name: '文心一言', count: 5, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 6, name: '今日头条', articleCount: '18 篇文章', category: '自媒体', totalCite: 22, pct: '3.9%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 14, color: '#f59e0b' }, { name: '文心一言', count: 8, color: '#ec4899' }], channel: '80 积分起', channelType: 'points' },
  { id: 7, name: '搜狐', articleCount: '9 篇文章', category: '门户', totalCite: 11, pct: '1.9%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 7, color: '#f59e0b' }, { name: '文心一言', count: 4, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 8, name: '36氪', articleCount: '6 篇文章', category: '门户', totalCite: 8, pct: '1.4%', authority: '高权威', authorityColor: 'green', models: [{ name: '豆包', count: 5, color: '#f59e0b' }, { name: '文心一言', count: 3, color: '#ec4899' }], channel: '100 积分起', channelType: 'points' },
  { id: 9, name: '小红书', articleCount: '31 篇文章', category: '社交', totalCite: 42, pct: '7.4%', authority: '--', authorityColor: 'none', models: [{ name: '豆包', count: 35, color: '#f59e0b' }, { name: '文心一言', count: 7, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 10, name: '微博', articleCount: '20 篇文章', category: '社交', totalCite: 27, pct: '4.8%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 22, color: '#f59e0b' }, { name: '文心一言', count: 5, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 11, name: 'CSDN', articleCount: '4 篇文章', category: '技术', totalCite: 5, pct: '0.9%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 4, color: '#f59e0b' }, { name: '文心一言', count: 1, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 12, name: '网易', articleCount: '7 篇文章', category: '门户', totalCite: 9, pct: '1.6%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 6, color: '#f59e0b' }, { name: '文心一言', count: 3, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 13, name: '腾讯新闻', articleCount: '5 篇文章', category: '门户', totalCite: 7, pct: '1.2%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 5, color: '#f59e0b' }, { name: '文心一言', count: 2, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 14, name: 'B站', articleCount: '3 篇文章', category: '视频', totalCite: 4, pct: '0.7%', authority: '--', authorityColor: 'none', models: [{ name: '豆包', count: 3, color: '#f59e0b' }, { name: '文心一言', count: 1, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 15, name: '58同城', articleCount: '2 篇文章', category: '电商', totalCite: 3, pct: '0.5%', authority: '正常权威', authorityColor: 'blue', models: [{ name: '豆包', count: 2, color: '#f59e0b' }, { name: '文心一言', count: 1, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 16, name: '大众点评', articleCount: '1 篇文章', category: '生活', totalCite: 2, pct: '0.4%', authority: '--', authorityColor: 'none', models: [{ name: '豆包', count: 1, color: '#f59e0b' }, { name: '文心一言', count: 1, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 17, name: '天眼查', articleCount: '2 篇文章', category: '企业', totalCite: 3, pct: '0.5%', authority: '高权威', authorityColor: 'green', models: [{ name: '豆包', count: 2, color: '#f59e0b' }, { name: '文心一言', count: 1, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 18, name: '企查查', articleCount: '1 篇文章', category: '企业', totalCite: 2, pct: '0.4%', authority: '高权威', authorityColor: 'green', models: [{ name: '豆包', count: 1, color: '#f59e0b' }, { name: '文心一言', count: 1, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
  { id: 19, name: '豆瓣', articleCount: '1 篇文章', category: '社交', totalCite: 1, pct: '0.2%', authority: '--', authorityColor: 'none', models: [{ name: '豆包', count: 1, color: '#f59e0b' }], channel: '未开通', channelType: 'locked' },
  { id: 20, name: '百度百科', articleCount: '2 篇文章', category: '百科', totalCite: 3, pct: '0.5%', authority: '高权威', authorityColor: 'green', models: [{ name: '豆包', count: 2, color: '#f59e0b' }, { name: '文心一言', count: 1, color: '#ec4899' }], channel: '未开通', channelType: 'locked' },
];

// 信源平台偏好 - 指标卡片
export const sourcePrefMetrics = [
  { key: 'sources', label: '引用来源数', value: '479', iconColor: 'indigo', icon: 'heart' },
  { key: 'total', label: '总引用次数', value: '4,158', iconColor: 'amber', icon: 'chart' },
  { key: 'avg', label: '平均引用次数', value: '8.7', iconColor: 'emerald', icon: 'trending' },
];

// 信源平台偏好 - TOP10 信源平台柱状图数据
export const top10Platforms = [
  { name: '抖音', doubao: 405, wenxin: 6, deepseek: 0, qianwen: 0, yuanbao: 0 },
  { name: '百度', doubao: 0, wenxin: 242, deepseek: 76, qianwen: 5, yuanbao: 65 },
  { name: 'szbw6868.cn', doubao: 0, wenxin: 169, deepseek: 42, qianwen: 0, yuanbao: 0 },
  { name: '中国采购与招标网', doubao: 0, wenxin: 132, deepseek: 22, qianwen: 14, yuanbao: 0 },
  { name: '大众网', doubao: 5, wenxin: 97, deepseek: 15, qianwen: 55, yuanbao: 0 },
  { name: '中国政府采购网', doubao: 4, wenxin: 66, deepseek: 10, qianwen: 2, yuanbao: 0 },
  { name: '顺企网', doubao: 10, wenxin: 54, deepseek: 12, qianwen: 54, yuanbao: 0 },
  { name: '八方资源网', doubao: 13, wenxin: 38, deepseek: 29, qianwen: 0, yuanbao: 0 },
  { name: '百度百科', doubao: 0, wenxin: 28, deepseek: 0, qianwen: 14, yuanbao: 0 },
  { name: '中国制造网', doubao: 8, wenxin: 22, deepseek: 18, qianwen: 5, yuanbao: 0 },
];

// 信源平台偏好 - 平台引用占比
export const platformRatio = [
  { name: '文心一言', value: 34, color: '#ec4899' },
  { name: '豆包', value: 25, color: '#f59e0b' },
  { name: '元宝', value: 20, color: '#0ea5e9' },
  { name: 'DeepSeek', value: 13, color: '#6366f1' },
  { name: '通义千问', value: 9, color: '#9333ea' },
];

// 信源平台偏好 - 引用来源明细表格
export const sourceDetailList = Array.from({ length: 50 }, (_, i) => {
  const platforms = [
    { name: '抖音', cite: 411, articles: 260, models: [{ name: '豆包', count: 405, color: '#f59e0b' }, { name: '文心一言', count: 6, color: '#ec4899' }] },
    { name: '百度', cite: 382, articles: 169, models: [{ name: '文心一言', count: 242, color: '#ec4899' }, { name: 'DeepSeek', count: 76, color: '#6366f1' }, { name: '元宝', count: 65, color: '#0ea5e9' }, { name: '通义千问', count: 5, color: '#9333ea' }] },
    { name: 'szbw6868.cn', cite: 211, articles: 88, models: [{ name: '文心一言', count: 169, color: '#ec4899' }, { name: 'DeepSeek', count: 42, color: '#6366f1' }] },
    { name: '中国采购与招标网', cite: 168, articles: 72, models: [{ name: '文心一言', count: 132, color: '#ec4899' }, { name: 'DeepSeek', count: 22, color: '#6366f1' }, { name: '通义千问', count: 14, color: '#9333ea' }] },
    { name: '大众网', cite: 172, articles: 65, models: [{ name: '文心一言', count: 97, color: '#ec4899' }, { name: '通义千问', count: 55, color: '#9333ea' }, { name: 'DeepSeek', count: 15, color: '#6366f1' }, { name: '豆包', count: 5, color: '#f59e0b' }] },
    { name: '中国政府采购网', cite: 82, articles: 38, models: [{ name: '文心一言', count: 66, color: '#ec4899' }, { name: 'DeepSeek', count: 10, color: '#6366f1' }, { name: '豆包', count: 4, color: '#f59e0b' }, { name: '通义千问', count: 2, color: '#9333ea' }] },
    { name: '顺企网', cite: 130, articles: 48, models: [{ name: '文心一言', count: 54, color: '#ec4899' }, { name: '通义千问', count: 54, color: '#9333ea' }, { name: 'DeepSeek', count: 12, color: '#6366f1' }, { name: '豆包', count: 10, color: '#f59e0b' }] },
    { name: '八方资源网', cite: 80, articles: 35, models: [{ name: '文心一言', count: 38, color: '#ec4899' }, { name: 'DeepSeek', count: 29, color: '#6366f1' }, { name: '豆包', count: 13, color: '#f59e0b' }] },
    { name: '百度百科', cite: 42, articles: 18, models: [{ name: '文心一言', count: 28, color: '#ec4899' }, { name: '通义千问', count: 14, color: '#9333ea' }] },
    { name: '中国制造网', cite: 53, articles: 22, models: [{ name: '文心一言', count: 22, color: '#ec4899' }, { name: 'DeepSeek', count: 18, color: '#6366f1' }, { name: '豆包', count: 8, color: '#f59e0b' }, { name: '通义千问', count: 5, color: '#9333ea' }] },
  ];
  const p = platforms[i % 10];
  return { id: i + 1, name: p.name, cite: p.cite, articles: p.articles, models: p.models, authority: i % 3 === 0 ? '--' : i % 3 === 1 ? '正常权威' : '高权威' };
});

// ===== 引用源洞察 (RankingSourceInsight) =====
// Top10 信源平台标签
export const insightPlatformTags = [
  { name: '抖音', count: 411, color: '#10b981' },
  { name: '百度', count: 382, color: '#6366f1' },
  { name: 'szbw6868.cn.china.cn', count: 169, color: '#f59e0b' },
  { name: '中国采购与招标网', count: 165, color: '#ef4444' },
  { name: '大众网', count: 157, color: '#06b6d4' },
  { name: '中国政府采购网', count: 106, color: '#8b5cf6' },
  { name: '顺企网', count: 104, color: '#14b8a6' },
  { name: '百度百科', count: 100, color: '#f97316' },
  { name: '八方资源网', count: 78, color: '#84cc16' },
  { name: '1688', count: 69, color: '#ec4899' },
];

// 信源洞察表格数据
export const sourceInsightList = [
  { rank: 1, name: '抖音', doubao: 405, deepseek: 0, wenxin: 6, qianwen: 0, yuanbao: 0, total: 411, status: '持续被引', change: '+13' },
  { rank: 2, name: '百度', doubao: 0, deepseek: 76, wenxin: 242, qianwen: 5, yuanbao: 65, total: 382, status: '持续被引', change: '+24' },
  { rank: 3, name: 'szbw6868.cn.china.cn', doubao: 0, deepseek: 42, wenxin: 169, qianwen: 0, yuanbao: 0, total: 169, status: '持续被引', change: '+5' },
  { rank: 4, name: '中国采购与招标网', doubao: 0, deepseek: 22, wenxin: 132, qianwen: 14, yuanbao: 0, total: 165, status: '持续被引', change: '+12' },
  { rank: 5, name: '大众网', doubao: 5, deepseek: 15, wenxin: 97, qianwen: 55, yuanbao: 0, total: 157, status: '持续被引', change: '-3' },
  { rank: 6, name: '中国政府采购网', doubao: 4, deepseek: 10, wenxin: 66, qianwen: 2, yuanbao: 0, total: 106, status: '持续被引', change: '+4' },
  { rank: 7, name: '顺企网', doubao: 10, deepseek: 12, wenxin: 54, qianwen: 54, yuanbao: 0, total: 104, status: '持续被引', change: '+3' },
  { rank: 8, name: '百度百科', doubao: 0, deepseek: 0, wenxin: 28, qianwen: 14, yuanbao: 0, total: 100, status: '持续被引', change: '+2' },
  { rank: 9, name: '八方资源网', doubao: 13, deepseek: 29, wenxin: 38, qianwen: 0, yuanbao: 0, total: 78, status: '持续被引', change: '+1' },
  { rank: 10, name: '1688', doubao: 8, deepseek: 18, wenxin: 22, qianwen: 5, yuanbao: 0, total: 69, status: '持续被引', change: '-1' },
  { rank: 11, name: '中国制造网', doubao: 8, deepseek: 18, wenxin: 22, qianwen: 5, yuanbao: 0, total: 53, status: '持续被引', change: '+3' },
  { rank: 12, name: '知乎', doubao: 5, deepseek: 12, wenxin: 18, qianwen: 3, yuanbao: 0, total: 38, status: '持续被引', change: '+2' },
  { rank: 13, name: '搜狐网', doubao: 3, deepseek: 8, wenxin: 15, qianwen: 2, yuanbao: 0, total: 28, status: '持续被引', change: '+1' },
  { rank: 14, name: '百家号', doubao: 2, deepseek: 5, wenxin: 10, qianwen: 1, yuanbao: 0, total: 18, status: '持续被引', change: '+2' },
  { rank: 15, name: '豆瓣', doubao: 0, deepseek: 3, wenxin: 8, qianwen: 0, yuanbao: 0, total: 11, status: '持续被引', change: '+1' },
  { rank: 16, name: '网易', doubao: 2, deepseek: 4, wenxin: 7, qianwen: 1, yuanbao: 0, total: 14, status: '本期新增', change: '+14' },
  { rank: 17, name: '新浪', doubao: 1, deepseek: 3, wenxin: 5, qianwen: 0, yuanbao: 0, total: 9, status: '本期新增', change: '+9' },
  { rank: 18, name: '腾讯网', doubao: 0, deepseek: 2, wenxin: 4, qianwen: 0, yuanbao: 0, total: 6, status: '本期新增', change: '+6' },
  { rank: 19, name: 'china.cn', doubao: 0, deepseek: 0, wenxin: 46, qianwen: 0, yuanbao: 0, total: 46, status: '持续被引', change: '+8' },
  { rank: 20, name: '深圳家具网', doubao: 3, deepseek: 36, wenxin: 0, qianwen: 0, yuanbao: 5, total: 44, status: '持续被引', change: '+11' },
];

// AI 洞察提示
export const insightTip = '抖音 是当前被 AI 引擎引用最多的信源平台（共 411 次）， 其中 豆包 对它的引用最为集中（405 次）。 建议优先在该平台布局高质量内容。';

export const topicRanking = [
  { question: '课桌椅采购厂家推荐', doubao: 0, deepseek: 0, yuanbao: 0 },
  { question: '采购礼堂椅厂家推荐', doubao: 1, deepseek: 3, yuanbao: 0 },
  { question: '学生课桌椅厂家', doubao: 2, deepseek: 0, yuanbao: 1 },
  { question: '课桌椅生产厂家排行', doubao: 0, deepseek: 0, yuanbao: 0 },
  { question: '宏祥家具怎么样', doubao: 3, deepseek: 5, yuanbao: 0 },
];

export const flowRisks = [
  {
    type: 'unmentioned',
    title: '目标公司未提及',
    question: '课桌椅采购厂家推荐',
    engines: '豆包、DeepSeek、文心一言、通义千问、元宝',
    content: '「课桌椅采购厂家推荐」在 豆包 完全未提及目标公司；在 文心一言 完全未提及目标公司；在 DeepSeek 完全未提及目标公司；在 通义千问 完全未提及目标公司；在 元宝 完全未提及目标公司',
    level: 'high',
  },
  {
    type: 'unmentioned',
    title: '目标公司未提及',
    question: '采购学生课桌椅厂家推荐',
    engines: '豆包、DeepSeek、文心一言、通义千问、元宝',
    content: '「采购学生课桌椅厂家推荐」在 豆包 完全未提及目标公司；在 文心一言 完全未提及目标公司；在 DeepSeek 完全未提及目标公司；在 通义千问 完全未提及目标公司；在 元宝 完全未提及目标公司',
    level: 'high',
  },
  {
    type: 'unmentioned',
    title: '目标公司未提及',
    question: '影院椅采购厂家推荐',
    engines: '通义千问、元宝',
    content: '「影院椅采购厂家推荐」在 通义千问 完全未提及目标公司；在 元宝 完全未提及目标公司',
    level: 'high',
  },
  {
    type: 'unmentioned',
    title: '目标公司未提及',
    question: '阶梯排椅采购厂家推荐',
    engines: '豆包、DeepSeek、通义千问、元宝',
    content: '「阶梯排椅采购厂家推荐」在 豆包 完全未提及目标公司；在 DeepSeek 完全未提及目标公司；在 通义千问 完全未提及目标公司；在 元宝 完全未提及目标公司',
    level: 'high',
  },
];

export const mediaSources = [
  { id: 'm1', name: '36氪', type: '门户', enginePref: ['doubao', 'deepseek'], authority: 92, price: 500, rate: 0.95, certStatus: '认证' },
  { id: 'm2', name: '知乎', type: '问答', enginePref: ['doubao', 'deepseek', 'yuanbao'], authority: 88, price: 300, rate: 0.90, certStatus: '认证' },
  { id: 'm3', name: '百家号', type: '自媒体', enginePref: ['doubao'], authority: 65, price: 150, rate: 0.80, certStatus: '认证' },
  { id: 'm4', name: '搜狐科技', type: '门户', enginePref: ['deepseek', 'yuanbao'], authority: 82, price: 400, rate: 0.88, certStatus: '认证' },
  { id: 'm5', name: 'CSDN', type: '自媒体', enginePref: ['deepseek'], authority: 75, price: 200, rate: 0.82, certStatus: '认证' },
  { id: 'm6', name: '少数派', type: '自媒体', enginePref: ['doubao', 'deepseek'], authority: 70, price: 180, rate: 0.78, certStatus: '认证' },
  { id: 'm7', name: 'SegmentFault', type: '自媒体', enginePref: ['deepseek'], authority: 68, price: 160, rate: 0.75, certStatus: '认证' },
  { id: 'm8', name: '极客公园', type: '门户', enginePref: ['doubao'], authority: 80, price: 350, rate: 0.85, certStatus: '认证' },
];

export const mediaLibraryList = [
  { id: 'ml1', name: '36氪', type: '新闻门户', logo: '36', enginePref: ['doubao', 'deepseek'], citeIndex: 92, price: 500, certStatus: '认证', area: '全国', category: '科技', fans: '120万' },
  { id: 'ml2', name: '知乎专栏', type: '问答社区', logo: '知', enginePref: ['doubao', 'deepseek', 'yuanbao'], citeIndex: 88, price: 300, certStatus: '认证', area: '全国', category: '综合', fans: '85万' },
  { id: 'ml3', name: '百家号', type: '自媒体', logo: '百', enginePref: ['doubao'], citeIndex: 65, price: 150, certStatus: '认证', area: '全国', category: '综合', fans: '200万' },
  { id: 'ml4', name: '搜狐科技', type: '新闻门户', logo: '搜', enginePref: ['deepseek', 'yuanbao'], citeIndex: 82, price: 400, certStatus: '认证', area: '全国', category: '科技', fans: '95万' },
  { id: 'ml5', name: 'CSDN', type: '自媒体', logo: 'CS', enginePref: ['deepseek'], citeIndex: 75, price: 200, certStatus: '认证', area: '全国', category: 'IT', fans: '60万' },
  { id: 'ml6', name: '少数派', type: '自媒体', logo: '少', enginePref: ['doubao', 'deepseek'], citeIndex: 70, price: 180, certStatus: '认证', area: '全国', category: '科技', fans: '45万' },
  { id: 'ml7', name: 'SegmentFault', type: '自媒体', logo: 'SF', enginePref: ['deepseek'], citeIndex: 68, price: 160, certStatus: '认证', area: '全国', category: 'IT', fans: '38万' },
  { id: 'ml8', name: '极客公园', type: '新闻门户', logo: '极', enginePref: ['doubao'], citeIndex: 80, price: 350, certStatus: '认证', area: '全国', category: '科技', fans: '72万' },
  { id: 'ml9', name: '虎嗅', type: '新闻门户', logo: '虎', enginePref: ['doubao', 'deepseek'], citeIndex: 85, price: 380, certStatus: '认证', area: '全国', category: '科技', fans: '110万' },
  { id: 'ml10', name: '钛媒体', type: '新闻门户', logo: '钛', enginePref: ['deepseek', 'yuanbao'], citeIndex: 78, price: 320, certStatus: '认证', area: '全国', category: '科技', fans: '88万' },
];

export const publishRecords = [
  { id: 'p1', title: '宏祥家具课桌椅深度评测', media: '36氪', status: '已发布', submitTime: '2026-08-25 14:30', engineRefs: 3 },
  { id: 'p2', title: '课桌椅采购指南', media: '知乎', status: '审核中', submitTime: '2026-08-25 10:00', engineRefs: 0 },
  { id: 'p3', title: '宏祥家具使用教程', media: '百家号', status: '已发布', submitTime: '2026-08-24 16:00', engineRefs: 2 },
  { id: 'p4', title: '课桌椅行业分析', media: '搜狐科技', status: '待审核', submitTime: '2026-08-24 09:30', engineRefs: 0 },
];

export const agentPresets = [
  { id: 1, text: '分析提及率波动', desc: '查看品牌在各AI引擎上的提及率变化' },
  { id: 2, text: '看今天热点', desc: '了解当前AI搜索领域的热点话题' },
  { id: 3, text: '豆包优化优质信源', desc: '获取适合豆包收录的高质量信源' },
  { id: 4, text: 'DeepSeek优化优质信源', desc: '获取适合DeepSeek收录的高质量信源' },
  { id: 5, text: '什么样的内容更容易被豆包引用', desc: '分析豆包引用偏好，提供内容策略建议' },
  { id: 6, text: '什么样的内容更容易被DeepSeek引用', desc: '分析DeepSeek引用偏好，提供内容策略建议' },
];

export const plans = [
  { id: 'free', name: '免费版', price: 0, credits: 0, features: ['1个品牌', '5个监控问题', '基础排名查询', '每日数据更新'] },
  { id: 'starter', name: '入门版', price: 79, credits: 790, features: ['3个品牌', '20个监控问题', 'AI排名透视', '每日数据更新', '基础情感分析'] },
  { id: 'basic', name: '基础版', price: 199, credits: 1990, features: ['10个品牌', '100个监控问题', '全部引擎排名', '竞品透视', '引用源追溯', '每小时数据更新'] },
  { id: 'pro', name: '专业版', price: 499, credits: 4990, features: ['不限品牌', '不限问题', '全部功能', '信源库发稿', 'AGENT对话', '专属客服', '实时数据更新'] },
  { id: 'custom', name: '定制版', price: -1, credits: 0, features: ['定制化需求', '私有化部署', 'API接入', '专属团队'], custom: true },
];

export const aiiMetric = {
  value: 22.7,
  delta: -0.9,
  sub: { visibility: 5, sentiment: 18, consensus: 41 },
};

export const trendData7d = {
  labels: ['08-20', '08-21', '08-22', '08-23', '08-24', '08-25', '08-26'],
  values: [24.1, 23.5, 23.8, 23.2, 22.9, 23.1, 22.7],
};

export const sentimentDist = { positive: 55, neutral: 27, negative: 18 };

export const sentimentTags = [
  { text: '性价比高', type: 'positive', size: 'lg' },
  { text: '一站式服务', type: 'positive', size: 'lg' },
  { text: '用料扎实', type: 'positive', size: 'lg' },
  { text: '资质齐全', type: 'positive', size: 'md' },
  { text: '价格适中', type: 'neutral', size: 'md' },
  { text: '厂家直供', type: 'neutral', size: 'md' },
  { text: '售后一般', type: 'negative', size: 'md' },
  { text: '品牌知名度低', type: 'negative', size: 'md' },
];

export const topicRankTable = [
  { question: '采购礼堂椅厂家推荐', top1: '大丰实业', top2: '沈阳隆鑫文仪家具有限公司', top3: '沈阳宏盛达家具制造有限公司', top5: '浙江恒林椅业' },
  { question: '阶梯排椅采购厂家推荐', top1: '河北润华体育器材制造有限公司', top2: '广东英驰家具实业有限公司', top3: '澳舒健', top5: '佛山虹桥家具' },
  { question: '连排椅采购厂家推荐', top1: '河北骏盛金属制品有限公司', top2: '佛山市南海区进一家具厂', top3: '澳舒健(广东佛山)', top5: '广东迪欧家具' },
  { question: '课桌椅采购厂家推荐', top1: '育才控股', top2: '博士有成', top3: '祥聚座椅', top5: '天坛玛金莎' },
  { question: '影院椅采购厂家推荐', top1: '礼棠家具', top2: '大丰实业', top3: '江苏恒康家具', top5: '广州百事得' },
];

// ===== AI排名透视 (Ranking) =====
export const rankingMetrics = [
  {
    key: 'mention',
    title: '品牌提及率',
    value: 20,
    sub: '7 / 35',
    delta: 3.2,
    trend: 'up' as const,
    color: '#3B82F6',
    chart: [14, 16, 15, 18, 17, 19, 20],
    desc: '品牌在 AI 答案中被提及的采样占比，不限位次。',
    descFormula: '公式 = 被提及的采样数 ÷ 总采样数',
    descNote: '一次采样 = 单个话题 × 单个引擎 × 单次监测',
  },
  {
    key: 'top3',
    title: 'Top3 推荐率',
    value: 12,
    sub: '4 / 35',
    delta: -1.8,
    trend: 'down' as const,
    color: '#10B981',
    chart: [10, 11, 9, 12, 13, 11, 12],
    desc: '品牌进入 AI 回答前 3 名的采样占比。',
    descFormula: '公式 = 前 3 名采样数 ÷ 总采样数',
    descNote: '一次采样 = 单个话题 × 单个引擎 × 单次监测',
  },
  {
    key: 'first',
    title: '首位推荐率',
    value: 6,
    sub: '2 / 35',
    delta: 0.5,
    trend: 'up' as const,
    color: '#F59E0B',
    chart: [3, 4, 3, 5, 4, 5, 6],
    desc: '品牌作为 AI 回答首位推荐的采样占比。',
    descFormula: '公式 = 首位采样数 ÷ 总采样数',
    descNote: '一次采样 = 单个话题 × 单个引擎 × 单次监测',
  },
];

export const rankingList = [
  { rank: 1, name: '大丰实业', badge: { type: 'new', text: 'NEW' } },
  { rank: 2, name: '沈阳隆鑫文仪家具有限公司', badge: { type: 'down', text: '▼ 1' } },
  { rank: 3, name: '沈阳宏盛达家具制造有限公司', badge: { type: 'new', text: 'NEW' } },
  { rank: 4, name: '天坛玛金莎', badge: { type: 'new', text: 'NEW' } },
  { rank: 5, name: '河南巨豪实业有限公司', badge: { type: 'new', text: 'NEW' } },
  { rank: 6, name: '佛山市宏祥家具实业有限公司本品牌', badge: { type: 'up', text: '▲ 3' }, isBrand: true },
  { rank: 7, name: '佛山市红富家具制造有限公司', badge: { type: 'new', text: 'NEW' } },
  { rank: 8, name: '河南新起点家具有限公司', badge: { type: 'new', text: 'NEW' } },
];

export const rankingTrend = {
  labels: ['08-21', '08-22', '08-23', '08-24', '08-25', '08-26', '08-27'],
  series: [
    { key: 'combined', label: '综合', color: '#8b5cf6', values: [2.4, 2.1, 2.0, 1.8, 1.5, 1.3, 1] },
  ],
};

export const rankingMatrix = [
  { question: '采购礼堂椅厂家推荐', combined: 6, mention: 40, top3: 20, first: 0, doubao: 6, deepseek: 3, wenxin: 0, qwen: 0, yuanbao: 0 },
  { question: '课桌椅采购厂家推荐', combined: 0, mention: 0, top3: 0, first: 0, doubao: 0, deepseek: 0, wenxin: 0, qwen: 0, yuanbao: 0 },
  { question: '影院椅采购厂家推荐', combined: 7, mention: 40, top3: 0, first: 0, doubao: 0, deepseek: 5, wenxin: 7, qwen: 0, yuanbao: 0 },
  { question: '阶梯排椅采购厂家推荐', combined: 6, mention: 20, top3: 20, first: 0, doubao: 0, deepseek: 0, wenxin: 3, qwen: 0, yuanbao: 0 },
  { question: '采购会议室座椅厂家推荐', combined: 0, mention: 0, top3: 0, first: 0, doubao: 0, deepseek: 0, wenxin: 0, qwen: 0, yuanbao: 0 },
  { question: '采购学生课桌椅厂家推荐', combined: 0, mention: 0, top3: 0, first: 0, doubao: 0, deepseek: 0, wenxin: 0, qwen: 0, yuanbao: 0 },
  { question: '连排椅采购厂家推荐', combined: 9, mention: 40, top3: 20, first: 0, doubao: 0, deepseek: 2, wenxin: 0, qwen: 5, yuanbao: 0 },
];

// ===== AI竞品透视 (RankingCompetitor) =====
export const competitorMetrics = [
  { key: 'total', icon: 'users', label: '竞品总数', value: '223' },
  { key: 'monitored', icon: 'eye', label: '监控问题', value: '7' },
  {
    key: 'strongest',
    icon: 'trophy',
    label: '最强竞品',
    value: '大丰实业',
    sub: '出现 6 次 · 提及率 17.14% · Top3 14.29%',
    truncate: true,
  },
  {
    key: 'top3Rate',
    icon: 'shield',
    label: '头号竞品 Top3 推荐率',
    value: '14.29%',
    sub: '大丰实业 · 综合 Top3 推荐率',
  },
];

export const competitorMentionList = [
  { id: 1, name: '佛山市宏祥家具实业有限公司本品牌', count: 7, mention: 20, top3: 8.57, first: 0, isBrand: true },
  { id: 2, name: '大丰实业', count: 6, mention: 17.14, top3: 14.29, first: 0 },
  { id: 3, name: '沈阳隆鑫文仪家具有限公司', count: 4, mention: 11.43, top3: 8.57, first: 0 },
  { id: 4, name: '沈阳宏盛达家具制造有限公司', count: 3, mention: 8.57, top3: 5.71, first: 2.86 },
  { id: 5, name: '天坛玛金莎', count: 3, mention: 8.57, top3: 5.71, first: 0 },
  { id: 6, name: '河南巨豪实业有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 7, name: '佛山市红富家具制造有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 8, name: '河南新起点家具有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 9, name: '育才控股', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 10, name: '礼棠家具', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 11, name: '广州市华盛家具制造有限公司', count: 4, mention: 11.43, top3: 8.57, first: 2.86 },
  { id: 12, name: '深圳市永泰家具有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 13, name: '东莞市金鹰家具实业有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 14, name: '佛山市宏达家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 15, name: '中山市中泰家具有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 16, name: '杭州市华丰家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 17, name: '宁波市佳美家具制造有限公司', count: 3, mention: 8.57, top3: 5.71, first: 0 },
  { id: 18, name: '温州市恒通家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 19, name: '成都市盛达家具实业有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 20, name: '重庆市瑞丰家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 21, name: '武汉市利达家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 22, name: '长沙市兴华家具实业有限公司', count: 3, mention: 8.57, top3: 5.71, first: 2.86 },
  { id: 23, name: '郑州市华艺家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 24, name: '济南市联发家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 25, name: '沈阳市新宏家具实业有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 26, name: '长春市万佳家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 27, name: '哈尔滨市德盛家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 28, name: '石家庄市金鹏家具实业有限公司', count: 3, mention: 8.57, top3: 5.71, first: 0 },
  { id: 29, name: '太原市华宇家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 30, name: '西安市东方家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 31, name: '深圳市华盛家具有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 32, name: '东莞市永泰家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 33, name: '佛山市金鹰家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 34, name: '中山市宏达家具有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 35, name: '杭州市中泰家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 36, name: '宁波市华丰家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 37, name: '温州市佳美家具有限公司', count: 4, mention: 11.43, top3: 8.57, first: 0 },
  { id: 38, name: '成都市恒通家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 39, name: '重庆市盛达家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 40, name: '武汉市瑞丰家具有限公司', count: 2, mention: 5.71, top3: 0, first: 0 },
  { id: 41, name: '长沙市利达家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 42, name: '郑州市兴华家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 43, name: '济南市华艺家具有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 44, name: '沈阳市联发家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 45, name: '长春市新宏家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 46, name: '哈尔滨市万佳家具有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 47, name: '石家庄市德盛家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 48, name: '太原市金鹏家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 49, name: '西安市华宇家具有限公司', count: 2, mention: 5.71, top3: 0, first: 0 },
  { id: 50, name: '广州市东方家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 51, name: '东莞市华盛家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 52, name: '佛山市永泰家具制造有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 53, name: '中山市金鹰家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 54, name: '杭州市宏达家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 55, name: '宁波市中泰家具制造有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 56, name: '温州市华丰家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 57, name: '成都市佳美家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 58, name: '重庆市恒通家具制造有限公司', count: 2, mention: 5.71, top3: 0, first: 0 },
  { id: 59, name: '武汉市盛达家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 60, name: '长沙市瑞丰家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 61, name: '郑州市利达家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 62, name: '济南市兴华家具有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 63, name: '沈阳市华艺家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 64, name: '长春市联发家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 65, name: '哈尔滨市新宏家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 66, name: '石家庄市万佳家具实业有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 67, name: '太原市德盛家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 68, name: '西安市金鹏家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 69, name: '广州市华宇家具实业有限公司', count: 2, mention: 5.71, top3: 0, first: 0 },
  { id: 70, name: '深圳市东方家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 71, name: '佛山市华盛家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 72, name: '中山市永泰家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 73, name: '杭州市金鹰家具实业有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 74, name: '宁波市宏达家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 75, name: '温州市中泰家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 76, name: '成都市华丰家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 77, name: '重庆市佳美家具制造有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 78, name: '武汉市恒通家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 79, name: '长沙市盛达家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 80, name: '郑州市瑞丰家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 81, name: '济南市利达家具有限公司', count: 2, mention: 5.71, top3: 0, first: 0 },
  { id: 82, name: '沈阳市兴华家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 83, name: '长春市华艺家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 84, name: '哈尔滨市联发家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 85, name: '石家庄市新宏家具实业有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 86, name: '太原市万佳家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 87, name: '西安市德盛家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 88, name: '广州市金鹏家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 89, name: '深圳市华宇家具制造有限公司', count: 2, mention: 5.71, top3: 2.86, first: 0 },
  { id: 90, name: '东莞市东方家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 91, name: '中山市华盛家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 92, name: '杭州市永泰家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 93, name: '宁波市金鹰家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 94, name: '温州市宏达家具有限公司', count: 2, mention: 5.71, top3: 0, first: 0 },
  { id: 95, name: '成都市中泰家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 96, name: '重庆市华丰家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 97, name: '武汉市佳美家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 98, name: '长沙市恒通家具实业有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 99, name: '郑州市盛达家具制造有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
  { id: 100, name: '济南市瑞丰家具有限公司', count: 1, mention: 2.86, top3: 0, first: 0 },
];

export interface CompetitorPlatformRow {
  id: number;
  name: string;
  isBrand?: boolean;
  combined: { mention: number; top3: number; first: number };
  doubao: { mention: number; top3: number; first: number };
  deepseek: { mention: number; top3: number; first: number };
  wenxin: { mention: number; top3: number; first: number };
  qwen: { mention: number; top3: number; first: number };
  yuanbao: { mention: number; top3: number; first: number };
  doubaoApp: { mention: number; top3: number; first: number };
  deepseekApp: { mention: number; top3: number; first: number };
  qwenApp: { mention: number; top3: number; first: number };
}

const zeroTriple = { mention: 0, top3: 0, first: 0 };

export const competitorPlatformList: CompetitorPlatformRow[] = [
  {
    id: 1, name: '佛山市宏祥家具实业有限公司本品牌', isBrand: true,
    combined: { mention: 20, top3: 8.57, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: { mention: 42.86, top3: 28.57, first: 0 },
    wenxin: { mention: 28.57, top3: 14.29, first: 0 },
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple,
    doubaoApp: zeroTriple,
    deepseekApp: { mention: 14.29, top3: 0, first: 0 },
    qwenApp: zeroTriple,
  },
  {
    id: 2, name: '大丰实业',
    combined: { mention: 17.14, top3: 14.29, first: 0 },
    doubao: { mention: 14.29, top3: 14.29, first: 0 },
    deepseek: { mention: 28.57, top3: 28.57, first: 0 },
    wenxin: { mention: 28.57, top3: 14.29, first: 0 },
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple,
    doubaoApp: { mention: 14.29, top3: 0, first: 0 },
    deepseekApp: zeroTriple,
    qwenApp: zeroTriple,
  },
  {
    id: 3, name: '沈阳隆鑫文仪家具有限公司',
    combined: { mention: 11.43, top3: 8.57, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: { mention: 14.29, top3: 14.29, first: 0 },
    wenxin: { mention: 14.29, top3: 14.29, first: 0 },
    qwen: { mention: 0, top3: 0, first: 0 },
    yuanbao: zeroTriple,
    doubaoApp: zeroTriple,
    deepseekApp: zeroTriple,
    qwenApp: zeroTriple,
  },
  {
    id: 4, name: '沈阳宏盛达家具制造有限公司',
    combined: { mention: 8.57, top3: 5.71, first: 2.86 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: { mention: 14.29, top3: 14.29, first: 0 },
    wenxin: { mention: 0, top3: 0, first: 14.29 },
    qwen: zeroTriple,
    yuanbao: zeroTriple,
    doubaoApp: zeroTriple,
    deepseekApp: zeroTriple,
    qwenApp: zeroTriple,
  },
  {
    id: 5, name: '天坛玛金莎',
    combined: { mention: 8.57, top3: 5.71, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: { mention: 14.29, top3: 14.29, first: 0 },
    wenxin: { mention: 0, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple,
    doubaoApp: zeroTriple,
    deepseekApp: zeroTriple,
    qwenApp: zeroTriple,
  },
  {
    id: 6, name: '河南巨豪实业有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: { mention: 0, top3: 14.29, first: 0 },
    wenxin: zeroTriple,
    qwen: zeroTriple,
    yuanbao: zeroTriple,
    doubaoApp: zeroTriple,
    deepseekApp: zeroTriple,
    qwenApp: zeroTriple,
  },
  {
    id: 7, name: '佛山市红富家具制造有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: { mention: 0, top3: 14.29, first: 0 },
    wenxin: zeroTriple,
    qwen: zeroTriple,
    yuanbao: zeroTriple,
    doubaoApp: zeroTriple,
    deepseekApp: zeroTriple,
    qwenApp: zeroTriple,
  },
  {
    id: 8, name: '河南新起点家具有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: { mention: 0, top3: 0, first: 0 },
    deepseek: { mention: 14.29, top3: 14.29, first: 0 },
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple,
    doubaoApp: zeroTriple,
    deepseekApp: zeroTriple,
    qwenApp: zeroTriple,
  },
  {
    id: 9, name: '育才控股',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple,
    wenxin: zeroTriple,
    qwen: zeroTriple,
    yuanbao: zeroTriple,
    doubaoApp: zeroTriple,
    deepseekApp: zeroTriple,
    qwenApp: zeroTriple,
  },
  {
    id: 10, name: '礼棠家具',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple,
    qwen: zeroTriple,
    yuanbao: zeroTriple,
    doubaoApp: zeroTriple,
    deepseekApp: zeroTriple,
    qwenApp: zeroTriple,
  },
  {
    id: 11, name: '广州市华盛家具制造有限公司',
    combined: { mention: 11.43, top3: 8.57, first: 2.86 },
    doubao: { mention: 28.57, top3: 28.57, first: 14.29 },
    deepseek: { mention: 28.57, top3: 14.29, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 12, name: '深圳市永泰家具有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 28.57, top3: 14.29, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 13, name: '东莞市金鹰家具实业有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 14.29, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 14, name: '佛山市宏达家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 15, name: '中山市中泰家具有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: { mention: 28.57, top3: 14.29, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 16, name: '杭州市华丰家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 17, name: '宁波市佳美家具制造有限公司',
    combined: { mention: 8.57, top3: 5.71, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 42.86, top3: 28.57, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 18, name: '温州市恒通家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 19, name: '成都市盛达家具实业有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: { mention: 28.57, top3: 14.29, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 20, name: '重庆市瑞丰家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 21, name: '武汉市利达家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 22, name: '长沙市兴华家具实业有限公司',
    combined: { mention: 8.57, top3: 5.71, first: 2.86 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 42.86, top3: 28.57, first: 14.29 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 23, name: '郑州市华艺家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 24, name: '济南市联发家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 25, name: '沈阳市新宏家具实业有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 14.29, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 26, name: '长春市万佳家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 27, name: '哈尔滨市德盛家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 28, name: '石家庄市金鹏家具实业有限公司',
    combined: { mention: 8.57, top3: 5.71, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 42.86, top3: 28.57, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 29, name: '太原市华宇家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 30, name: '西安市东方家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 31, name: '深圳市华盛家具有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: { mention: 28.57, top3: 14.29, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 32, name: '东莞市永泰家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 33, name: '佛山市金鹰家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 34, name: '中山市宏达家具有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 28.57, top3: 14.29, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 35, name: '杭州市中泰家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 36, name: '宁波市华丰家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 37, name: '温州市佳美家具有限公司',
    combined: { mention: 11.43, top3: 8.57, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 14.29, first: 0 },
    qwen: { mention: 28.57, top3: 28.57, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 38, name: '成都市恒通家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 39, name: '重庆市盛达家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 40, name: '武汉市瑞丰家具有限公司',
    combined: { mention: 5.71, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 28.57, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 41, name: '长沙市利达家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 42, name: '郑州市兴华家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 43, name: '济南市华艺家具有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: { mention: 28.57, top3: 14.29, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 44, name: '沈阳市联发家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 45, name: '长春市新宏家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 46, name: '哈尔滨市万佳家具有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 28.57, top3: 14.29, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 47, name: '石家庄市德盛家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 48, name: '太原市金鹏家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 49, name: '西安市华宇家具有限公司',
    combined: { mention: 5.71, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 50, name: '广州市东方家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 51, name: '东莞市华盛家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 52, name: '佛山市永泰家具制造有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 28.57, top3: 14.29, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 53, name: '中山市金鹰家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 54, name: '杭州市宏达家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 55, name: '宁波市中泰家具制造有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: { mention: 28.57, top3: 14.29, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 56, name: '温州市华丰家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 57, name: '成都市佳美家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 58, name: '重庆市恒通家具制造有限公司',
    combined: { mention: 5.71, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 28.57, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 59, name: '武汉市盛达家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 60, name: '长沙市瑞丰家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 61, name: '郑州市利达家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 62, name: '济南市兴华家具有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 28.57, top3: 14.29, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 63, name: '沈阳市华艺家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 64, name: '长春市联发家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 65, name: '哈尔滨市新宏家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 66, name: '石家庄市万佳家具实业有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 28.57, top3: 14.29, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 67, name: '太原市德盛家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 68, name: '西安市金鹏家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 69, name: '广州市华宇家具实业有限公司',
    combined: { mention: 5.71, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 70, name: '深圳市东方家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 71, name: '佛山市华盛家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 72, name: '中山市永泰家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 73, name: '杭州市金鹰家具实业有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 14.29, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 74, name: '宁波市宏达家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 75, name: '温州市中泰家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 76, name: '成都市华丰家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 77, name: '重庆市佳美家具制造有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 14.29, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 78, name: '武汉市恒通家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 79, name: '长沙市盛达家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 80, name: '郑州市瑞丰家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 81, name: '济南市利达家具有限公司',
    combined: { mention: 5.71, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 82, name: '沈阳市兴华家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 83, name: '长春市华艺家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 84, name: '哈尔滨市联发家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 85, name: '石家庄市新宏家具实业有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 14.29, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 86, name: '太原市万佳家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 87, name: '西安市德盛家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 88, name: '广州市金鹏家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 89, name: '深圳市华宇家具制造有限公司',
    combined: { mention: 5.71, top3: 2.86, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 28.57, top3: 14.29, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 90, name: '东莞市东方家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 91, name: '中山市华盛家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 92, name: '杭州市永泰家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 93, name: '宁波市金鹰家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 94, name: '温州市宏达家具有限公司',
    combined: { mention: 5.71, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 28.57, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 95, name: '成都市中泰家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 96, name: '重庆市华丰家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 97, name: '武汉市佳美家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple,
    wenxin: { mention: 14.29, top3: 0, first: 0 },
    qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 98, name: '长沙市恒通家具实业有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple, deepseek: zeroTriple, wenxin: zeroTriple,
    qwen: { mention: 14.29, top3: 0, first: 0 },
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 99, name: '郑州市盛达家具制造有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: { mention: 14.29, top3: 0, first: 0 },
    deepseek: zeroTriple, wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
  {
    id: 100, name: '济南市瑞丰家具有限公司',
    combined: { mention: 2.86, top3: 0, first: 0 },
    doubao: zeroTriple,
    deepseek: { mention: 14.29, top3: 0, first: 0 },
    wenxin: zeroTriple, qwen: zeroTriple,
    yuanbao: zeroTriple, doubaoApp: zeroTriple, deepseekApp: zeroTriple, qwenApp: zeroTriple,
  },
];

export const competitorProblemList = [
  {
    id: 1,
    keyword: '采购礼堂椅厂家推荐',
    brandRank: 6,
    engines: [
      { name: '豆包', rank: 6 },
      { name: 'DeepSeek', rank: 3 },
      { name: '文心一言', rank: 0 },
      { name: '通义千问', rank: 0 },
      { name: '元宝', rank: 0 },
    ],
  },
  {
    id: 2,
    keyword: '课桌椅采购厂家推荐',
    brandRank: 0,
    engines: [
      { name: '豆包', rank: 0 },
      { name: 'DeepSeek', rank: 0 },
      { name: '文心一言', rank: 0 },
      { name: '通义千问', rank: 0 },
      { name: '元宝', rank: 0 },
    ],
  },
  {
    id: 3,
    keyword: '影院椅采购厂家推荐',
    brandRank: 7,
    engines: [
      { name: '豆包', rank: 0 },
      { name: 'DeepSeek', rank: 5 },
      { name: '文心一言', rank: 7 },
      { name: '通义千问', rank: 0 },
      { name: '元宝', rank: 0 },
    ],
  },
  {
    id: 4,
    keyword: '阶梯排椅采购厂家推荐',
    brandRank: 6,
    engines: [
      { name: '豆包', rank: 0 },
      { name: 'DeepSeek', rank: 0 },
      { name: '文心一言', rank: 3 },
      { name: '通义千问', rank: 0 },
      { name: '元宝', rank: 0 },
    ],
  },
  {
    id: 5,
    keyword: '采购会议室座椅厂家推荐',
    brandRank: 0,
    engines: [
      { name: '豆包', rank: 0 },
      { name: 'DeepSeek', rank: 0 },
      { name: '文心一言', rank: 0 },
      { name: '通义千问', rank: 0 },
      { name: '元宝', rank: 0 },
    ],
  },
  {
    id: 6,
    keyword: '采购学生课桌椅厂家推荐',
    brandRank: 0,
    engines: [
      { name: '豆包', rank: 0 },
      { name: 'DeepSeek', rank: 0 },
      { name: '文心一言', rank: 0 },
      { name: '通义千问', rank: 0 },
      { name: '元宝', rank: 0 },
    ],
  },
  {
    id: 7,
    keyword: '连排椅采购厂家推荐',
    brandRank: 9,
    engines: [
      { name: '豆包', rank: 0 },
      { name: 'DeepSeek', rank: 2 },
      { name: '文心一言', rank: 0 },
      { name: '通义千问', rank: 5 },
      { name: '元宝', rank: 0 },
    ],
  },
];

export const brandInfo = {
  name: '佛山市宏祥家具实业有限公司',
  correctionName: '宏祥家具',
  industry: '公共家具制造',
  website: '',
  protocol: 'https://',
  description: '佛山市宏祥家具实业有限公司，专注于公共空间家具的研发与制造，产品覆盖教育、办公、文化娱乐等公共场景。定价策略未公开。\n\n目标客群:学校及教育机构（课桌椅）、剧院/影院/礼堂（礼堂椅、影院椅、公共座椅）。',
  aliases: ['宏祥盛誉', '宏祥家具'],
  products: [
    { id: 'prod1', name: '礼堂椅', desc: '' },
    { id: 'prod2', name: '课桌椅', desc: '' },
    { id: 'prod3', name: '公共座椅', desc: '' },
    { id: 'prod4', name: '办公家具', desc: '' },
    { id: 'prod5', name: '影院椅', desc: '' },
  ],
  competitors: [
    { id: 'comp1', name: '祥聚座椅', desc: '', aliases: [] },
    { id: 'comp2', name: '礼棠家具', desc: '', aliases: [] },
    { id: 'comp3', name: '大丰实业', desc: '', aliases: [] },
    { id: 'comp4', name: '天坛玛金莎', desc: '', aliases: [] },
    { id: 'comp5', name: '育才控股', desc: '', aliases: [] },
    { id: 'comp6', name: '博士有成', desc: '', aliases: [] },
  ],
  wiki: [
    { id: 'wiki1', title: '宏祥家具产品介绍', updatedAt: '2026-08-25' },
    { id: 'wiki2', title: '宏祥家具使用教程', updatedAt: '2026-08-20' },
    { id: 'wiki3', title: '宏祥家具技术白皮书', updatedAt: '2026-08-15' },
  ],
};

// ============ AI 口碑分析 ============
// 情感倾向分布
export const sentimentDistribution = [
  { label: '正面评价', value: 53, color: '#10B981' },
  { label: '中性描述', value: 27, color: '#94A3B8' },
  { label: '负面反馈', value: 20, color: '#F43F5E' },
];

// 情感走势数据
export const sentimentTrend = [
  { date: '08-22', positive: 50, neutral: 30, negative: 20 },
  { date: '08-23', positive: 55, neutral: 28, negative: 17 },
  { date: '08-24', positive: 52, neutral: 29, negative: 19 },
  { date: '08-25', positive: 58, neutral: 25, negative: 17 },
  { date: '08-26', positive: 54, neutral: 27, negative: 19 },
  { date: '08-27', positive: 56, neutral: 24, negative: 20 },
  { date: '08-28', positive: 53, neutral: 27, negative: 20 },
];

// 关键词标签
export const sentimentKeywords = {
  positive: [
    { keyword: '性价比突出', count: 9 },
    { keyword: '性价比高', count: 8 },
    { keyword: '资质齐全', count: 8 },
    { keyword: '高性价比', count: 8 },
    { keyword: '一站式服务', count: 5 },
    { keyword: '服务网络完善', count: 5 },
    { keyword: '售后响应快', count: 4 },
    { keyword: '用料厚实', count: 3 },
    { keyword: '全国服务网点', count: 3 },
  ],
  neutral: [
    { keyword: '价格适中', count: 6 },
    { keyword: '市场认知一般', count: 5 },
    { keyword: '品牌知名度有限', count: 4 },
    { keyword: '行业排名中等', count: 3 },
  ],
  negative: [
    { keyword: '品牌知名度低', count: 5 },
    { keyword: '线上曝光不足', count: 4 },
    { keyword: '用户评价偏少', count: 3 },
  ],
};

// 原文引用
export const sentimentCitations = [
  { platform: '通义千问', text: '礼堂椅基础款出厂价在500-600元区间，比高端品牌便宜20%-35%' },
  { platform: '通义千问', text: '其口碑呈现出...性价比突出' },
  { platform: '豆包', text: '属于靠谱的二线源头工厂，性价比突出' },
  { platform: '豆包', text: '性价比不错，没有大规模集中投诉曝光' },
  { platform: '豆包', text: '价格定位介于大牌和小作坊中间，高中低端款式都有' },
  { platform: '文心一言', text: '礼堂椅基础款出厂价500-600元，比高端品牌便宜20%-35%' },
  { platform: 'DeepSeek', text: '作为工程直供的源头厂家，它在价格上有明显优势。其礼堂椅的主力产品价格带在400-600元区间，被一些行业观察者称为"性价比杀手"，能用中端价格获得接近中高端的品质' },
  { platform: 'DeepSeek', text: '被一些行业观察者称为"性价比杀手"，能用中端价格获得接近中高端的品质' },
  { platform: 'DeepSeek', text: '作为工程直供的源头厂家，它在价格上有明显优势。' },
];

// 全景口碑矩阵
export const sentimentMatrix = {
  platforms: ['豆包', 'DeepSeek', '文心一言', '通义千问', '元宝'],
  rows: [
    {
      question: '宏祥盛誉怎么样，口碑好不好',
      healthScore: 75.5,
      healthTrend: 'down',
      riskLevel: '中风险',
      riskType: 'amber',
      scores: [
        { value: 50, type: 'red' },
        { value: 56.25, type: 'red' },
        { value: 100, type: 'green' },
        { value: 93.75, type: 'green' },
        { value: 56.25, type: 'red' },
      ],
    },
  ],
};
