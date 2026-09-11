<template>
  <div class="p-wrap">
    <div class="p-hd">
      <h2>AI竞品透视</h2>
      <p>竞品在 AI 回答中的被提及频次与位次表现（不含自家品牌）</p>
    </div>

    <PreCollectionEmpty v-if="pending" title="AI竞品透视" />

    <template v-else>
      <div class="p-kpis">
        <div class="p-kpi">
          <div class="p-kpi-label">监测竞品数</div>
          <div class="p-kpi-value">{{ list.length }}</div>
          <div class="p-kpi-sub">本期被 AI 提及的竞品实体</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">被提及总次数</div>
          <div class="p-kpi-value">{{ totalFreq }}</div>
          <div class="p-kpi-sub">竞品在采样中出现的总频次</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">最高提及率</div>
          <div class="p-kpi-value">{{ fmtPct(topRate) }}</div>
          <div class="p-kpi-sub">被提及采样占比最高的竞品</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">平均覆盖问题</div>
          <div class="p-kpi-value">{{ avgKw }}</div>
          <div class="p-kpi-sub">单个竞品平均覆盖的监控问题数</div>
        </div>
      </div>

      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">竞品透视表</div>
            <div class="p-card-s">按被提及频次降序；提及率 = 被提及采样 ÷ 有效采集槽位</div>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!list.length" class="p-empty">暂无竞品数据（采集或解析尚未产出）</div>
          <div v-else class="p-table">
            <div class="p-tr p-th">
              <span class="c-i">#</span>
              <span class="c-n">竞品品牌</span>
              <span class="c-b">提及率</span>
              <span class="c-r">Top3 推荐率</span>
              <span class="c-r">首位推荐率</span>
              <span class="c-r">被提及次数</span>
              <span class="c-r">Top3 次数</span>
              <span class="c-r">覆盖问题</span>
            </div>
            <div v-for="(row, i) in list" :key="i" class="p-tr">
              <span class="c-i">{{ i + 1 }}</span>
              <span class="c-n" :title="row.name">{{ row.name }}</span>
              <span class="c-b">
                <span class="c-b-track"><i :style="{ width: barWidth(row.mention_rate) }"></i></span>
                <em>{{ fmtPct(row.mention_rate) }}</em>
              </span>
              <span class="c-r">{{ fmtPct(row.top3_mention_rate) }}</span>
              <span class="c-r">{{ fmtPct(row.first_mention_rate) }}</span>
              <span class="c-r">{{ row.frequency }}</span>
              <span class="c-r">{{ row.top3_frequency }}</span>
              <span class="c-r">{{ row.keyword_count }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { monitorApi } from '@/api/modules/monitor';
import PreCollectionEmpty from '@/components/PreCollectionEmpty.vue';
import { fmtPct, fmtNum } from '@/utils/engines';

const pending = ref(true);
const raw = ref<any[]>([]);

const list = computed(() => (raw.value || []).slice().sort((a: any, b: any) => (b.frequency || 0) - (a.frequency || 0)));
const totalFreq = computed(() => list.value.reduce((s: number, r: any) => s + (r.frequency || 0), 0));
const topRate = computed(() => (list.value.length ? list.value[0].mention_rate : 0));
const avgKw = computed(() => (list.value.length ? fmtNum(list.value.reduce((s: number, r: any) => s + (r.keyword_count || 0), 0) / list.value.length) : 0));
const barWidth = (v: number) => `${Math.max(0, Math.min(100, v))}%`;

onMounted(async () => {
  try {
    const st = await monitorApi.queryStatus();
    pending.value = !!st?.pending;
    if (!st?.pending) {
      const resp: any = await monitorApi.competitorInsight();
      raw.value = resp?.list || [];
    }
  } catch { pending.value = false; }
});
</script>

<style scoped lang="scss">
.p-wrap { margin: -16px -24px; padding: 28px 36px 96px; background: #f8fafc; min-height: calc(100vh - 32px); display: flex; flex-direction: column; gap: 16px; }
.p-hd h2 { font-size: 22px; font-weight: 800; color: #0f1115; margin: 0; line-height: 33px; }
.p-hd p { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }
.p-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.p-kpi { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 18px; }
.p-kpi-label { font-size: 12px; color: #6b7280; }
.p-kpi-value { font-size: 24px; font-weight: 800; color: #111827; margin-top: 6px; line-height: 1.2; }
.p-kpi-sub { font-size: 11px; color: #9ca3af; margin-top: 4px; }
.p-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.p-card-h { padding: 14px 18px; border-bottom: 1px solid #f0f1f5; }
.p-card-t { font-size: 14.5px; font-weight: 800; color: #0f1115; }
.p-card-s { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }
.p-body { padding: 16px 18px 18px; }
.p-empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 36px 0; }
.p-table { display: flex; flex-direction: column; }
.p-tr { display: grid; grid-template-columns: 40px minmax(180px, 2fr) 1.4fr repeat(5, 90px); gap: 10px; align-items: center; padding: 11px 12px; border-bottom: 1px solid #f0f1f5; }
.p-tr:last-child { border-bottom: none; }
.p-th { background: #f5f6fa; border-radius: 8px; padding: 9px 12px; font-size: 11.5px; font-weight: 600; color: #5b606a; border-bottom: none; }
.c-i { font-size: 13px; font-weight: 700; color: #9ca3af; }
.c-n { font-size: 13px; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c-r { text-align: right; font-size: 13px; font-weight: 600; color: #374151; }
.c-b { display: flex; align-items: center; gap: 10px; }
.c-b-track { flex: 1; height: 8px; background: #f3f4f6; border-radius: 100px; overflow: hidden; }
.c-b-track i { display: block; height: 100%; border-radius: 100px; background: linear-gradient(90deg, #6366f1, #4f46e5); }
.c-b em { font-style: normal; font-size: 12.5px; font-weight: 700; color: #111827; min-width: 52px; text-align: right; }
@media (max-width: 900px) { .p-kpis { grid-template-columns: 1fr 1fr; } }
</style>
