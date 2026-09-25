<script setup lang="ts">
import { GEO_SITE } from '~/utils/geo-seo'
import { GEO_CONTENT_STAMP } from '~/utils/content/authors'

definePageMeta({ layout: 'geo' })

const sitePage = useSitePage()
const siteUrl = useGeoSiteUrl()

const legalName = computed(
  () => sitePage.value?.site?.companyZh?.trim() || GEO_SITE.legalName,
)
const beian = computed(() => sitePage.value?.site?.beian?.trim() || GEO_SITE.beian)
const brandName = computed(
  () =>
    sitePage.value?.site?.brandZh?.trim() ||
    GEO_SITE.brand,
)

useGeoHubPageSeo({
  title: `关于 ${GEO_SITE.brand}｜主体、产品分工与公开原则`,
  description: `${GEO_SITE.brand} 由 ${GEO_SITE.legalName} 运营。本站提供 GEO 教育、方法报告与免费诊断入口；深度监测与计费在控制台完成。`,
  keywords: '关于HANYUAI GEO,GEO公司主体,生成式引擎优化,成都云冕',
  path: '/about',
  type: 'article',
  datePublished: GEO_CONTENT_STAMP.datePublished,
  dateModified: GEO_CONTENT_STAMP.dateModified,
  breadcrumbs: [{ name: '关于', path: '/about' }],
  faqs: [
    {
      q: `${GEO_SITE.brand} 的法律主体是谁？`,
      a: `运营主体为${GEO_SITE.legalName}，网站备案号为${GEO_SITE.beian}。产品品牌为 ${GEO_SITE.brand}，与主体全称同时出现时以主体全称为准。`,
    },
    {
      q: '本站和控制台是什么关系？',
      a: '本站负责公开内容、术语、方法报告与免费轻诊断；登录后的监测、计费、Agent 与项目数据在控制台处理。',
    },
  ],
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        '@id': `${siteUrl.value}/about#aboutpage`,
        url: `${siteUrl.value}/about`,
        name: `关于 ${brandName.value}`,
        description: `${brandName.value} 的主体信息、产品分工与公开原则。`,
        inLanguage: 'zh-CN',
        isPartOf: { '@id': `${siteUrl.value}/#website` },
        about: { '@id': `${siteUrl.value}/#organization` },
        mainEntity: { '@id': `${siteUrl.value}/#organization` },
        publisher: { '@id': `${siteUrl.value}/#organization` },
      }),
    },
  ],
}))
</script>

<template>
  <GeoHubPage
    eyebrow="关于"
    :title="`关于 ${brandName}`"
    description="可索引的行业内容 + 可验证的产品工作台。下面写清谁在运营、本站做什么、以及我们公开承诺的边界。"
  >
    <section class="hub-section">
      <h2>运营主体</h2>
      <p>
        <strong>{{ brandName }}</strong>
        为产品品牌名；本站运营主体为
        <strong>{{ legalName }}</strong>。
      </p>
      <ul>
        <li>主体全称：{{ legalName }}</li>
        <li>
          ICP 备案：
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
          >{{ beian }}</a>
        </li>
        <li>联系邮箱：<a :href="`mailto:${GEO_SITE.email}`">{{ GEO_SITE.email }}</a></li>
        <li>商务合作：<a :href="`mailto:${GEO_SITE.partnerEmail}`">{{ GEO_SITE.partnerEmail }}</a></li>
      </ul>
      <p class="note">
        页脚、隐私政策与 Organization schema 均使用同一主体全称与备案号；若后台 CMS 配置了公司名/备案，以前台展示值为准。
      </p>
    </section>

    <section class="hub-section">
      <h2>本站与控制台怎么分工</h2>
      <p>
        本站（geo.hanyuai.com）负责获客、GEO 教育、术语、公开方法报告与免费轻诊断入口。
        登录后的深度监测、计费、Agent 会话与项目数据在控制台完成，不在本站持久化工作台访问令牌。
      </p>
      <ul>
        <li>公开学习：<NuxtLink to="/learn">学习中心</NuxtLink>、<NuxtLink to="/glossary">术语表</NuxtLink></li>
        <li>方法权威：<NuxtLink to="/reports/ai-visibility-baseline-2026-q3">可复核基线方法报告</NuxtLink></li>
        <li>免费入口：<NuxtLink to="/diagnose">诊断</NuxtLink>、<NuxtLink to="/tools">工具</NuxtLink>、<NuxtLink to="/pricing">价格</NuxtLink></li>
      </ul>
    </section>

    <section class="hub-section">
      <h2>我们公开承诺的原则</h2>
      <ul>
        <li>不虚构评分、排行榜名次或未授权客户成绩</li>
        <li>方法报告公开问题集版本、引擎名单、采样窗口与局限声明</li>
        <li>指标口径与产品模块文案尽量与控制台对齐，变更时更新本站说明</li>
        <li>免费诊断只读采样，不修改客户站点、不索取服务器凭据</li>
      </ul>
    </section>

    <section class="hub-section">
      <h2>信任与合规入口</h2>
      <p>实体事实以本页为准；数据处理与使用边界见下列页面：</p>
      <ul>
        <li><NuxtLink to="/privacy">隐私政策</NuxtLink> — 访问日志、诊断表单与 Cookie 边界</li>
        <li><NuxtLink to="/terms">服务条款</NuxtLink> — 公开内容与轻诊断的参考性质</li>
        <li><NuxtLink to="/security">安全说明</NuxtLink> — 流量站与控制台的安全边界</li>
        <li><NuxtLink to="/contact">联系我们</NuxtLink> — 商务与演示预约</li>
      </ul>
    </section>
  </GeoHubPage>
</template>

<style scoped>
.hub-section { margin-top: 1.75rem; }
.hub-section h2 { font-size: 1.15rem; margin-bottom: 0.55rem; }
.hub-section p,
.hub-section li { line-height: 1.75; color: #3f3b46; }
.hub-section ul {
  margin: 0.4rem 0 0;
  padding-left: 1.15rem;
}
.hub-section li { margin: 0 0 0.4rem; }
.hub-section a {
  color: #c2410c;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.note {
  margin-top: 0.85rem;
  font-size: 0.9rem;
  color: #6e6a76 !important;
}
</style>
