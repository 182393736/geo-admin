<script setup lang="ts">
const props = withDefaults(defineProps<{
  consolePath: string
  placeholder?: string
  fillTemplate?: string
  submitLabel?: string
  chips?: string[]
}>(), {
  chips: () => [],
})

const prompt = ref('')
const submitting = ref(false)

const { isLoggedIn, goDash } = useGeoAuth()
const { open: openAuth } = useGeoAuthModal()

const loginLabel = computed(() => (isLoggedIn.value ? '进入工作台' : '登录后开始'))

function onLoginAction(e: Event) {
  e.preventDefault()
  if (isLoggedIn.value) {
    goDash()
    return
  }
  openAuth('wechat', 'start_card')
}

function fill(name: string) {
  prompt.value = props.fillTemplate
    ? props.fillTemplate.replaceAll('{brand}', name)
    : `我的品牌叫「${name}」。请分析它在豆包、DeepSeek、通义等 AI 搜索里是否被提及、排在什么位置、引用了谁。`
}

function appendLine(label: string) {
  const line = `${label}：`
  if (prompt.value.includes(line)) return
  prompt.value = prompt.value.trim() ? `${prompt.value.trim()}\n${line}` : line
}

async function start() {
  const text = prompt.value.trim()
  if (!text) return
  submitting.value = true
  const brand = text.replace(/^我的品牌叫「/, '').split('」')[0] || text.slice(0, 40)
  await navigateTo({ path: '/diagnose', query: { brand } })
}
</script>

<template>
  <div class="start">
    <form class="prompt" @submit.prevent="start">
      <textarea
        v-model="prompt"
        rows="4"
        :placeholder="placeholder || '例如：我的品牌叫「格力空调」，是空调品类里的头部品牌，官网是 www.gree.com，主要竞品是美的和海尔…'"
      />
      <div class="prompt-bar">
        <div class="tools">
          <button type="button" @click="appendLine('品牌')">加上品牌</button>
          <button type="button" @click="appendLine('官网')">加上官网</button>
          <button type="button" @click="appendLine('主要竞品')">写上竞品</button>
        </div>
        <div class="actions">
          <a class="ghost" href="#" @click="onLoginAction">{{ loginLabel }}</a>
          <button class="go" type="submit" :disabled="submitting || !prompt.trim()">
            {{ submitting ? '正在开始…' : (submitLabel || '开始免费分析') }}
          </button>
        </div>
      </div>
    </form>
    <div v-if="chips.length" class="chips">
      <span>快速填入</span>
      <button v-for="name in chips" :key="name" type="button" @click="fill(name)">{{ name }}</button>
    </div>
  </div>
</template>

<style scoped>
.start { width: 100%; }
.prompt {
  background: #fff;
  border: 0;
  border-radius: 20px;
  text-align: left;
  padding: 22px 22px 16px;
  box-shadow: 0 18px 50px rgba(22, 22, 26, 0.06), 0 0 0 1px rgba(22, 22, 26, 0.06);
}
.prompt textarea {
  display: block;
  width: 100%;
  border: 0;
  resize: none;
  outline: none;
  font: inherit;
  font-size: 15px;
  line-height: 1.7;
  color: #16161a;
  background: transparent;
  min-height: 96px;
  padding: 0;
}
.prompt textarea::placeholder { color: #9b97a3; }
.prompt textarea:focus-visible { outline: none; }
.prompt-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #efeff2;
}
.tools, .actions { display: flex; align-items: center; gap: 8px; }
.tools button, .chips button, .go, .ghost {
  font: inherit;
  cursor: pointer;
}
.tools button, .chips button, .ghost {
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #ececef;
  background: #f6f6f8;
  color: #16161a;
  font-size: 13px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.tools button:hover, .chips button:hover, .ghost:hover { background: #fff; }
.go:focus-visible, .ghost:focus-visible, .tools button:focus-visible, .chips button:focus-visible {
  outline: 2px solid #c2410c;
  outline-offset: 2px;
}
.go {
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: #c2410c;
  color: #fff;
  font-size: 14px;
  font-weight: 650;
}
.go:hover { background: #9a3412; }
.go:disabled { opacity: 0.4; cursor: not-allowed; }
.chips {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 0;
  color: #6e6a76;
  font-size: 13px;
}
.chips button { background: #fff; }
@media (max-width: 860px) {
  .prompt-bar, .actions, .tools { flex-direction: column; align-items: stretch; }
}
</style>
