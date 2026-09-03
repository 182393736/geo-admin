<template>
  <div class="periodic-report-page">
    <!-- ============ 1. 头部 header.rp-page-header ============ -->
    <header class="rp-page-header">
      <div>
        <h1>报告</h1>
        <p>当前品牌：佛山市宏祥家具实业有限公司 · 周报 每周日截止、月报 每月月末截止后次日自动生成</p>
      </div>
      <button class="rp-template-trigger">报告模板 标准版</button>
    </header>

    <!-- ============ 2. 品牌卡片 + 快捷动作 section.ov2-top2 ============ -->
    <section class="ov2-top2">
      <!-- 左：品牌卡片 -->
      <div class="ov2-hero">
        <div class="ov2-hero-top">
          <div class="ov2-mark">佛</div>
          <div class="ov2-hero-id">
            <div class="ov2-brand">
              佛山市宏祥家具实业有限公司
              <span class="ov2-live normal" title="采集槽位 35/35，完整度 100.0%"><i></i>采集正常</span>
            </div>
            <div class="ov2-meta">
              <span class="ov2-mchip pri">公共家具制造</span>
              <span class="ov2-mchip">未设置官网</span>
              <button type="button" class="ov2-mchip">2 个识别词</button>
              <button type="button" class="ov2-mchip">8 个监控问题</button>
              <button type="button" class="ov2-mchip">6 个竞品</button>
            </div>
          </div>
          <button type="button" class="ov2-hero-link">品牌档案
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
        <div class="ov2-facts2">
          <div class="ov2-fact"><b>40</b><span>当日采集查询</span></div>
          <div class="ov2-fact"><b>196</b><span>引用源</span></div>
          <div class="ov2-fact"><b>0</b><span>已发稿件</span></div>
          <span class="ov2-upd">统计日期 2026-08-28 · 更新于 2026-08-29 13:03</span>
        </div>
      </div>
      <!-- 右：快捷动作 -->
      <div class="ov2-actcard">
        <div class="ov2-actcard-head">快捷动作</div>
        <button class="ov2-tile">
          <div class="ov2-tile-ic">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
          </div>
          <div class="ov2-tile-body">
            <div>挖掘监控问题</div>
            <div>对话式补全监测面</div>
          </div>
        </button>
        <button class="ov2-tile">
          <div class="ov2-tile-ic">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </div>
          <div class="ov2-tile-body">
            <div>AI 撰写稿件</div>
            <div>写作 Agent · 挂载知识库</div>
          </div>
        </button>
        <button class="ov2-tile">
          <div class="ov2-tile-ic">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
          </div>
          <div class="ov2-tile-body">
            <div>信源库</div>
            <div>监控 × 价格 · 按被引成本推荐</div>
          </div>
        </button>
        <button class="ov2-tile">
          <div class="ov2-tile-ic">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-5"/></svg>
          </div>
          <div class="ov2-tile-body">
            <div>AI排名透视</div>
            <div>实时位次 · 逐题下钻</div>
          </div>
        </button>
      </div>
    </section>

    <!-- ============ 3. 周报/月报 Tabs + 元信息 section.rp-top ============ -->
    <section class="rp-top">
      <div class="rp-typeseg">
        <button class="on">周报</button>
        <button class="on">月报</button>
      </div>
      <span class="rp-pick-cur">8/17–8/23周报</span>
      <span class="rp-meta-sep">·</span>
      <span class="rp-meta-text">08-17 至 08-23</span>
      <span class="rp-latest">最新一期</span>
      <span class="rp-meta-sep">·</span>
      <span class="rp-meta-text">生成于 <b>2026-08-27 20:47</b></span>
      <span class="rp-meta-sep">·</span>
      <span class="rp-meta-text">模板 <b>标准版</b></span>
      <span class="rp-meta-sep">·</span>
      <span class="rp-meta-text"><b>6</b> 个模块</span>
      <button class="rp-download">导出报告</button>
    </section>

    <!-- ============ 4. 内容模块 div.rp-modules ============ -->
    <div class="rp-modules">

      <!-- ===== Panel 1: 本期引用概况 ===== -->
      <section class="rp-modcard">
        <div class="rp-modcard-h">
          <span class="rp-modcard-ic">◎</span>
          <div>
            <div class="rp-modcard-t">本期引用概况</div>
            <div class="rp-modcard-s">AI 引擎采集分布 · 监控问题 / 查询量 / 引用源总量</div>
          </div>
        </div>
        <div class="rp-modcard-b">
          <div class="rp-m2">
            <div class="rp-m2-cols">
              <div class="rp-m2-endcol">
                <div class="rp-m2-pill rp-m2-e1"><span class="rp-m2-dot" style="background: rgb(100, 82, 255);"></span><span class="rp-m2-name">DeepSeek · 网页端</span></div>
                <div class="rp-m2-pill rp-m2-e2"><span class="rp-m2-dot" style="background: rgb(59, 130, 246);"></span><span class="rp-m2-name">豆包 · 网页端</span></div>
                <div class="rp-m2-pill rp-m2-e3"><span class="rp-m2-dot" style="background: rgb(236, 72, 153);"></span><span class="rp-m2-name">文心一言 · 网页端</span></div>
                <div class="rp-m2-pill rp-m2-e4"><span class="rp-m2-dot" style="background: rgb(245, 158, 11);"></span><span class="rp-m2-name">通义千问 · 网页端</span></div>
                <div class="rp-m2-pill rp-m2-e5"><span class="rp-m2-dot" style="background: rgb(6, 182, 212);"></span><span class="rp-m2-name">元宝 · 网页端</span></div>
              </div>
            </div>
            <div class="rp-m2-mid">
              <div class="rp-m2-hub">佛山</div>
              <div class="rp-m2-brand">佛山市宏祥家具实业有限公司 · 监控品牌</div>
              <div class="rp-m2-cap">监控问题 × AI 引擎 × 天</div>
            </div>
            <div class="rp-m2-col right">
              <div class="rp-m2-stat rp-m2-s1"><div class="rp-m2-sv">7</div><div class="rp-m2-sl">监控排名问题数量</div></div>
              <div class="rp-m2-stat rp-m2-s2"><div class="rp-m2-sv">1</div><div class="rp-m2-sl">监控口碑问题数量</div></div>
              <div class="rp-m2-stat rp-m2-s3"><div class="rp-m2-sv">40</div><div class="rp-m2-sl">本期查询量</div></div>
              <div class="rp-m2-stat rp-m2-s4"><div class="rp-m2-sv">534</div><div class="rp-m2-sl">引用源总量</div></div>
            </div>
          </div>
          <div class="rp-mon-note">查询量 = 本期实际采集到的「监控问题 × AI 引擎 × 天」去重条数；引用源 = 本期 AI 回答里出现过的来源域名，按域名去重</div>
        </div>
      </section>

      <!-- ===== Panel 2: 核心指标 ===== -->
      <section class="rp-modcard">
        <div class="rp-modcard-h">
          <span class="rp-modcard-ic">◴</span>
          <div>
            <div class="rp-modcard-t">核心指标</div>
            <div class="rp-modcard-s">四项主指标 + 五个 AI 引擎逐项环比（口径同 AI排名透视），显示周期内平均值。</div>
          </div>
        </div>
        <div class="rp-modcard-b">
          <div class="rep-current">
            <div class="rep-metrics">
              <div class="rep-metric"><div class="rep-metric-label">品牌提及率</div><div class="rep-metric-value">26.94%<em class="rep-delta flat">—</em></div></div>
              <div class="rep-metric"><div class="rep-metric-label">Top3 推荐率</div><div class="rep-metric-value">9.39%<em class="rep-delta flat">—</em></div></div>
              <div class="rep-metric"><div class="rep-metric-label">首位推荐率</div><div class="rep-metric-value">3.27%<em class="rep-delta flat">—</em></div></div>
              <div class="rep-metric"><div class="rep-metric-label">平均排名</div><div class="rep-metric-value">4.5<em class="rep-delta flat">—</em></div></div>
              <div class="rep-metric"><div class="rep-metric-label">口碑分</div><div class="rep-metric-value">72<em class="rep-delta flat">—</em></div></div>
              <div class="rep-metric"><div class="rep-metric-label">引用源数</div><div class="rep-metric-value">534<em class="rep-delta flat">—</em></div></div>
            </div>
            <div class="rp-emx">
              <div class="rp-emx-t">按 AI 引擎拆解 · 环比上期</div>
              <div class="rp-emx-h">
                <span>AI 引擎</span>
                <span>平均位次</span>
                <span>提及率</span>
                <span>Top3 推荐率</span>
                <span>首位推荐率</span>
              </div>
              <div class="rp-emx-r">
                <span class="rp-emx-n"><i style="background: rgb(100, 82, 255);"></i>DeepSeek</span>
                <span><b>#4.7</b><em class="flat">—</em></span>
                <span><b>28.57%</b><em class="flat">—</em></span>
                <span><b>8.16%</b><em class="flat">—</em></span>
                <span><b>0%</b><em class="flat">—</em></span>
              </div>
              <div class="rp-emx-r">
                <span class="rp-emx-n"><i style="background: rgb(59, 130, 246);"></i>豆包</span>
                <span><b>#3.4</b><em class="flat">—</em></span>
                <span><b>12.25%</b><em class="flat">—</em></span>
                <span><b>4.08%</b><em class="flat">—</em></span>
                <span><b>2.04%</b><em class="flat">—</em></span>
              </div>
              <div class="rp-emx-r">
                <span class="rp-emx-n"><i style="background: rgb(236, 72, 153);"></i>文心一言</span>
                <span><b>#2.9</b><em class="flat">—</em></span>
                <span><b>34.7%</b><em class="flat">—</em></span>
                <span><b>18.37%</b><em class="flat">—</em></span>
                <span><b>8.17%</b><em class="flat">—</em></span>
              </div>
              <div class="rp-emx-r">
                <span class="rp-emx-n"><i style="background: rgb(245, 158, 11);"></i>通义千问</span>
                <span><b>#2.3</b><em class="flat">—</em></span>
                <span><b>22.45%</b><em class="flat">—</em></span>
                <span><b>12.25%</b><em class="flat">—</em></span>
                <span><b>4.08%</b><em class="flat">—</em></span>
              </div>
              <div class="rp-emx-r">
                <span class="rp-emx-n"><i style="background: rgb(6, 182, 212);"></i>元宝</span>
                <span><b>#5.6</b><em class="flat">—</em></span>
                <span><b>36.74%</b><em class="flat">—</em></span>
                <span><b>4.08%</b><em class="flat">—</em></span>
                <span><b>2.04%</b><em class="flat">—</em></span>
              </div>
            </div>
            <div class="rp-emx-note">口径同「AI排名透视」：提及率 = 被提及的采样占比（不限位次） · Top3 推荐率 = 进入前三的采样占比 · 首位推荐率 = 排到首位的采样占比；一次采样 = 单个监控问题 × 单个引擎 × 单次监测</div>
          </div>
        </div>
      </section>

      <!-- ===== Panel 3: 竞争格局 ===== -->
      <section class="rp-modcard">
        <div class="rp-modcard-h">
          <span class="rp-modcard-ic">⚑</span>
          <div class="rp-modcard-t">竞争格局</div>
          <div class="rp-modcard-s">竞品透视</div>
        </div>
        <div class="rp-modcard-b">
          <div class="rp-cp">
            <div class="rp-cp-h">
              <span>#</span><span>品牌</span><span>环比</span><span>提及率</span><span>Top3 推荐率</span><span>首位提及率</span>
            </div>
            <div class="rp-cp-r" v-for="(row, i) in competitors" :key="i">
              <span class="rp-cp-i">{{ i + 1 }}</span>
              <span class="rp-cp-n">{{ row.brand }}</span>
              <em class="flat">—</em>
              <span class="rp-cp-g">{{ row.rate }}</span>
              <span class="rp-cp-g">{{ row.top3 }}</span>
              <span class="rp-cp-g">{{ row.first }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== Panel 4: 信源引用趋势 ===== -->
      <section class="rp-modcard">
        <div class="rp-modcard-h">
          <span class="rp-modcard-ic">⇅</span>
          <div>
            <div class="rp-modcard-t">信源引用趋势</div>
            <div class="rp-modcard-s">本期引用源增减、Top 平台被引变化与可投放标记</div>
          </div>
          <div class="rp-modcard-link">
            <button type="button">引用源追溯
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
        <div class="rp-modcard-b">
          <div class="rp-sc-top">
            <div class="rp-sc-kpi"><b>534</b><span>命中信源平台数</span></div>
            <div class="rp-sc-kpi"><b class="flat">—</b><span>本期新增信源平台（全量 0）</span></div>
            <div class="rp-sc-kpi"><b class="flat">—</b><span>本期流失信源平台（全量 0）</span></div>
          </div>
          <div class="rp-sc">
            <div class="rp-sc-h">
              <span>信源平台</span>
              <span>本期被引</span>
              <span></span>
              <span>覆盖监控问题</span>
              <span>可投放</span>
            </div>
            <div class="rp-sc-r" v-for="(row, i) in citationPlatforms" :key="i">
              <span class="rp-sc-n">{{ row.platform }}</span>
              <span class="rp-sc-v"><b>{{ row.cited }}</b><em class="flat">—</em></span>
              <span class="rp-sc-bar"><i :style="{ width: row.bar + '%' }"></i></span>
              <span class="rp-sc-q">{{ row.cover }} 个</span>
              <span><em :class="row.placeable === '信源库内' ? 'ok' : ''">{{ row.placeable }}</em></span>
            </div>
          </div>
          <div class="rp-sc-mvgrid">
            <div class="rp-sc-mvcard up">
              <div class="rp-sc-mvhead">↗ 本期新进信源平台<b>0</b></div>
              <div class="rp-sc-mvchips"><em class="rp-sc-mvnone">本期无变化</em></div>
            </div>
            <div class="rp-sc-mvcard dn">
              <div class="rp-sc-mvhead">↘ 本期掉出信源平台<b>0</b></div>
              <div class="rp-sc-mvchips"><em class="rp-sc-mvnone">本期无变化</em></div>
            </div>
          </div>
          <div class="rp-sc-note">「可投放」= 该平台已收录进信源库、可直接下单发稿；未收录的平台可在信源库提交收录申请后投放</div>
        </div>
      </section>

      <!-- ===== Panel 5: 信源投放分析 ===== -->
      <section class="rp-modcard">
        <div class="rp-modcard-h">
          <span class="rp-modcard-ic">⌘</span>
          <div class="rp-modcard-t">信源投放分析</div>
          <div class="rp-modcard-s">各信源的发稿 / 发布 / 被引转化与积分成本效率</div>
          <div class="rp-modcard-link">信源库</div>
        </div>
        <div class="rp-modcard-b">
          <div class="rp-wbox solo">
            <div class="rp-chan h">
              <span>信源</span><span>发稿</span><span>已发布</span><span>被引</span>
            </div>
            <div class="rp-chan">
              <span>品牌网</span><span>1</span><span>1</span><span>0</span>
            </div>
          </div>
          <div class="rp-wcost">
            本期发稿消耗 <span class="rp-wcost-hl">✦ 850</span> 积分 · 折合每次被引 <span class="rp-wcost-hl">✦ 0</span> 积分；成本越低说明该信源在 AI 回答里越"顶用"
          </div>
        </div>
      </section>

      <!-- ===== Panel 6: 发稿明细 ===== -->
      <section class="rp-modcard">
        <div class="rp-modcard-h">
          <span class="rp-modcard-ic">☷</span>
          <div class="rp-modcard-t">发稿明细</div>
          <div class="rp-modcard-s">本期稿件清单与发布状态</div>
          <div class="rp-modcard-link">全部记录</div>
        </div>
        <div class="rp-modcard-b">
          <div class="rp-pubtb">
            <div class="rp-pubtb-h">
              <span>稿件</span><span>信源</span><span>状态</span><span>被引</span>
            </div>
            <div class="rp-pubtb-r">
              <span class="rp-pt-t">非遗豌杂面兵哥豌豆面怎么样？十二年从成都小店到百家连锁</span>
              <span>中国品牌网</span>
              <span class="rp-st ok">已发布</span>
              <span>—</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const competitors = ref([
  { brand: '育才控股', rate: '8.16%', top3: '7.35%', first: '6.53%' },
  { brand: '大丰实业', rate: '7.35%', top3: '5.31%', first: '4.08%' },
  { brand: '北京新奇耐特舞台设备有限公司', rate: '6.12%', top3: '4.49%', first: '3.67%' },
  { brand: '郦江科创', rate: '8.16%', top3: '6.94%', first: '1.22%' },
  { brand: '康迪 KANGDI', rate: '5.31%', top3: '4.49%', first: '2.45%' },
  { brand: '上海永乐座椅有限公司', rate: '4.08%', top3: '3.67%', first: '2.04%' },
  { brand: '广东英驰家具实业有限公司', rate: '7.76%', top3: '2.86%', first: '1.22%' },
  { brand: '河北润华体育器材制造有限公司', rate: '5.31%', top3: '2.86%', first: '2.04%' },
  { brand: '天坛玛金莎', rate: '5.71%', top3: '3.67%', first: '0.82%' },
  { brand: '河北骏盛金属制品有限公司', rate: '4.08%', top3: '2.86%', first: '1.63%' },
]);

const citationPlatforms = ref([
  { platform: '抖音', cited: '430', cover: '8', placeable: '信源库内', bar: 100 },
  { platform: '百度', cited: '428', cover: '8', placeable: '信源库内', bar: 100 },
  { platform: '大众网', cited: '190', cover: '7', placeable: '信源库内', bar: 44 },
  { platform: 'szbw6868.cn.china.cn', cited: '185', cover: '6', placeable: '未收录', bar: 43 },
  { platform: '百度百科', cited: '132', cover: '8', placeable: '信源库内', bar: 31 },
  { platform: '中国采购与招标网', cited: '122', cover: '8', placeable: '信源库内', bar: 28 },
  { platform: '中国政府采购网', cited: '118', cover: '7', placeable: '未收录', bar: 27 },
  { platform: '八方资源网', cited: '86', cover: '8', placeable: '信源库内', bar: 20 },
  { platform: '十大品牌网', cited: '85', cover: '8', placeable: '信源库内', bar: 20 },
  { platform: '1688', cited: '82', cover: '7', placeable: '未收录', bar: 19 },
  { platform: '哔哩哔哩', cited: '82', cover: '6', placeable: '信源库内', bar: 19 },
  { platform: '今日头条', cited: '77', cover: '8', placeable: '信源库内', bar: 18 },
  { platform: '搜狐', cited: '72', cover: '8', placeable: '信源库内', bar: 17 },
  { platform: '顺企网', cited: '68', cover: '8', placeable: '未收录', bar: 16 },
  { platform: '手机搜狐网', cited: '68', cover: '7', placeable: '信源库内', bar: 16 },
]);
</script>

<style lang="scss" scoped>
/* ================================================================
   报告页面 - 像素级复刻
   对标: geo.timus.cn/dashboard/overview
   精确CSS值来源: getComputedStyle
   ================================================================ */

.periodic-report-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 0 48px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #17182b;
}

