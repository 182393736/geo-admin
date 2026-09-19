<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader
      title="单次品牌诊断"
      description="无需订阅、无需建品牌，对任意品牌跑一次完整诊断 · 适合新品牌首测、提案打单"
    >
      <template #actions>
        <Button size="sm" variant="outline" @click="openCalc">
          <Calculator class="h-3.5 w-3.5" />
          费用计算器
        </Button>
        <Button size="sm" @click="openWizard">
          <Zap class="h-3.5 w-3.5" />
          立即诊断
        </Button>
      </template>
    </PageHeader>

    <!-- Blue hero -->
    <div class="overflow-hidden rounded-lg bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 shadow-lg">
      <div class="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="flex flex-col justify-center px-8 py-10 text-white sm:px-11 sm:py-12">
          <span class="mb-4 inline-flex items-center gap-2 text-[11.5px] font-semibold tracking-wide text-blue-200">
            <span class="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_0_4px_rgba(125,211,252,0.22)]" />
            单次品牌诊断 · 按积分计费
          </span>
          <h2 class="mb-4 text-2xl font-semibold leading-snug tracking-tight sm:text-[30px] sm:leading-[1.22]">
            为任意品牌，即时跑出<br />
            <em class="not-italic bg-gradient-to-r from-sky-300 to-blue-200 bg-clip-text text-transparent">一份完整的 AI 诊断报告</em>
          </h2>
          <p class="mb-6 max-w-[480px] text-sm leading-relaxed text-white/70 sm:text-[14.5px] sm:leading-[1.75]">
            无需订阅、不必先建品牌，按需即跑。覆盖五大国产大模型的网页端，并支持 豆包 / DeepSeek / 通义千问 APP 端，输出品牌可见性、排名、引用源与竞品对比，几分钟生成一份可直接交付的 PDF 报告——新品牌上线前快速摸底，代理提案时拿一份有分量的诊断上桌。
          </p>
          <div class="mb-4 flex flex-wrap items-center gap-3">
            <Button
              class="h-11 bg-white px-6 text-[15px] font-semibold text-blue-950 hover:bg-white/90"
              @click="openWizard"
            >
              <Zap class="h-4 w-4" />
              立即诊断
            </Button>
            <Button
              variant="outline"
              class="h-11 border-white/30 bg-transparent px-6 text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white"
              @click="openCalc"
            >
              <Calculator class="h-4 w-4" />
              费用计算器
            </Button>
            <Button
              variant="outline"
              class="h-11 border-white/30 bg-transparent px-6 text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white"
              @click="previewSample"
            >
              <Eye class="h-4 w-4" />
              预览示例报告
            </Button>
          </div>
          <div class="mb-3 font-mono text-xs text-white/60">
            网页端 2 / APP 端 4(豆包 8) 积分 · 每监控问题·平台 · 100 积分起 · 折合 ¥0.1/积分
          </div>
          <div class="grid gap-1 text-xs text-white/45">
            <div>网页端 豆包 · DeepSeek · 文心一言 · 通义千问 · 元宝</div>
            <div>APP 端 豆包 · DeepSeek · 通义千问 · 预计 3 小时内出报告</div>
          </div>
        </div>

        <div class="flex items-center justify-center px-6 pb-10 pt-2 lg:px-10 lg:py-9 lg:pl-2">
          <div class="w-full max-w-[338px] -rotate-[1.4deg] rounded-lg border bg-card p-5 text-card-foreground shadow-2xl">
            <div class="mb-4 flex items-start justify-between">
              <div>
                <div class="text-sm font-semibold">诊断报告</div>
                <div class="mt-0.5 text-[11.5px] text-muted-foreground">格力空调 · 网页端 + APP 端</div>
              </div>
              <Badge variant="secondary" class="text-[10px]">示例</Badge>
            </div>
            <div class="mb-3.5 flex items-baseline gap-2.5 border-b pb-3.5">
              <div class="text-4xl font-semibold tabular-nums tracking-tight">
                68<span class="text-lg">%</span>
              </div>
              <div class="text-xs leading-snug text-muted-foreground">AI 可见性<br />全端综合</div>
            </div>
            <div class="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-wide text-muted-foreground">
              网页端
              <span class="h-px flex-1 bg-border" />
            </div>
            <div v-for="b in sampleBars" :key="b.name" class="mb-2 flex items-center gap-2.5 text-xs">
              <span class="flex w-[72px] shrink-0 items-center gap-1.5 text-foreground/80">
                <i class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: b.color }" />
                {{ b.name }}
              </span>
              <span class="h-1.5 flex-1 overflow-hidden rounded-md bg-muted">
                <span class="block h-full rounded-md" :style="{ width: b.val + '%', background: b.color }" />
              </span>
              <span class="w-8 shrink-0 text-right font-mono text-xs font-semibold tabular-nums">{{ b.val }}%</span>
            </div>
            <div class="mb-2 mt-1 flex items-center gap-2 text-[10px] font-semibold tracking-wide text-muted-foreground">
              APP 端
              <span class="h-px flex-1 bg-border" />
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="c in sampleApps"
                :key="c.name"
                class="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium"
              >
                <i class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: c.color }" />
                {{ c.name }}
              </span>
            </div>
            <div class="mt-3.5 flex justify-between border-t pt-3.5 text-[11.5px] text-muted-foreground">
              <span>平均排名 <b class="font-semibold text-foreground">#3</b></span>
              <span>引用源 <b class="font-semibold text-foreground">156</b></span>
              <span>竞品差距 <b class="font-semibold text-foreground">+4%</b></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Steps -->
    <div class="grid gap-3.5 md:grid-cols-3">
      <Card v-for="s in steps" :key="s.no">
        <CardContent class="flex items-start gap-3.5 p-5">
          <div class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
            {{ s.no }}
          </div>
          <div>
            <div class="mb-1 text-sm font-semibold">{{ s.t }}</div>
            <div class="text-xs leading-relaxed text-muted-foreground">{{ s.d }}</div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Includes -->
    <Card>
      <CardContent class="p-6">
        <div class="mb-4 text-sm font-semibold">每份诊断报告包含</div>
        <div class="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="inc in includes"
            :key="inc.t"
            class="flex items-start gap-3 rounded-lg bg-muted/60 p-3.5"
          >
            <component :is="inc.icon" class="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
            <div>
              <div class="mb-1 text-[13px] font-semibold">{{ inc.t }}</div>
              <div class="text-[11.5px] leading-snug text-muted-foreground">{{ inc.d }}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Task list -->
    <div v-if="loading" class="flex justify-center py-10 text-sm text-muted-foreground">加载中…</div>
    <template v-else-if="tasks.length">
      <div class="flex flex-wrap items-center gap-3">
        <div class="inline-flex gap-1.5">
          <button
            v-for="f in filters"
            :key="f.key"
            type="button"
            class="rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors"
            :class="filter === f.key
              ? 'border-foreground bg-foreground text-background'
              : 'border-input bg-background text-muted-foreground hover:border-muted-foreground hover:text-foreground'"
            @click="filter = f.key"
          >{{ f.label }}</button>
        </div>
        <div class="ml-auto flex gap-2">
          <Button size="sm" variant="outline" @click="load">
            <RefreshCw class="h-3.5 w-3.5" />
            刷新
          </Button>
          <Button size="sm" @click="openWizard">
            <Zap class="h-3.5 w-3.5" />
            立即诊断
          </Button>
        </div>
      </div>

      <Card
        v-for="t in filteredTasks"
        :key="t.diagnosis_id"
        :class="isActive(t) ? 'border-primary/30 shadow-[0_8px_28px_rgba(37,99,235,0.08)]' : ''"
      >
        <CardContent class="p-5">
          <div class="flex flex-wrap items-center gap-2.5">
            <div class="min-w-0 flex-1">
              <div class="text-base font-semibold">{{ brandName(t) }}</div>
              <div class="mt-1 font-mono text-xs text-muted-foreground">{{ t.diagnosis_id }}</div>
              <div class="mt-2 text-xs text-muted-foreground">
                {{ formatTime(t.created_at) }} · {{ t.topic_count || '—' }} 话题 · ✦{{ t.credit_cost ?? '—' }}
              </div>
            </div>
            <Badge :class="statusBadgeClass(t.status)">
              <span class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
              {{ statusMeta(t.status).label }}
            </Badge>
          </div>

          <div v-if="isQueued(t)" class="mt-4 rounded-lg bg-muted/60 px-4 py-3.5">
            <div class="flex justify-between text-sm text-muted-foreground">
              <span>队列状态</span>
              <b class="font-semibold text-foreground">排队中</b>
            </div>
            <div class="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
              预计 3 小时内开始生成（高峰期可能排队）。可随时取消。
            </div>
          </div>

          <div v-if="isRunning(t)" class="mt-4">
            <div class="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>生成进度</span>
              <b class="font-semibold text-foreground">{{ t.progress || 35 }}%</b>
            </div>
            <div class="h-1.5 overflow-hidden rounded-md bg-muted">
              <div
                class="h-full rounded-md bg-primary transition-all"
                :style="{ width: `${t.progress || 35}%` }"
              />
            </div>
          </div>

          <div v-if="t.status === 'done' && t.result" class="mt-4 flex items-center gap-3">
            <div class="text-[34px] font-semibold tabular-nums tracking-tight leading-none">
              {{ (t.result as any).visibility ?? 68 }}<span class="text-lg">%</span>
            </div>
            <div class="text-[11.5px] leading-snug text-muted-foreground">AI 可见性<br />全端综合</div>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2 border-t pt-3.5">
            <span v-if="isQueued(t) || isRunning(t)" class="text-xs text-muted-foreground">预计 3 小时内出报告</span>
            <div class="flex-1" />
            <Button v-if="canCancel(t)" size="sm" variant="outline" @click="cancelTask(t)">取消</Button>
            <Button v-if="t.status === 'done'" size="sm" @click="previewSample">查看报告</Button>
            <Button size="sm" variant="outline" @click="openWizard">再次诊断</Button>
          </div>
        </CardContent>
      </Card>
    </template>

    <!-- 费用计算器 / 下单确认 -->
    <Teleport to="body">
      <div
        v-if="calcOpen"
        class="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        @click.self="calcOpen = false"
      >
        <Card class="flex max-h-[90vh] w-full max-w-[820px] flex-col overflow-hidden shadow-lg">
          <div class="flex items-start justify-between gap-4 border-b px-6 py-5">
            <div>
              <h3 class="text-lg font-semibold tracking-tight">
                {{ calcMode === 'pay' ? '确认诊断范围' : '费用计算器' }}
              </h3>
              <p class="mt-1.5 max-w-[560px] text-xs leading-relaxed text-muted-foreground">
                按引擎 × 终端估算积分消耗 · 网页端 2 / APP 端 4(豆包 8) 积分 / 监控问题·平台 · 100 积分起 · 仅供估价
              </p>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" @click="calcOpen = false">
              <X class="h-4 w-4" />
            </Button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-5">
            <div class="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
              <div>
                <div>
                  <div class="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                    <Search class="h-4 w-4 text-primary" />
                    诊断监控问题数量
                  </div>
                  <div class="mb-4 text-xs text-muted-foreground">本次诊断要覆盖的监控问题 / 关键词总数</div>
                  <div class="flex flex-wrap items-center gap-2.5">
                    <div class="inline-flex overflow-hidden rounded-lg border">
                      <button
                        type="button"
                        class="flex h-12 w-11 items-center justify-center bg-muted text-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        @click="topicCount = Math.max(1, topicCount - 1)"
                      >−</button>
                      <input
                        v-model.number="topicCount"
                        class="h-12 w-[110px] border-x bg-background text-center font-mono text-xl font-semibold tabular-nums outline-none"
                        min="1"
                        type="number"
                      >
                      <button
                        type="button"
                        class="flex h-12 w-11 items-center justify-center bg-muted text-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        @click="topicCount += 1"
                      >+</button>
                    </div>
                    <div class="inline-flex gap-2">
                      <button
                        v-for="n in [30, 50, 100]"
                        :key="n"
                        type="button"
                        class="rounded-lg border border-input bg-background px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        @click="topicCount = n"
                      >{{ n }}</button>
                    </div>
                  </div>
                </div>

                <div class="mt-7 border-t pt-7">
                  <div class="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                    <Monitor class="h-4 w-4 text-primary" />
                    诊断平台 · 终端
                    <button
                      type="button"
                      class="ml-auto text-xs font-semibold text-primary hover:underline"
                      @click="toggleAll"
                    >{{ allSelected ? '取消全选' : '全选' }}</button>
                  </div>
                  <div class="mb-4 text-xs text-muted-foreground">
                    勾选每个 AI 引擎要诊断的终端,逐项单独计费(仅豆包 / DeepSeek / 通义千问开放 APP 端)
                  </div>
                  <div class="flex flex-col gap-2">
                    <div
                      v-for="eng in engines"
                      :key="eng.key"
                      class="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/50 px-3.5 py-2.5"
                    >
                      <span class="inline-flex items-center gap-2 text-sm font-semibold">
                        <span class="h-2 w-2 rounded-full" :style="{ background: eng.color }" />
                        {{ eng.label }}
                      </span>
                      <span class="inline-flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          class="rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors"
                          :class="isSel(eng.key, 'web')
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-input bg-background text-muted-foreground hover:border-muted-foreground'"
                          @click="toggleEnd(eng.key, 'web')"
                        >网页端 ✦2</button>
                        <button
                          v-if="eng.app"
                          type="button"
                          class="rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors"
                          :class="isSel(eng.key, 'app')
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-input bg-background text-muted-foreground hover:border-muted-foreground'"
                          @click="toggleEnd(eng.key, 'app')"
                        >APP 端 ✦{{ eng.key === 'doubao' ? 8 : 4 }}</button>
                        <span v-else class="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">APP 端 · 暂无</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-lg bg-gradient-to-br from-blue-800 to-slate-900 p-6 text-white shadow-md">
                <div class="mb-5 flex items-center gap-2 text-[13px] font-semibold text-white/70">
                  <Coins class="h-4 w-4 text-amber-300" />
                  费用预估
                </div>
                <div class="mb-3 flex items-center justify-between text-[13px] text-white/75">
                  <span>诊断监控问题</span>
                  <span class="font-mono font-semibold text-white">{{ topicCount }}</span>
                </div>
                <div class="mb-3 flex items-center justify-between text-[13px] text-white/75">
                  <span>引擎 · 终端</span>
                  <span class="font-mono font-semibold text-white">网页端 {{ webCount }} · APP 端 {{ appCount }}</span>
                </div>
                <div class="mb-4 flex items-center justify-between text-[13px] text-white/75">
                  <span>查询次数</span>
                  <span class="font-mono font-semibold text-white">{{ queryTimes }} 次</span>
                </div>
                <div class="mb-4 rounded-lg bg-white/5 px-3 py-2.5 text-center font-mono text-xs text-white/55">
                  {{ topicCount }} 监控问题 × (网页端 {{ webCount }}×2 + APP 端 {{ appCostDetail }}) 积分
                </div>
                <div class="mb-4 h-px bg-white/10" />
                <div class="mb-1 text-xs text-white/70">预估消耗积分</div>
                <div class="mb-1 flex items-baseline gap-1">
                  <span class="text-[22px] font-semibold">✦</span>
                  <span class="text-[42px] font-semibold leading-none tracking-tight">{{ formatNum(estimate) }}</span>
                </div>
                <div class="mb-4 text-xs font-medium text-white/50">≈ ¥{{ (estimate * 0.1).toFixed(0) }} · 按基准价 ¥0.1/积分</div>
                <Button
                  class="h-11 w-full bg-white text-[15px] font-semibold text-primary hover:bg-white/90"
                  :disabled="submitting || !selectedEnds.length"
                  @click="submitDiagnosis"
                >
                  {{ submitting ? '提交中…' : (calcMode === 'pay' ? '确认下单 →' : '去诊断 →') }}
                </Button>
                <div class="mt-3 text-center text-[11px] leading-relaxed text-white/50">
                  仅供估价,实际以诊断订单结算为准
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Teleport>

    <!-- 立即诊断向导 -->
    <Teleport to="body">
      <div
        v-if="wizOpen"
        class="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        @click.self="wizOpen = false"
      >
        <Card class="flex max-h-[90vh] w-full max-w-[720px] flex-col overflow-hidden shadow-lg">
          <div class="flex items-start justify-between gap-4 border-b px-6 py-5">
            <div>
              <h3 class="text-lg font-semibold tracking-tight">单次品牌诊断</h3>
              <p class="mt-1.5 max-w-[560px] text-xs leading-relaxed text-muted-foreground">
                选择诊断对象 → 配置话题 → 选平台结算 · 预计 3 小时内出报告 · 网页端 2 / APP端 4(豆包 8) 积分 / 话题·平台,100 积分起
              </p>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0" @click="wizOpen = false">
              <X class="h-4 w-4" />
            </Button>
          </div>

          <div class="min-h-[230px] flex-1 overflow-y-auto px-6 py-5">
            <div class="mb-4 text-[15px] font-semibold">确定您想诊断的品牌</div>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="rounded-lg border p-4 text-left transition-colors"
                :class="brandMode === 'current'
                  ? 'border-primary bg-primary/[0.04]'
                  : 'border-input bg-background hover:border-muted-foreground'"
                @click="brandMode = 'current'"
              >
                <div class="mb-1 text-sm font-semibold">当前品牌</div>
                <div class="text-xs leading-relaxed text-muted-foreground">诊断正在监测的品牌</div>
              </button>
              <button
                type="button"
                class="rounded-lg border p-4 text-left transition-colors"
                :class="brandMode === 'new'
                  ? 'border-primary bg-primary/[0.04]'
                  : 'border-input bg-background hover:border-muted-foreground'"
                @click="brandMode = 'new'"
              >
                <div class="mb-1 text-sm font-semibold">新品牌</div>
                <div class="text-xs leading-relaxed text-muted-foreground">创建一个未监测的品牌来诊断</div>
              </button>
            </div>

            <div v-if="brandMode === 'current'" class="mt-4 rounded-lg border bg-muted/50 p-5">
              <div class="flex items-center gap-3.5">
                <div class="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary text-[22px] font-semibold text-primary-foreground">
                  {{ brandInitial }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-xl font-semibold tracking-tight">{{ currentBrandName }}</div>
                  <div class="mt-0.5 text-xs text-muted-foreground">监测中</div>
                </div>
                <Badge class="shrink-0 border-transparent bg-emerald-100 text-emerald-800">档案完整</Badge>
              </div>
              <div class="mb-2 mt-4 text-[11.5px] text-muted-foreground">
                已登记别名 · AI 回答中出现这些名称都算作提及该品牌
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="a in brandAliases"
                  :key="a"
                  class="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium"
                >{{ a }}</span>
                <span
                  v-if="!brandAliases.length"
                  class="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >暂无别名</span>
              </div>
            </div>

            <div v-else class="mt-4 rounded-lg border bg-muted/50 p-5">
              <div class="mb-2 text-sm font-semibold">品牌名称</div>
              <Input v-model="newBrandName" class="h-10" placeholder="例如：格力空调" />
            </div>
          </div>

          <div class="flex items-center gap-2.5 border-t px-6 py-4">
            <div class="flex-1" />
            <Button variant="outline" @click="continueWithTopics('existing')">使用已监控的话题</Button>
            <Button @click="continueWithTopics('new')">使用新的话题</Button>
          </div>
        </Card>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  BarChart3,
  Calculator,
  Coins,
  Eye,
  Link2,
  Monitor,
  RefreshCw,
  Search,
  Users,
  X,
  Zap,
} from 'lucide-vue-next'
import { diagnosisApi } from '@/api/modules/diagnosis'
import { brandApi } from '@/api/modules/brand'
import { monitorApi } from '@/api/modules/monitor'
import { useAuthStore } from '@/stores/auth'
import type { DiagnosisTaskItem } from '@/api/types'
import { Message } from '@/lib/toast'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent, Input } from '@/components/ui'

