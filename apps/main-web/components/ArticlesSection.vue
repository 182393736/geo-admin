<script setup lang="ts">
interface Article { cat: string; title: string; desc: string; date: string; hot?: boolean }
const cats = ['入门指南', '实战方法', '行业观察', '平台观察', '行业动态'];

const articles: Article[] = [
  { cat: '入门指南', title: 'GEO是什么：生成式引擎优化的定义与做法2026', desc: 'GEO 是生成式引擎优化的缩写，指让品牌信息更可能被 AI 生成的回答采信和引用。本文讲清它和 SEO 的根本区别、生成式引擎产生答案的四步流程、影响被采信的四个因素，以及效果验收的三个追问。', date: '2026-09-01' },
  { cat: '入门指南', title: 'AEO答案引擎优化是什么：和GEO、SEO的区别2026', desc: 'AEO、GEO、SEO 不是同义词：SEO 争位次，AEO 争答案位，GEO 争被采信。本文讲清三者的分界、AEO 的六条可自查清单、三个常见误区，以及效果该怎么分三层衡量。', date: '2026-09-01' },
  { cat: '实战方法', title: 'GEO竞品分析怎么做：看懂友商声量与话术2026', desc: '闷头写文章发文章是这个行业最贵的一种勤奋。竞品在做什么其实是能看到的——AI 点了谁、排第几、引用了什么信源，都可观测。本文讲怎么读战场态势、怎么用术语密度识别话术，以及验收服务商的六个具体问法。', date: '2026-08-31' },
  { cat: '行业观察', title: 'GEO可信信息传播与信息生态治理规范怎么落地2026', desc: 'T/CAPT 026—2026 国内首部 GEO 可信传播团体标准发布。本文拆解它为什么必要、四步怎么落地，以及甲方可以用它怎么检查服务商。', date: '2026-08-31' },
  { cat: '行业观察', title: '告别线索枯竭：B2B如何借GEO优化让AI搜索主动引用产品信息完成信任背书', desc: '一批企业买家把研究动作从搜索引擎搬到了 AI 对话框，候选名单在销售介入之前就已经成型。本文从行业数据、买家行为、搜索机制和落地方法四个维度展开。', date: '2026-08-31' },
  { cat: '行业观察', title: '生成式引擎优化（GEO）服务可信基本要求怎么用2026', desc: '信通院 AIIA/T 0277-2026 与 CAPT T/CAPT 026-2026 两份 GEO 标准同期落地。标准评的是服务商，甲方要的是验收依据。', date: '2026-08-31' },
  { cat: '行业动态', title: '2026最火的GEO监测工具！五大黄金选型标准，选对系统少走半年弯路', desc: '2026年 GEO 工具市场出现了两件事：一边是国际厂商拿到大额融资、传统 SEO 巨头被收购整合；另一边是国内服务商数量激增、报价从零元到几十万不等。本文给你六个可核验维度。', date: '2026-08-31' },
  { cat: '平台观察', title: 'GEO情感分析进阶：如何识别AI搜索答案里隐晦的品牌风险', desc: '在 GEO 日常运营工作中，绝大多数企业对在AI中的口碑分析还停留在简单的正向、中性、负向三元标签。但生成式大模型具备文本归纳能力，隐性风险识别更关键。', date: '2026-08-31' },
  { cat: '平台观察', title: '不会做GEO优化，你的品牌正在AI时代里慢慢贬值', desc: '生成式AI大规模普及之后，企业品牌的传播阵地已经从传统搜索引擎，延伸至大模型对话输出、AI 摘要、智能问答、Agent应用等全新场景。', date: '2026-08-31' },
];

const links = [
  'GEO监测工具怎么选2026：六个可核验维度，附免费试用验收法',
  'GEO推广怎么做？先花一次监测的钱，再决定投不投2026',
  'GEO服务商怎么自证效果？客户不认截图，认这三类数据2026',
  '十年运营老兵：我帮一家跨境电商ERP，把AI推荐率做到行业前列',
  'GEO公司推荐怎么看？选型指南与AI搜索流量影响2026',
  'B2B GEO推广：51%买家从AI开始选供应商2026',
  'GEO服务哪个靠谱？2026年买了没效果的原因排查',
  'GEO效果监测 2026：别只看排名，看这四个数据才能验收',
  'GEO优化公司效果怎么验收？客户只问这三个问题2026',
  'GEO选词别照搬SEO 2026：提问语义少，监测检测两回事',
  'GEO优化多少钱？2026报价：差别不在数字，在敢不敢复现',
  'CTO怎么看GEO预算2026：报告能不能进董事会',
];
</script>

<template>
  <section class="articles section">
    <div class="container">
      <h2 class="section-title">最新文章与资讯</h2>
      <p class="section-sub">GEO 行业洞察与实战方法论，持续更新</p>

      <div class="article-grid">
        <article v-for="a in articles" :key="a.title" class="article-card">
          <span class="a-cat">{{ a.cat }}</span>
          <h3 class="a-title">{{ a.title }}</h3>
          <p class="a-desc">{{ a.desc }}</p>
          <div class="a-foot">
            <span class="a-date">{{ a.date }}</span>
            <NuxtLink to="/articles" class="a-link">阅读全文&nbsp;→</NuxtLink>
          </div>
        </article>
      </div>

      <div class="more-block">
        <div class="more-label">更多</div>
        <div class="more-links">
          <NuxtLink v-for="l in links" :key="l" to="/articles" class="more-link">{{ l }}</NuxtLink>
        </div>
      </div>

      <div class="back-row">
        <NuxtLink to="/articles" class="back-btn">查看全部文章&nbsp;→</NuxtLink>
        <NuxtLink to="/news" class="back-btn back-btn--2">查看全部资讯&nbsp;→</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.articles { background: #fff; padding: 96px 0; }
.article-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-bottom: 44px; }
.article-card {
  background: #fff; border: 1px solid #ececf1; border-radius: 16px; padding: 24px 24px 20px;
  display: flex; flex-direction: column;
  transition: transform .18s ease, box-shadow .18s ease;
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(16, 24, 40, .06); }
}
.a-cat {
  display: inline-block; width: fit-content;
  font-size: 11.5px; font-weight: 600; color: #6366f1; background: #eef2ff;
  padding: 4px 10px; border-radius: 999px; margin-bottom: 14px;
}
.a-title {
  font-size: 16.5px; font-weight: 700; color: var(--ink); line-height: 1.45; margin: 0 0 10px;
}
.a-desc {
  font-size: 13px; color: #6b7280; line-height: 1.75; margin: 0 0 20px; flex: 1;
  display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.a-foot { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.a-date { font-size: 12px; color: #9ca3af; }
.a-link { font-size: 13.5px; font-weight: 600; color: #6366f1; &:hover { color: #4f46e5; } }

.more-block { border-top: 1px solid #f3f4f6; padding-top: 24px; margin-bottom: 40px; }
.more-label { font-size: 12.5px; font-weight: 600; color: #9ca3af; margin-bottom: 14px; }
.more-links { display: flex; flex-direction: column; gap: 8px; }
.more-link { font-size: 13.5px; color: #4b5563; transition: color .12s ease; &:hover { color: #6366f1; } }

.back-row { display: flex; justify-content: center; gap: 12px; }
.back-btn {
  padding: 0 26px; height: 44px; border-radius: 999px; display: inline-flex; align-items: center;
  background: #fff; border: 1px solid #e5e5ea; font-size: 14px; font-weight: 600;
  transition: all .15s ease;
  &:hover { border-color: #c7c7d1; }
  &--2 { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
}
</style>
