<script setup lang="ts">
import { GEO_SITE } from '~/utils/geo-seo'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '服务条款｜HANYUAI GEO',
  description: '使用本站内容与免费诊断即表示你理解公开信息的参考性质，深度能力以控制台协议为准。',
  keywords: '服务条款,GEO条款',
  path: '/terms',
  breadcrumbs: [
    { name: '关于', path: '/about' },
    { name: '服务条款', path: '/terms' },
  ],
})
</script>

<template>
  <GeoHubPage eyebrow="信任" title="服务条款" description="使用本站内容与免费诊断即表示你理解公开信息的参考性质，深度能力以控制台协议为准。">
    <section class="hub-section">
      <h2>运营主体</h2>
      <p>
        本站由 <strong>{{ GEO_SITE.legalName }}</strong> 运营（产品品牌 {{ GEO_SITE.brand }}）。
        详见 <NuxtLink to="/about">关于我们</NuxtLink>。
      </p>
    </section>
    <section class="hub-section">
      <h2>服务范围</h2>
      <p>本站提供 GEO 相关公开内容与轻诊断入口。付费功能、SLA 与数据处理协议在控制台签约后生效。</p>
    </section>
    <section class="hub-section">
      <h2>内容性质</h2>
      <p>公开文章、术语与方法报告供学习与引用参考；不构成对排名、提及率或商业结果的保证。</p>
    </section>
    <section class="hub-section">
      <h2>相关页面</h2>
      <p>
        <NuxtLink to="/privacy">隐私政策</NuxtLink> ·
        <NuxtLink to="/security">安全说明</NuxtLink> ·
        <NuxtLink to="/contact">联系我们</NuxtLink>
      </p>
    </section>
    <p class="meta">更新日期：2026-09-25</p>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.5rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.5rem; }
.hub-section p { line-height: 1.75; }
.hub-section a {
  color: #c2410c;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.meta { margin-top: 2rem; color: hsl(var(--muted-foreground)); font-size: 0.875rem; }
</style>
