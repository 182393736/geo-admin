<script setup lang="ts">
import { GEO_SITE } from '~/utils/geo-seo'

definePageMeta({ layout: 'geo' })

useGeoHubPageSeo({
  title: '隐私政策｜HANYUAI GEO',
  description: '说明流量站收集的信息类型、用途与控制台登录跳转相关的数据处理边界。',
  keywords: '隐私政策,GEO隐私',
  path: '/privacy',
  breadcrumbs: [
    { name: '关于', path: '/about' },
    { name: '隐私政策', path: '/privacy' },
  ],
})
</script>

<template>
  <GeoHubPage eyebrow="信任" title="隐私政策" description="本页适用于 HANYUAI GEO 行业流量站（公开站）。控制台侧另有产品隐私说明。">
    <section class="hub-section">
      <h2>运营主体</h2>
      <p>
        本站由 <strong>{{ GEO_SITE.legalName }}</strong> 运营（产品品牌 {{ GEO_SITE.brand }}）。
        主体事实见 <NuxtLink to="/about">关于我们</NuxtLink>。
      </p>
    </section>
    <section class="hub-section">
      <h2>我们收集什么</h2>
      <p>访问日志（IP、UA、路径）、诊断表单中你主动提交的品牌名/官网，以及必要的分析 Cookie（若启用）。</p>
    </section>
    <section class="hub-section">
      <h2>用途</h2>
      <p>提供页面与诊断体验、改进内容、防止滥用。登录后的业务数据由控制台处理。</p>
    </section>
    <section class="hub-section">
      <h2>第三方</h2>
      <p>跳转控制台时会带 UTM 与回跳参数；不向无关第三方出售个人信息。</p>
    </section>
    <section class="hub-section">
      <h2>相关页面</h2>
      <p>
        <NuxtLink to="/terms">服务条款</NuxtLink> ·
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
