<script setup lang="ts">
definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '预约 GEO 产品演示｜HANYUAI GEO',
  description: '预约 HANYUAI GEO演示：可见性监测、引用源分析、Agent 与发稿闭环。演示与账号开通在控制台完成。',
  keywords: 'GEO演示,AI搜索监测演示,预约演示',
  path: '/demo',
})

const { toConsole } = useGeoConsoleLink()
</script>

<template>
  <GeoHubPage
    eyebrow="演示"
    title="预约产品演示"
    description="适合增长负责人、品牌与内容团队。演示中会走通：问题集 → 引擎采样 → 引用缺口 → 行动清单。"
    :diagnose-cta="true"
  >
    <section class="hub-section card">
      <div class="card-header">
        <div class="card-title">如何预约</div>
        <div class="card-description">
          流量站不自建 CRM。点击下方按钮进入控制台登录/注册，并带上演示意图参数；商务会按账号跟进。
        </div>
      </div>
      <div class="card-footer" style="gap:.75rem;flex-wrap:wrap">
        <a class="btn btn-default" :href="toConsole('/login?intent=demo', 'geo_demo')">登录并预约演示</a>
        <NuxtLink to="/diagnose" class="btn btn-outline">先做免费诊断</NuxtLink>
        <NuxtLink to="/tools" class="btn btn-ghost">浏览 GEO工具</NuxtLink>
      </div>
    </section>
    <section class="hub-section">
      <h2>演示会覆盖什么？</h2>
      <ol>
        <li>品牌实体与问题集如何配置</li>
        <li>多引擎可见性与竞品差距怎么读</li>
        <li>引用源缺口如何变成 brief 与发稿</li>
        <li>Agent 与报告中心的分工</li>
      </ol>
    </section>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.75rem; }
.hub-section h2 { font-size: 1.2rem; margin-bottom: 0.65rem; }
.hub-section li { line-height: 1.7; }
</style>
