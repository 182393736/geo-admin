<template>
  <div class="nw-root">
    <div class="nw-hero">
      <h1 class="nw-hero-title">今天想让 Agent 帮你做什么？</h1>
      <p class="nw-hero-sub">{{ modeCfg.sub }}</p>
      <div class="nw-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="nw-tab"
          :class="{ on: mode === tab.key }"
          @click="mode = tab.key"
        >
          <component :is="tab.icon" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="nw-chat-card" :class="{ sweep: starting }">
      <!-- 顶部 chips：写稿选题/平台；各模式余额 -->
      <div class="nw-chips-row">
        <template v-if="mode === 'writing'">
          <div class="nw-topic-wrap">
            <button type="button" class="nw-topic-btn" @click="topicOpen = !topicOpen">
              <span class="nw-topic-ic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>
              </span>
              <span class="nw-topic-tx">
                <span class="nw-topic-name">{{ selectedTopicLabel }}</span>
                <span class="nw-topic-sub">监控话题</span>
              </span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div v-if="topicOpen" class="nw-topic-menu">
              <button type="button" class="nw-topic-opt" @click="pickTopic(null)">不指定话题</button>
              <button
                v-for="q in topics"
                :key="q.query_id"
                type="button"
                class="nw-topic-opt"
                :class="{ on: selectedQueryId === q.query_id }"
                @click="pickTopic(q)"
              >{{ q.query }}</button>
              <div v-if="!topics.length" class="nw-topic-empty">暂无监控话题</div>
            </div>
          </div>
          <div class="nw-plat" role="group" aria-label="目标 AI 平台">
            <span class="nw-plat-label">优化平台</span>
            <button
              type="button"
              class="nw-plat-btn"
              :class="{ on: platform === 'doubao' }"
              :aria-pressed="platform === 'doubao'"
              @click="platform = 'doubao'"
            >豆包</button>
            <button
              type="button"
              class="nw-plat-btn"
              disabled
              title="DeepSeek 即将开放"
            >DeepSeek</button>
          </div>
        </template>
        <div class="nw-balance-wrap">
          <button type="button" class="nw-balance" title="查看积分明细 / 充值" @click="goCredits">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>
            <span class="nw-balance-label">可用余额</span>
            <span class="nw-balance-num">{{ balance }}</span>
          </button>
        </div>
      </div>

      <textarea
        ref="taRef"
        v-model="prompt"
        class="nw-textarea"
        :placeholder="modeCfg.placeholder"
        rows="3"
        @keydown="onKeydown"
      />

      <div class="nw-toolbar">
        <div class="nw-toolbar-left">
          <template v-if="mode === 'mining'">
            <button type="button" class="nw-tool-pill" @click="pickFile">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/></svg>
              上传文件
            </button>
            <button type="button" class="nw-tool-pill" @click="addLink">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              链接
            </button>
          </template>
          <template v-else-if="mode === 'writing'">
            <button type="button" class="nw-tool-pill" :class="{ 'has-file': !!refLink }" @click="addLink">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              {{ refLink ? '已添加链接' : '添加参考链接' }}
            </button>
            <button type="button" class="nw-tool-pill" :class="{ 'has-file': !!mimicFile }" @click="pickFile">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/></svg>
              {{ mimicFile || '上传仿写文章' }}
            </button>
          </template>
        </div>
        <div class="nw-toolbar-right">
          <button
            type="button"
            class="nw-submit-btn"
            :disabled="starting || (!canStart)"
            @click="start"
          >
            <svg v-if="starting" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="nw-spin"><path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 22v-4M19.07 19.07l-2.83-2.83M22 12h-4M19.07 4.93l-2.83 2.83"/></svg>
            <span>{{ starting ? '启动中…' : modeCfg.submit }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="agent-quick-section">
      <div class="agent-quick-label">{{ modeCfg.guide }}</div>
      <div class="agent-quick-grid" :class="{ 'cols-1': modeCfg.questions.length <= 4 && mode !== 'chat' }">
        <button
          v-for="(q, i) in modeCfg.questions"
          :key="i"
          type="button"
          class="agent-quick-question"
          :class="{ active: prompt === q }"
          @click="useQuestion(q)"
        >
          <span>{{ q }}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <input ref="fileRef" type="file" class="nw-hidden" @change="onFile" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { agentApi, type AgentChatMode } from '@/api/modules/agent';
import { userApi } from '@/api/modules/user';
import { monitorApi } from '@/api/modules/monitor';

const route = useRoute();
const router = useRouter();
const mode = ref<AgentChatMode>(
  (['chat', 'mining', 'writing'].includes(String(route.query.mode || ''))
    ? String(route.query.mode) as AgentChatMode
    : 'chat'),
);
const prompt = ref('');
const balance = ref(0);
const starting = ref(false);
const platform = ref('doubao');
const topics = ref<{ query_id: number; query: string }[]>([]);
const selectedQueryId = ref<number | null>(null);
const topicOpen = ref(false);
const refLink = ref('');
const mimicFile = ref('');
const taRef = ref<HTMLTextAreaElement | null>(null);
const fileRef = ref<HTMLInputElement | null>(null);

const IconMsg = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z' }),
]);
const IconSearch = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'm21 21-4.34-4.34' }),
  h('circle', { cx: 11, cy: 11, r: 8 }),
]);
const IconPen = () => h('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M13 21h8' }),
  h('path', { d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z' }),
]);

