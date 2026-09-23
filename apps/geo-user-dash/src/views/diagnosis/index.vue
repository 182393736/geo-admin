<template>
  <div class="geo-page">
    <div class="rcx">
      <div class="rcx-head">
        <h1>单次品牌诊断</h1>
        <p>无需订阅、无需建品牌，对任意品牌跑一次完整诊断 · 适合新品牌首测、提案打单</p>
      </div>

      <!-- Hero -->
      <div class="diag-hero">
        <div class="diag-hero-copy">
          <span class="diag-hero-eyebrow">单次品牌诊断 · 按积分计费</span>
          <h2 class="diag-hero-title">为任意品牌，即时跑出<br><em>一份完整的 AI 诊断报告</em></h2>
          <p class="diag-hero-lead">
            无需订阅、不必先建品牌，按需即跑。覆盖五大国产大模型的网页端，并支持 豆包 / DeepSeek / 通义千问 APP 端，输出品牌可见性、排名、引用源与竞品对比，几分钟生成一份可直接交付的 PDF 报告——新品牌上线前快速摸底，代理提案时拿一份有分量的诊断上桌。
          </p>
          <div class="diag-hero-cta">
            <button type="button" class="diag-hero-btn" @click="openWizard">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>
              立即诊断
            </button>
            <button type="button" class="diag-hero-btn ghost" @click="openCalc">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="18"/><line x1="8" y1="18" x2="12" y2="18"/></svg>
              费用计算器
            </button>
            <button type="button" class="diag-hero-btn ghost" @click="previewSample">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
              预览示例报告
            </button>
          </div>
          <div class="diag-hero-note">网页端 2 / APP 端 4(豆包 8) 积分 · 每监控问题·平台 · 100 积分起 · 折合 ¥0.1/积分</div>
          <div class="diag-hero-trust">
            <div>网页端 豆包 · DeepSeek · 文心一言 · 通义千问 · 元宝</div>
            <div>APP 端 豆包 · DeepSeek · 通义千问 · 预计 3 小时内出报告</div>
          </div>
        </div>
        <div class="diag-hero-visual">
          <div class="diag-card">
            <div class="diag-card-head">
              <div>
                <div class="diag-card-title">诊断报告</div>
                <div class="diag-card-sub">格力空调 · 网页端 + APP 端</div>
              </div>
              <span class="diag-card-tag">示例</span>
            </div>
            <div class="diag-card-score">
              <div class="diag-card-score-num">68<span>%</span></div>
              <div class="diag-card-score-label">AI 可见性<br>全端综合</div>
            </div>
            <div class="diag-bar-group">网页端</div>
            <div v-for="b in sampleBars" :key="b.name" class="diag-bar">
              <span class="diag-bar-name"><i :style="{ background: b.color }" />{{ b.name }}</span>
              <span class="diag-bar-track"><span class="diag-bar-fill" :style="{ width: b.val + '%', background: b.color }" /></span>
              <span class="diag-bar-val">{{ b.val }}%</span>
            </div>
            <div class="diag-bar-group">APP 端</div>
            <div class="diag-app-chips">
              <span v-for="c in sampleApps" :key="c.name" class="diag-app-chip"><i :style="{ background: c.color }" />{{ c.name }}</span>
            </div>
            <div class="diag-card-foot">
              <span>平均排名 <b>#3</b></span>
              <span>引用源 <b>156</b></span>
              <span>竞品差距 <b>+4%</b></span>
            </div>
          </div>
        </div>
      </div>

      <div class="diag-steps">
        <div v-for="s in steps" :key="s.no" class="diag-step">
          <span class="diag-step-no">{{ s.no }}</span>
          <div>
            <div class="diag-step-t">{{ s.t }}</div>
            <div class="diag-step-d">{{ s.d }}</div>
          </div>
        </div>
      </div>

      <div class="diag-includes">
        <div class="diag-inc-title">每份诊断报告包含</div>
        <div class="diag-inc-grid">
          <div v-for="inc in includes" :key="inc.t" class="diag-inc-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="inc.svg" />
            <div>
              <div class="diag-inc-t">{{ inc.t }}</div>
              <div class="diag-inc-d">{{ inc.d }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史任务 -->
      <div v-if="loading" class="rc-loading">加载中…</div>
      <template v-else-if="tasks.length">
        <div class="rcx-bar">
          <div class="rcx-filters">
            <button
              v-for="f in filters"
              :key="f.key"
              type="button"
              class="rcx-filter"
              :class="{ active: filter === f.key }"
              @click="filter = f.key"
            >{{ f.label }}</button>
          </div>
          <div class="rcx-bar-actions">
            <button type="button" class="rcx-ghost" @click="load">刷新</button>
            <button type="button" class="rcx-primary" @click="openWizard">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>
              立即诊断
            </button>
          </div>
        </div>
        <div
          v-for="t in filteredTasks"
          :key="t.diagnosis_id"
          class="rc-card"
          :class="{ active: isActive(t) }"
        >
          <div class="rc-card-head">
            <div>
              <div class="rc-card-brand">{{ brandName(t) }}</div>
              <div class="rc-card-id">{{ t.diagnosis_id }}</div>
              <div class="rc-card-meta">{{ formatTime(t.created_at) }} · {{ t.topic_count || '—' }} 话题 · ✦{{ t.credit_cost ?? '—' }}</div>
            </div>
            <div class="rc-card-spacer" />
            <span class="rc-chip" :class="statusMeta(t.status).cls">
              <span class="rc-chip-dot" />{{ statusMeta(t.status).label }}
            </span>
          </div>
          <div v-if="isQueued(t)" class="rc-card-queue">
            <div class="rc-q-row"><span>队列状态</span><b>排队中</b></div>
            <div class="rc-q-note">预计 3 小时内开始生成（高峰期可能排队）。可随时取消。</div>
          </div>
          <div v-if="isRunning(t)" class="rc-card-prog">
            <div class="rc-prog-head"><span>生成进度</span><b>{{ t.progress || 35 }}%</b></div>
            <div class="rc-prog-bar"><div class="rc-prog-fill" :style="{ width: `${t.progress || 35}%` }" /></div>
          </div>
          <div v-if="t.status === 'done' && t.result" class="rc-card-result">
            <div class="rc-res-score">
              <div class="rc-res-num">{{ (t.result as any).visibility ?? 68 }}<span>%</span></div>
              <div class="rc-res-lab">AI 可见性<br>全端综合</div>
            </div>
          </div>
          <div class="rc-card-acts">
            <span v-if="isQueued(t) || isRunning(t)" class="rc-eta">预计 3 小时内出报告</span>
            <div style="flex:1" />
            <button v-if="canCancel(t)" type="button" class="rc-act" @click="cancelTask(t)">取消</button>
            <button v-if="t.status === 'done'" type="button" class="rc-act primary" @click="previewSample">查看报告</button>
            <button type="button" class="rc-act" @click="openWizard">再次诊断</button>
          </div>
        </div>
      </template>
    </div>

    <!-- 费用计算器 / 下单确认 -->
    <div v-if="calcOpen" class="osw">
      <div class="modal-overlay visible" @click.self="calcOpen = false">
        <div class="modal-card calc-card">
          <div class="modal-header">
            <div>
              <div class="modal-title">{{ calcMode === 'pay' ? '确认诊断范围' : '费用计算器' }}</div>
              <div class="modal-sub">按引擎 × 终端估算积分消耗 · 网页端 2 / APP 端 4(豆包 8) 积分 / 监控问题·平台 · 100 积分起 · 仅供估价</div>
            </div>
            <button type="button" class="modal-close" @click="calcOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="calc-body">
            <div class="oneshot-wrap">
              <div class="oneshot-config">
                <div class="oneshot-section">
                  <div class="oneshot-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="7"/></svg>
                    诊断监控问题数量
                  </div>
                  <div class="oneshot-hint">本次诊断要覆盖的监控问题 / 关键词总数</div>
                  <div style="display:flex;align-items:center;flex-wrap:wrap;gap:10px">
                    <div class="oneshot-stepper">
                      <button type="button" class="oneshot-step-btn" @click="topicCount = Math.max(1, topicCount - 1)">−</button>
                      <input v-model.number="topicCount" class="oneshot-topic-input" min="1" type="number">
                      <button type="button" class="oneshot-step-btn" @click="topicCount += 1">+</button>
                    </div>
                    <div class="oneshot-quick">
                      <button v-for="n in [30, 50, 100]" :key="n" type="button" class="oneshot-quick-btn" @click="topicCount = n">{{ n }}</button>
                    </div>
                  </div>
                </div>
                <div class="oneshot-section">
                  <div class="oneshot-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    诊断平台 · 终端
                    <button type="button" class="oneshot-selall" @click="toggleAll">{{ allSelected ? '取消全选' : '全选' }}</button>
                  </div>
                  <div class="oneshot-hint">勾选每个 AI 引擎要诊断的终端,逐项单独计费(仅豆包 / DeepSeek / 通义千问开放 APP 端)</div>
                  <div class="calc-eng-list">
                    <div v-for="eng in engines" :key="eng.key" class="calc-eng-row">
                      <span class="calc-eng-name"><span class="oneshot-plat-dot" :style="{ background: eng.color }" />{{ eng.label }}</span>
                      <span class="calc-eng-ends">
                        <button type="button" class="calc-end-chip" :class="{ sel: isSel(eng.key, 'web') }" @click="toggleEnd(eng.key, 'web')">网页端 ✦2</button>
                        <button
                          v-if="eng.app"
                          type="button"
                          class="calc-end-chip"
                          :class="{ sel: isSel(eng.key, 'app') }"
                          @click="toggleEnd(eng.key, 'app')"
                        >APP 端 ✦{{ eng.key === 'doubao' ? 8 : 4 }}</button>
                        <span v-else class="calc-end-chip na">APP 端 · 暂无</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="oneshot-summary">
                <div class="oneshot-summary-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  费用预估
                </div>
                <div class="oneshot-sum-row"><span>诊断监控问题</span><span class="v">{{ topicCount }}</span></div>
                <div class="oneshot-sum-row"><span>引擎 · 终端</span><span class="v">网页端 {{ webCount }} · APP 端 {{ appCount }}</span></div>
                <div class="oneshot-sum-row"><span>查询次数</span><span class="v">{{ queryTimes }} 次</span></div>
                <div class="oneshot-formula">{{ topicCount }} 监控问题 × (网页端 {{ webCount }}×2 + APP 端 {{ appCostDetail }}) 积分</div>
                <div class="oneshot-sum-divider" />
                <div class="oneshot-total-label">预估消耗积分</div>
                <div class="oneshot-total"><span class="oneshot-total-cur">✦</span><span class="oneshot-total-num">{{ formatNum(estimate) }}</span></div>
                <div class="oneshot-total-yuan">≈ ¥{{ (estimate * 0.1).toFixed(0) }} · 按基准价 ¥0.1/积分</div>
                <button type="button" class="oneshot-pay-btn" :disabled="submitting || !selectedEnds.length" @click="submitDiagnosis">
                  {{ submitting ? '提交中…' : (calcMode === 'pay' ? '确认下单 →' : '去诊断 →') }}
                </button>
                <div class="oneshot-sum-foot">仅供估价,实际以诊断订单结算为准</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 立即诊断向导 -->
    <div v-if="wizOpen" class="osw">
      <div class="modal-overlay visible" @click.self="wizOpen = false">
        <div class="modal-card oneshot-wiz-card">
          <div class="modal-header">
            <div>
              <div class="modal-title">单次品牌诊断</div>
              <div class="modal-sub">选择诊断对象 → 配置话题 → 选平台结算 · 预计 3 小时内出报告 · 网页端 2 / APP端 4(豆包 8) 积分 / 话题·平台,100 积分起</div>
            </div>
            <button type="button" class="modal-close" @click="wizOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="wiz-body">
            <div class="wiz-q">确定您想诊断的品牌</div>
            <div class="wiz-choice-grid">
              <button type="button" class="wiz-choice" :class="{ active: brandMode === 'current' }" @click="brandMode = 'current'">
                <div class="wiz-choice-t">当前品牌</div>
                <div class="wiz-choice-d">诊断正在监测的品牌</div>
              </button>
              <button type="button" class="wiz-choice" :class="{ active: brandMode === 'new' }" @click="brandMode = 'new'">
                <div class="wiz-choice-t">新品牌</div>
                <div class="wiz-choice-d">创建一个未监测的品牌来诊断</div>
              </button>
            </div>
            <div v-if="brandMode === 'current'" class="wiz-bhero">
              <div class="wiz-bhero-top">
                <div class="wiz-bhero-logo">{{ brandInitial }}</div>
                <div class="wiz-bhero-id">
                  <div class="wiz-bhero-name">{{ currentBrandName }}</div>
                  <div class="wiz-bhero-meta">监测中</div>
                </div>
                <span class="wiz-bhero-badge">档案完整</span>
              </div>
              <div class="wiz-bhero-aliases-label">已登记别名 · AI 回答中出现这些名称都算作提及该品牌</div>
              <div class="wiz-bhero-aliases">
                <span v-for="a in brandAliases" :key="a" class="wiz-bhero-alias">{{ a }}</span>
                <span v-if="!brandAliases.length" class="wiz-bhero-alias">暂无别名</span>
              </div>
            </div>
            <div v-else class="wiz-bhero">
              <div class="oneshot-label" style="margin-bottom:8px">品牌名称</div>
              <input v-model="newBrandName" class="oneshot-topic-input" style="width:100%;height:40px;border:1px solid var(--line);border-radius:10px;padding:0 12px;text-align:left" placeholder="例如：格力空调">
            </div>
          </div>
          <div class="wiz-footer">
            <div class="wiz-footer-spacer" />
            <button type="button" class="wiz-btn ghost" @click="continueWithTopics('existing')">使用已监控的话题</button>
            <button type="button" class="wiz-btn" @click="continueWithTopics('new')">使用新的话题</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { diagnosisApi } from '@/api/modules/diagnosis';
import { brandApi } from '@/api/modules/brand';
import { monitorApi } from '@/api/modules/monitor';
import { useAuthStore } from '@/stores/auth';
import type { DiagnosisTaskItem } from '@/api/types';

const SAMPLE_URL = 'https://timus.cn/r/hOI0eC710ynTBx_O';
const auth = useAuthStore();

const sampleBars = [
  { name: '豆包', color: '#f59e0b', val: 74 },
  { name: 'DeepSeek', color: '#6366f1', val: 61 },
  { name: '文心一言', color: '#e91e63', val: 58 },
  { name: '通义千问', color: '#10b981', val: 70 },
  { name: '元宝', color: '#ef4444', val: 66 },
];
const sampleApps = [
  { name: '豆包', color: '#f59e0b' },
  { name: 'DeepSeek', color: '#6366f1' },
  { name: '通义千问', color: '#10b981' },
];
const steps = [
  { no: 1, t: '配置诊断范围', d: '选定诊断监控问题数量与要覆盖的大模型平台' },
  { no: 2, t: '按量付费', d: '按监控问题 × 平台消耗积分(网页端 2 / APP 端 4,豆包 APP 8),100 积分起,确认后进入诊断队列' },
  { no: 3, t: '生成报告', d: '预计 3 小时内交付完整可下载报告(高峰期可能排队)' },
];
const includes = [
  { t: '品牌可见性', d: '在各模型回答中的出现率与占位', svg: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>' },
  { t: '排名快照', d: '各监控问题下品牌的排序位置', svg: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>' },
  { t: '引用源分析', d: '模型引用了哪些内容与站点', svg: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' },
  { t: '竞品对比', d: '与主要竞品的可见性 / 排名差距', svg: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>' },
];

const engines = [
  { key: 'doubao', label: '豆包', color: '#f59e0b', app: true },
  { key: 'deepseek', label: 'DeepSeek', color: '#6366f1', app: true },
  { key: 'wenxin', label: '文心一言', color: '#e91e63', app: false },
  { key: 'qwen', label: '通义千问', color: '#10b981', app: true },
  { key: 'yuanbao', label: '元宝', color: '#ef4444', app: false },
];

type EndKey = `${string}:${'web' | 'app'}`;
const selectedEnds = ref<EndKey[]>([
  'doubao:web', 'doubao:app',
  'deepseek:web', 'deepseek:app',
  'wenxin:web',
  'qwen:web', 'qwen:app',
  'yuanbao:web',
]);
const topicCount = ref(100);
const calcOpen = ref(false);
const calcMode = ref<'calc' | 'pay'>('calc');
const wizOpen = ref(false);
const brandMode = ref<'current' | 'new'>('current');
const newBrandName = ref('');
const brandAliases = ref<string[]>([]);
const monitoredQueryCount = ref(30);
const submitting = ref(false);
const loading = ref(false);
const tasks = ref<DiagnosisTaskItem[]>([]);
const filter = ref<'all' | 'active' | 'done'>('all');

const filters = [
  { key: 'all' as const, label: '全部' },
  { key: 'active' as const, label: '进行中' },
  { key: 'done' as const, label: '已完成' },
];

const currentBrandName = computed(() => auth.activeBrand?.name || '未选择品牌');
const brandInitial = computed(() => (currentBrandName.value || '品').slice(0, 1));

const webCount = computed(() => selectedEnds.value.filter(k => k.endsWith(':web')).length);
const appCount = computed(() => selectedEnds.value.filter(k => k.endsWith(':app')).length);
const doubaoApp = computed(() => selectedEnds.value.includes('doubao:app'));
const normalApp = computed(() => appCount.value - (doubaoApp.value ? 1 : 0));
const appCostDetail = computed(() => {
  const parts: string[] = [];
  if (normalApp.value) parts.push(`${normalApp.value}×4`);
  if (doubaoApp.value) parts.push(`1×8`);
  return parts.join(' + ') || '0';
});
const unitCost = computed(() => webCount.value * 2 + normalApp.value * 4 + (doubaoApp.value ? 8 : 0));
const queryTimes = computed(() => Math.max(0, topicCount.value) * (webCount.value + appCount.value));
const estimate = computed(() => Math.max(100, topicCount.value * unitCost.value));
const allSelected = computed(() => {
  let total = 0;
  for (const e of engines) {
    total += 1;
    if (e.app) total += 1;
  }
  return selectedEnds.value.length >= total;
});

const filteredTasks = computed(() => {
  if (filter.value === 'all') return tasks.value;
  if (filter.value === 'done') return tasks.value.filter(t => t.status === 'done' || t.status === 'partial');
  return tasks.value.filter(t => ['queued', 'pending_pay', 'pending', 'crawling', 'generating', 'running'].includes(t.status));
});

function isSel(engine: string, end: 'web' | 'app') {
  return selectedEnds.value.includes(`${engine}:${end}`);
}
function toggleEnd(engine: string, end: 'web' | 'app') {
  const k = `${engine}:${end}` as EndKey;
  const i = selectedEnds.value.indexOf(k);
  if (i >= 0) selectedEnds.value.splice(i, 1);
  else selectedEnds.value.push(k);
}
function toggleAll() {
  if (allSelected.value) {
    selectedEnds.value = [];
    return;
  }
  const next: EndKey[] = [];
  for (const e of engines) {
    next.push(`${e.key}:web`);
    if (e.app) next.push(`${e.key}:app`);
  }
  selectedEnds.value = next;
}
function formatNum(n: number) {
  return n.toLocaleString('en-US');
}

function openCalc() {
  calcMode.value = 'calc';
  calcOpen.value = true;
}
function openWizard() {
  brandMode.value = auth.activeBrandId ? 'current' : 'new';
  wizOpen.value = true;
  loadBrandMeta();
}
function previewSample() {
  window.open(SAMPLE_URL, '_blank', 'noopener');
}

async function loadBrandMeta() {
  try {
    const [aliasesRes, queries]: any[] = await Promise.all([
      brandApi.aliases().catch(() => null),
      monitorApi.queryList('all').catch(() => null),
    ]);
    const list = aliasesRes?.aliases || aliasesRes || [];
    brandAliases.value = (Array.isArray(list) ? list : [])
      .map((a: any) => (typeof a === 'string' ? a : a.alias || a.name))
      .filter(Boolean)
      .slice(0, 12);
    const qlist = queries?.list || [];
    monitoredQueryCount.value = Math.max(1, Array.isArray(qlist) ? qlist.length : 30);
  } catch { /* ignore */ }
}

function continueWithTopics(kind: 'existing' | 'new') {
  const name = brandMode.value === 'current' ? currentBrandName.value : newBrandName.value.trim();
  if (!name) {
    Message.warning(brandMode.value === 'current' ? '请先选择品牌' : '请输入品牌名称');
    return;
  }
  topicCount.value = kind === 'existing' ? monitoredQueryCount.value : 50;
  wizOpen.value = false;
  calcMode.value = 'pay';
  calcOpen.value = true;
}

async function submitDiagnosis() {
  const name = calcMode.value === 'pay'
    ? (brandMode.value === 'current' ? currentBrandName.value : newBrandName.value.trim())
    : (auth.activeBrand?.name || newBrandName.value.trim() || '未命名品牌');
  if (!name) {
    Message.warning('请先指定品牌');
    return;
  }
  if (!selectedEnds.value.length) {
    Message.warning('请至少选择一个引擎终端');
    return;
  }
  submitting.value = true;
  try {
    const map = new Map<string, Array<'web' | 'app'>>();
    for (const k of selectedEnds.value) {
      const [engine, end] = k.split(':') as [string, 'web' | 'app'];
      if (!map.has(engine)) map.set(engine, []);
      map.get(engine)!.push(end);
    }
    const platforms = [...map.entries()].map(([engine, ends]) => ({ engine, ends }));
    await diagnosisApi.create({
      brand_name: name,
      brand_id: brandMode.value === 'current' ? auth.activeBrandId : null,
      aliases: brandAliases.value,
      topic_count: topicCount.value,
      platforms,
      target_brand_input: { name, brand_id: brandMode.value === 'current' ? auth.activeBrandId : null },
    });
    Message.success('已加入诊断队列');
    calcOpen.value = false;
    await load();
  } catch (e: any) {
    Message.error(e?.message || '下单失败');
  } finally {
    submitting.value = false;
  }
}

function brandName(t: DiagnosisTaskItem) {
  const input = t.target_brand_input as any;
  return input?.name || input?.brand_name || '未命名品牌';
}
function formatTime(raw?: string) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function statusMeta(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    pending_pay: { label: '待支付', cls: 'queued' },
    pending: { label: '排队中', cls: 'queued' },
    queued: { label: '排队中', cls: 'queued' },
    crawling: { label: '生成中', cls: 'running' },
    generating: { label: '生成中', cls: 'running' },
    running: { label: '生成中', cls: 'running' },
    done: { label: '已完成', cls: 'done' },
    partial: { label: '部分完成', cls: 'partial' },
    failed: { label: '失败', cls: 'failed' },
    fail: { label: '失败', cls: 'failed' },
    cancelled: { label: '已取消', cls: 'cancelled' },
  };
  return map[status] || { label: status, cls: 'cancelled' };
}
function isQueued(t: DiagnosisTaskItem) {
  return ['queued', 'pending_pay', 'pending'].includes(t.status);
}
function isRunning(t: DiagnosisTaskItem) {
  return ['crawling', 'generating', 'running'].includes(t.status);
}
function isActive(t: DiagnosisTaskItem) {
  return isQueued(t) || isRunning(t);
}
function canCancel(t: DiagnosisTaskItem) {
  return isQueued(t) || isRunning(t);
}

async function cancelTask(t: DiagnosisTaskItem) {
  try {
    await diagnosisApi.cancel(t.diagnosis_id);
    Message.success('已取消');
    await load();
  } catch (e: any) {
    Message.error(e?.message || '取消失败');
  }
}

async function load() {
  loading.value = true;
  try {
    const res = await diagnosisApi.tasks(1, 50);
    tasks.value = res?.list || [];
  } catch {
    tasks.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style lang="scss" scoped>
.rcx {
  --bg-soft: #fafafe;
  --line: #ececf3;
  --line-soft: #f2f2f8;
  --ink: #111114;
  --ink-2: #3a3a45;
  --ink-3: #6e6e7a;
  --ink-4: #9a9aa6;
  --primary: #6452ff;
  --primary-soft: #efecff;
  --primary-deep: #4a38e0;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 22px;
  max-width: 1080px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.rcx-head {
  margin-bottom: 18px;
  h1 {
    font-size: 22px;
    font-weight: 800;
    color: var(--ink);
    margin: 0;
    letter-spacing: -0.3px;
  }
  p {
    font-size: 13px;
    color: var(--ink-3);
    margin: 4px 0 0;
  }
}

.diag-hero {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 0;
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: 16px;
  background: radial-gradient(130% 150% at 0% 0%, rgb(58, 36, 128), rgb(36, 26, 77) 46%, rgb(21, 19, 47));
  box-shadow: rgba(30, 18, 70, 0.28) 0 18px 48px;
}
@media (max-width: 980px) {
  .diag-hero { grid-template-columns: 1fr; }
}

.diag-hero-copy {
  padding: 46px 44px 42px;
  color: #fff;
  align-self: center;
}
.diag-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: rgb(199, 188, 255);
  margin-bottom: 18px;
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgb(167, 139, 250);
    box-shadow: rgba(167, 139, 250, 0.22) 0 0 0 4px;
  }
}
.diag-hero-title {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.22;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
  em {
    font-style: normal;
    background: linear-gradient(90deg, rgb(196, 181, 253), rgb(240, 171, 252));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}
.diag-hero-lead {
  font-size: 14.5px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.74);
  margin: 0 0 26px;
  max-width: 480px;
}
.diag-hero-cta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.diag-hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 14px 26px;
  border: none;
  border-radius: 12px;
  background: #fff;
  color: rgb(42, 29, 99);
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.16s;
  svg { width: 16px; height: 16px; }
  &:hover { transform: translateY(-2px); box-shadow: rgba(0, 0, 0, 0.28) 0 12px 28px; }
  &.ghost {
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.32);
    &:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.55); box-shadow: none; }
  }
}
.diag-hero-note {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.62);
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 12px;
}
.diag-hero-trust {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.48);
  display: grid;
  gap: 4px;
}
.diag-hero-visual {
  position: relative;
  padding: 34px 40px 34px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.diag-card {
  width: 100%;
  max-width: 338px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: rgba(0, 0, 0, 0.36) 0 26px 64px;
  transform: rotate(-1.4deg);
}
.diag-card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.diag-card-title { font-size: 14px; font-weight: 800; color: var(--ink); }
.diag-card-sub { font-size: 11.5px; color: var(--ink-4); margin-top: 2px; }
.diag-card-tag { font-size: 10px; font-weight: 800; color: var(--ink-4); background: var(--bg-soft); padding: 2px 8px; border-radius: 100px; }
.diag-card-score {
  display: flex; align-items: baseline; gap: 10px;
  padding-bottom: 15px; border-bottom: 1px solid var(--line-soft); margin-bottom: 14px;
}
.diag-card-score-num { font-size: 40px; font-weight: 800; color: var(--ink); line-height: 1; letter-spacing: -0.03em; span { font-size: 19px; } }
.diag-card-score-label { font-size: 12px; color: var(--ink-3); }
.diag-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; font-size: 12px; }
.diag-bar-name { display: flex; align-items: center; gap: 6px; width: 72px; color: var(--ink-2); flex-shrink: 0; i { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; } }
.diag-bar-track { flex: 1; height: 6px; background: var(--bg-soft); border-radius: 100px; overflow: hidden; }
.diag-bar-fill { display: block; height: 100%; border-radius: 100px; }
.diag-bar-val { width: 34px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--ink); flex-shrink: 0; }
.diag-bar-group {
  display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800;
  letter-spacing: 0.04em; color: var(--ink-4); margin: 4px 0 9px;
  &::after { content: ''; flex: 1; height: 1px; background: var(--line-soft); }
}
.diag-app-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.diag-app-chip {
  display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700;
  color: var(--ink-2); background: var(--bg-soft); padding: 3px 9px; border-radius: 100px;
  i { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
}
.diag-card-foot {
  display: flex; justify-content: space-between; margin-top: 14px; padding-top: 14px;
  border-top: 1px solid var(--line-soft); font-size: 11.5px; color: var(--ink-4);
  b { color: var(--ink); font-weight: 800; }
}

.diag-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px; }
@media (max-width: 760px) { .diag-steps { grid-template-columns: 1fr; } }
.diag-step {
  background: #fff; border: 1px solid var(--line); border-radius: var(--radius-lg);
  padding: 18px 20px; display: flex; gap: 13px; align-items: flex-start;
}
.diag-step-no {
  width: 28px; height: 28px; border-radius: 9px; flex-shrink: 0;
  background: var(--primary-soft); color: var(--primary-deep);
  font-size: 14px; font-weight: 800; display: grid; place-items: center;
}
.diag-step-t { font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
.diag-step-d { font-size: 12px; color: var(--ink-3); line-height: 1.5; }

.diag-includes {
  background: #fff; border: 1px solid var(--line); border-radius: var(--radius-lg);
  padding: 22px 24px; margin-bottom: 16px;
}
.diag-inc-title { font-size: 13px; font-weight: 800; color: var(--ink); margin-bottom: 16px; }
.diag-inc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
@media (max-width: 900px) { .diag-inc-grid { grid-template-columns: repeat(2, 1fr); } }
.diag-inc-item {
  display: flex; gap: 11px; align-items: flex-start; padding: 14px;
  background: var(--bg-soft); border-radius: var(--radius-md);
  :deep(svg) { width: 18px; height: 18px; color: var(--primary); flex-shrink: 0; margin-top: 1px; }
}
.diag-inc-t { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
.diag-inc-d { font-size: 11.5px; color: var(--ink-3); line-height: 1.45; }

.rcx-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.rcx-filters { display: inline-flex; gap: 6px; }
.rcx-filter {
  padding: 7px 14px; border: 1px solid var(--line); border-radius: 100px; background: #fff;
  font-family: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink-3); cursor: pointer;
  &:hover { border-color: var(--ink-3); color: var(--ink); }
  &.active { background: var(--ink); border-color: var(--ink); color: #fff; }
}
.rcx-bar-actions { margin-left: auto; display: inline-flex; gap: 10px; }
.rcx-primary {
  display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border: none;
  border-radius: 10px; background: var(--primary); color: #fff; font-family: inherit;
  font-size: 13px; font-weight: 800; cursor: pointer;
  svg { width: 14px; height: 14px; }
  &:hover { background: var(--primary-deep); }
}
.rcx-ghost {
  display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px;
  border: 1px solid var(--line); border-radius: 10px; background: #fff; color: var(--ink-2);
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  &:hover { border-color: var(--primary); color: var(--primary); }
}
.rc-card {
  background: #fff; border: 1px solid var(--line); border-radius: var(--radius-xl);
  padding: 20px 22px; margin-bottom: 14px;
  &.active { border-color: rgba(100, 82, 255, 0.32); box-shadow: rgba(100, 82, 255, 0.08) 0 8px 28px; }
}
.rc-card-head { display: flex; align-items: center; gap: 10px; }
.rc-card-brand { font-size: 16px; font-weight: 800; color: var(--ink); }
.rc-card-id { font-size: 12px; color: var(--ink-4); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
.rc-card-meta { font-size: 12.5px; color: var(--ink-3); margin-top: 8px; }
.rc-card-spacer { flex: 1; }
.rc-chip {
  display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700;
  padding: 3px 11px; border-radius: 100px; white-space: nowrap;
}
.rc-chip-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.rc-chip.queued { color: rgb(180, 83, 9); background: rgb(254, 243, 199); }
.rc-chip.running { color: var(--primary-deep); background: var(--primary-soft); }
.rc-chip.done { color: rgb(10, 122, 100); background: rgba(16, 185, 129, 0.13); }
.rc-chip.partial { color: rgb(180, 83, 9); background: rgb(254, 243, 199); }
.rc-chip.failed { color: rgb(220, 38, 38); background: rgb(254, 226, 226); }
.rc-chip.cancelled { color: var(--ink-4); background: var(--bg-soft); }
.rc-card-queue { margin-top: 15px; padding: 14px 16px; background: var(--bg-soft); border-radius: var(--radius-md); }
.rc-q-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--ink-3); padding: 3px 0; b { color: var(--ink); font-weight: 700; } }
.rc-q-note { font-size: 11.5px; color: var(--ink-4); line-height: 1.6; margin-top: 8px; }
.rc-card-prog { margin-top: 15px; }
.rc-prog-head { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--ink-3); margin-bottom: 7px; b { color: var(--ink); font-weight: 700; } }
.rc-prog-bar { height: 7px; border-radius: 100px; background: var(--line-soft); overflow: hidden; }
.rc-prog-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, var(--primary), var(--primary-deep)); }
.rc-card-result { margin-top: 16px; display: flex; gap: 22px; align-items: center; }
.rc-res-score { display: flex; align-items: center; gap: 12px; }
.rc-res-num { font-size: 34px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; line-height: 1; span { font-size: 17px; margin-left: 1px; } }
.rc-res-lab { font-size: 11.5px; color: var(--ink-4); line-height: 1.45; }
.rc-card-acts { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line-soft); display: flex; align-items: center; gap: 9px; }
.rc-eta { font-size: 12px; color: var(--ink-4); }
.rc-act {
  padding: 8px 16px; border: 1px solid var(--line); border-radius: 9px; background: #fff;
  font-family: inherit; font-size: 12.5px; font-weight: 700; color: var(--ink-2); cursor: pointer;
  &:hover { border-color: var(--primary); color: var(--primary-deep); }
  &.primary { background: var(--primary); border-color: var(--primary); color: #fff; &:hover { background: var(--primary-deep); color: #fff; } }
}
.rc-loading { padding: 40px 0; display: flex; justify-content: center; color: var(--ink-4); }
</style>

<style lang="scss">
/* modal CSS (global under .osw) — 对标 ReportCenterPage */
@import './diag-modals.css';

.osw {
  --bg-soft: #fafafe;
  --line: #ececf3;
  --line-soft: #f2f2f8;
  --ink: #111114;
  --ink-2: #3a3a45;
  --ink-3: #6e6e7a;
  --ink-4: #9a9aa6;
  --primary: #6452ff;
  --primary-soft: #efecff;
  --primary-deep: #4a38e0;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 22px;
  --shadow-lg: 0 24px 60px rgba(0, 0, 0, 0.18);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.osw .modal-overlay.visible { opacity: 1; pointer-events: auto; }
.osw .modal-overlay {
  position: fixed; inset: 0; background: rgba(20, 20, 40, 0.4); z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.osw .modal-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding: 22px 26px 0;
}
.osw .modal-title { font-size: 18px; font-weight: 800; color: var(--ink); }
.osw .modal-sub { font-size: 12.5px; color: var(--ink-3); margin-top: 6px; line-height: 1.55; max-width: 560px; }
.osw .modal-close {
  width: 32px; height: 32px; border: none; background: var(--bg-soft); border-radius: 8px;
  display: grid; place-items: center; cursor: pointer; color: var(--ink-3); flex-shrink: 0;
  svg { width: 16px; height: 16px; }
}
.osw .wiz-bhero-alias {
  font-size: 12px; font-weight: 600; color: var(--ink-2); background: #fff;
  border: 1px solid var(--line); border-radius: 100px; padding: 4px 10px;
}
.osw .wiz-footer {
  display: flex; align-items: center; gap: 10px; padding: 16px 26px 22px; border-top: 1px solid var(--line-soft);
}
.osw .wiz-footer-spacer { flex: 1; }
.osw .wiz-btn {
  padding: 10px 18px; border: none; border-radius: 10px; background: var(--ink); color: #fff;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  &.ghost { background: #fff; color: var(--ink-2); border: 1px solid var(--line); }
}
</style>
