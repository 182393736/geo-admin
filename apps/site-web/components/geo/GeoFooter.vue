<script setup lang="ts">
import { GEO_FUNCTIONAL_SLUGS, GEO_PRODUCT_PAGES } from '~/utils/geo-hub'
import { GEO_SITE } from '~/utils/geo-seo'

const sitePage = useSitePage()

const products = GEO_PRODUCT_PAGES.filter((p) =>
  (GEO_FUNCTIONAL_SLUGS as readonly string[]).includes(p.slug),
)

const brandName = computed(
  () =>
    sitePage.value?.site?.brandZh?.trim() ||
    sitePage.value?.site?.meta?.title?.trim() ||
    GEO_SITE.brand,
)

const companyName = computed(
  () => sitePage.value?.site?.companyZh?.trim() || '',
)

const beian = computed(() => sitePage.value?.site?.beian?.trim() || '')

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <NuxtLink to="/" class="brand" style="margin-bottom:.75rem">
            <span class="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
            </span>
            {{ brandName }}
          </NuxtLink>
          <p class="text-muted" style="font-size:.875rem;max-width:20rem">
            先看品牌在 AI 答案里的处境。这些功能都有免费额度。
          </p>
        </div>
        <div>
          <h4>产品</h4>
          <ul>
            <li v-for="p in products" :key="p.slug">
              <NuxtLink :to="`/tools/${p.slug}`">{{ p.title.split('｜')[0] }}</NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <h4>学习</h4>
          <ul>
            <li><NuxtLink to="/learn">GEO 学习中心</NuxtLink></li>
            <li><NuxtLink to="/learn/what-is-geo">什么是 GEO</NuxtLink></li>
            <li><NuxtLink to="/learn/geo-vs-seo-deep-dive">GEO 与 SEO</NuxtLink></li>
            <li><NuxtLink to="/glossary">术语表</NuxtLink></li>
            <li><NuxtLink to="/pricing">价格</NuxtLink></li>
            <li><NuxtLink to="/contact">联系我们</NuxtLink></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="legal">
          <span>© {{ year }} {{ brandName }}</span>
          <span v-if="companyName" class="sep" aria-hidden="true">·</span>
          <span v-if="companyName">{{ companyName }}</span>
          <template v-if="beian">
            <span class="sep" aria-hidden="true">·</span>
            <a
              class="beian"
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
            >{{ beian }}</a>
          </template>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.legal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.5rem;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
}
.sep { opacity: 0.55; }
.beian {
  color: inherit;
  text-decoration: none;
}
.beian:hover {
  color: hsl(var(--foreground));
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
