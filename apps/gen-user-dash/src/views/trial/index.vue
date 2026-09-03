<template>
  <div class="trial-page">
    <!-- 顶部条 -->
    <header class="topbar">
      <span class="brand-mark">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="3" fill="currentColor" stroke="none"/>
        </svg>
        <b>GEO 管理平台</b>
      </span>
      <button class="ghost-btn" @click="handleLogout">退出登录</button>
    </header>

    <main class="trial-main">
      <!-- ============ 阶段一：填写表单 ============ -->
      <section v-if="phase === 'form'" class="card">
        <h1 class="title">先认识一下你的品牌</h1>
        <p class="subtitle">填写品牌信息，智能分析引擎会为你生成首批监控问题与识别词，完成后自动进入工作台。</p>

        <div class="field">
          <label class="label">品牌名称 <i class="req">*</i></label>
          <input v-model.trim="form.brand_name" class="input" maxlength="60"
                 placeholder="请输入品牌正式名称" @keyup.enter="submit" />
        </div>

        <div class="field">
          <label class="label">官网 / 介绍链接</label>
          <input v-model.trim="form.website" class="input" maxlength="200"
                 placeholder="例如 www.example.com（选填，公开页面即可）" @keyup.enter="submit" />
        </div>

        <div class="field">
          <label class="label">补充介绍</label>
          <textarea v-model.trim="form.business_desc" class="textarea" rows="4" maxlength="2000"
                    placeholder="一句话说说你是做什么的、服务谁、和同行有什么不同（选填，写准了分析更准）"></textarea>
        </div>

        <div class="field-row">
          <input ref="fileRef" type="file" accept=".pdf,.doc,.docx,.md,.txt" hidden @change="onPickFile" />
          <button class="ghost-btn" type="button" @click="fileRef?.click()">📎 上传文档</button>
          <span v-if="fileName" class="file-chip">{{ fileName }} <b @click="fileName=''">×</b></span>
          <span class="hint">文档会在分析阶段解析 · 选填</span>
        </div>

        <div class="quick-fill">
          <span class="hint">快速填入：</span>
          <button v-for="q in quickFills" :key="q.name" class="chip" type="button" @click="fillDemo(q)">{{ q.name }}</button>
        </div>

        <button class="primary-btn" :disabled="!canSubmit || submitting" @click="submit">
          {{ submitting ? '提交中…' : '开始智能分析' }}
        </button>
      </section>

      <!-- ============ 阶段二：分析进度 ============ -->
      <section v-else class="card">
        <h1 class="title">智能分析进行中</h1>
        <p class="subtitle">正在为「{{ brandLabel }}」建立品牌档案并生成监控问题，全程约 1~2 分钟。</p>

        <ul class="steps">
          <li v-for="s in steps" :key="s.key" class="step" :class="s.state">
            <span class="dot">
              <i v-if="s.state === 'done'">✓</i>
              <i v-else-if="s.state === 'doing'" class="spinner"></i>
            </span>
            <div>
              <b>{{ s.label }}</b>
              <p>{{ s.desc }}</p>
            </div>
          </li>
        </ul>

        <div v-if="summary.done" class="result-ok">
          ✅ 分析完成：识别词 {{ summary.aliases }} 个 · 排名问题 {{ summary.industry }} 个 · 口碑问题 {{ summary.brand }} 个
        </div>
        <div v-if="errorMsg" class="result-fail">
          ⚠️ {{ errorMsg }}
          <button class="ghost-btn" @click="reset">重新填写</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * 首次品牌分析引导页（/trial）
 * 登录后没有任何品牌时强制进入这里（路由守卫保证）；有品牌访问会被送回工作台。
 * 提交 → POST /user/brands/analyze 拿 task_id → 每 2s 轮询状态 → done 刷新品牌进工作台。
 */
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { userApi } from '@/api/modules/user';
import { toast } from '@/lib/toast';
import type { OnboardingStage } from '@/api/types';

const router = useRouter();
const auth = useAuthStore();

defineOptions({ name: 'TrialPage' });