const SAMPLE_URL = 'https://timus.cn/r/hOI0eC710ynTBx_O'
const auth = useAuthStore()

const sampleBars = [
  { name: '豆包', color: '#f59e0b', val: 74 },
  { name: 'DeepSeek', color: '#3b82f6', val: 61 },
  { name: '文心一言', color: '#e91e63', val: 58 },
  { name: '通义千问', color: '#10b981', val: 70 },
  { name: '元宝', color: '#ef4444', val: 66 },
]
const sampleApps = [
  { name: '豆包', color: '#f59e0b' },
  { name: 'DeepSeek', color: '#3b82f6' },
  { name: '通义千问', color: '#10b981' },
]
const steps = [
  { no: 1, t: '配置诊断范围', d: '选定诊断监控问题数量与要覆盖的大模型平台' },
  { no: 2, t: '按量付费', d: '按监控问题 × 平台消耗积分(网页端 2 / APP 端 4,豆包 APP 8),100 积分起,确认后进入诊断队列' },
  { no: 3, t: '生成报告', d: '预计 3 小时内交付完整可下载报告(高峰期可能排队)' },
]
const includes = [
  { t: '品牌可见性', d: '在各模型回答中的出现率与占位', icon: Eye },
  { t: '排名快照', d: '各监控问题下品牌的排序位置', icon: BarChart3 },
  { t: '引用源分析', d: '模型引用了哪些内容与站点', icon: Link2 },
  { t: '竞品对比', d: '与主要竞品的可见性 / 排名差距', icon: Users },
]

