<template>
  <div class="p-wrap">
    <div class="p-hd">
      <h2>引用源追溯</h2>
      <p>追踪 AI 回答中高频引用的信息来源与权重归因</p>
    </div>

    <PreCollectionEmpty v-if="pending" title="引用源追溯" />

    <template v-else>
      <div class="p-kpis">
        <div class="p-kpi">
          <div class="p-kpi-label">被引总次数</div>
          <div class="p-kpi-value">{{ summary.total_ref_count }}</div>
          <div class="p-kpi-sub">本期全部信源被引之和</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">命中信源数</div>
          <div class="p-kpi-value">{{ summary.total_sources }}</div>
          <div class="p-kpi-sub">去重信源平台数</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">自有信源</div>
          <div class="p-kpi-value">{{ summary.own_source_count }}</div>
          <div class="p-kpi-sub">含自有发稿内容的信源</div>
        </div>
        <div class="p-kpi">
          <div class="p-kpi-label">Top5 集中度</div>
          <div class="p-kpi-value">{{ summary.top5_share }}%</div>
          <div class="p-kpi-sub">前 5 信源被引占比</div>
        </div>
      </div>

      <!-- 引擎分布 -->
      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">各引擎被引分布</div>
            <div class="p-card-s">信源被引在 4 个 AI 引擎间的分布</div>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!platformRows.length" class="p-empty">暂无数据</div>
          <div v-else class="p-ebars">
            <div v-for="r in platformRows" :key="r.key" class="p-ebar-row">
              <span class="p-ebar-name"><i :style="{ background: r.color }"></i>{{ r.name }}</span>
              <span class="p-ebar-track"><i :style="{ width: r.w, background: r.color }"></i></span>
              <span class="p-ebar-v">{{ r.v }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 信源列表 -->
      <div class="p-card">
        <div class="p-card-h">
          <div>
            <div class="p-card-t">信源被引列表</div>
            <div class="p-card-s">按被引次数降序；可投放 = 已收录信源库、可直接下单</div>
          </div>
          <div class="p-card-right">
            <span class="p-page">共 {{ total }} 个 · 第 {{ page }} / {{ pages }} 页</span>
          </div>
        </div>
        <div class="p-body">
          <div v-if="!list.length" class="p-empty">暂无信源引用数据</div>
          <div v-else class="p-table">
            <div class="p-tr p-th">
              <span class="c-n">信源</span>
              <span class="c-c">类目</span>
              <span class="c-r">被引</span>
              <span class="c-r">文章数</span>
              <span class="c-r">覆盖问题</span>
              <span class="c-r">自有内容</span>
              <span class="c-p">可投放</span>
            </div>
            <div v-for="s in list" :key="s.canonical_source" class="p-tr">
              <span class="c-n" :title="s.canonical_source">{{ s.canonical_source }}</span>
              <span class="c-c">{{ s.category || '未分类' }}</span>
              <span class="c-r">{{ s.ref_count }}</span>
              <span class="c-r">{{ s.article_count }}</span>
              <span class="c-r">{{ s.query_count }}</span>
              <span class="c-r">{{ s.own_article_count }}</span>
              <span class="c-p"><em :class="s.media_key ? 'p-ok' : 'p-no'">{{ s.media_key ? '信源库内' : '未收录' }}</em></span>
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
import { ENGINE_KEYS, engineName, engineColor, lastNDays } from '@/utils/engines';

const pending = ref(true);
const list = ref<any[]>([]);
const summary = ref<any>({ total_ref_count: 0, total_sources: 0, own_source_count: 0, top5_share: 0, platform_breakdown: {} });
const page = ref(1);
const size = 20;
const total = ref(0);

const pages = computed(() => Math.max(1, Math.ceil(total.value / size)));
const platformRows = computed(() => {
  const pb = summary.value.platform_breakdown || {};
  const max = Math.max(1, ...Object.values(pb).map((v: any) => Number(v) || 0));
  return (ENGINE_KEYS as readonly string[]).map(k => {
    const v = Number(pb[k]) || 0;
    return { key: k, name: engineName(k), color: engineColor(k), v, w: `${(v / max) * 100}%` };
  });
});

async function load() {
  try {
    const { start, end } = lastNDays(30);
    const resp: any = await monitorApi.sourceStats(start, end, page.value, size);
    list.value = resp?.list || [];
    summary.value = resp?.summary || summary.value;
    total.value = resp?.total || 0;
  } catch { list.value = []; }
}

onMounted(async () => {
  try {
    const st = await monitorApi.queryStatus();
    pending.value = !!st?.pending;
    if (!st?.pending) await load();
  } catch { pending.value = false; }
});
</script>

<style scoped lang="scss">
.p-wrap { max-width: 1240px; margin: 0 auto; padding: 28px 36px 80px; display: flex; flex-direction: column; gap: 16px; }
.p-hd h2 { font-size: 22px; font-weight: 800; color: #0f1115; margin: 0; line-height: 33px; }
.p-hd p { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }
.p-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.p-kpi { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 18px; }
.p-kpi-label { font-size: 12px; color: #6b7280; }
.p-kpi-value { font-size: 24px; font-weight: 800; color: #111827; margin-top: 6px; line-height: 1.2; }
.p-kpi-sub { font-size: 11px; color: #9ca3af; margin-top: 4px; }
.p-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.p-card-h { padding: 14px 18px; border-bottom: 1px solid #f0f1f5; display: flex; align-items: center; gap: 10px; }
.p-card-t { font-size: 14.5px; font-weight: 800; color: #0f1115; }
.p-card-s { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }
.p-card-right { margin-left: auto; }
.p-page { font-size: 12px; color: #6b7280; }
.p-body { padding: 16px 18px 18px; }
.p-empty { text-align: center; color: #9ca3af; font-size: 13px; padding: 36px 0; }
.p-ebars { display: flex; flex-direction: column; gap: 12px; }
.p-ebar-row { display: grid; grid-template-columns: 90px 1fr 60px; gap: 10px; align-items: center; }
.p-ebar-name { font-size: 12.5px; color: #374151; display: flex; align-items: center; gap: 6px; }
.p-ebar-name i { width: 8px; height: 8px; border-radius: 50%; }
.p-ebar-track { height: 9px; background: #f3f4f6; border-radius: 100px; overflow: hidden; }
.p-ebar-track i { display: block; height: 100%; border-radius: 100px; min-width: 2px; }
.p-ebar-v { font-size: 12.5px; font-weight: 700; color: #111827; text-align: right; }
.p-table { display: flex; flex-direction: column; }
.p-tr { display: grid; grid-template-columns: minmax(160px, 2fr) 100px repeat(4, 80px) 90px; gap: 10px; align-items: center; padding: 11px 12px; border-bottom: 1px solid #f0f1f5; }
.p-tr:last-child { border-bottom: none; }
.p-th { background: #f5f6fa; border-radius: 8px; padding: 9px 12px; font-size: 11.5px; font-weight: 600; color: #5b606a; border-bottom: none; }
.c-n { font-size: 13px; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c-c { font-size: 12.5px; color: #6b7280; }
.c-r { text-align: right; font-size: 13px; font-weight: 600; color: #374151; }
.c-p { text-align: center; }
.p-ok { font-style: normal; font-size: 11px; font-weight: 700; color: #047857; background: #ecfdf5; border-radius: 6px; padding: 3px 8px; }
.p-no { font-style: normal; font-size: 11px; font-weight: 700; color: #9ca3af; background: #f3f4f6; border-radius: 6px; padding: 3px 8px; }
@media (max-width: 900px) { .p-kpis { grid-template-columns: 1fr 1fr; } }
</style>
