<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader
      title="发布稿件"
      description="多媒体编辑 · 一键分发到 AI 引擎收录的内容平台 · 让稿件被豆包 / DeepSeek / 文心一言引用"
    />

    <!-- 上传 / 选稿 -->
    <Card>
      <CardContent class="space-y-3.5 p-5">
        <div class="flex gap-2">
          <Button
            size="sm"
            :variant="sourceMode === 'upload' ? 'default' : 'outline'"
            @click="sourceMode = 'upload'"
          >
            <Upload class="h-3.5 w-3.5" />
            上传文档
          </Button>
          <Button
            size="sm"
            :variant="sourceMode === 'draft' ? 'default' : 'outline'"
            @click="switchDraftMode"
          >
            <FileText class="h-3.5 w-3.5" />
            选择已有稿件
          </Button>
        </div>

        <div
          v-if="sourceMode === 'upload'"
          class="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/40 px-5 py-4 transition-colors"
          :class="dragOver ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'"
          @click="fileInput?.click()"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="onDrop"
        >
          <Upload class="mb-0.5 h-8 w-8 text-muted-foreground" />
          <div class="text-sm font-medium">拖入文档，或点击从本地选择</div>
          <div class="text-center text-[11px] text-muted-foreground">
            支持 Word(.docx)、Markdown、纯文本 · 自动转为可编辑正文，Word 内嵌图片自动转存图床
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".docx,.md,.txt,text/plain,text/markdown"
            class="hidden"
            @change="onFilePick"
          />
        </div>

        <div v-else class="relative draft-pick">
          <div class="flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
            <Search class="h-3.5 w-3.5 shrink-0" />
            <input
              v-model="draftQuery"
              class="flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              type="text"
              placeholder="搜索并选择一篇稿件…"
              @focus="draftOpen = true"
              @input="onDraftSearch"
            />
          </div>
          <p class="mt-2.5 text-xs text-muted-foreground">从 AI 写作中心「已完成」的稿件中挑一篇，载入编辑器继续完善</p>
          <div
            v-if="draftOpen"
            class="absolute left-0 right-0 top-11 z-20 max-h-72 overflow-auto rounded-lg border bg-background shadow-lg"
            @mousedown.prevent
          >
            <div v-if="draftLoading" class="px-4 py-4 text-center text-sm text-muted-foreground">加载中…</div>
            <button
              v-for="d in filteredDrafts"
              :key="d.article_id"
              type="button"
              class="flex w-full flex-col gap-0.5 border-b px-3 py-2.5 text-left last:border-0 hover:bg-muted/45"
              @click="pickDraft(d)"
            >
              <span class="text-sm font-medium">{{ d.title || '未命名草稿' }}</span>
              <span class="text-[11px] text-muted-foreground">{{ d.word_count || 0 }} 字 · {{ d.status || 'draft' }}</span>
            </button>
            <div v-if="!draftLoading && !filteredDrafts.length" class="px-4 py-4 text-center text-sm text-muted-foreground">暂无匹配稿件</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 编辑器 -->
    <Card class="overflow-hidden">
      <div class="border-b px-5 pb-2 pt-4">
        <input
          v-model="titleText"
          class="h-9 w-full border-0 bg-transparent text-xl font-semibold outline-none placeholder:text-muted-foreground/50"
          type="text"
          placeholder="输入稿件标题…"
          maxlength="30"
        />
        <div class="mt-0.5 text-[11px] text-muted-foreground">{{ titleText.length }} / 30 · 建议标题 30 字数以内</div>
      </div>

      <div class="flex flex-wrap items-center gap-1 border-b px-5 py-2">
        <button type="button" :class="tbCls(blockFmt === 'p')" @click="fmtBlock('p')">正文</button>
        <button type="button" :class="tbCls(blockFmt === 'h2')" @click="fmtBlock('h2')">H2</button>
        <button type="button" :class="tbCls(blockFmt === 'h3')" @click="fmtBlock('h3')">H3</button>
        <span class="mx-1 h-4 w-px bg-border" />
        <button type="button" :class="tbCls()" @click="exec('bold')"><b>B</b></button>
        <button type="button" :class="tbCls()" @click="exec('italic')"><i>I</i></button>
        <button type="button" :class="tbCls()" @click="exec('underline')"><u>U</u></button>
        <span class="mx-1 h-4 w-px bg-border" />
        <button type="button" :class="tbCls()" @click="exec('insertUnorderedList')">• 列表</button>
        <button type="button" :class="tbCls()" @click="exec('insertOrderedList')">1. 列表</button>
        <button type="button" :class="tbCls()" @click="exec('formatBlock', 'blockquote')">❝ 引用</button>
        <button type="button" :class="tbCls()" @click="insertLink">链接</button>
        <span class="mx-1 h-4 w-px bg-border" />
        <button type="button" :class="[tbCls(), 'text-emerald-600']" @click="imgInput?.click()">
          <ImageIcon class="mr-0.5 inline h-3.5 w-3.5" />图片
        </button>
        <button type="button" :class="tbCls()" @click="insertVideo">
          <Play class="mr-0.5 inline h-3.5 w-3.5" />视频
        </button>
        <button type="button" :class="tbCls()" @click="exec('insertHorizontalRule')">— 分隔线</button>
        <span class="mx-1 h-4 w-px bg-border" />
        <button type="button" :class="tbCls()" @click="exec('removeFormat')">清除格式</button>
        <input ref="imgInput" type="file" accept="image/*" class="hidden" @change="onImgPick" />
      </div>

      <div class="border-b bg-amber-50 px-4 py-2">
        <span class="text-[11px] leading-relaxed text-amber-800">
          粘贴网页/文档内容时，图片会自动搬运到本站图床；但 Word 本地图片(截图另存的)可能搬运失败，若提示失败请用「图片」重新上传。图片单张 &lt; 5M，上传后自动压缩。
        </span>
      </div>

      <div
        ref="editorEl"
        class="pb-editor min-h-[260px] overflow-y-auto px-4 py-3.5 text-[14.5px] leading-[1.85] text-foreground outline-none"
        contenteditable="true"
        data-ph="在这里撰写或粘贴正文，可插入图片、视频、链接……"
        @input="onEditorInput"
        @mouseup="syncBlockFmt"
        @keyup="syncBlockFmt"
        @paste="onPaste"
      />

      <div class="flex flex-wrap items-center justify-between gap-2 px-4 pb-3 pt-2.5 text-xs text-muted-foreground">
        <span>
          字数 <strong class="font-semibold text-foreground">{{ wordCount }}</strong>
          · 预计阅读时间 <strong class="font-semibold text-foreground">{{ readTimeLabel }}</strong>
        </span>
        <div class="flex items-center gap-2">
          <Button size="sm" variant="outline" @click="runValidate">
            <ShieldCheck class="h-3.5 w-3.5" />
            内容校验
          </Button>
          <Button size="sm" variant="outline" @click="previewOpen = true">
            <Eye class="h-3.5 w-3.5" />
            查看预览
          </Button>
        </div>
      </div>
    </Card>

    <!-- 发稿备注 -->
    <Card>
      <CardContent class="space-y-3 p-5">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText class="h-4 w-4" />
          </div>
          <span class="text-sm font-semibold">发稿备注</span>
        </div>
        <select v-model="remark" class="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm">
          <option value="">无（不填）</option>
          <option value="标题不接受修改，如原标题不能发，请拒稿">标题不接受修改，如原标题不能发请拒稿</option>
          <option value="什么值得买发文不接受转载（推荐）模式">什么值得买发文不接受转载（推荐）模式</option>
          <option value="列举网指定地区">列举网指定地区…（自定义地区）</option>
        </select>
        <p class="text-xs text-muted-foreground">平台备注仅接受以上固定指令，将随订单提交给发稿平台。</p>
      </CardContent>
    </Card>

    <!-- 发布设置 -->
    <Card>
      <CardContent class="space-y-4 p-5">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings class="h-4 w-4" />
          </div>
          <span class="text-sm font-semibold">发布设置</span>
        </div>
        <div class="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            :variant="publishMode === 'now' ? 'default' : 'outline'"
            @click="publishMode = 'now'"
          >
            <Send class="h-3.5 w-3.5" />
            立即发布
          </Button>
          <Button
            size="sm"
            :variant="publishMode === 'schedule' ? 'default' : 'outline'"
            @click="publishMode = 'schedule'"
          >
            <Clock class="h-3.5 w-3.5" />
            定时发布
          </Button>
        </div>
        <div v-if="publishMode === 'schedule'" class="w-fit">
          <input
            v-model="scheduleAt"
            class="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            type="datetime-local"
          />
          <p class="mt-2 text-xs text-muted-foreground">定时发布时间需在当前 2 小时后 ~ 10 天以内，由发稿平台按时投放。</p>
        </div>
      </CardContent>
    </Card>

    <!-- 发布媒体 -->
    <Card>
      <CardContent class="space-y-4 p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Newspaper class="h-4 w-4" />
            </div>
            <span class="text-sm font-semibold">发布媒体</span>
          </div>
          <Button size="sm" variant="outline" @click="openMediaPicker">
            <Plus class="h-3 w-3" />
            选择媒体
          </Button>
        </div>

        <div
          v-if="!selectedMedia.length"
          class="rounded-lg border border-dashed bg-muted/40 px-6 py-6 text-center text-sm text-muted-foreground"
        >
          尚未选择发布媒体 · 点击从信源库挑选，优先选择引热度高的信源平台
        </div>
        <div v-else class="flex flex-wrap items-center gap-2">
          <div
            v-for="m in selectedMedia"
            :key="m.media_key"
            class="inline-flex items-center gap-1.5 rounded-lg border bg-muted/50 px-2.5 py-1.5 text-xs"
          >
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white"
              :style="{ background: logoColor(m.name) }"
            >{{ logoText(m.name) }}</span>
            <span class="max-w-40 truncate font-medium">{{ m.name }}</span>
            <span class="font-medium text-orange-600">{{ m.sell_price || 0 }} 积分</span>
            <button type="button" class="text-muted-foreground hover:text-foreground" @click="removeMedia(m.media_key)">
              <X class="h-3.5 w-3.5" />
            </button>
          </div>
          <div class="w-full text-xs text-muted-foreground">
            合计 <strong class="text-orange-600">{{ totalPoints }}</strong> 积分 · 已选 {{ selectedMedia.length }} 家
          </div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <Button variant="outline" :disabled="saving" @click="saveDraft">{{ saving ? '保存中…' : '存为草稿' }}</Button>
          <Button :disabled="submitting" @click="submitPublish">{{ submitLabel }}</Button>
        </div>
      </CardContent>
    </Card>

    <!-- 注意事项 -->
    <Card>
      <CardContent class="space-y-3 p-5">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info class="h-4 w-4" />
          </div>
          <span class="text-sm font-semibold">注意事项</span>
        </div>
        <ul class="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">文章内容必须属于合法内容，如有负面、涉政、敏感、国家领导人等一律不予发布并停止账号使用。</li>
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">文章提交发布后不可修改、取消或删除，请在提交之前确认好文章内容。</li>
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">一篇文章的发布时间为 1-36 小时以内，平均大约花费 6 小时。</li>
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">稿件发布时间一般为 3~12 小时，工作日 16:00 之后、周末全天提交的稿件，媒体审核存在延迟，可能无法当日完成发布，敬请谅解。</li>
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">审稿时间为：周一至周五 09:00-18:00，下午 16 点后提交的文章在隔天发布。</li>
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">所选媒体可能会因为审稿不达标，导致个别所选媒体不能发布，届时会建议您更换媒体或退款。</li>
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">不能带网址的一律不能带电话、QQ、微信等信息，百度新闻源根据文章质量不保证 100% 收录。</li>
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">文章标题 22 字以内，内容 500~2500 字内，图片 0~3 张内，图片宽度 500 像素内，媒体可能会对文章进行适当的调整。</li>
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">请勿使用微信图片，文章中含微信图片会导致发布稿件图片不显示。</li>
          <li class="relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/40">所有发布出的链接默认时效为保证一个月，违规违法稿件一经发现会立马删除且扣除收益。</li>
        </ul>
      </CardContent>
    </Card>

    <!-- 内容校验弹层 -->
    <div
      v-if="validateOpen"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-foreground/40 p-4"
      @click.self="validateOpen = false"
    >
      <Card class="w-full max-w-md overflow-hidden shadow-xl">
        <div class="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <div class="text-sm font-semibold">内容校验</div>
            <div class="mt-0.5 text-[11px] text-muted-foreground">自动检测广告法违规词 / 医疗功效宣称 / 虚假宣传表述</div>
          </div>
          <Button size="sm" variant="outline" class="h-8 w-8 p-0" @click="validateOpen = false">
            <X class="h-4 w-4" />
          </Button>
        </div>
        <CardContent class="space-y-0 p-5">
          <div
            v-for="c in validateChecks"
            :key="c.name"
            class="flex items-center justify-between border-b py-2.5 text-sm last:border-0"
          >
            <span>{{ c.name }}</span>
            <Badge
              :class="c.pass
                ? 'border-transparent bg-emerald-50 text-emerald-700'
                : 'border-transparent bg-rose-50 text-rose-700'"
            >{{ c.pass ? '通过' : '未通过' }}</Badge>
          </div>
          <div
            class="mt-3.5 rounded-lg px-3.5 py-3 text-xs leading-relaxed"
            :class="validateAllPass ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-900'"
          >
            {{ validateAllPass
              ? '自动化校验已通过，仍请人工复核涉政 / 国家领导人 / 敏感事件等内容，避免账号被停用。'
              : '存在未通过项，请按提示修改后再提交发布。' }}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 预览弹层 -->
    <div
      v-if="previewOpen"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-foreground/40 p-4"
      @click.self="previewOpen = false"
    >
      <Card class="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden shadow-xl">
        <div class="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <div class="text-sm font-semibold">稿件预览</div>
            <div class="mt-0.5 text-[11px] text-muted-foreground">发布前最终确认 · 实际排版以各媒体平台为准</div>
          </div>
          <Button size="sm" variant="outline" class="h-8 w-8 p-0" @click="previewOpen = false">
            <X class="h-4 w-4" />
          </Button>
        </div>
        <div class="overflow-y-auto px-6 py-5">
          <div class="text-xl font-semibold leading-snug">{{ titleText || '未命名稿件' }}</div>
          <div class="mb-4 mt-2 text-xs text-muted-foreground">约 {{ wordCount }} 字 · 预计阅读 {{ previewMinutes }} 分钟</div>
          <div class="prose-preview text-[14.5px] leading-[1.85] text-foreground" v-html="editorHtml || '<p class=&quot;text-muted-foreground&quot;>暂无正文</p>'" />
        </div>
      </Card>
    </div>

    <!-- 信源库选择媒体 -->
    <div
      v-if="mediaOpen"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-foreground/40 p-4"
      @click.self="closeMediaPicker"
    >
      <Card class="flex h-[min(820px,92vh)] w-full max-w-[1080px] flex-col overflow-hidden shadow-xl">
        <div class="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <div class="text-sm font-semibold">信源库</div>
            <div class="mt-0.5 text-[11px] text-muted-foreground">搜索或按分类查找，默认按索引热度排序，优先挑选被引高的信源更容易被 AI 引擎收录引用</div>
          </div>
          <Button size="sm" variant="outline" class="h-8 w-8 p-0" @click="closeMediaPicker">
            <X class="h-4 w-4" />
          </Button>
        </div>

        <div class="flex items-center gap-3 px-5 pt-3">
          <div class="flex h-10 flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 text-muted-foreground">
            <Search class="h-3.5 w-3.5 shrink-0" />
            <input
              v-model="mp.q"
              class="flex-1 border-0 bg-transparent text-sm text-foreground outline-none"
              type="text"
              placeholder="搜索媒体名称，如 知乎、新华网、36氪…"
              @keydown.enter="loadMedia(1)"
            />
            <Button size="sm" variant="secondary" class="h-7" @click="loadMedia(1)">搜索媒体</Button>
          </div>
          <span class="shrink-0 text-xs text-muted-foreground">当前 {{ formatNum(mpTotal) }} 家</span>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 px-5 py-3">
          <label class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            AI 引擎
            <select v-model="mp.engine" class="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground" @change="loadMedia(1)">
              <option value="all">全部引擎</option>
              <option value="wenxin">文心</option>
              <option value="deepseek">DeepSeek</option>
              <option value="doubao">豆包</option>
              <option value="yuanbao">元宝</option>
              <option value="qwen">通义千问</option>
            </select>
          </label>
          <label class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            地区
            <select v-model="mp.area" class="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground" @change="loadMedia(1)">
              <option value="">不限</option>
              <option v-for="a in areas" :key="a.value" :value="a.value">{{ a.value }}</option>
            </select>
          </label>
          <label class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            媒体分类
            <select v-model="mp.taxonomy" class="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground" @change="loadMedia(1)">
              <option value="">不限</option>
              <option v-for="t in taxonomy" :key="t.value" :value="t.value">{{ t.value }}</option>
            </select>
          </label>
          <label class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            积分
            <select v-model="mp.price" class="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground" @change="loadMedia(1)">
              <option value="">不限</option>
              <option value="0-100">≤ 100</option>
              <option value="101-500">101–500</option>
              <option value="501-1000">501–1000</option>
              <option value="1001-5000">1001–5000</option>
              <option value="5000+">&gt; 5000</option>
            </select>
          </label>
          <label class="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            排序
            <select v-model="mp.sort" class="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground" @change="loadMedia(1)">
              <option value="cite-desc">默认（综合/被引）</option>
              <option value="price-asc">价格 低→高</option>
              <option value="price-desc">价格 高→低</option>
            </select>
          </label>
          <Button size="sm" variant="outline" class="ml-auto" :disabled="!mpRows.length" @click="selectAllPage">
            全选当前 {{ mpRows.length }} 家
          </Button>
        </div>

        <div class="flex min-h-0 flex-1 border-t">
          <aside class="flex w-36 shrink-0 flex-col gap-0.5 overflow-auto border-r p-2">
            <div class="px-2.5 pb-1 pt-2.5 text-[11px] text-muted-foreground">常用</div>
            <button type="button" :class="mpSideCls(mp.tab === 'all')" @click="setMpTab('all')">全部媒体</button>
            <button type="button" :class="mpSideCls(mp.tab === 'frequent')" @click="setMpTab('frequent')">常发媒体</button>
            <button type="button" :class="mpSideCls(mp.tab === 'fav')" @click="setMpTab('fav')">我的收藏</button>
            <div class="px-2.5 pb-1 pt-2.5 text-[11px] text-muted-foreground">按分类</div>
            <button type="button" :class="mpSideCls(mp.tab === 'portal')" @click="setMpTab('portal')">新闻门户</button>
            <button type="button" :class="mpSideCls(mp.tab === 'selfmedia')" @click="setMpTab('selfmedia')">自媒体</button>
          </aside>

          <div class="flex-1 overflow-auto p-2">
            <div v-if="mpLoading" class="px-4 py-8 text-center text-sm text-muted-foreground">加载中…</div>
            <div
              v-for="item in mpRows"
              :key="item.media_key"
              class="flex cursor-pointer gap-3 border-b px-2.5 py-3 last:border-0 hover:bg-muted/45"
              @click="togglePick(item)"
            >
              <span
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                :style="{ background: logoColor(item.name) }"
              >{{ logoText(item.name) }}</span>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-semibold">{{ item.name }}</div>
                <div class="mt-1.5 flex flex-wrap gap-1">
                  <Badge
                    v-for="e in (item.geo_engines || item.indexed_engines || [])"
                    :key="e"
                    class="border-transparent text-[10px] text-white"
                    :style="{ backgroundColor: engineColor(e) }"
                  >{{ engineLabel(e) }}</Badge>
                </div>
                <div class="mt-1.5 flex items-center gap-2 text-xs">
                  <span class="text-primary">{{ item.area || '全国' }}</span>
                  <a
                    v-if="item.case_url || item.site_url"
                    :href="item.case_url || item.site_url"
                    target="_blank"
                    rel="noopener"
                    class="text-primary hover:underline"
                    @click.stop
                  >案例预览 ↗</a>
                </div>
                <div v-if="item.note" class="mt-1 truncate text-[11px] text-muted-foreground">备注: {{ item.note }}</div>
              </div>
              <div class="flex min-w-[110px] shrink-0 flex-col items-end gap-1">
                <Badge class="border-transparent bg-primary/10 text-[10px] text-primary">{{ item.platform || item.category_label || '媒体' }}</Badge>
                <span class="text-[11px] text-muted-foreground">出稿率 {{ item.success_rate != null ? Math.round(item.success_rate * 100) : 80 }}%</span>
                <span class="text-sm font-semibold text-orange-600">
                  +{{ item.sell_price || 0 }}
                  <em v-if="item.list_price && item.list_price !== item.sell_price" class="ml-1 font-normal not-italic text-muted-foreground">+{{ item.list_price }}</em>
                </span>
                <button
                  type="button"
                  class="text-muted-foreground hover:text-amber-500"
                  :class="{ 'text-amber-500': item.fav }"
                  @click.stop="toggleFav(item)"
                >
                  <Star class="h-4 w-4" :fill="item.fav ? 'currentColor' : 'none'" />
                </button>
                <span
                  class="h-4 w-4 rounded-full border-2"
                  :class="pickSet.has(item.media_key) ? 'border-primary bg-primary' : 'border-muted-foreground/40'"
                />
              </div>
            </div>
            <div v-if="!mpLoading && !mpRows.length" class="px-4 py-8 text-center text-sm text-muted-foreground">暂无媒体</div>
          </div>
        </div>

        <div class="flex items-center justify-between border-t px-5 py-3 text-sm text-muted-foreground">
          <span>已选 {{ pickKeys.length }} 个媒体</span>
          <div class="flex gap-2">
            <Button variant="outline" @click="closeMediaPicker">取消</Button>
            <Button @click="confirmMedia">确定</Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Clock, Eye, FileText, Image as ImageIcon, Info, Newspaper, Play,
  Plus, Search, Send, Settings, ShieldCheck, Star, Upload, X,
} from 'lucide-vue-next'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { publishApi } from '@/api/modules/report'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/lib/toast'