/* ====== 1. 头部 ====== */
.rp-page-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;

  h1 {
    font-size: 25px;
    font-weight: 800;
    color: #17182b;
    line-height: 31.25px;
    margin: 0;
  }

  p {
    font-size: 12.5px;
    font-weight: 400;
    color: #8b8d9d;
    line-height: 20px;
    margin: 6px 0 0;
  }
}

.rp-template-trigger {
  font-size: 16px;
  font-weight: 400;
  color: #4f3fd3;
  background: #fff;
  border: 1px solid #e7e9f0;
  border-radius: 10px;
  padding: 8px 13px;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ====== 2. 品牌卡片 + 快捷动作 grid ====== */
.ov2-top2 {
  display: grid;
  grid-template-columns: 1fr 401px;
  gap: 16px;
  margin-bottom: 16px;
}

/* --- 品牌卡片 --- */
.ov2-hero {
  background: linear-gradient(126deg, #fff 42%, rgba(100, 82, 255, 0.075) 132%);
  border: 1px solid rgba(100, 82, 255, 0.16);
  border-radius: 14px;
  box-shadow: rgba(30, 31, 50, 0.05) 0px 2px 10px 0px;
  padding: 20px 22px 17px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ov2-hero-top {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 15px;
}

.ov2-mark {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, #8a7bff, #6452ff);
  color: #fff;
  font-size: 23px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ov2-hero-id {
  flex: 1;
  min-width: 0;
}

.ov2-brand {
  font-size: 22px;
  font-weight: 800;
  color: #17182b;
  line-height: 33px;
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
  margin: 0;
}

.ov2-live {
  font-size: 10.5px;
  font-weight: 700;
  color: #0fb5a6;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 5px;
  background: #e7f7f4;
  border-radius: 999px;
  padding: 3px 10px;

  i {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #0fb5a6;
  }
}

.ov2-meta {
  display: flex;
  align-items: normal;
  gap: 7px;
  margin-top: 9px;
  flex-wrap: wrap;
}

.ov2-mchip {
  font-size: 11.5px;
  font-weight: 700;
  color: #4f3fd3;
  background: #eeebff;
  border: 1px solid rgba(100, 82, 255, 0.22);
  border-radius: 999px;
  padding: 5px 11px;
  cursor: pointer;
  font-family: inherit;
  line-height: 11.5px;
}

.ov2-mchip.pri {
  /* same as above */
}

.ov2-hero-link {
  font-size: 12.5px;
  font-weight: 400;
  color: #626477;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 3px 0;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

/* --- 统计区 --- */
.ov2-facts2 {
  display: flex;
  flex-direction: row;
  gap: 0;
  padding-top: 15px;
  border-top: 1px solid #f0f1f5;
  align-items: flex-end;
  flex-wrap: nowrap;
  margin-top: auto;
}

.ov2-fact {
  display: block;
  padding-right: 20px;

  b {
    display: block;
    font-size: 21px;
    font-weight: 800;
    color: #17182b;
    line-height: 24.15px;
  }

  span {
    display: block;
    font-size: 11.5px;
    font-weight: 400;
    color: #8b8d9d;
    line-height: 1.4;
    margin-top: 2px;
  }
}

.ov2-upd {
  display: block;
  font-size: 11.5px;
  font-weight: 400;
  color: #8b8d9d;
  margin-left: auto;
  line-height: 1.4;
}

/* --- 快捷动作 --- */
.ov2-actcard {
  background: #fff;
  border: 1px solid #e7e9f0;
  border-radius: 14px;
  padding: 16px 16px 15px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.ov2-actcard-head {
  font-size: 12px;
  font-weight: 700;
  color: #626477;
  line-height: 1.4;
}

.ov2-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e7e9f0;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: rgba(100, 82, 255, 0.3);
    box-shadow: rgba(100, 82, 255, 0.08) 0px 2px 8px;
  }
}

.ov2-tile-ic {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eef2ff;
  color: #4f3fd3;
}

.ov2-tile-body {
  & > div:first-child {
    font-size: 13.5px;
    font-weight: 700;
    color: #17182b;
    line-height: 1.4;
  }

  & > div:last-child {
    font-size: 11.5px;
    font-weight: 400;
    color: #8b8d9d;
    line-height: 1.4;
    margin-top: 2px;
  }
}

/* ====== 3. 周报/月报 Tabs + 元信息 ====== */
.rp-top {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e7e9f0;
  border-radius: 14px;
  box-shadow: rgba(30, 31, 50, 0.05) 0px 2px 10px 0px;
}

.rp-typeseg {
  display: flex;
  gap: 3px;

  button {
    font-size: 13px;
    font-weight: 700;
    border-radius: 8px;
    padding: 7px 18px;
    cursor: pointer;
    font-family: inherit;
    border: none;
    line-height: 1.4;
    transition: background 0.15s, color 0.15s;

    &:first-child {
      color: #4f3fd3;
      background: #fff;
    }

    &:last-child {
      color: #626477;
      background: transparent;
    }
  }
}

.rp-pick-cur {
  font-size: 13px;
  font-weight: 600;
  color: #17182b;
  line-height: 1.4;
}

.rp-latest {
  font-size: 11px;
  font-weight: 700;
  color: #007a5e;
  line-height: 1.4;
}

.rp-meta-sep {
  font-size: 12px;
  color: #c8cad4;
  line-height: 1.4;
}

.rp-meta-text {
  font-size: 12px;
  color: #8b8d9d;
  line-height: 1.4;

  b {
    font-weight: 700;
    color: #414356;
  }
}

.rp-download {
  margin-left: auto;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  background: #17182b;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
  transition: background 0.15s;

  &:hover {
    background: #2a2d36;
  }
}

/* ====== 4. 模块卡片通用 ====== */
.rp-modules {
  display: flex;
  flex-direction: column;
}

.rp-modcard {
  background: #fff;
  border: 1px solid #e7e9f0;
  border-radius: 14px;
  box-shadow: rgba(30, 31, 50, 0.05) 0px 2px 10px 0px;
  margin-bottom: 16px;
  overflow: hidden;
}

.rp-modcard-h {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f1f5;
}

.rp-modcard-ic {
  font-size: 14px;
  color: #4f3fd3;
  line-height: 1;
}

.rp-modcard-t {
  font-size: 14.5px;
  font-weight: 800;
  color: #17182b;
  line-height: 1.4;
}

.rp-modcard-s {
  font-size: 11.5px;
  font-weight: 400;
  color: #8b8d9d;
  line-height: 1.4;
}

.rp-modcard-link {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: #626477;
  cursor: pointer;
  line-height: 1.4;

  button {
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    cursor: pointer;
    line-height: inherit;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0;
  }
}

.rp-modcard-b {
  padding: 16px 18px 18px;
}

.rp-note {
  font-size: 11.5px;
  color: #8b8d9d;
  line-height: 1.6;
  margin: 12px 0 0;
}

/* ====== Panel 1: 本期引用概况 ====== */
.rp-m2 {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 0 58px;
  justify-content: center;
  align-items: center;
  padding: 22px 28px;
  background: linear-gradient(115deg, #f6f3ff, #fdf2fb 48%, #f0f6ff);
}

.rp-m2-cols {
  display: flex;
  gap: 12px;
}

.rp-m2-endcol {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: normal;
}

.rp-m2-pill {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 16px;
  border: none;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 400;
  color: #17182b;
  background: rgba(255, 255, 255, 0.78);
  line-height: 24px;
  box-shadow: rgba(100, 82, 255, 0.08) 0px 2px 10px 0px;
  width: fit-content;
}

.rp-m2-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: block;
  flex-shrink: 0;
}

.rp-m2-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #414356;
}

.rp-m2-mid {
  display: block;
  text-align: center;
}

.rp-m2-hub {
  width: 62px;
  height: 62px;
  display: grid;
  align-items: center;
  justify-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #8a7bff, #6452ff);
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  margin: 0 auto;
  box-shadow: rgba(100, 82, 255, 0.35) 0px 10px 26px 0px, rgba(255, 255, 255, 0.55) 0px 0px 0px 7px;
}

.rp-m2-brand {
  font-size: 12.5px;
  font-weight: 800;
  color: #17182b;
  display: block;
  margin: 10px 0 0;
  text-align: center;
}

.rp-m2-cap {
  font-size: 10.5px;
  font-weight: 400;
  color: #8b8d9d;
  line-height: 15.75px;
  text-align: center;
  margin-top: 4px;
}

.rp-m2-col.right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.rp-m2-stat {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.78);
  border: none;
  border-radius: 100px;
  width: fit-content;
}

.rp-m2-sv {
  font-size: 18px;
  font-weight: 800;
  color: #17182b;
  line-height: 27px;
}

.rp-m2-sl {
  font-size: 11px;
  font-weight: 400;
  color: #8b8d9d;
}

.rp-mon-note {
  font-size: 11px;
  color: #8b8d9d;
  text-align: start;
  margin: 12px 0 0;
  line-height: 1.5;
}

/* ====== Panel 2: 核心指标 ====== */
.rep-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0;
  margin: 0 0 20px;
}

.rep-metric {
  display: block;
  padding: 14px 16px;
  border: 0 solid #17182b;
  border-radius: 10px;
  background: #f7f8fb;
  font-size: 16px;
}

.rep-metric-label {
  font-size: 12px;
  font-weight: 400;
  color: #8b8d9d;
  line-height: 18px;
}

.rep-metric-value {
  font-size: 21px;
  font-weight: 800;
  color: #17182b;
  line-height: 31.5px;
}

.rep-delta {
  font-size: 12px;
  font-weight: 700;
  color: #8b8d9d;
  font-style: normal;
  margin: 0;
  line-height: 18px;
}

.rp-emx {
  display: block;
  padding: 16px 0 0;
  margin: 20px 0 0;
}

.rp-emx-t {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #414356;
  margin: 0 0 11px;
  line-height: 18px;
}

.rp-emx-h {
  display: grid;
  grid-template-columns: 234px 195px 195px 195px 195px;
  gap: 12px;
  padding: 0 10px 9px;
  align-items: center;
  line-height: 16.5px;

  span {
    font-size: 11px;
    font-weight: 400;
    color: #8b8d9d;
    line-height: 16.5px;

    &:not(:first-child) {
      text-align: right;
    }
  }
}

.rp-emx-r {
  display: grid;
  grid-template-columns: 234px 195px 195px 195px 195px;
  gap: 12px;
  padding: 11px 10px;
  font-size: 16px;
  color: #17182b;
  align-items: center;
  line-height: 24px;

  > span:not(.rp-emx-n) {
    text-align: right;
  }

  .rp-emx-n {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    font-weight: 600;
    color: #414356;

    i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: block;
      flex-shrink: 0;
    }
  }

  b {
    font-size: 15px;
    font-weight: 800;
    color: #17182b;
  }

  em.flat {
    font-size: 11px;
    font-weight: 700;
    color: #8b8d9d;
    font-style: normal;
    margin: 2px 0 0;
    display: block;
  }
}

