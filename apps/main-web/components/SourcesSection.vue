<script setup lang="ts">
const cols = ['豆包', 'DeepSeek', '千问', '元宝'];
const rows = [
  { label: '问答社区', values: [312, 96, 178, null] },
  { label: '官方网媒', values: [104, 287, 165, 142] },
  { label: '行业媒体', values: [186, null, 92, 231] },
  { label: '百科词条', values: [null, 77, null, null] },
];
function cellCls(v: number | null) {
  if (v === null) return 'gap';
  if (v >= 200) return 'dom';
  if (v >= 90) return 'own';
  return 'gap';
}
const insights = [
  { title: '引用竞争格局', desc: '声量份额 + 信源阵地热力图，你与竞品的阵地与缺口一眼看清' },
  { title: '引擎信源偏好', desc: '每个引擎更爱从哪类平台取材，「先做哪个」性价比排序不靠猜' },
  { title: '引用源透视表', desc: '源 × 监控问题明细下钻，本期 vs 上期，定位每条被引内容' },
  { title: '自有内容归因', desc: '发出去的文章被引了没、该补该改，每篇给出下一步动作' },
];
</script>

<template>
  <section class="sources section--tight">
    <div class="container">
      <div class="grid2">
        <!-- 左：热力图卡 -->
        <div class="heat-card">
          <div class="heat-header">
            <span class="dot dot--r" /><span class="dot dot--y" /><span class="dot dot--g" />
            <span class="heat-title">引用源情报 · 信源阵地热力图（近 30 天）</span>
          </div>
          <div class="heat-legend">
            <span class="legend"><i class="sw sw--own" />你方主导</span>
            <span class="legend"><i class="sw sw--comp" />竞品占领</span>
            <span class="legend"><i class="sw sw--gap" />机会缺口</span>
          </div>
          <table class="heat-table">
            <thead>
              <tr><th class="th-label" /><th v-for="c in cols" :key="c">{{ c }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.label">
                <td class="td-label">{{ r.label }}</td>
                <td v-for="(v, i) in r.values" :key="i">
                  <span v-if="v !== null" class="cell" :class="`cell--${cellCls(v)}`">{{ v }}</span>
                  <span v-else class="cell cell--null">—</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="heat-tips">
            <div class="tips-head">本期洞察 <span class="tips-chip">引用竞争格局</span></div>
            <p>「DeepSeek × 官方网媒」为竞品核心阵地（被引 287 次，你方占比 12%）；「元宝 × 问答社区」尚无人系统覆盖。</p>
            <p class="tips-suggest"><b>→ 建议：</b>官方网媒补位 2 篇 · 抢占元宝问答社区首批引用位</p>
            <p class="tips-foot">声量份额 · 源 × 监控问题透视 · 自有内容归因，均基于中立监测底座每日更新</p>
          </div>
        </div>

        <!-- 右：文案 + 洞察列表 -->
        <div class="heat-copy">
          <div class="eyebrow">引用源深度洞察</div>
          <h2 class="title">摸清 <em>AI</em> 的引用偏好，<br />把预算花在会被引用的地方</h2>
          <p class="sub">停止盲投。引用源情报从四个维度拆解 AI 引用池：你和竞品在 AI 的引用里各占多少、各引擎更爱从哪类平台取材、每一条被引内容的来龙去脉、你发的文章到底有没有被引——内容该怎么打，答案都在数据里。</p>
          <ul class="insights">
            <li v-for="i in insights" :key="i.title" class="insight">
              <span class="insight-icon">✓</span>
              <div>
                <div class="insight-title">{{ i.title }}</div>
                <div class="insight-desc">{{ i.desc }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.sources { background: #fff; padding-top: 80px; }
.grid2 { display: grid; grid-template-columns: 1.05fr 1fr; gap: 64px; align-items: start; }

.heat-card { background: linear-gradient(135deg, #f3f1fd 0%, #f5f1fc 55%, #f8f1fa 100%); border-radius: 20px; padding: 28px 26px 30px; }
.heat-header { display: flex; align-items: center; gap: 7px; margin-bottom: 18px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot--r { background: #fca5a5; } .dot--y { background: #fde68a; } .dot--g { background: #86efac; }
.heat-title { font-size: 13px; color: #6b7280; margin-left: 10px; font-weight: 500; }
.heat-legend { display: flex; gap: 22px; font-size: 12px; color: #6b7280; margin-bottom: 18px; }
.legend { display: flex; align-items: center; gap: 6px; }
.sw { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.sw--own { background: #6366f1; } .sw--comp { background: #1c1917; } .sw--gap { background: #fff; border: 1px dashed #d4d4d8; }

.heat-table { width: 100%; border-collapse: collapse; }
.heat-table th { font-size: 12px; font-weight: 500; color: #6b7280; padding: 8px 6px; text-align: center; }
.heat-table td { text-align: center; padding: 5px 6px; }
.th-label, .td-label { text-align: left !important; font-size: 13px; color: #4b5563; font-weight: 600; }
.td-label { padding-right: 10px !important; }

.cell {
  display: inline-block; min-width: 56px; padding: 9px 0; border-radius: 9px;
  font-size: 13px; font-weight: 700;
}
.cell--own { background: #6366f1; color: #fff; }
.cell--dom { background: #1c1917; color: #fff; }
.cell--gap { background: #fff; color: #9ca3af; border: 1px dashed #d4d4d8; }
.cell--null { background: transparent; color: #d1d5db; border: none; }

.heat-tips {
  margin-top: 20px; background: #fff; border-radius: 12px; padding: 18px 20px;
  border-left: 3px solid #6366f1;
}
.tips-head { font-size: 13.5px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
.tips-chip { margin-left: 8px; font-size: 11px; font-weight: 600; color: #6366f1; background: #eef2ff; padding: 3px 8px; border-radius: 4px; }
.heat-tips p { font-size: 13px; color: #4b5563; line-height: 1.75; margin: 0 0 6px; }
.tips-suggest { color: #7c3aed !important; font-weight: 600; }
.tips-foot { font-size: 12px; color: #9ca3af !important; margin-top: 10px !important; }

.eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.18em; color: #6b7280; margin-bottom: 18px; }
.title { font-size: 38px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; color: var(--ink); margin: 0 0 18px; em { font-style: normal; color: #6366f1; } }
.sub { font-size: 15px; color: #4b5563; line-height: 1.85; margin-bottom: 30px; }
.insights { list-style: none; padding: 0; }
.insight { display: flex; gap: 13px; padding: 12px 0; }
.insight-icon {
  width: 24px; height: 24px; border-radius: 999px;
  background: linear-gradient(135deg, #eef2ff, #f3e8ff); color: #6366f1;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.insight-title { font-size: 14.5px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
.insight-desc { font-size: 13px; color: #6b7280; }
</style>