type MediaItem = {
  media_key: string
  name: string
  platform?: string
  category_label?: string
  area?: string
  list_price?: number
  sell_price?: number
  note?: string
  fav?: boolean
  case_url?: string | null
  site_url?: string
  success_rate?: number | null
  indexed_engines?: string[]
  geo_engines?: string[]
}

type DraftItem = {
  article_id: string
  title?: string
  content_md?: string
  word_count?: number
  status?: string
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const titleText = ref('')
const remark = ref('')
const sourceMode = ref<'upload' | 'draft'>('upload')
const publishMode = ref<'now' | 'schedule'>('now')
const scheduleAt = ref('')
const articleId = ref('')
const editorHtml = ref('')
const wordCount = ref(0)
const blockFmt = ref('p')
const dragOver = ref(false)
const saving = ref(false)
const submitting = ref(false)

const editorEl = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const imgInput = ref<HTMLInputElement | null>(null)

const draftQuery = ref('')
const draftOpen = ref(false)
const draftLoading = ref(false)
const drafts = ref<DraftItem[]>([])

const validateOpen = ref(false)
const previewOpen = ref(false)
const validateChecks = ref<{ name: string; pass: boolean; hits?: string[] }[]>([])

const selectedMedia = ref<MediaItem[]>([])
const mediaOpen = ref(false)
const pickKeys = ref<string[]>([])
const pickMap = ref<Record<string, MediaItem>>({})
const mpLoading = ref(false)
const mpRows = ref<MediaItem[]>([])
const mpTotal = ref(0)
const mpPage = ref(1)
const areas = ref<{ value: string; count: number }[]>([])
const taxonomy = ref<{ value: string; count: number }[]>([])
const mp = reactive({
  q: '',
  engine: 'all',
  area: '',
  taxonomy: '',
  price: '',
  sort: 'cite-desc',
  tab: 'all' as 'all' | 'frequent' | 'fav' | 'portal' | 'selfmedia',
})

const AD_WORDS = ['国家级', '世界级', '最高级', '最佳', '第一', '唯一', '全网最低', '绝对', '万能', '根治']
const MED_WORDS = ['疗效', '包治', '药到病除', '特效', '祖传秘方', '无副作用', '治愈率']
const FAKE_WORDS = ['震惊', '速看', '不转不是中国人', '点击领取', '百分百', '稳赚不赔']

const ENGINE_META: Record<string, { label: string; color: string }> = {
  doubao: { label: '豆包', color: '#f59e0b' },
  deepseek: { label: 'DeepSeek', color: '#0ea5e9' },
  wenxin: { label: '文心', color: '#ec4899' },
  qwen: { label: '通义千问', color: '#0f766e' },
  yuanbao: { label: '元宝', color: '#2563eb' },
}

const filteredDrafts = computed(() => {
  const q = draftQuery.value.trim().toLowerCase()
  if (!q) return drafts.value
  return drafts.value.filter(d => (d.title || '').toLowerCase().includes(q))
})
const pickSet = computed(() => new Set(pickKeys.value))
const totalPoints = computed(() => selectedMedia.value.reduce((s, m) => s + (Number(m.sell_price) || 0), 0))
const validateAllPass = computed(() => validateChecks.value.every(c => c.pass))
const readTimeLabel = computed(() => {
  const secs = Math.max(60, Math.round(wordCount.value / 6))
  const m = Math.floor(secs / 60)
  const s = secs % 60
  if (!s) return `${m}分钟`
  return `${m}分${s}秒`
})
const previewMinutes = computed(() => Math.max(1, Math.ceil(wordCount.value / 300)))
const submitLabel = computed(() => {
  if (submitting.value) return '提交中…'
  if (!selectedMedia.value.length) return '选择媒体后发布'
  return `消耗 ${totalPoints.value} 积分发布`
})

function engineLabel(e: string) { return ENGINE_META[e]?.label || e }
function engineColor(e: string) { return ENGINE_META[e]?.color || '#64748b' }
function formatNum(n: number) { return Number(n || 0).toLocaleString('zh-CN') }
function logoText(name: string) { return (name || '?').replace(/\s/g, '').slice(0, 1) }
function logoColor(name: string) {
  const colors = ['#2d7fd0', '#0f9d6b', '#e11d48', '#ea580c', '#0891b2', '#0f766e', '#2563eb']
  let h = 0
  for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % colors.length
  return colors[h]
}
function tbCls(active = false) {
  return [
    'rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
    active ? 'bg-muted text-foreground font-semibold' : '',
  ]
}
function mpSideCls(on: boolean) {
  return [
    'rounded-md px-2.5 py-2 text-left text-sm transition-colors',
    on ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-muted',
  ]
}

function syncWordCount() {
  const text = (editorEl.value?.innerText || '').replace(/\s+/g, '')
  wordCount.value = text.length
  editorHtml.value = editorEl.value?.innerHTML || ''
}
function onEditorInput() { syncWordCount() }
function syncBlockFmt() {
  try {
    const v = String(document.queryCommandValue('formatBlock') || '').toLowerCase()
    if (v.includes('h2')) blockFmt.value = 'h2'
    else if (v.includes('h3')) blockFmt.value = 'h3'
    else blockFmt.value = 'p'
  } catch { /* ignore */ }
}
function exec(cmd: string, val?: string) {
  editorEl.value?.focus()
  document.execCommand(cmd, false, val)
  syncWordCount()
  syncBlockFmt()
}
function fmtBlock(tag: 'p' | 'h2' | 'h3') {
  exec('formatBlock', tag === 'p' ? 'p' : tag)
  blockFmt.value = tag
}
function insertLink() {
  const url = window.prompt('输入链接地址', 'https://')
  if (!url) return
  exec('createLink', url)
}
function insertVideo() {
  const url = window.prompt('输入视频地址（将以链接形式插入）', 'https://')
  if (!url) return
  exec('insertHTML', `<p><a href="${url}" target="_blank" rel="noopener">▶ 视频：${url}</a></p>`)
}
function setEditorHtml(html: string) {
  if (!editorEl.value) return
  editorEl.value.innerHTML = html || ''
  syncWordCount()
}
function mdToHtml(md: string) {
  const esc = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc
    .split(/\n{2,}/)
    .map(block => {
      const lines = block.split('\n').map(l =>
        l.replace(/^###\s+(.+)$/, '<h3>$1</h3>')
          .replace(/^##\s+(.+)$/, '<h2>$1</h2>')
          .replace(/^#\s+(.+)$/, '<h2>$1</h2>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>'),
      )
      if (lines.some(l => l.startsWith('<h'))) return lines.join('')
      return `<p>${lines.join('<br/>')}</p>`
    })
    .join('')
}

async function switchDraftMode() {
  sourceMode.value = 'draft'
  draftOpen.value = true
  if (!drafts.value.length) await loadDrafts()
}
async function loadDrafts() {
  draftLoading.value = true
  try {
    const resp: any = await publishApi.drafts({ size: 50, q: draftQuery.value.trim() || undefined })
    drafts.value = resp?.list || []
  } catch (e: any) {
    toast.error(e?.message || '加载稿件失败')
  } finally {
    draftLoading.value = false
  }
}
function onDraftSearch() {
  draftOpen.value = true
}
function pickDraft(d: DraftItem) {
  articleId.value = d.article_id
  titleText.value = (d.title || '').slice(0, 30)
  const html = (d.content_md || '').includes('<') ? (d.content_md || '') : mdToHtml(d.content_md || '')
  setEditorHtml(html)
  draftQuery.value = d.title || ''
  draftOpen.value = false
  toast.success('已载入稿件')
}

async function onDrop(e: DragEvent) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) await ingestFile(f)
}
async function onFilePick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (f) await ingestFile(f)
}
async function ingestFile(file: File) {
  const name = file.name || ''
  const lower = name.toLowerCase()
  try {
    if (lower.endsWith('.txt') || lower.endsWith('.md') || file.type.startsWith('text/')) {
      const text = await file.text()
      if (!titleText.value) titleText.value = name.replace(/\.(txt|md)$/i, '').slice(0, 30)
      setEditorHtml(lower.endsWith('.md') ? mdToHtml(text) : `<p>${text.replace(/\n/g, '<br/>')}</p>`)
      toast.success('文档已载入')
      return
    }
    if (lower.endsWith('.docx')) {
      const html = await parseDocx(file)
      if (!titleText.value) titleText.value = name.replace(/\.docx$/i, '').slice(0, 30)
      setEditorHtml(html)
      toast.success('Word 文档已载入')
      return
    }
    toast.error('仅支持 .docx / .md / .txt')
  } catch (err: any) {
    toast.error(err?.message || '文档解析失败')
  }
}
async function parseDocx(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const zip = await unzip(buf)
  const xml = zip['word/document.xml']
  if (!xml) throw new Error('无效的 Word 文件')
  const text = xml
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<w:br\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return text.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('') || '<p></p>'
}
async function unzip(buf: ArrayBuffer): Promise<Record<string, string>> {
  const view = new DataView(buf)
  const u8 = new Uint8Array(buf)
  const files: Record<string, string> = {}
  let offset = 0
  while (offset + 30 < u8.length) {
    const sig = view.getUint32(offset, true)
    if (sig !== 0x04034b50) break
    const method = view.getUint16(offset + 8, true)
    const compSize = view.getUint32(offset + 18, true)
    const uncompSize = view.getUint32(offset + 22, true)
    const nameLen = view.getUint16(offset + 26, true)
    const extraLen = view.getUint16(offset + 28, true)
    const nameBytes = u8.slice(offset + 30, offset + 30 + nameLen)
    const name = new TextDecoder().decode(nameBytes)
    const dataStart = offset + 30 + nameLen + extraLen
    const data = u8.slice(dataStart, dataStart + compSize)
    offset = dataStart + compSize
    if (method === 0) {
      files[name] = new TextDecoder().decode(data)
    } else if (method === 8 && typeof (globalThis as any).DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate-raw')
      const stream = new Blob([data]).stream().pipeThrough(ds)
      const ab = await new Response(stream).arrayBuffer()
      files[name] = new TextDecoder().decode(ab)
    }
  }
  return files
}

function onPaste(e: ClipboardEvent) {
  const html = e.clipboardData?.getData('text/html')
  if (!html) return
  e.preventDefault()
  const cleaned = html
    .replace(/<\/?(html|body|meta|head|style|script)[^>]*>/gi, '')
    .replace(/style="[^"]*"/gi, '')
  exec('insertHTML', cleaned)
}
async function onImgPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!f) return
  if (f.size > 5 * 1024 * 1024) {
    toast.error('图片需小于 5M')
    return
  }
  const dataUrl = await compressImage(f)
  exec('insertHTML', `<p><img src="${dataUrl}" alt="" style="max-width:100%"/></p>`)
}
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const maxW = 1200
      const scale = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('canvas')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')) }
    img.src = url
  })
}