const tabs = [
  { key: 'chat' as const, label: '优化策略', icon: IconMsg },
  { key: 'mining' as const, label: '问题挖掘', icon: IconSearch },
  { key: 'writing' as const, label: '撰写稿件', icon: IconPen },
];

const MODES: Record<AgentChatMode, { sub: string; placeholder: string; submit: string; guide: string; questions: string[] }> = {
  chat: {
    sub: '查数据，找问题，制定优化计划',
    placeholder: '问我 GEO 表现、行业热点、信源选择或内容引用...',
    submit: '开始',
    guide: '大家在问',
    questions: [
      '分析一下提及率有什么波动？',
      '看看今天有什么热点？',
      '做豆包优化有哪些优质信源？',
      '做 DeepSeek 优化有哪些优质信源？',
      '什么样的内容更容易被豆包引用？',
      '什么样的内容更容易被 DeepSeek 引用？',
    ],
  },
  mining: {
    sub: '挖掘用户意图问题，优化问题库',
    placeholder: '说说你想挖什么，或直接开始',
    submit: '开始挖掘',
    guide: '大家在挖',
    questions: [
      '分析现状再挖新话题',
      '哪些监控问题该换掉了？',
      '竞品覆盖了我没覆盖的？',
      '口碑这段缺口大不大？',
    ],
  },
  writing: {
    sub: '创作高引用稿件',
    placeholder: '描述你想写的主题、目标读者和核心观点...',
    submit: '开始写稿',
    guide: '大家在写',
    questions: [
      '帮我出几个撰稿选题',
      '哪些问题排名靠后、该补稿？',
      '行业和竞品最近在写什么？',
      '口碑热词里能借哪些势？',
    ],
  },
};

const modeCfg = computed(() => MODES[mode.value]);
const selectedTopicLabel = computed(() => {
  if (!selectedQueryId.value) return '选择监控话题';
  return topics.value.find(t => t.query_id === selectedQueryId.value)?.query || '选择监控话题';
});
const canStart = computed(() => {
  if (mode.value === 'mining') return true;
  return !!prompt.value.trim();
});

watch(mode, () => {
  prompt.value = '';
  topicOpen.value = false;
});

function useQuestion(q: string) {
  prompt.value = q;
  taRef.value?.focus();
}

function pickTopic(q: { query_id: number; query: string } | null) {
  selectedQueryId.value = q ? q.query_id : null;
  if (q && !prompt.value.trim()) prompt.value = q.query;
  topicOpen.value = false;
}

function goCredits() {
  router.push('/dashboard/plan-upgrade');
}

function addLink() {
  const url = window.prompt('请输入参考链接');
  if (url && url.trim()) {
    refLink.value = url.trim();
    ElMessage.success('已添加参考链接');
  }
}

function pickFile() {
  fileRef.value?.click();
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  mimicFile.value = f.name.length > 12 ? `${f.name.slice(0, 10)}…` : f.name;
  ElMessage.success(`已选择 ${f.name}`);
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    start();
  }
}