const engines = [
  { key: 'doubao', label: '豆包', color: '#f59e0b', app: true },
  { key: 'deepseek', label: 'DeepSeek', color: '#3b82f6', app: true },
  { key: 'wenxin', label: '文心一言', color: '#e91e63', app: false },
  { key: 'qwen', label: '通义千问', color: '#10b981', app: true },
  { key: 'yuanbao', label: '元宝', color: '#ef4444', app: false },
]

type EndKey = `${string}:${'web' | 'app'}`
const selectedEnds = ref<EndKey[]>([
  'doubao:web', 'doubao:app',
  'deepseek:web', 'deepseek:app',
  'wenxin:web',
  'qwen:web', 'qwen:app',
  'yuanbao:web',
])
const topicCount = ref(100)
const calcOpen = ref(false)
const calcMode = ref<'calc' | 'pay'>('calc')
const wizOpen = ref(false)
const brandMode = ref<'current' | 'new'>('current')
const newBrandName = ref('')
const brandAliases = ref<string[]>([])
const monitoredQueryCount = ref(30)
const submitting = ref(false)
const loading = ref(false)
const tasks = ref<DiagnosisTaskItem[]>([])
const filter = ref<'all' | 'active' | 'done'>('all')

const filters = [
  { key: 'all' as const, label: '全部' },
  { key: 'active' as const, label: '进行中' },
  { key: 'done' as const, label: '已完成' },
]