function hitWords(text: string, words: string[]) {
  return words.filter(w => text.includes(w))
}
function runValidate() {
  const text = `${titleText.value}\n${editorEl.value?.innerText || ''}`
  const checks = [
    { name: '广告法违规词', pass: true as boolean, hits: hitWords(text, AD_WORDS) },
    { name: '医疗/功效违禁', pass: true, hits: hitWords(text, MED_WORDS) },
    { name: '敏感/虚假宣传', pass: true, hits: hitWords(text, FAKE_WORDS) },
    { name: '标题长度', pass: titleText.value.length > 0 && titleText.value.length <= 30, hits: [] as string[] },
  ]
  checks[0].pass = checks[0].hits.length === 0
  checks[1].pass = checks[1].hits.length === 0
  checks[2].pass = checks[2].hits.length === 0
  validateChecks.value = checks
  validateOpen.value = true
}

function removeMedia(key: string) {
  selectedMedia.value = selectedMedia.value.filter(m => m.media_key !== key)
}
async function openMediaPicker() {
  pickKeys.value = selectedMedia.value.map(m => m.media_key)
  pickMap.value = Object.fromEntries(selectedMedia.value.map(m => [m.media_key, m]))
  mediaOpen.value = true
  if (!areas.value.length) {
    try {
      const facets: any = await publishApi.mediaFacets()
      areas.value = facets?.areas || []
      taxonomy.value = facets?.taxonomy || []
    } catch { /* ignore */ }
  }
  await loadMedia(1)
}
function closeMediaPicker() { mediaOpen.value = false }
function setMpTab(tab: typeof mp.tab) {
  mp.tab = tab
  loadMedia(1)
}
function priceRange() {
  if (!mp.price) return {}
  if (mp.price === '0-100') return { price_min: 0, price_max: 100 }
  if (mp.price === '101-500') return { price_min: 101, price_max: 500 }
  if (mp.price === '501-1000') return { price_min: 501, price_max: 1000 }
  if (mp.price === '1001-5000') return { price_min: 1001, price_max: 5000 }
  if (mp.price === '5000+') return { price_min: 5001 }
  return {}
}
async function loadMedia(page = 1) {
  mpLoading.value = true
  mpPage.value = page
  try {
    const category = mp.tab === 'portal' ? 'portal' : mp.tab === 'selfmedia' ? 'selfmedia' : undefined
    const resp: any = await publishApi.mediaList({
      page,
      size: 20,
      sort: mp.sort,
      display_mode: 'account',
      fav: mp.tab === 'fav',
      ...(mp.q.trim() ? { q: mp.q.trim() } : {}),
      ...(mp.engine !== 'all' ? { engine: mp.engine } : {}),
      ...(mp.area ? { area: mp.area } : {}),
      ...(mp.taxonomy ? { taxonomy: mp.taxonomy } : {}),
      ...(category ? { category } : {}),
      ...priceRange(),
    })
    mpRows.value = resp?.list || []
    mpTotal.value = Number(resp?.total || 0)
  } catch (e: any) {
    mpRows.value = []
    toast.error(e?.message || '加载媒体失败')
  } finally {
    mpLoading.value = false
  }
}
function togglePick(item: MediaItem) {
  const i = pickKeys.value.indexOf(item.media_key)
  if (i >= 0) {
    pickKeys.value.splice(i, 1)
    delete pickMap.value[item.media_key]
    return
  }
  pickKeys.value.push(item.media_key)
  pickMap.value[item.media_key] = item
}
function selectAllPage() {
  for (const r of mpRows.value) {
    if (!pickSet.value.has(r.media_key)) {
      pickKeys.value.push(r.media_key)
      pickMap.value[r.media_key] = r
    }
  }
}
async function toggleFav(item: MediaItem) {
  try {
    await publishApi.mediaFav(item.media_key, !item.fav)
    item.fav = !item.fav
  } catch (e: any) {
    toast.error(e?.message || '收藏失败')
  }
}
function confirmMedia() {
  selectedMedia.value = pickKeys.value.map(k => pickMap.value[k]).filter(Boolean)
  mediaOpen.value = false
}