async function start() {
  if (starting.value || !canStart.value) return;
  starting.value = true;
  try {
    const text = prompt.value.trim() || (mode.value === 'mining' ? '开始挖掘监控问题与潜在话题' : '');
    const data = await agentApi.start({
      mode: mode.value,
      prompt: text,
      platform: mode.value === 'writing' ? platform.value : undefined,
      query_id: mode.value === 'writing' ? selectedQueryId.value : undefined,
      ref_links: refLink.value ? [refLink.value] : undefined,
    });
    window.dispatchEvent(new CustomEvent('agent-sessions-changed'));
    await router.push(`/dashboard/writing/${data.session_id}`);
  } catch (err: any) {
    ElMessage.error(err?.message || '启动失败');
  } finally {
    starting.value = false;
  }
}

async function loadBalance() {
  try {
    const acc: any = await userApi.creditAccount();
    balance.value = Math.round(Number(acc?.available ?? acc?.balance ?? 0));
  } catch { /* ignore */ }
}

async function loadTopics() {
  try {
    const res: any = await monitorApi.queryList('all');
    const list = res?.list || [];
    topics.value = (Array.isArray(list) ? list : []).map((q: any) => ({
      query_id: Number(q.query_id ?? q.id),
      query: String(q.query || q.text || ''),
    })).filter((q: any) => q.query_id && q.query);
  } catch { topics.value = []; }
}

onMounted(() => {
  loadBalance();
  loadTopics();
});
</script>

<style lang="scss" scoped>
.nw-root {
  --primary: #6452ff;
  --primary-soft: #efecff;
  --primary-deep: #4a38e0;
  --ink: #111114;
  --ink-2: #3a3a45;
  --ink-3: #6e6e7a;
  --ink-4: #9a9aa6;
  --line: #ececf3;
  --line-soft: #f2f2f8;
  --bg-soft: #fafafe;
  margin: 0;
  min-height: 100%;
  background: #f8fafc;
  padding: 0 24px 48px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
}

.nw-hero {
  text-align: center;
  margin: 56px auto 28px;
  max-width: 760px;
}

.nw-hero-title {
  font-size: clamp(26px, 4vw, 42px);
  font-weight: 900;
  letter-spacing: -0.04em;
  margin: 0;
  color: var(--ink);
  line-height: 1.2;
}

.nw-hero-sub {
  margin: 10px 0 0;
  color: var(--ink-3);
  font-size: 13px;
  line-height: 1.6;
  min-height: 21px;
}

.nw-tabs {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 18px 0 0;
  flex-wrap: wrap;
}

.nw-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  color: #5b606a;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover { background: #f2f3f7; color: #0f1115; }
  &.on { background: #0f1115; color: #fff; }
  &.on:hover { background: #0f1115; }
}

.nw-chat-card {
  max-width: 760px;
  margin: 0 auto;
  min-height: 208px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1.5px solid #d8d8d8;
  border-radius: 18px;
  padding: 16px 18px 14px;
  box-shadow: rgba(0, 0, 0, 0.07) 0 2px 20px;
  transition: border-color 0.25s, box-shadow 0.25s;
  position: relative;

  &:focus-within {
    border-color: #c4b5fd;
    box-shadow: rgba(79, 70, 229, 0.08) 0 0 0 4px, rgba(0, 0, 0, 0.07) 0 2px 20px;
  }

  &.sweep {
    overflow: hidden;
    border-color: transparent !important;
  }
  &.sweep::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: conic-gradient(transparent 0deg, #a78bfa 60deg, #4f46e5 120deg, #3b82f6 180deg, #67e8f9 220deg, transparent 260deg);
    animation: nw-sweep-rot 1.4s linear infinite;
    z-index: 0;
    pointer-events: none;
  }
  &.sweep::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 16px;
    background: #fff;
    z-index: 1;
  }
  &.sweep > * { position: relative; z-index: 2; }
}

@keyframes nw-sweep-rot {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.nw-chips-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  align-items: center;
}

