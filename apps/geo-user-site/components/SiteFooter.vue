<template>
  <footer id="contact">
    <div class="v2-wrap">
      <div class="foot-in">
  <div class="foot-brand">
    <div class="logo"><img class="logo-image" :src="logoSrc" alt="" aria-hidden="true"><span>透镜GEO</span></div>
    <p>北京时光不语科技有限公司是一家以技术为驱动的AI人工智能解决方案公司，为企业提供全域人工智能解决方案。</p>
  </div>
  <div class="foot-info">
    <div><b>电话</b><span>15611186501</span></div>
    <div><b>地址</b><span>北京市朝阳区广顺北大街17号北京市数字人基地三层</span></div>
    <div><b>产品</b><span><a href="/dashboard/overview" target="_blank" rel="noopener">透镜GEO</a> · <a href="https://xinghai.timus.cn" target="_blank" rel="noopener">星海智能体</a></span></div>
    <div><b>资源</b><span><a href="/resources">报告</a> · <a href="/articles">文章</a> · <a href="/news">资讯</a> · <a href="/ai">AI Instructions</a></span></div>
  </div>
      </div>
      <template v-if="variant!=='none'">
  <div class="foot-recent">
      <b>近期更新</b>
      <div class="foot-recent-list"><template v-if="variant==='articles'">
  <a href="/articles/7c1a6e3fd0b48592">GEO工具与服务商怎么选：四类生意的定价与能力边界对照</a><a href="/articles/6b19fb37fc54e86d">GEO是什么：生成式引擎优化的定义与做法2026</a><a href="/articles/87b74b11c7b80ba1">AEO答案引擎优化是什么：和GEO、SEO的区别2026</a><a href="/articles/eeb0fb12588d8be8">GEO竞品分析怎么做：看懂友商声量与话术2026</a><a href="/articles/82109cd09d76036f">GEO可信信息传播与信息生态治理规范怎么落地2026</a><a href="/articles/2c532af06b21c906">告别线索枯竭：B2B如何借GEO优化让AI搜索主动引用产品信息完成信任背书</a><a href="/articles/894e509d102d5829">生成式引擎优化（GEO）服务可信基本要求怎么用2026</a><a href="/articles/c48e03f09b3055aa">GEO监测工具怎么选2026：六个可核验维度，附免费试用验收法</a><a href="/articles/7ed7ad9093d6aefe">GEO推广怎么做？先花一次监测的钱，再决定投不投2026</a><a href="/articles/4489136590e0d717">GEO服务商怎么自证效果？客户不认截图，认这三类数据2026</a>
  </template><template v-else-if="variant==='news'">
  <a href="/news/72cc3aae5198cf3b">AI 搜索答案里的品牌歧视：全球品牌 73%，小众品牌仅 11%</a><a href="/news/ed31345a7004a4ff">爆红的GEO，市场规模到底有多大？是风口还是骗局？</a><a href="/news/b044c2f6c402ab9c">GEO运营实战丨透镜GEO数据监测与智能决策平台，如何用数据指导GEO运营优化</a><a href="/news/b4418e0f56ae3f1b">2026最火的GEO监测工具！五大黄金选型标准，选对系统少走半年弯路</a><a href="/news/0dcfb0b78d388c85">GEO情感分析进阶：如何识别AI搜索答案里隐晦的品牌风险</a><a href="/news/b098a30ef7613e84">不会做GEO优化，你的品牌正在AI时代里慢慢贬值</a><a href="/news/a8929b1b67bc4f35">十年运营老兵：我帮一家跨境电商ERP，把AI推荐率做到行业前列</a><a href="/news/6c4dcbaadc31418a">GEO公司推荐怎么看？选型指南与AI搜索流量影响2026</a><a href="/news/10ef597589a18e58">B2B GEO推广：51%买家从AI开始选供应商2026</a><a href="/news/fcca263377886b42">2026年国内专业GEO监控平台评测：助力品牌抢占AI“标准答案”</a>
  </template><template v-else>
  <a href="/articles/7c1a6e3fd0b48592">GEO工具与服务商怎么选：四类生意的定价与能力边界对照</a><a href="/news/72cc3aae5198cf3b">AI 搜索答案里的品牌歧视：全球品牌 73%，小众品牌仅 11%</a><a href="/news/ed31345a7004a4ff">爆红的GEO，市场规模到底有多大？是风口还是骗局？</a><a href="/news/b044c2f6c402ab9c">GEO运营实战丨透镜GEO数据监测与智能决策平台，如何用数据指导GEO运营优化</a><a href="/articles/6b19fb37fc54e86d">GEO是什么：生成式引擎优化的定义与做法2026</a><a href="/articles/87b74b11c7b80ba1">AEO答案引擎优化是什么：和GEO、SEO的区别2026</a><a href="/articles/eeb0fb12588d8be8">GEO竞品分析怎么做：看懂友商声量与话术2026</a><a href="/articles/82109cd09d76036f">GEO可信信息传播与信息生态治理规范怎么落地2026</a><a href="/articles/2c532af06b21c906">告别线索枯竭：B2B如何借GEO优化让AI搜索主动引用产品信息完成信任背书</a><a href="/articles/894e509d102d5829">生成式引擎优化（GEO）服务可信基本要求怎么用2026</a>
  </template></div>
      <div class="foot-recent-more"><a href="/articles">全部文章</a> · <a href="/news">全部资讯</a></div>
    </div>
  </template>
  <div class="foot-bottom">
  <span>© 2026 北京时光不语科技有限公司 版权所有</span>
  <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">京ICP备2025155669号-1</a>
      </div>
    </div>
  </footer>
</template>
<script setup lang="ts">
const logoSrc = '/i_e4fc38b37b.svg'

const route = useRoute()
// 页脚「近期更新」跟随版块：/articles 只列文章、/news 只列资讯、/ai 不显示
const variant = computed(() => {
  const p = route.path.replace(/\/$/, '') || '/'
  if (p === '/articles') return 'articles'
  if (p === '/news') return 'news'
  if (p === '/ai') return 'none'
  return 'mixed'
})
</script>