const currentBrandName = computed(() => auth.activeBrand?.name || '未选择品牌')
const brandInitial = computed(() => (currentBrandName.value || '品').slice(0, 1))

const webCount = computed(() => selectedEnds.value.filter(k => k.endsWith(':web')).length)
const appCount = computed(() => selectedEnds.value.filter(k => k.endsWith(':app')).length)
const doubaoApp = computed(() => selectedEnds.value.includes('doubao:app'))
const normalApp = computed(() => appCount.value - (doubaoApp.value ? 1 : 0))
const appCostDetail = computed(() => {
  const parts: string[] = []
  if (normalApp.value) parts.push(`${normalApp.value}×4`)
  if (doubaoApp.value) parts.push(`1×8`)
  return parts.join(' + ') || '0'
})
const unitCost = computed(() => webCount.value * 2 + normalApp.value * 4 + (doubaoApp.value ? 8 : 0))
const queryTimes = computed(() => Math.max(0, topicCount.value) * (webCount.value + appCount.value))
const estimate = computed(() => Math.max(100, topicCount.value * unitCost.value))
const allSelected = computed(() => {
  let total = 0
  for (const e of engines) {
    total += 1
    if (e.app) total += 1
  }
  return selectedEnds.value.length >= total
})

const filteredTasks = computed(() => {
  if (filter.value === 'all') return tasks.value
  if (filter.value === 'done') return tasks.value.filter(t => t.status === 'done' || t.status === 'partial')
  return tasks.value.filter(t => ['queued', 'pending_pay', 'pending', 'crawling', 'generating', 'running'].includes(t.status))
})