const phase = ref<'form' | 'running'>('form');
const submitting = ref(false);
const errorMsg = ref('');
const fileName = ref('');
const fileRef = ref<HTMLInputElement | null>(null);

const form = ref({ brand_name: '', website: '', business_desc: '' });
const brandLabel = computed(() => form.value.brand_name || '你的品牌');
const canSubmit = computed(() => !!form.value.brand_name || form.value.business_desc.length >= 6);

const quickFills = [
  { name: '餐饮连锁', brand_name: '麦香园快餐', website: '', business_desc: '社区连锁快餐品牌，主打平价现炒，30 家门店。' },
  { name: '教育培训', brand_name: '启航少儿编程', website: '', business_desc: '面向 6-14 岁的少儿编程课，线上小班 + 线下校区。' },
  { name: '工业制造', brand_name: '恒力精密五金', website: '', business_desc: 'CNC 精密加工厂，服务 3C 与汽车行业客户。' },
];
function fillDemo(q: typeof quickFills[number]) {
  form.value = { brand_name: q.brand_name, website: q.website, business_desc: q.business_desc };
}
function onPickFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  fileName.value = f ? f.name : '';
}

// ---- 进度状态机（与后端 stage 对应） ----
const stage = ref<OnboardingStage>('crawl');
const STAGE_ORDER: OnboardingStage[] = ['crawl', 'keyword', 'query', 'done'];
const summary = ref({ done: false, aliases: 0, industry: 0, brand: 0 });

const steps = computed(() => {
  const idx = STAGE_ORDER.indexOf(stage.value === 'fail' ? 'crawl' : stage.value);
  const def = [
    { key: 'crawl',   label: '读取品牌素材',   desc: '抓取官网与提交的链接、文档内容' },
    { key: 'keyword', label: '提炼品牌要素',   desc: '大模型抽取行业、定位、识别词与别名' },
    { key: 'query',   label: '生成监控问题',   desc: '产出首批排名问题与口碑问题' },
    { key: 'done',    label: '写入品牌档案',   desc: '建立识别口径，进入每日监测' },
  ];
  return def.map((d, i) => ({
    ...d,
    state: summary.value.done || i < idx ? 'done' : i === idx && !errorMsg.value ? 'doing' : 'wait',
  }));
});

// ---- 提交 + 轮询 ----
let timer: ReturnType<typeof setTimeout> | null = null;
let pollFails = 0;

async function submit() {
  if (!canSubmit.value || submitting.value) return;
  submitting.value = true;
  errorMsg.value = '';
  try {
    const resp = await userApi.analyzeBrand({
      brand_name: form.value.brand_name || undefined,
      website: form.value.website || undefined,
      business_desc: form.value.business_desc || undefined,
    });
    phase.value = 'running';
    submitting.value = false;
    poll(resp.task_id);
  } catch (e: any) {
    submitting.value = false;
    errorMsg.value = e?.message || '提交失败，请稍后重试';
    phase.value = 'running'; // 进度卡内呈现错误与重试
    toast.error('提交失败', errorMsg.value);
  }
}

async function poll(task_id: string) {
  try {
    const s = await userApi.onboardingStatus(task_id);
    stage.value = s.stage;
    pollFails = 0;
    if (s.done && s.brand) {
      summary.value = {
        done: true,
        aliases: s.generated.aliases,
        industry: s.generated.industry_queries,
        brand: s.generated.brand_queries,
      };
      toast.success('分析完成', `品牌「${s.brand.name}」档案已建立`);
      await auth.refreshBrands().catch(() => []);
      timer = setTimeout(() => router.push('/dashboard/overview'), 1200);
      return;
    }
    if (s.stage === 'fail') {
      errorMsg.value = s.error || '分析失败，请重试';
      return;
    }
  } catch (e) {
    pollFails += 1;
    if (pollFails > 10) { errorMsg.value = '网络异常，进度查询中断'; return; }
  }
  timer = setTimeout(() => poll(task_id), 2000);
}

