<script setup lang="ts">
const tab = ref<'overview' | 'geo' | 'sources'>('overview')
</script>

<template>
  <section class="section section-alt" id="report">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">报告示例 · 脱敏数据</div>
        <h2>GEO 报告示例：看得见、为什么、下一步做什么</h2>
        <p>
          一份合格的 GEO 优化报告不把分数当结论，而是把每个分数拆成问题、证据和动作。
          下面是品牌 AI 搜索可见性与引用源的综合视图示例。
        </p>
      </div>

      <div class="card dash">
        <div class="dash-top">
          <div>
            <div class="dash-title">示例品牌</div>
            <div class="dash-period">近 30 天 · 2026.08.15—09.14</div>
          </div>
          <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
            <span class="badge badge-success"><span class="dot" style="margin-right:.375rem" />数据已更新</span>
            <div class="tabs-list" role="tablist">
              <button class="tabs-trigger" type="button" role="tab" :data-state="tab === 'overview' ? 'active' : 'inactive'" @click="tab = 'overview'">综合概览</button>
              <button class="tabs-trigger" type="button" role="tab" :data-state="tab === 'geo' ? 'active' : 'inactive'" @click="tab = 'geo'">GEO 可见性</button>
              <button class="tabs-trigger" type="button" role="tab" :data-state="tab === 'sources' ? 'active' : 'inactive'" @click="tab = 'sources'">引用源洞察</button>
            </div>
          </div>
        </div>

        <div class="dash-body">
          <div class="kpis">
            <div class="card kpi">
              <div class="card-header"><span class="card-title">综合健康度</span><span class="badge badge-secondary">较上期 +12</span></div>
              <div class="card-content"><div class="v">78</div><div class="progress" style="margin-top:.5rem"><div style="width:78%" /></div></div>
            </div>
            <div class="card kpi">
              <div class="card-header"><span class="card-title">AI 品牌提及率</span></div>
              <div class="card-content"><div class="v">74%</div><div class="d">+16% 较上期</div></div>
            </div>
            <div class="card kpi">
              <div class="card-header"><span class="card-title">平均推荐位</span></div>
              <div class="card-content"><div class="v">#3.2</div><div class="d">↑ 1.4 位</div></div>
            </div>
            <div class="card kpi">
              <div class="card-header"><span class="card-title">有效引用源</span></div>
              <div class="card-content"><div class="v">126</div><div class="d">+18 本期新增</div></div>
            </div>
          </div>

          <div v-show="tab === 'overview'" class="tabs-content" style="margin-top:0">
            <div class="dash-grid">
              <div class="card">
                <div class="card-header" style="padding-bottom:.5rem">
                  <div class="card-title">问题采样明细</div>
                  <div class="card-description">最近一轮采样中的代表性问题与引擎表现</div>
                </div>
                <div class="table-wrap">
                  <table class="table">
                    <thead><tr><th>问题</th><th>引擎</th><th>推荐位</th><th>倾向</th><th>引用来源</th></tr></thead>
                    <tbody>
                      <tr><td style="max-width:220px">适合中型团队的项目管理工具有哪些？</td><td>DeepSeek</td><td class="mono">#2</td><td><span class="badge badge-success">正面</span></td><td class="text-muted">知乎 · 自有案例</td></tr>
                      <tr><td style="max-width:220px">预算有限，如何选择企业协作软件？</td><td>豆包</td><td class="mono">#4</td><td><span class="badge badge-secondary">中性</span></td><td class="text-muted">36氪 · 产品页</td></tr>
                      <tr><td style="max-width:220px">国产 CRM 哪个更适合制造业？</td><td>通义千问</td><td><span class="badge badge-outline">未出现</span></td><td class="text-muted">—</td><td><span class="badge badge-destructive">机会问题</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="card">
                <div class="card-header" style="padding-bottom:.75rem">
                  <div class="card-title">优先级建议</div>
                  <div class="card-description">按影响、难度与证据强度排序</div>
                </div>
                <div class="card-content">
                  <div class="rec">
                    <span class="badge badge-default" style="align-self:flex-start">P0</span>
                    <div><div class="rt">补齐制造业场景证据 <span class="badge badge-outline">GEO</span></div><div class="rd">在 3 组高提问量问题中未进入推荐名单，建议发布一篇含客户规模、部署周期和结果指标的对比内容。</div></div>
                  </div>
                  <div class="rec">
                    <span class="badge badge-secondary" style="align-self:flex-start">P1</span>
                    <div><div class="rt">扩充 7 组高价值引用信源 <span class="badge badge-outline">GEO</span></div><div class="rd">这 7 组高价值问题缺少权威第三方信源，建议补充实测、案例和对比证据，提升被 AI 引用的概率。</div></div>
                  </div>
                  <div class="rec">
                    <span class="badge badge-secondary" style="align-self:flex-start">P1</span>
                    <div><div class="rt">补全品牌事实与产品证据 <span class="badge badge-outline">技术</span></div><div class="rd">品牌资料缺少价格区间、功能、适用场景和客户结果，建议补全可验证事实并持续观察引用变化。</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-show="tab === 'geo'" class="tabs-content" style="margin-top:0">
            <div class="dash-grid">
              <div class="card">
                <div class="card-header" style="padding-bottom:.5rem">
                  <div class="card-title">健康度趋势</div>
                  <div class="card-description">近 10 个采样周期</div>
                </div>
                <div class="card-content">
                  <svg viewBox="0 0 400 140" preserveAspectRatio="none" style="width:100%;height:160px;color:hsl(var(--primary))" aria-hidden="true">
                    <g stroke="hsl(var(--border))" stroke-dasharray="3 3"><line x1="0" x2="400" y1="35" y2="35" /><line x1="0" x2="400" y1="70" y2="70" /><line x1="0" x2="400" y1="105" y2="105" /></g>
                    <g fill="currentColor" opacity=".85">
                      <rect x="8" y="73" width="26" height="67" rx="3" /><rect x="48" y="66" width="26" height="74" rx="3" /><rect x="88" y="69" width="26" height="71" rx="3" /><rect x="128" y="57" width="26" height="83" rx="3" /><rect x="168" y="60" width="26" height="80" rx="3" /><rect x="208" y="50" width="26" height="90" rx="3" /><rect x="248" y="53" width="26" height="87" rx="3" /><rect x="288" y="41" width="26" height="99" rx="3" /><rect x="328" y="43" width="26" height="97" rx="3" /><rect x="368" y="31" width="26" height="109" rx="3" />
                    </g>
                  </svg>
                </div>
              </div>
              <div class="card">
                <div class="card-header" style="padding-bottom:.75rem"><div class="card-title">按引擎提及率</div><div class="card-description">同一问题集在各引擎的出现比例</div></div>
                <div class="card-content source-list">
                  <div class="source-row"><div class="sr"><span>DeepSeek</span><span class="mono text-muted">86%</span></div><div class="progress"><div style="width:86%" /></div></div>
                  <div class="source-row"><div class="sr"><span>豆包</span><span class="mono text-muted">79%</span></div><div class="progress"><div style="width:79%" /></div></div>
                  <div class="source-row"><div class="sr"><span>通义千问</span><span class="mono text-muted">64%</span></div><div class="progress"><div style="width:64%" /></div></div>
                  <div class="source-row"><div class="sr"><span>元宝</span><span class="mono text-muted">71%</span></div><div class="progress"><div style="width:71%" /></div></div>
                  <div class="source-row"><div class="sr"><span>Kimi</span><span class="mono text-muted">68%</span></div><div class="progress"><div style="width:68%" /></div></div>
                </div>
              </div>
            </div>
          </div>

          <div v-show="tab === 'sources'" class="tabs-content" style="margin-top:0">
            <div class="dash-grid">
              <div class="card">
                <div class="card-header" style="padding-bottom:.5rem"><div class="card-title">引用源类型分布</div><div class="card-description">AI 回答中被实际引用的信源</div></div>
                <div class="table-wrap">
                  <table class="table">
                    <thead><tr><th>信源类型</th><th>数量</th><th>占比</th><th>状态</th></tr></thead>
                    <tbody>
                      <tr><td>行业媒体 / 资讯</td><td class="mono">48</td><td class="mono">38%</td><td><span class="badge badge-success">充足</span></td></tr>
                      <tr><td>问答社区（知乎等）</td><td class="mono">31</td><td class="mono">25%</td><td><span class="badge badge-success">充足</span></td></tr>
                      <tr><td>自有官网 / 产品页</td><td class="mono">27</td><td class="mono">21%</td><td><span class="badge badge-secondary">一般</span></td></tr>
                      <tr><td>第三方测评 / 对比</td><td class="mono">12</td><td class="mono">10%</td><td><span class="badge badge-destructive">缺口</span></td></tr>
                      <tr><td>客户案例 / 白皮书</td><td class="mono">8</td><td class="mono">6%</td><td><span class="badge badge-destructive">缺口</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="card">
                <div class="card-header" style="padding-bottom:.75rem"><div class="card-title">缺口提醒</div></div>
                <div class="card-content" style="display:flex;flex-direction:column;gap:.75rem">
                  <div class="alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                    <div><div class="alert-title">7 组高价值问题缺少权威第三方信源</div><div class="alert-desc">竞品在这些问题上平均被引用 2.3 个第三方来源。</div></div>
                  </div>
                  <div class="alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
                    <div><div class="alert-title">制造业场景无可引用案例</div><div class="alert-desc">建议发布含客户规模、部署周期和结果指标的对比内容。</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