.nw-balance-wrap {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.nw-balance {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  background: #f3f0ff;
  border: 1px solid #e3deff;
  color: #6b5bd2;
  white-space: nowrap;
  font-family: inherit;
}

.nw-balance-label { color: #8a8398; }
.nw-balance-num {
  color: #6b5bd2;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  font-weight: 800;
}

.nw-topic-wrap { position: relative; }
.nw-topic-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px 5px 5px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e6e8ee;
  font-family: inherit;
  cursor: pointer;
}
.nw-topic-ic {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #6452ff 0%, #8a7aff 100%);
  flex-shrink: 0;
}
.nw-topic-tx {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
  gap: 1px;
  min-width: 0;
}
.nw-topic-name {
  font-size: 12.5px;
  font-weight: 500;
  color: #8a8f9b;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nw-topic-sub { font-size: 10.5px; font-weight: 500; color: #8a8f9b; }
.nw-topic-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  min-width: 260px;
  max-width: 360px;
  max-height: 280px;
  overflow: auto;
  background: #fff;
  border: 1px solid #ececf3;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 17, 21, 0.1);
  padding: 6px;
}
.nw-topic-opt {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 12.5px;
  color: #3a3a45;
  cursor: pointer;
  font-family: inherit;
  &:hover, &.on { background: #f5f3ff; color: #4a38e0; }
}
.nw-topic-empty { padding: 10px; font-size: 12px; color: #9a9aa6; }

.nw-plat {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border-radius: 12px;
  background: #f6f7fb;
  border: 1px solid #e7e8ef;
  flex-shrink: 0;
}
.nw-plat-label {
  padding: 0 6px;
  font-size: 10.5px;
  font-weight: 600;
  color: #8a8f9b;
}
.nw-plat-btn {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #6a6478;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  &.on {
    background: #fff;
    border-color: #e3deff;
    color: #4a38e0;
    box-shadow: 0 1px 3px rgba(15, 17, 21, 0.06);
  }
  &:disabled {
    color: #b4b7c1;
    cursor: not-allowed;
    opacity: 0.72;
  }
}

.nw-textarea {
  width: 100%;
  min-height: 56px;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 14.5px;
  color: var(--ink);
  background: transparent;
  line-height: 1.5;
  padding: 4px 4px 0;
  box-sizing: border-box;
  flex: 1;
  &::placeholder { color: var(--ink-4); }
}

.nw-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}
.nw-toolbar-left {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.nw-toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.nw-tool-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: #fff;
  font-size: 12px;
  color: var(--ink-3);
  font-family: inherit;
  cursor: pointer;
  transition: 0.18s;
  white-space: nowrap;
  &:hover {
    border-color: #c4b5fd;
    color: #4f46e5;
    background: #eef2ff;
  }
  &.has-file {
    border-color: #c4b5fd;
    color: #4f46e5;
    background: #eef2ff;
    font-weight: 600;
  }
}

@keyframes wm-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
@keyframes wm-pulse-ring {
  0% { box-shadow: rgba(139, 92, 246, 0.35) 0 0 0 0, rgba(79, 70, 229, 0.25) 0 2px 12px; }
  70% { box-shadow: rgba(139, 92, 246, 0) 0 0 0 6px, rgba(79, 70, 229, 0.25) 0 2px 12px; }
  100% { box-shadow: rgba(139, 92, 246, 0) 0 0 0 0, rgba(79, 70, 229, 0.25) 0 2px 12px; }
}

.nw-submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 13px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #6366f1 100%);
  color: #fff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.02em;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  animation: wm-pulse-ring 2.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  transition: opacity 0.2s, transform 0.15s;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.22) 50%, transparent 70%);
    transform: translateX(-100%);
    animation: wm-shimmer 2.8s ease-in-out infinite;
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 40%;
    background: linear-gradient(rgba(255, 255, 255, 0.15), transparent);
    pointer-events: none;
    border-radius: 13px 13px 0 0;
  }
  > span, > svg { position: relative; z-index: 1; }
  &:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
  &:active:not(:disabled) { opacity: 0.85; transform: translateY(0); }
  &:disabled { animation: none; opacity: 0.55; cursor: not-allowed; }
}

.nw-spin { animation: spin 1.2s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.agent-quick-section {
  max-width: 760px;
  margin: 20px auto 0;
}
.agent-quick-label {
  margin: 0 2px 9px;
  color: var(--ink-4);
  font-size: 12px;
  font-weight: 600;
}
.agent-quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  &.cols-1 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.agent-quick-question {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--ink-2);
  font-family: inherit;
  font-size: 12.5px;
  line-height: 1.45;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s, background 0.16s, color 0.16s, transform 0.16s;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  svg {
    flex-shrink: 0;
    color: var(--ink-4);
    transition: transform 0.16s, color 0.16s;
  }
  &:hover, &.active {
    border-color: #c4b5fd;
    background: #faf9ff;
    color: var(--primary-deep);
    transform: translateY(-1px);
    svg { color: var(--primary); transform: translateX(2px); }
  }
}

.nw-hidden { display: none; }

@media (max-width: 760px) {
  .agent-quick-grid { grid-template-columns: 1fr; }
}
</style>