function reset() {
  if (timer) clearTimeout(timer);
  phase.value = 'form';
  errorMsg.value = '';
  stage.value = 'crawl';
  summary.value = { done: false, aliases: 0, industry: 0, brand: 0 };
}

function handleLogout() {
  auth.logout();
  router.push('/login');
}

onUnmounted(() => { if (timer) clearTimeout(timer); });
</script>

<style scoped lang="scss">
.trial-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #0d0d24 0%, #16162e 55%, #1d1a3d 100%);
  color: #eceaf6;
  display: flex;
  flex-direction: column;
}
.topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 32px;
}
.brand-mark { display: flex; align-items: center; gap: 8px; font-size: 16px; color: #fff; }
.ghost-btn {
  background: rgba(255,255,255,.06); color: #cfcbe6; border: 1px solid rgba(255,255,255,.14);
  border-radius: 8px; padding: 7px 14px; cursor: pointer; font-size: 13px; transition: .2s;
  &:hover { background: rgba(255,255,255,.12); color: #fff; }
}
.trial-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; }
.card {
  width: 640px; max-width: 94vw; background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 40px 44px;
  backdrop-filter: blur(10px);
}
.title { font-size: 26px; margin: 0 0 10px; color: #fff; }
.subtitle { color: #a9a4c8; font-size: 14px; line-height: 1.7; margin: 0 0 26px; }
.field { margin-bottom: 18px; }
.field-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.label { display: block; font-size: 13px; color: #c8c3e4; margin-bottom: 8px; }
.req { color: #ff7a7a; font-style: normal; }
.input, .textarea {
  width: 100%; box-sizing: border-box; background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.14); border-radius: 10px; color: #fff;
  padding: 11px 14px; font-size: 14px; outline: none; transition: border-color .2s;
  &:focus { border-color: #8f7bff; }
  &::placeholder { color: #6b6694; }
}
.textarea { resize: vertical; line-height: 1.6; }
.hint { font-size: 12px; color: #8b86ae; }
.file-chip {
  background: rgba(143,123,255,.16); color: #c9bfff; border-radius: 6px;
  padding: 4px 10px; font-size: 12px;
  b { cursor: pointer; margin-left: 6px; }
}
.quick-fill { display: flex; align-items: center; gap: 8px; margin-bottom: 26px; flex-wrap: wrap; }
.chip {
  background: transparent; border: 1px dashed rgba(143,123,255,.5); color: #b7adff;
  border-radius: 999px; padding: 5px 14px; font-size: 12.5px; cursor: pointer; transition: .2s;
  &:hover { background: rgba(143,123,255,.14); }
}
.primary-btn {
  width: 100%; border: none; border-radius: 10px; padding: 13px 0; font-size: 15px;
  background: linear-gradient(90deg, #7b61ff, #5b8cff); color: #fff; cursor: pointer;
  transition: opacity .2s;
  &:disabled { opacity: .45; cursor: not-allowed; }
  &:not(:disabled):hover { opacity: .88; }
}
.steps { list-style: none; padding: 0; margin: 6px 0 22px; }
.step {
  display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,.06);
  &:last-child { border-bottom: none; }
  b { color: #fff; font-size: 14.5px; }
  p { margin: 4px 0 0; color: #8b86ae; font-size: 12.5px; }
  &.wait { opacity: .45; }
  .dot {
    width: 26px; height: 26px; border-radius: 50%; flex: none; margin-top: 2px;
    display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px;
    background: rgba(255,255,255,.1);
  }
  &.doing .dot { background: rgba(123,97,255,.4); }
  &.done .dot { background: #3fae7c; }
}
.spinner {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  animation: spin .8s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
.result-ok {
  background: rgba(63,174,124,.14); border: 1px solid rgba(63,174,124,.4);
  color: #7be0b1; border-radius: 10px; padding: 12px 16px; font-size: 13.5px;
}
.result-fail {
  background: rgba(255,122,122,.12); border: 1px solid rgba(255,122,122,.4);
  color: #ffa3a3; border-radius: 10px; padding: 12px 16px; font-size: 13.5px;
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
}
</style>
