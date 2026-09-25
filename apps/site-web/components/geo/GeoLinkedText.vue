<script setup lang="ts">
/** 解析段落中的 [文案](url) ；url 可为 https:// 或站内 /path */
const props = defineProps<{ text: string }>()

type Part = { text: string; href?: string; external?: boolean }

const parts = computed((): Part[] => {
  const src = props.text || ''
  const out: Part[] = []
  const re = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index) })
    const href = m[2]
    out.push({ text: m[1], href, external: /^https?:\/\//.test(href) })
    last = m.index + m[0].length
  }
  if (last < src.length) out.push({ text: src.slice(last) })
  return out.length ? out : [{ text: src }]
})
</script>

<template>
  <span class="linked">
    <template v-for="(part, i) in parts" :key="i">
      <a
        v-if="part.href && part.external"
        :href="part.href"
        target="_blank"
        rel="noopener noreferrer"
      >{{ part.text }}</a>
      <NuxtLink v-else-if="part.href" :to="part.href">{{ part.text }}</NuxtLink>
      <template v-else>{{ part.text }}</template>
    </template>
  </span>
</template>

<style scoped>
a {
  color: #c2410c;
  font-weight: 650;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
