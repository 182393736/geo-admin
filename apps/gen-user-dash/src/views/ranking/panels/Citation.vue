<template>
  <div class="p-wrap">
    <div class="p-hd">
      <h2>引用源追溯</h2>
      <p>按位次权重聚合的公司排名与目标品牌可见性趋势（口径同 AI 排名透视）</p>
    </div>

    <PreCollectionEmpty v-if="pending" title="引用源追溯" />

    <template v-else>
      <!-- 目标品牌可见性趋势 -->
      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">目标品牌可见性趋势</div>
            <div class="p-card-s">各监控问题榜单中目标品牌当日位次（未提及 = 当日未上榜）</div>
          </div>
          <div class="p-card-right">
            <span v-for="r in visLatest" :key="r.k" class="p-pill"><i :style="{ background: r.c }"></i>{{ r.k }}：{{ r.v }}</span>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!vis.length" class="p-empty">暂无可见性数据</div>
          <SparkLine v-else :points="visScores" :labels="visLabels" color="#4f46e5" :digits="0" />
        </div>
      </div>

      <!-- 公司排名 -->
      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">公司排名</div>
            <div class="p-card-s">按位次权重分（第1名 40 分起）聚合的实体排名，目标品牌高亮</div>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!ranking.length" class="p-empty">暂无排名数据（榜单抽取尚未产出）</div>
          <div v-else class="p-table">
            <div class="p-tr p-th">
              <span class="c-i">排名</span>
              <span class="c-n">公司 / 品牌</span>
              <span class="c-r">权重分</span>
              <span class="c-r">位次变化</span>
              <span class="c-r">状态</span>
            </div>
            <div v-for="row in ranking" :key="row.name" class="p-tr">
              <span class="c-i">{{ row.current_rank }}</span>
              <span class="c-n">
                {{ row.name }}
                <em v-if="row.is_target" class="p-target">目标品牌</em>
              </span>
              <span class="c-r">{{ row.current_score }}</span>
              <span class="c-r">{{ changeTxt(row) }}</span>
              <span class="c-r"><em :class="trendCls(row.trend)">{{ trendTxt(row.trend) }}</em></span>
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
import SparkLine from '@/components/SparkLine.vue';
import { fmtDate } from '@/utils/engines';

const pending = ref(true);
const ranking = ref<any[]>([]);
const visAll = ref<any[]>([]);

const vis = computed(() => visAll.value || []);
const visLabels = computed(() => vis.value.map((v: any) => fmtDate(v.date_day)));
const visScores = computed(() => vis.value.map((v: any) => Number(v.score) || 0));
const visLatest = computed(() => {
  const last = vis.value[vis.value.length - 1];
  if (!last) return [];
  return [{ k: '最新位次', v: last.rank_value || '未提及', c: '#4f46e5' }, { k: '权重分', v: last.score || '0', c: '#059669' }];
});

const changeTxt = (r: any) => {
  if (r.rank_change == null || r.rank_change === 0) return '—';
  const up = r.rank_change < 0; // 位次数字变小 = 上升
  return `${up ? '↑' : '↓'} ${Math.abs(r.rank_change)}`;
};
const trendCls = (t: string) => (t === 'up' ? 'p-up' : t === 'down' ? 'p-down' : t === 'new' ? 'p-new' : 'p-flat');
const trendTxt = (t: string) => (t === 'up' ? '上升' : t === 'down' ? '下降' : t === 'new' ? '新上榜' : '平稳');

onMounted(async () => {
  try {
    const st = await monitorApi.queryStatus();
    pending.value = !!st?.pending;
    if (!st?.pending) {
      const resp: any = await monitorApi.getReferences();
      ranking.value = resp?.company_ranking_data || [];
      visAll.value = resp?.visibility_trend?.all || [];
    }
  } catch { pending.value = false; }
});
</script>

<style scoped lang="scss">
.p-wrap { margin: -16px -24px; padding: 28px 36px 96px; background: #f8fafc; min-height: calc(100vh - 32px); display: flex; flex-direction: column; gap: 16px; }
.p-hd h2 { font-size: 22px; font-weight: 800; color: #0f1115; margin: 0; line-height: 33px; }
.p-hd p { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }
.p-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.p-card-h { padding: 14px 18px; border-bottom: 1px solid #f0f1f5; display: flex; align-items: center; gap: 10px; }
.p-card-t { font-size: 14.5px; font-weight: 800; color: #0f1115; }
.p-card-s { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }
.p-card-right { margin-left: auto; display: flex; gap: 8px; }
.p-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #374151; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 999px; padding: 4px 12px; }
.p-pill i { width: 7px; height: 7px; border-radius: 50%; }
.p-body { padding: 16px 18px 18px; }
.p-empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 36px 0; }
.p-table { display: flex; flex-direction: column; }
.p-tr { display: grid; grid-template-columns: 70px 1fr 110px 110px 90px; gap: 10px; align-items: center; padding: 11px 12px; border-bottom: 1px solid #f0f1f5; }
.p-tr:last-child { border-bottom: none; }
.p-th { background: #f5f6fa; border-radius: 8px; padding: 9px 12px; font-size: 11.5px; font-weight: 600; color: #5b606a; border-bottom: none; }
.c-i { font-size: 13px; font-weight: 700; color: #9ca3af; }
.c-n { font-size: 13px; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
.c-r { text-align: right; font-size: 13px; font-weight: 600; color: #374151; }
.p-target { font-style: normal; font-size: 10.5px; font-weight: 700; color: #4f46e5; background: #eef2ff; border-radius: 6px; padding: 2px 8px; }
.p-up { font-style: normal; color: #059669; }
.p-down { font-style: normal; color: #dc2626; }
.p-new { font-style: normal; color: #d97706; }
.p-flat { font-style: normal; color: #9ca3af; }
</style>