async function saveDraft() {
  const content = editorEl.value?.innerHTML || ''
  if (!titleText.value.trim() && !content.replace(/<[^>]+>/g, '').trim()) {
    toast.error('请先填写标题或正文')
    return
  }
  saving.value = true
  try {
    const resp: any = await publishApi.saveDraft({
      article_id: articleId.value || undefined,
      brand_id: auth.activeBrandId,
      title: titleText.value.trim(),
      content_md: content,
    })
    articleId.value = resp?.article_id || articleId.value
    toast.success('草稿已保存')
  } catch (e: any) {
    toast.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function validateSchedule(): string | null {
  if (publishMode.value !== 'schedule') return null
  if (!scheduleAt.value) return '请选择定时发布时间'
  const t = new Date(scheduleAt.value).getTime()
  if (!Number.isFinite(t)) return '时间格式无效'
  const now = Date.now()
  const min = now + 2 * 60 * 60 * 1000
  const max = now + 10 * 24 * 60 * 60 * 1000
  if (t < min || t > max) return '定时发布时间需在当前 2 小时后 ~ 10 天以内'
  return null
}

async function submitPublish() {
  if (!titleText.value.trim()) {
    toast.error('请填写稿件标题')
    return
  }
  if (!selectedMedia.value.length) {
    openMediaPicker()
    return
  }
  const schedErr = validateSchedule()
  if (schedErr) {
    toast.error(schedErr)
    return
  }
  const brandId = auth.activeBrandId
  if (!brandId) {
    toast.error('请先选择品牌')
    return
  }
  submitting.value = true
  try {
    const resp: any = await publishApi.submit({
      brand_id: brandId,
      article_id: articleId.value || undefined,
      title: titleText.value.trim(),
      content_html: editorEl.value?.innerHTML || '',
      article_note: remark.value,
      media_keys: selectedMedia.value.map(m => m.media_key),
      schedule_at: publishMode.value === 'schedule' ? new Date(scheduleAt.value).toISOString() : null,
    })
    articleId.value = resp?.article_id || articleId.value
    toast.success('已提交发布', `订单 ${resp?.order_nos?.length || 0} 笔 · 消耗 ${resp?.total_points || totalPoints.value} 积分`)
    router.push('/dashboard/media-library/records')
  } catch (e: any) {
    toast.error(e?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

async function hydrateFromQuery() {
  const articleFromQuery = String(route.query.article_id || '').trim()
  if (articleFromQuery) {
    try {
      const resp: any = await publishApi.drafts({ size: 50 })
      const found = (resp?.list || []).find((d: any) => d.article_id === articleFromQuery)
      if (found) {
        sourceMode.value = 'draft'
        pickDraft(found)
      } else {
        articleId.value = articleFromQuery
      }
    } catch { /* ignore */ }
  }
  const keys = String(route.query.media_keys || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  if (!keys.length) return
  try {
    const resp: any = await publishApi.mediaList({ media_keys: keys, size: keys.length, page: 1 })
    const list: MediaItem[] = resp?.list || []
    selectedMedia.value = keys.map(k => list.find(x => x.media_key === k)).filter(Boolean) as MediaItem[]
  } catch { /* ignore */ }
}

function onDocClick(e: MouseEvent) {
  const t = e.target as HTMLElement
  if (!t.closest('.draft-pick')) draftOpen.value = false
}

onMounted(async () => {
  document.addEventListener('click', onDocClick)
  await nextTick()
  syncWordCount()
  await hydrateFromQuery()
})
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.pb-editor:empty::before {
  content: attr(data-ph);
  color: hsl(var(--muted-foreground) / 0.5);
}
.prose-preview :deep(img) {
  max-width: 100%;
}
</style>
