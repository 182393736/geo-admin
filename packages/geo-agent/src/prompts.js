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

const QUERIES_SCHEMA = `{
  "candidates": [{
    "query": "用户会向 AI 助手提问的完整问题（口语化、可检索）",
    "query_type": "industry=行业排名/工具推荐类 | brand=品牌口碑类",
    "weight": "该问题母词的预估搜索热度，1~10 整数，最热的给10，依次递减",
    "is_golden": "热度最高的前三条标 true，其余 false",
    "query_description": "分类标签，格式 '热度档 · 场景'，如 '高热度 · 工具选择'、'核心场景 · 科研绘图'",
    "user_friendly": "给用户看的问法",
    "platform_query": "投喂给 AI 引擎的实际问法（可与 user_friendly 相同）"
  }, "6~10条，industry 为主，brand 1~2 条"]
}`;

function profilePrompts(input, site) {
  const sys = '你是品牌情报分析师。基于用户输入与官网抓取信息，为「AI 搜索可见性监测」业务提取品牌档案。所有推断必须标注保守，不确定的字段留空，不要编造公司全称、融资、数据。';
  const siteBlock = site && site.ok
    ? `\n官网抓取（${site.url}）：\n标题：${site.title || '无'}\n描述：${site.description || '无'}\n正文摘录：${(site.text || '').slice(0, 3000) || '无'}`
    : '\n官网抓取：未提供或未成功';
  const user = `品牌名称：${input.brand_name || '未知'}\n官网：${input.website || '未提供'}\n用户补充介绍：${input.business_desc || '未提供'}${siteBlock}\n\n请输出结构化品牌档案。`;
  return { sys, user, schemaHint: PROFILE_SCHEMA };
}

function queriesPrompts(profile, keywords, limit) {
  const sys = '你是中文搜索行为专家。为一个品牌生成「用户真正会问 AI 助手」的监控问题候选集，并按母词真实热度估计赋权（最热=10 递减）。问题要能引出品牌/竞品对比，避免自问自答式。';
  const user = `品牌：${profile.brand.name}\n行业：${(profile.profile.industry || []).join('、') || profile.brand.industry || '未知'}\n业务：${profile.brand.business_desc}\n竞品：${(profile.competitors || []).map(c => c.name).join('、') || '暂无'}\n核心母词：${(keywords || []).join('、')}\n\n请生成最多 ${limit} 条监控问题候选。`;
  return { sys, user, schemaHint: QUERIES_SCHEMA };
}

function libraryPrompts(profile, candidates) {
  const sys = '你是品牌情报编辑。基于已确认的品牌档案与监控问题，撰写一篇内部情报文，供后续写作 Agent 引用。用中文，markdown 小节即可，不要虚构具体数字与客户案例。';
  const golden = (candidates || []).filter(c => c.is_golden).map(c => c.query).join('；');
  const user = `品牌：${profile.brand.name}（${profile.brand.business_desc}）\n画像：${profile.profile.description}\n卖点：${(profile.profile.scripts || []).join('；')}\n竞品及竞争点：${(profile.competitors || []).map(c => `${c.name}（${c.compet_point}）`).join('；')}\n核心监控问题：${golden || '无'}\n\n请写一篇《品牌口碑与市场处境》情报文（300~600字），含：市场处境、口碑风险点、相对竞品的叙事角度、对监控策略的建议。`;
  return { sys, user, jsonMode: false };
}

module.exports = { profilePrompts, queriesPrompts, libraryPrompts, PROFILE_SCHEMA, QUERIES_SCHEMA };