function isSel(engine: string, end: 'web' | 'app') {
  return selectedEnds.value.includes(`${engine}:${end}`)
}
function toggleEnd(engine: string, end: 'web' | 'app') {
  const k = `${engine}:${end}` as EndKey
  const i = selectedEnds.value.indexOf(k)
  if (i >= 0) selectedEnds.value.splice(i, 1)
  else selectedEnds.value.push(k)
}
function toggleAll() {
  if (allSelected.value) {
    selectedEnds.value = []
    return
  }
  const next: EndKey[] = []
  for (const e of engines) {
    next.push(`${e.key}:web`)
    if (e.app) next.push(`${e.key}:app`)
  }
  selectedEnds.value = next
}
function formatNum(n: number) {
  return n.toLocaleString('en-US')
}

function openCalc() {
  calcMode.value = 'calc'
  calcOpen.value = true
}
function openWizard() {
  brandMode.value = auth.activeBrandId ? 'current' : 'new'
  wizOpen.value = true
  loadBrandMeta()
}
function previewSample() {
  window.open(SAMPLE_URL, '_blank', 'noopener')
}

async function loadBrandMeta() {
  try {
    const [aliasesRes, queries]: any[] = await Promise.all([
      brandApi.aliases().catch(() => null),
      monitorApi.queryList('all').catch(() => null),
    ])
    const list = aliasesRes?.aliases || aliasesRes || []
    brandAliases.value = (Array.isArray(list) ? list : [])
      .map((a: any) => (typeof a === 'string' ? a : a.alias || a.name))
      .filter(Boolean)
      .slice(0, 12)
    const qlist = queries?.list || []
    monitoredQueryCount.value = Math.max(1, Array.isArray(qlist) ? qlist.length : 30)
  } catch { /* ignore */ }
}

