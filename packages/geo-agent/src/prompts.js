'use strict';
/**
 * 提示词（原创）：三段式 —— 画像抽取 → 监控问题候选 → 情报文
 * 字段命名严格对齐实测契约（industary 为线上拼写沿用、双形态 question_list、weight 热度、竞争点一句话定位）
 */

const PROFILE_SCHEMA = `{
  "brand_name": "品牌正式名称",
  "company": "运营主体公司名（能从站点/介绍判断则填，否则空串）",
  "industary": ["行业标签数组，1~3个，如 \\"AI图像工具\\""],
  "website": "官网 URL（用户没给而根据资料推断得出也可填，无法判断留空串）",
  "slogan": "品牌口号，无则空串",
  "business_desc": "一句话业务概述（<=80字）",
  "description": "完整品牌画像段落：核心业务+公司背景+定价模式+目标客群+用户痛点，150~300字",
  "scripts": ["卖点话术短句 3~6 条，每条<=30字，可用于对外沟通"],
  "tone": {"style": "沟通调性词，如 专业/亲和", "persona": "品牌人设一句话"},
  "aliases": ["品牌常用简称/别名/英文名，0~4个"],
  "products": [{"name": "产品线/核心功能名", "category": "类目", "price_range": "价格带，未知填空串"}],
  "competitors": [{"name": "竞品名", "compet_point": "一句话竞争定位：品类 · 关键差异点，如 '电商AI设计工具 · 阿里旗下产品，电商场景强'"}, "3~6个"],
  "keywords": ["核心业务关键词（母词），4~8个"]
}`;

// 监控问题一律「行业中立」：不再产出 brand 口碑题（见 NEUTRAL_RULES）
const QUERIES_SCHEMA = `{
  "candidates": [{
    "query": "用户会向 AI 助手提问的完整问题（口语化、可检索）；必须是行业中立问法，不得出现品牌名",
    "weight": "该问题母词的预估搜索热度，1~10 整数，最热的给10，依次递减",
    "is_golden": "热度最高的前三条标 true，其余 false",
    "query_description": "分类标签，格式 '热度档 · 场景'，如 '高热度 · 工具选择'、'核心场景 · 科研绘图'",
    "user_friendly": "给用户看的问法（同样不得出现品牌名）",
    "platform_query": "投喂给 AI 引擎的实际问法（可与 user_friendly 相同，同样不得出现品牌名）"
  }, "6~10条，全部为行业中立问题"]
}`;

/** 品牌中立约束（提示词侧；代码侧另有 src/neutral.js 硬闸门兜底） */
const NEUTRAL_RULES = `【为什么必须中立】客户要测的是：行业里的真实用户问 AI 时，AI 会不会主动提到他的品牌。
问题里一旦带了品牌名，AI 必然顺着提到该品牌，提及率/排名/口碑全部失真（自问自答），监测就失去意义。
【硬性禁止】query / user_friendly / platform_query 三段文本里都不得出现：品牌名、品牌简称或别名、英文名、公司主体名、产品名。
  反例（禁止）：「XX怎么样，口碑好不好」「XX和YY哪个好用」「XX官网入口」
  正例（照此写）：「免费AI绘图工具哪个好用」「科研论文配图用什么工具画」「AI图生图工具有哪些推荐」
【角度覆盖】品类推荐 / 场景选型 / 功能对比 / 价格预算 / 避坑评价，尽量分散，不要都是「XX推荐」。
【用词】避免绝对化词（最好、第一、最强）与违规词。`;

function profilePrompts(input, site, evidence = '') {
  const sys = '你是品牌情报分析师。基于用户输入、官网抓取信息与联网检索证据，为「AI 搜索可见性监测」业务提取品牌档案。所有推断必须标注保守，不确定的字段留空，不要编造公司全称、融资、数据。';
  const siteBlock = site && site.ok
    ? `\n官网抓取（${site.url}）：\n标题：${site.title || '无'}\n描述：${site.description || '无'}\n正文摘录：${(site.text || '').slice(0, 3000) || '无'}`
    : '\n官网抓取：未提供或未成功';
  const evBlock = evidence
    ? `\n联网检索证据要点：\n${evidence.slice(0, 2500)}`
    : '';
  const user = `品牌名称：${input.brand_name || '未知'}\n官网：${input.website || '未提供'}\n用户补充介绍：${input.business_desc || '未提供'}${siteBlock}${evBlock}\n\n请输出结构化品牌档案。`;
  return { sys, user, schemaHint: PROFILE_SCHEMA };
}

function queriesPrompts(profile, keywords, limit, { forbidden = [], retryNote = '' } = {}) {
  const sys = '你是中文 AI 搜索行为研究专家。为一个品牌生成「行业里真实用户会向 AI 助手提的」监控问题候选集，'
    + '并按母词真实热度估计赋权（最热=10 递减）。所有问题必须与具体品牌无关——'
    + '模拟一个不认识该品牌的普通用户提问，用来观察 AI 会不会自己提到该品牌。\n\n' + NEUTRAL_RULES;
  const forbidLine = forbidden.length
    ? `\n【禁止出现的词】${forbidden.join('、')}（含大小写变体、简称与中英文混写）`
    : '';
  const user = `品牌（仅用于理解业务，禁止出现在问题里）：${profile.brand.name}\n行业：${(profile.profile.industry || []).join('、') || profile.brand.industry || '未知'}\n业务：${profile.brand.business_desc}\n竞品：${(profile.competitors || []).map(c => c.name).join('、') || '暂无'}\n核心母词：${(keywords || []).join('、')}${forbidLine}\n\n请生成最多 ${limit} 条监控问题候选。${retryNote}`;
  return { sys, user, schemaHint: QUERIES_SCHEMA };
}

function libraryPrompts(profile, candidates) {
  const sys = '你是品牌情报编辑。基于已确认的品牌档案与监控问题，撰写一篇内部情报文，供后续写作 Agent 引用。用中文，markdown 小节即可，不要虚构具体数字与客户案例。';
  const golden = (candidates || []).filter(c => c.is_golden).map(c => c.query).join('；');
  const user = `品牌：${profile.brand.name}（${profile.brand.business_desc}）\n画像：${profile.profile.description}\n卖点：${(profile.profile.scripts || []).join('；')}\n竞品及竞争点：${(profile.competitors || []).map(c => `${c.name}（${c.compet_point}）`).join('；')}\n核心监控问题：${golden || '无'}\n\n请写一篇《品牌口碑与市场处境》情报文（300~600字），含：市场处境、口碑风险点、相对竞品的叙事角度、对监控策略的建议。`;
  return { sys, user, jsonMode: false };
}

module.exports = { profilePrompts, queriesPrompts, libraryPrompts, PROFILE_SCHEMA, QUERIES_SCHEMA, NEUTRAL_RULES };