.rp-emx-note {
  font-size: 11px;
  color: #8b8d9d;
  margin: 12px 0 0;
  line-height: 18.15px;
  padding: 0;
}

/* ====== Panel 3: 竞争格局 ====== */
.rp-cp {
  display: flex;
  flex-direction: column;
}

.rp-cp-h {
  display: grid;
  grid-template-columns: 40px 1fr 60px 100px 100px 100px;
  padding: 10px 12px;
  background: #f5f6fa;
  border-radius: 8px;

  span {
    font-size: 11.5px;
    font-weight: 600;
    color: #5b606a;
    line-height: 1.4;
  }
}

.rp-cp-r {
  display: grid;
  grid-template-columns: 40px 1fr 60px 100px 100px 100px;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f1f5;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  .rp-cp-i {
    font-size: 13px;
    font-weight: 700;
    color: #8a8f9b;
    line-height: 1.4;
  }

  .rp-cp-n {
    font-size: 13px;
    font-weight: 500;
    color: #17182b;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .flat {
    font-size: 12px;
    color: #c8cad4;
    font-style: normal;
    line-height: 1.4;
  }

  .rp-cp-g {
    font-size: 13px;
    font-weight: 600;
    color: #414356;
    line-height: 1.4;
  }
}

/* ====== Panel 4: 信源引用趋势 ====== */
.rp-sc-top {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.rp-sc-kpi {
  display: block;
  padding: 13px 15px;
  background: #f7f8fb;
  border: 1px solid #f0f1f5;
  border-radius: 11px;

  b {
    font-size: 23px;
    font-weight: 800;
    color: #17182b;
    line-height: 34.5px;
    display: inline;
  }

  b.flat {
    color: #8b8d9d;
    font-style: normal;
  }

  span {
    font-size: 11.5px;
    font-weight: 400;
    color: #8b8d9d;
    line-height: 17.25px;
    margin-top: 4px;
    display: block;
  }
}

.rp-sc {
  display: block;
  padding: 0;
}

.rp-sc-h {
  display: grid;
  grid-template-columns: 3fr 92px 2fr 96px 82px;
  gap: 10px;
  padding: 0 10px 9px;
  align-items: center;
  font-size: 11px;
  line-height: 16.5px;

  span {
    font-size: 11px;
    font-weight: 400;
    color: #8b8d9d;
    line-height: 16.5px;
    display: block;

    &:nth-child(2),
    &:nth-child(4),
    &:nth-child(5) {
      text-align: right;
    }
  }
}

.rp-sc-r {
  display: grid;
  grid-template-columns: 3fr 92px 2fr 96px 82px;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #f0f1f5;
  align-items: center;
  line-height: 18.75px;

  &:last-child {
    border-bottom: none;
  }

  .rp-sc-n {
    font-size: 12.5px;
    font-weight: 600;
    color: #17182b;
    line-height: 18.75px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rp-sc-v {
    font-size: 12.5px;
    font-weight: 400;
    color: #17182b;
    line-height: 18.75px;
    display: block;

    b {
      font-size: 15px;
      font-weight: 800;
      color: #17182b;
      line-height: 22.5px;
    }

    em.flat {
      font-size: 11px;
      font-weight: 700;
      color: #8b8d9d;
      font-style: normal;
      line-height: 16.5px;
      margin-left: 5px;
    }
  }

  .rp-sc-bar {
    display: block;
    height: 6px;
    background: #e7e9f0;
    border-radius: 100px;
    overflow: hidden;

    i {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, #8a7bff, #6452ff);
      border-radius: 100px;
    }
  }

  .rp-sc-q {
    font-size: 12px;
    font-weight: 400;
    color: #626477;
    line-height: 18px;
    text-align: right;
  }

  .ok {
    font-size: 11px;
    font-weight: 700;
    color: #007a5e;
    font-style: normal;
    line-height: 16.5px;
    background: #e7f8f4;
    padding: 2px 8px;
    border-radius: 6px;
    display: inline-block;
  }

  em:not(.ok):not(.flat) {
    font-size: 11px;
    font-weight: 700;
    color: #8b8d9d;
    font-style: normal;
    line-height: 16.5px;
  }
}

.rp-sc-mvgrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.rp-sc-mvcard {
  border-radius: 12px;
  padding: 12px 14px;
  display: block;

  &.up {
    border: 1px solid rgba(15, 181, 166, 0.28);
    background: #f2fbf8;
  }

  &.dn {
    border: 1px solid rgba(255, 71, 87, 0.2);
    background: #fef4f4;
  }
}

.rp-sc-mvhead {
  font-size: 12px;
  font-weight: 800;
  line-height: 18px;

  b {
    font-weight: 800;
    margin-left: 4px;
  }
}

.rp-sc-mvcard.up .rp-sc-mvhead {
  color: #007a5e;
}

.rp-sc-mvcard.dn .rp-sc-mvhead {
  color: #ff4757;
}

.rp-sc-mvchips {
  margin-top: 4px;
}

.rp-sc-mvnone {
  font-size: 11.5px;
  font-weight: 400;
  color: #8b8d9d;
  font-style: normal;
  line-height: 17.25px;
}

.rp-sc-note {
  font-size: 11px;
  color: #8b8d9d;
  line-height: 18.15px;
  margin: 12px 0 0;
}

/* ====== Panel 5: 信源投放分析 ====== */
.rp-wbox.solo {
  display: flex;
  flex-direction: column;
}

.rp-chan {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 10px 12px;
  align-items: center;

  &.h {
    background: #f5f6fa;
    border-radius: 8px;

    span {
      font-size: 11.5px;
      font-weight: 600;
      color: #5b606a;
      line-height: 1.4;
    }
  }

  &:not(.h) {
    border-bottom: 1px solid #f0f1f5;

    span {
      font-size: 13px;
      color: #17182b;
      line-height: 1.4;
    }
  }
}

.rp-wcost {
  font-size: 12px;
  color: #8b8d9d;
  line-height: 1.6;
  margin-top: 12px;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 8px;
}

.rp-wcost-hl {
  font-size: 14px;
  font-weight: 800;
  color: #4f3fd3;
}

/* ====== Panel 6: 发稿明细 ====== */
.rp-pubtb {
  display: flex;
  flex-direction: column;
}

.rp-pubtb-h {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 10px 12px;
  background: #f5f6fa;
  border-radius: 8px;

  span {
    font-size: 11.5px;
    font-weight: 600;
    color: #5b606a;
    line-height: 1.4;
  }
}

.rp-pubtb-r {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 10px 12px;
  align-items: center;

  span {
    font-size: 13px;
    color: #17182b;
    line-height: 1.4;
  }

  .rp-pt-t {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rp-st.ok {
    font-size: 11.5px;
    font-weight: 600;
    color: #0fb5a6;
  }
}
</style>