function continueWithTopics(kind: 'existing' | 'new') {
  const name = brandMode.value === 'current' ? currentBrandName.value : newBrandName.value.trim()
  if (!name) {
    Message.warning(brandMode.value === 'current' ? '请先选择品牌' : '请输入品牌名称')
    return
  }
  topicCount.value = kind === 'existing' ? monitoredQueryCount.value : 50
  wizOpen.value = false
  calcMode.value = 'pay'
  calcOpen.value = true
}

async function submitDiagnosis() {
  const name = calcMode.value === 'pay'
    ? (brandMode.value === 'current' ? currentBrandName.value : newBrandName.value.trim())
    : (auth.activeBrand?.name || newBrandName.value.trim() || '未命名品牌')
  if (!name) {
    Message.warning('请先指定品牌')
    return
  }
  if (!selectedEnds.value.length) {
    Message.warning('请至少选择一个引擎终端')
    return
  }
  submitting.value = true
  try {
    const map = new Map<string, Array<'web' | 'app'>>()
    for (const k of selectedEnds.value) {
      const [engine, end] = k.split(':') as [string, 'web' | 'app']
      if (!map.has(engine)) map.set(engine, [])
      map.get(engine)!.push(end)
    }
    const platforms = [...map.entries()].map(([engine, ends]) => ({ engine, ends }))
    await diagnosisApi.create({
      brand_name: name,
      brand_id: brandMode.value === 'current' ? auth.activeBrandId : null,
      aliases: brandAliases.value,
      topic_count: topicCount.value,
      platforms,
      target_brand_input: { name, brand_id: brandMode.value === 'current' ? auth.activeBrandId : null },
    })
    Message.success('已加入诊断队列')
    calcOpen.value = false
    await load()
  } catch (e: any) {
    Message.error(e?.message || '下单失败')
  } finally {
    submitting.value = false
  }
}

function brandName(t: DiagnosisTaskItem) {
  const input = t.target_brand_input as any
  return input?.name || input?.brand_name || '未命名品牌'
}
function formatTime(raw?: string) {
  if (!raw) return '—'
  const d = new Date(raw)
  if (!Number.isFinite(d.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
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
  }
  return map[status] || { label: status, cls: 'cancelled' }
}
function statusBadgeClass(status: string) {
  const cls = statusMeta(status).cls
  if (cls === 'queued' || cls === 'partial') return 'border-transparent bg-amber-100 text-amber-900'
  if (cls === 'running') return 'border-transparent bg-primary/10 text-primary'
  if (cls === 'done') return 'border-transparent bg-emerald-100 text-emerald-800'
  if (cls === 'failed') return 'border-transparent bg-red-100 text-red-700'
  return 'border-transparent bg-muted text-muted-foreground'
}
function isQueued(t: DiagnosisTaskItem) {
  return ['queued', 'pending_pay', 'pending'].includes(t.status)
}
function isRunning(t: DiagnosisTaskItem) {
  return ['crawling', 'generating', 'running'].includes(t.status)
}
function isActive(t: DiagnosisTaskItem) {
  return isQueued(t) || isRunning(t)
}
function canCancel(t: DiagnosisTaskItem) {
  return isQueued(t) || isRunning(t)
}

async function cancelTask(t: DiagnosisTaskItem) {
  try {
    await diagnosisApi.cancel(t.diagnosis_id)
    Message.success('已取消')
    await load()
  } catch (e: any) {
    Message.error(e?.message || '取消失败')
  }
}

async function load() {
  loading.value = true
  try {
    const res = await diagnosisApi.tasks(1, 50)
    tasks.value = res?.list || []
  } catch {
    tasks.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
