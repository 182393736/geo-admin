<template>
  <div class="pb-page geo-page">
    <div class="pb-header geo-page-header">
      <div class="geo-page-header__text">
        <h2 class="pb-title geo-page-title">发布稿件</h2>
        <p class="pb-desc geo-page-desc">多媒体编辑 · 一键分发到 AI 引擎收录的内容平台 · 让稿件被豆包 / DeepSeek / 文心一言引用</p>
      </div>
    </div>

    <div class="geo-page-stack">
      <!-- 上传 / 选稿 -->
      <div class="pb-source-card">
        <div class="pb-upload-row">
          <button class="pb-btn-mode" :class="{ 'pb-btn-mode--on': sourceMode === 'upload' }" type="button" @click="sourceMode = 'upload'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            上传文档
          </button>
          <button class="pb-btn-mode" :class="{ 'pb-btn-mode--on': sourceMode === 'draft' }" type="button" @click="switchDraftMode">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            选择已有稿件
          </button>
        </div>

        <div
          v-if="sourceMode === 'upload'"
          class="pb-drag-area"
          :class="{ 'pb-drag-area--over': dragOver }"
          @click="fileInput?.click()"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="onDrop"
        >
          <svg class="pb-drag-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
          <div class="pb-drag-text">拖入文档，或点击从本地选择</div>
          <div class="pb-drag-hint">支持 Word(.docx)、Markdown、纯文本 · 自动转为可编辑正文，Word 内嵌图片自动转存图床</div>
          <input ref="fileInput" type="file" accept=".docx,.md,.txt,text/plain,text/markdown" class="pb-file-hidden" @change="onFilePick" />
        </div>

        <div v-else class="pb-draft-pick">
          <div class="pb-draft-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
            <input
              v-model="draftQuery"
              class="pb-draft-search"
              type="text"
              placeholder="搜索并选择一篇稿件…"
              @focus="draftOpen = true"
              @input="onDraftSearch"
            />
          </div>
          <p class="pb-draft-tip">从 AI 写作中心「已完成」的稿件中挑一篇，载入编辑器继续完善</p>
          <div v-if="draftOpen" class="pb-draft-dropdown" @mousedown.prevent>
            <div v-if="draftLoading" class="pb-draft-empty">加载中…</div>
            <button
              v-for="d in filteredDrafts"
              :key="d.article_id"
              type="button"
              class="pb-draft-item"
              @click="pickDraft(d)"
            >
              <span class="pb-draft-item-title">{{ d.title || '未命名草稿' }}</span>
              <span class="pb-draft-item-meta">{{ d.word_count || 0 }} 字 · {{ d.status || 'draft' }}</span>
            </button>
            <div v-if="!draftLoading && !filteredDrafts.length" class="pb-draft-empty">暂无匹配稿件</div>
          </div>
        </div>
      </div>

      <!-- 编辑器 -->
      <div class="pb-editor-card">
        <div class="pb-title-wrap">
          <input v-model="titleText" class="pb-title-input" type="text" placeholder="输入稿件标题…" maxlength="30" />
          <div class="pb-title-count">{{ titleText.length }} / 30 · 建议标题 30 字数以内</div>
        </div>

        <div class="pb-toolbar">
          <button class="pb-tb" :class="{ 'pb-tb--active': blockFmt === 'p' }" type="button" @click="fmtBlock('p')">正文</button>
          <button class="pb-tb" :class="{ 'pb-tb--active': blockFmt === 'h2' }" type="button" @click="fmtBlock('h2')">H2</button>
          <button class="pb-tb" :class="{ 'pb-tb--active': blockFmt === 'h3' }" type="button" @click="fmtBlock('h3')">H3</button>
          <span class="pb-tb-sep"></span>
          <button class="pb-tb" type="button" @click="exec('bold')"><b>B</b></button>
          <button class="pb-tb" type="button" @click="exec('italic')"><i>I</i></button>
          <button class="pb-tb" type="button" @click="exec('underline')"><u>U</u></button>
          <span class="pb-tb-sep"></span>
          <button class="pb-tb" type="button" @click="exec('insertUnorderedList')">• 列表</button>
          <button class="pb-tb" type="button" @click="exec('insertOrderedList')">1. 列表</button>
          <button class="pb-tb" type="button" @click="exec('formatBlock', 'blockquote')">❝ 引用</button>
          <button class="pb-tb" type="button" @click="insertLink">链接</button>
          <span class="pb-tb-sep"></span>
          <button class="pb-tb pb-tb--img" type="button" @click="imgInput?.click()">🖼 图片</button>
          <button class="pb-tb" type="button" @click="insertVideo">▶ 视频</button>
          <button class="pb-tb" type="button" @click="exec('insertHorizontalRule')">— 分隔线</button>
          <span class="pb-tb-sep"></span>
          <button class="pb-tb" type="button" @click="exec('removeFormat')">清除格式</button>
          <input ref="imgInput" type="file" accept="image/*" class="pb-file-hidden" @change="onImgPick" />
        </div>

        <div class="pb-editor-hint-bar">
          <span class="pb-editor-hint">粘贴网页/文档内容时，图片会自动搬运到本站图床；但 Word 本地图片(截图另存的)可能搬运失败，若提示失败请用「🖼 图片」重新上传。图片单张 &lt; 5M，上传后自动压缩。</span>
        </div>

        <div
          ref="editorEl"
          class="pb-editor"
          contenteditable="true"
          data-ph="在这里撰写或粘贴正文，可插入图片、视频、链接……"
          @input="onEditorInput"
          @mouseup="syncBlockFmt"
          @keyup="syncBlockFmt"
          @paste="onPaste"
        ></div>

        <div class="pb-editor-footer">
          <span class="pb-editor-count">字数 <strong>{{ wordCount }}</strong> · 预计阅读时间 <strong>{{ readTimeLabel }}</strong></span>
          <span class="pb-footer-right">
            <button class="pb-sm pb-sm--purple" type="button" @click="runValidate">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              内容校验
            </button>
            <button class="pb-sm pb-sm--gray" type="button" @click="previewOpen = true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              查看预览
            </button>
          </span>
        </div>
      </div>

      <!-- 发稿备注 -->
      <div class="pb-remark-card">
        <div class="pb-remark-head">
          <svg class="pb-panel-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
          <span class="pb-remark-title">发稿备注</span>
        </div>
        <div class="pb-remark-body">
          <select v-model="remark" class="pb-combo pb-combo--full">
            <option value="">无（不填）</option>
            <option value="标题不接受修改，如原标题不能发，请拒稿">标题不接受修改，如原标题不能发请拒稿</option>
            <option value="什么值得买发文不接受转载（推荐）模式">什么值得买发文不接受转载（推荐）模式</option>
            <option value="列举网指定地区">列举网指定地区…（自定义地区）</option>
          </select>
          <p class="pb-remark-tip">平台备注仅接受以上固定指令，将随订单提交给发稿平台。</p>
        </div>
      </div>

      <!-- 发布设置 -->
      <div class="pb-setting-card">
        <div class="pb-setting-head">
          <svg class="pb-panel-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>
          <span class="pb-setting-title">发布设置</span>
        </div>
        <div class="pb-setting-body">
          <div class="pb-setting-actions">
            <button class="pb-md" :class="publishMode === 'now' ? 'pb-md--purple' : 'pb-md--gray'" type="button" @click="publishMode = 'now'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
              立即发布
            </button>
            <button class="pb-md" :class="publishMode === 'schedule' ? 'pb-md--purple' : 'pb-md--gray'" type="button" @click="publishMode = 'schedule'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
              定时发布
            </button>
          </div>
          <div v-if="publishMode === 'schedule'" class="pb-schedule-wrap">
            <input v-model="scheduleAt" class="pb-schedule-input" type="datetime-local" />
            <p class="pb-schedule-tip">定时发布时间需在当前 2 小时后 ~ 10 天以内，由发稿平台按时投放。</p>
          </div>
        </div>
      </div>

      <!-- 发布媒体 -->
      <div class="pb-media-card">
        <div class="pb-media-head">
          <span class="pb-media-title">发布媒体</span>
          <button class="pb-sm pb-sm--purple-out" type="button" @click="openMediaPicker">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            选择媒体
          </button>
        </div>

        <div v-if="!selectedMedia.length" class="pb-media-empty">尚未选择发布媒体 · 点击从信源库挑选，优先选择引热度高的信源平台</div>
        <div v-else class="pb-media-selected">
          <div v-for="m in selectedMedia" :key="m.media_key" class="pb-media-chip">
            <span class="pb-media-chip-logo" :style="{ background: logoColor(m.name) }">{{ logoText(m.name) }}</span>
            <span class="pb-media-chip-name">{{ m.name }}</span>
            <span class="pb-media-chip-pts">{{ m.sell_price || 0 }} 积分</span>
            <button type="button" class="pb-media-chip-x" @click="removeMedia(m.media_key)">×</button>
          </div>
          <div class="pb-media-total">合计 <strong>{{ totalPoints }}</strong> 积分 · 已选 {{ selectedMedia.length }} 家</div>
        </div>

        <div class="pb-media-bottom">
          <button class="pb-md pb-md--gray" type="button" :disabled="saving" @click="saveDraft">{{ saving ? '保存中…' : '存为草稿' }}</button>
          <button class="pb-md pb-md--dark" type="button" :disabled="submitting" @click="submitPublish">
            {{ submitLabel }}
          </button>
        </div>
      </div>

      <!-- 注意事项 -->
      <div class="pb-notice-card">
        <div class="pb-notice-head">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>注意事项</span>
        </div>
        <ul class="pb-notice-list">
          <li>文章内容必须属于合法内容，如有负面、涉政、敏感、国家领导人等一律不予发布并停止账号使用。</li>
          <li>文章提交发布后不可修改、取消或删除，请在提交之前确认好文章内容。</li>
          <li>一篇文章的发布时间为 1-36 小时以内，平均大约花费 6 小时。</li>
          <li>稿件发布时间一般为 3~12 小时，工作日 16:00 之后、周末全天提交的稿件，媒体审核存在延迟，可能无法当日完成发布，敬请谅解。</li>
          <li>审稿时间为：周一至周五 09:00-18:00，下午 16 点后提交的文章在隔天发布。</li>
          <li>所选媒体可能会因为审稿不达标，导致个别所选媒体不能发布，届时会建议您更换媒体或退款。</li>
          <li>不能带网址的一律不能带电话、QQ、微信等信息，百度新闻源根据文章质量不保证 100% 收录。</li>
          <li>文章标题 22 字以内，内容 500~2500 字内，图片 0~3 张内，图片宽度 500 像素内，媒体可能会对文章进行适当的调整。</li>
          <li>请勿使用微信图片，文章中含微信图片会导致发布稿件图片不显示。</li>
          <li>所有发布出的链接默认时效为保证一个月，违规违法稿件一经发现会立马删除且扣除收益。</li>
        </ul>
      </div>
    </div>

    <!-- 内容校验弹层 -->
    <div v-if="validateOpen" class="pb-modal-mask" @click.self="validateOpen = false">
      <div class="pb-modal pb-modal--sm">
        <div class="pb-modal-head">
          <div>
            <div class="pb-modal-title">内容校验</div>
            <div class="pb-modal-sub">自动检测广告法违规词 / 医疗功效宣称 / 虚假宣传表述</div>
          </div>
          <button type="button" class="pb-modal-x" @click="validateOpen = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="pb-modal-body">
          <div v-for="c in validateChecks" :key="c.name" class="pb-check-row">
            <span>{{ c.name }}</span>
            <span class="pb-check-badge" :class="c.pass ? 'pb-check-badge--ok' : 'pb-check-badge--fail'">{{ c.pass ? '通过' : '未通过' }}</span>
          </div>
          <div class="pb-check-note" :class="validateAllPass ? 'pb-check-note--ok' : 'pb-check-note--warn'">
            {{ validateAllPass
              ? '自动化校验已通过，仍请人工复核涉政 / 国家领导人 / 敏感事件等内容，避免账号被停用。'
              : '存在未通过项，请按提示修改后再提交发布。' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 预览弹层 -->
    <div v-if="previewOpen" class="pb-modal-mask" @click.self="previewOpen = false">
      <div class="pb-modal pb-modal--preview">
        <div class="pb-modal-head">
          <div>
            <div class="pb-modal-title">稿件预览</div>
            <div class="pb-modal-sub">发布前最终确认 · 实际排版以各媒体平台为准</div>
          </div>
          <button type="button" class="pb-modal-x" @click="previewOpen = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="pb-preview-body">
          <div class="pb-preview-title">{{ titleText || '未命名稿件' }}</div>
          <div class="pb-preview-meta">约 {{ wordCount }} 字 · 预计阅读 {{ previewMinutes }} 分钟</div>
          <div class="pb-preview-content" v-html="editorHtml || '<p style=&quot;color:#8a8f9b&quot;>暂无正文</p>'"></div>
        </div>
      </div>
    </div>

    <!-- 信源库选择媒体 -->
    <div v-if="mediaOpen" class="pb-modal-mask" @click.self="closeMediaPicker">
      <div class="pb-modal pb-modal--media">
        <div class="pb-modal-head">
          <div>
            <div class="pb-modal-title">信源库</div>
            <div class="pb-modal-sub">搜索或按分类查找，默认按索引热度排序，优先挑选被引高的信源更容易被 AI 引擎收录引用</div>
          </div>
          <button type="button" class="pb-modal-x" @click="closeMediaPicker">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="pb-mp-toolbar">
          <div class="pb-mp-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
            <input v-model="mp.q" type="text" placeholder="搜索媒体名称，如 知乎、新华网、36氪…" @keydown.enter="loadMedia(1)" />
            <button type="button" class="pb-mp-search-btn" @click="loadMedia(1)">搜索媒体</button>
          </div>
          <span class="pb-mp-count">当前 {{ formatNum(mpTotal) }} 家</span>
        </div>

        <div class="pb-mp-filters">
          <label>AI 引擎
            <select v-model="mp.engine" @change="loadMedia(1)">
              <option value="all">全部引擎</option>
              <option value="wenxin">文心</option>
              <option value="deepseek">DeepSeek</option>
              <option value="doubao">豆包</option>
              <option value="yuanbao">元宝</option>
              <option value="qwen">通义千问</option>
            </select>
          </label>
          <label>地区
            <select v-model="mp.area" @change="loadMedia(1)">
              <option value="">不限</option>
              <option v-for="a in areas" :key="a.value" :value="a.value">{{ a.value }}</option>
            </select>
          </label>
          <label>媒体分类
            <select v-model="mp.taxonomy" @change="loadMedia(1)">
              <option value="">不限</option>
              <option v-for="t in taxonomy" :key="t.value" :value="t.value">{{ t.value }}</option>
            </select>
          </label>
          <label>积分
            <select v-model="mp.price" @change="loadMedia(1)">
              <option value="">不限</option>
              <option value="0-100">≤ 100</option>
              <option value="101-500">101–500</option>
              <option value="501-1000">501–1000</option>
              <option value="1001-5000">1001–5000</option>
              <option value="5000+">&gt; 5000</option>
            </select>
          </label>
          <label>排序
            <select v-model="mp.sort" @change="loadMedia(1)">
              <option value="cite-desc">默认（综合/被引）</option>
              <option value="price-asc">价格 低→高</option>
              <option value="price-desc">价格 高→低</option>
            </select>
          </label>
          <button type="button" class="pb-mp-select-all" :disabled="!mpRows.length" @click="selectAllPage">全选当前 {{ mpRows.length }} 家</button>
        </div>

        <div class="pb-mp-body">
          <aside class="pb-mp-side">
            <div class="pb-mp-side-label">常用</div>
            <button type="button" :class="{ on: mp.tab === 'all' }" @click="setMpTab('all')">全部媒体</button>
            <button type="button" :class="{ on: mp.tab === 'frequent' }" @click="setMpTab('frequent')">常发媒体</button>
            <button type="button" :class="{ on: mp.tab === 'fav' }" @click="setMpTab('fav')">我的收藏</button>
            <div class="pb-mp-side-label">按分类</div>
            <button type="button" :class="{ on: mp.tab === 'portal' }" @click="setMpTab('portal')">新闻门户</button>
            <button type="button" :class="{ on: mp.tab === 'selfmedia' }" @click="setMpTab('selfmedia')">自媒体</button>
          </aside>

          <div class="pb-mp-list">
            <div v-if="mpLoading" class="pb-draft-empty">加载中…</div>
            <div v-for="item in mpRows" :key="item.media_key" class="pb-mp-item" @click="togglePick(item)">
              <span class="pb-mp-logo" :style="{ background: logoColor(item.name) }">{{ logoText(item.name) }}</span>
              <div class="pb-mp-main">
                <div class="pb-mp-name">{{ item.name }}</div>
                <div class="pb-mp-engines">
                  <span v-for="e in (item.geo_engines || item.indexed_engines || [])" :key="e" class="pb-mp-eng" :class="'eng-' + e">{{ engineLabel(e) }}</span>
                </div>
                <div class="pb-mp-meta">
                  <span class="pb-mp-area">{{ item.area || '全国' }}</span>
                  <a v-if="item.case_url || item.site_url" :href="item.case_url || item.site_url" target="_blank" rel="noopener" class="pb-mp-case" @click.stop>案例预览 ↗</a>
                </div>
                <div v-if="item.note" class="pb-mp-note">备注: {{ item.note }}</div>
              </div>
              <div class="pb-mp-right">
                <span class="pb-mp-plat">{{ item.platform || item.category_label || '媒体' }}</span>
                <span class="pb-mp-rate">出稿率 {{ item.success_rate != null ? Math.round(item.success_rate * 100) : 80 }}%</span>
                <span class="pb-mp-pts">+{{ item.sell_price || 0 }} <em v-if="item.list_price && item.list_price !== item.sell_price">+{{ item.list_price }}</em></span>
                <button type="button" class="pb-mp-star" :class="{ on: item.fav }" @click.stop="toggleFav(item)">★</button>
                <span class="pb-mp-radio" :class="{ on: pickSet.has(item.media_key) }"></span>
              </div>
            </div>
            <div v-if="!mpLoading && !mpRows.length" class="pb-draft-empty">暂无媒体</div>
          </div>
        </div>

        <div class="pb-mp-foot">
          <span>已选 {{ pickKeys.length }} 个媒体</span>
          <div class="pb-mp-foot-actions">
            <button type="button" class="pb-md pb-md--gray" @click="closeMediaPicker">取消</button>
            <button type="button" class="pb-md pb-md--dark" @click="confirmMedia">确定</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { publishApi } from '@/api/modules/report';
import { useAuthStore } from '@/stores/auth';
import { toast } from '@/lib/toast';

type MediaItem = {
  media_key: string;
  name: string;
  platform?: string;
  category_label?: string;
  area?: string;
  list_price?: number;
  sell_price?: number;
  note?: string;
  fav?: boolean;
  case_url?: string | null;
  site_url?: string;
  success_rate?: number | null;
  indexed_engines?: string[];
  geo_engines?: string[];
};

type DraftItem = {
  article_id: string;
  title?: string;
  content_md?: string;
  word_count?: number;
  status?: string;
};

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const titleText = ref('');
const remark = ref('');
const sourceMode = ref<'upload' | 'draft'>('upload');
const publishMode = ref<'now' | 'schedule'>('now');
const scheduleAt = ref('');
const articleId = ref('');
const editorHtml = ref('');
const wordCount = ref(0);
const blockFmt = ref('p');
const dragOver = ref(false);
const saving = ref(false);
const submitting = ref(false);

const editorEl = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const imgInput = ref<HTMLInputElement | null>(null);

const draftQuery = ref('');
const draftOpen = ref(false);
const draftLoading = ref(false);
const drafts = ref<DraftItem[]>([]);

const validateOpen = ref(false);
const previewOpen = ref(false);
const validateChecks = ref<{ name: string; pass: boolean; hits?: string[] }[]>([]);

const selectedMedia = ref<MediaItem[]>([]);
const mediaOpen = ref(false);
const pickKeys = ref<string[]>([]);
const pickMap = ref<Record<string, MediaItem>>({});
const mpLoading = ref(false);
const mpRows = ref<MediaItem[]>([]);
const mpTotal = ref(0);
const mpPage = ref(1);
const areas = ref<{ value: string; count: number }[]>([]);
const taxonomy = ref<{ value: string; count: number }[]>([]);
const mp = reactive({
  q: '',
  engine: 'all',
  area: '',
  taxonomy: '',
  price: '',
  sort: 'cite-desc',
  tab: 'all' as 'all' | 'frequent' | 'fav' | 'portal' | 'selfmedia',
});

const AD_WORDS = [ '国家级', '世界级', '最高级', '最佳', '第一', '唯一', '全网最低', '绝对', '万能', '根治' ];
const MED_WORDS = [ '疗效', '包治', '药到病除', '特效', '祖传秘方', '无副作用', '治愈率' ];
const FAKE_WORDS = [ '震惊', '速看', '不转不是中国人', '点击领取', '百分百', '稳赚不赔' ];

const ENGINE_META: Record<string, string> = {
  doubao: '豆包', deepseek: 'DeepSeek', wenxin: '文心', qwen: '通义千问', yuanbao: '元宝',
};

const filteredDrafts = computed(() => {
  const q = draftQuery.value.trim().toLowerCase();
  if (!q) return drafts.value;
  return drafts.value.filter(d => (d.title || '').toLowerCase().includes(q));
});
const pickSet = computed(() => new Set(pickKeys.value));
const totalPoints = computed(() => selectedMedia.value.reduce((s, m) => s + (Number(m.sell_price) || 0), 0));
const validateAllPass = computed(() => validateChecks.value.every(c => c.pass));
const readTimeLabel = computed(() => {
  const secs = Math.max(60, Math.round(wordCount.value / 6));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (!s) return `${m}分钟`;
  return `${m}分${s}秒`;
});
const previewMinutes = computed(() => Math.max(1, Math.ceil(wordCount.value / 300)));
const submitLabel = computed(() => {
  if (submitting.value) return '提交中…';
  if (!selectedMedia.value.length) return '选择媒体后发布';
  return `消耗 ${totalPoints.value} 积分发布`;
});

function engineLabel(e: string) { return ENGINE_META[e] || e; }
function formatNum(n: number) { return Number(n || 0).toLocaleString('zh-CN'); }
function logoText(name: string) { return (name || '?').replace(/\s/g, '').slice(0, 1); }
function logoColor(name: string) {
  const colors = [ '#2d7fd0', '#7c3aed', '#0f9d6b', '#e11d48', '#ea580c', '#4f46e5', '#0891b2' ];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % colors.length;
  return colors[h];
}

function syncWordCount() {
  const text = (editorEl.value?.innerText || '').replace(/\s+/g, '');
  wordCount.value = text.length;
  editorHtml.value = editorEl.value?.innerHTML || '';
}
function onEditorInput() { syncWordCount(); }
function syncBlockFmt() {
  try {
    const v = String(document.queryCommandValue('formatBlock') || '').toLowerCase();
    if (v.includes('h2')) blockFmt.value = 'h2';
    else if (v.includes('h3')) blockFmt.value = 'h3';
    else blockFmt.value = 'p';
  } catch { /* ignore */ }
}
function exec(cmd: string, val?: string) {
  editorEl.value?.focus();
  document.execCommand(cmd, false, val);
  syncWordCount();
  syncBlockFmt();
}
function fmtBlock(tag: 'p' | 'h2' | 'h3') {
  exec('formatBlock', tag === 'p' ? 'p' : tag);
  blockFmt.value = tag;
}
function insertLink() {
  const url = window.prompt('输入链接地址', 'https://');
  if (!url) return;
  exec('createLink', url);
}
function insertVideo() {
  const url = window.prompt('输入视频地址（将以链接形式插入）', 'https://');
  if (!url) return;
  exec('insertHTML', `<p><a href="${url}" target="_blank" rel="noopener">▶ 视频：${url}</a></p>`);
}
function setEditorHtml(html: string) {
  if (!editorEl.value) return;
  editorEl.value.innerHTML = html || '';
  syncWordCount();
}
function mdToHtml(md: string) {
  const esc = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .split(/\n{2,}/)
    .map(block => {
      const lines = block.split('\n').map(l =>
        l.replace(/^###\s+(.+)$/, '<h3>$1</h3>')
          .replace(/^##\s+(.+)$/, '<h2>$1</h2>')
          .replace(/^#\s+(.+)$/, '<h2>$1</h2>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>'),
      );
      if (lines.some(l => l.startsWith('<h'))) return lines.join('');
      return `<p>${lines.join('<br/>')}</p>`;
    })
    .join('');
}

async function switchDraftMode() {
  sourceMode.value = 'draft';
  draftOpen.value = true;
  if (!drafts.value.length) await loadDrafts();
}
async function loadDrafts() {
  draftLoading.value = true;
  try {
    const resp: any = await publishApi.drafts({ size: 50, q: draftQuery.value.trim() || undefined });
    drafts.value = resp?.list || [];
  } catch (e: any) {
    toast.error(e?.message || '加载稿件失败');
  } finally {
    draftLoading.value = false;
  }
}
function onDraftSearch() {
  draftOpen.value = true;
}
function pickDraft(d: DraftItem) {
  articleId.value = d.article_id;
  titleText.value = (d.title || '').slice(0, 30);
  const html = (d.content_md || '').includes('<') ? (d.content_md || '') : mdToHtml(d.content_md || '');
  setEditorHtml(html);
  draftQuery.value = d.title || '';
  draftOpen.value = false;
  toast.success('已载入稿件');
}

async function onDrop(e: DragEvent) {
  dragOver.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) await ingestFile(f);
}
async function onFilePick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  (e.target as HTMLInputElement).value = '';
  if (f) await ingestFile(f);
}
async function ingestFile(file: File) {
  const name = file.name || '';
  const lower = name.toLowerCase();
  try {
    if (lower.endsWith('.txt') || lower.endsWith('.md') || file.type.startsWith('text/')) {
      const text = await file.text();
      if (!titleText.value) titleText.value = name.replace(/\.(txt|md)$/i, '').slice(0, 30);
      setEditorHtml(lower.endsWith('.md') ? mdToHtml(text) : `<p>${text.replace(/\n/g, '<br/>')}</p>`);
      toast.success('文档已载入');
      return;
    }
    if (lower.endsWith('.docx')) {
      const html = await parseDocx(file);
      if (!titleText.value) titleText.value = name.replace(/\.docx$/i, '').slice(0, 30);
      setEditorHtml(html);
      toast.success('Word 文档已载入');
      return;
    }
    toast.error('仅支持 .docx / .md / .txt');
  } catch (err: any) {
    toast.error(err?.message || '文档解析失败');
  }
}
async function parseDocx(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const zip = await unzip(buf);
  const xml = zip['word/document.xml'];
  if (!xml) throw new Error('无效的 Word 文件');
  const text = xml
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<w:br\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('') || '<p></p>';
}
async function unzip(buf: ArrayBuffer): Promise<Record<string, string>> {
  const view = new DataView(buf);
  const u8 = new Uint8Array(buf);
  const files: Record<string, string> = {};
  let offset = 0;
  while (offset + 30 < u8.length) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break;
    const method = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const uncompSize = view.getUint32(offset + 22, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const nameBytes = u8.slice(offset + 30, offset + 30 + nameLen);
    const name = new TextDecoder().decode(nameBytes);
    const dataStart = offset + 30 + nameLen + extraLen;
    const data = u8.slice(dataStart, dataStart + compSize);
    offset = dataStart + compSize;
    if (method === 0) {
      files[name] = new TextDecoder().decode(data);
    } else if (method === 8 && typeof (globalThis as any).DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate-raw');
      const stream = new Blob([ data ]).stream().pipeThrough(ds);
      const ab = await new Response(stream).arrayBuffer();
      files[name] = new TextDecoder().decode(ab);
    }
  }
  return files;
}

function onPaste(e: ClipboardEvent) {
  const html = e.clipboardData?.getData('text/html');
  if (!html) return;
  e.preventDefault();
  const cleaned = html
    .replace(/<\/?(html|body|meta|head|style|script)[^>]*>/gi, '')
    .replace(/style="[^"]*"/gi, '');
  exec('insertHTML', cleaned);
}
async function onImgPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  (e.target as HTMLInputElement).value = '';
  if (!f) return;
  if (f.size > 5 * 1024 * 1024) {
    toast.error('图片需小于 5M');
    return;
  }
  const dataUrl = await compressImage(f);
  exec('insertHTML', `<p><img src="${dataUrl}" alt="" style="max-width:100%"/></p>`);
}
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxW = 1200;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')); };
    img.src = url;
  });
}

function hitWords(text: string, words: string[]) {
  return words.filter(w => text.includes(w));
}
function runValidate() {
  const text = `${titleText.value}\n${editorEl.value?.innerText || ''}`;
  const checks = [
    { name: '广告法违规词', pass: true as boolean, hits: hitWords(text, AD_WORDS) },
    { name: '医疗/功效违禁', pass: true, hits: hitWords(text, MED_WORDS) },
    { name: '敏感/虚假宣传', pass: true, hits: hitWords(text, FAKE_WORDS) },
    { name: '标题长度', pass: titleText.value.length > 0 && titleText.value.length <= 30, hits: [] as string[] },
  ];
  checks[0].pass = checks[0].hits.length === 0;
  checks[1].pass = checks[1].hits.length === 0;
  checks[2].pass = checks[2].hits.length === 0;
  validateChecks.value = checks;
  validateOpen.value = true;
}

function removeMedia(key: string) {
  selectedMedia.value = selectedMedia.value.filter(m => m.media_key !== key);
}
async function openMediaPicker() {
  pickKeys.value = selectedMedia.value.map(m => m.media_key);
  pickMap.value = Object.fromEntries(selectedMedia.value.map(m => [ m.media_key, m ]));
  mediaOpen.value = true;
  if (!areas.value.length) {
    try {
      const facets: any = await publishApi.mediaFacets();
      areas.value = facets?.areas || [];
      taxonomy.value = facets?.taxonomy || [];
    } catch { /* ignore */ }
  }
  await loadMedia(1);
}
function closeMediaPicker() { mediaOpen.value = false; }
function setMpTab(tab: typeof mp.tab) {
  mp.tab = tab;
  loadMedia(1);
}
function priceRange() {
  if (!mp.price) return {};
  if (mp.price === '0-100') return { price_min: 0, price_max: 100 };
  if (mp.price === '101-500') return { price_min: 101, price_max: 500 };
  if (mp.price === '501-1000') return { price_min: 501, price_max: 1000 };
  if (mp.price === '1001-5000') return { price_min: 1001, price_max: 5000 };
  if (mp.price === '5000+') return { price_min: 5001 };
  return {};
}
async function loadMedia(page = 1) {
  mpLoading.value = true;
  mpPage.value = page;
  try {
    const category = mp.tab === 'portal' ? 'portal' : mp.tab === 'selfmedia' ? 'selfmedia' : undefined;
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
    });
    mpRows.value = resp?.list || [];
    mpTotal.value = Number(resp?.total || 0);
  } catch (e: any) {
    mpRows.value = [];
    toast.error(e?.message || '加载媒体失败');
  } finally {
    mpLoading.value = false;
  }
}
function togglePick(item: MediaItem) {
  const i = pickKeys.value.indexOf(item.media_key);
  if (i >= 0) {
    pickKeys.value.splice(i, 1);
    delete pickMap.value[item.media_key];
    return;
  }
  pickKeys.value.push(item.media_key);
  pickMap.value[item.media_key] = item;
}
function selectAllPage() {
  for (const r of mpRows.value) {
    if (!pickSet.value.has(r.media_key)) {
      pickKeys.value.push(r.media_key);
      pickMap.value[r.media_key] = r;
    }
  }
}
async function toggleFav(item: MediaItem) {
  try {
    await publishApi.mediaFav(item.media_key, !item.fav);
    item.fav = !item.fav;
  } catch (e: any) {
    toast.error(e?.message || '收藏失败');
  }
}
function confirmMedia() {
  selectedMedia.value = pickKeys.value.map(k => pickMap.value[k]).filter(Boolean);
  mediaOpen.value = false;
}

async function saveDraft() {
  const content = editorEl.value?.innerHTML || '';
  if (!titleText.value.trim() && !content.replace(/<[^>]+>/g, '').trim()) {
    toast.error('请先填写标题或正文');
    return;
  }
  saving.value = true;
  try {
    const resp: any = await publishApi.saveDraft({
      article_id: articleId.value || undefined,
      brand_id: auth.activeBrandId,
      title: titleText.value.trim(),
      content_md: content,
    });
    articleId.value = resp?.article_id || articleId.value;
    toast.success('草稿已保存');
  } catch (e: any) {
    toast.error(e?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

function validateSchedule(): string | null {
  if (publishMode.value !== 'schedule') return null;
  if (!scheduleAt.value) return '请选择定时发布时间';
  const t = new Date(scheduleAt.value).getTime();
  if (!Number.isFinite(t)) return '时间格式无效';
  const now = Date.now();
  const min = now + 2 * 60 * 60 * 1000;
  const max = now + 10 * 24 * 60 * 60 * 1000;
  if (t < min || t > max) return '定时发布时间需在当前 2 小时后 ~ 10 天以内';
  return null;
}

async function submitPublish() {
  if (!titleText.value.trim()) {
    toast.error('请填写稿件标题');
    return;
  }
  if (!selectedMedia.value.length) {
    openMediaPicker();
    return;
  }
  const schedErr = validateSchedule();
  if (schedErr) {
    toast.error(schedErr);
    return;
  }
  const brandId = auth.activeBrandId;
  if (!brandId) {
    toast.error('请先选择品牌');
    return;
  }
  submitting.value = true;
  try {
    const resp: any = await publishApi.submit({
      brand_id: brandId,
      article_id: articleId.value || undefined,
      title: titleText.value.trim(),
      content_html: editorEl.value?.innerHTML || '',
      article_note: remark.value,
      media_keys: selectedMedia.value.map(m => m.media_key),
      schedule_at: publishMode.value === 'schedule' ? new Date(scheduleAt.value).toISOString() : null,
    });
    articleId.value = resp?.article_id || articleId.value;
    toast.success('已提交发布', `订单 ${resp?.order_nos?.length || 0} 笔 · 消耗 ${resp?.total_points || totalPoints.value} 积分`);
    router.push('/dashboard/media-library/records');
  } catch (e: any) {
    toast.error(e?.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}

async function hydrateFromQuery() {
  const articleFromQuery = String(route.query.article_id || '').trim();
  if (articleFromQuery) {
    try {
      const resp: any = await publishApi.drafts({ size: 50 });
      const found = (resp?.list || []).find((d: any) => d.article_id === articleFromQuery);
      if (found) {
        sourceMode.value = 'draft';
        pickDraft(found);
      } else {
        articleId.value = articleFromQuery;
      }
    } catch { /* ignore */ }
  }
  const keys = String(route.query.media_keys || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (!keys.length) return;
  try {
    const resp: any = await publishApi.mediaList({ media_keys: keys, size: keys.length, page: 1 });
    const list: MediaItem[] = resp?.list || [];
    selectedMedia.value = keys.map(k => list.find(x => x.media_key === k)).filter(Boolean) as MediaItem[];
  } catch { /* ignore */ }
}

function onDocClick(e: MouseEvent) {
  const t = e.target as HTMLElement;
  if (!t.closest('.pb-draft-pick')) draftOpen.value = false;
}

onMounted(async () => {
  document.addEventListener('click', onDocClick);
  await nextTick();
  syncWordCount();
  await hydrateFromQuery();
});
onUnmounted(() => document.removeEventListener('click', onDocClick));
</script>

<style lang="scss" scoped>
.pb-page {
  background: #f8fafc;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
  font-size: 16px;
}
.pb-header { display: flex; flex-direction: column; gap: 0; }

.pb-source-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  padding: 18px;
  box-shadow: rgba(0, 0, 0, 0.03) 0px 1px 4px;
}

.pb-upload-row { display: flex; gap: 8px; margin-bottom: 14px; }

.pb-btn-mode {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 37.5px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid #e6e8ee;
  background: #fff;
  color: #2a2d36;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  &:hover { background: #f5f6fa; }
}
.pb-btn-mode--on {
  color: #6452ff;
  background: #efecff;
  border-color: #6452ff;
  &:hover { background: #e6e0ff; }
}

.pb-drag-area {
  background: #f5f6fa;
  border: 1.5px dashed #e6e8ee;
  border-radius: 12px;
  padding: 18px 20px;
  min-height: 79.5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  &:hover, &.pb-drag-area--over {
    border-color: #6452ff;
    background: #f0f0ff;
  }
}
.pb-drag-icon { color: #8a8f9b; margin-bottom: 2px; }
.pb-drag-text { font-size: 13.5px; font-weight: 600; color: #0f1115; line-height: 20.25px; }
.pb-drag-hint { font-size: 11.5px; font-weight: 400; color: #8a8f9b; line-height: 17.25px; text-align: center; }
.pb-file-hidden { display: none; }

.pb-draft-pick { position: relative; }
.pb-draft-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e6e8ee;
  border-radius: 10px;
  background: #fff;
  color: #8a8f9b;
  &:focus-within { border-color: #6452ff; }
}
.pb-draft-search {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13.5px;
  font-family: inherit;
  color: #0f1115;
  background: transparent;
  &::placeholder { color: #c5c8d0; }
}
.pb-draft-tip { margin: 10px 0 0; font-size: 12px; color: #8a8f9b; line-height: 18px; }
.pb-draft-dropdown {
  position: absolute;
  left: 0; right: 0; top: 44px;
  z-index: 20;
  max-height: 280px;
  overflow: auto;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(15, 17, 21, 0.12);
}
.pb-draft-item {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: none;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: inherit;
  &:hover { background: #f5f6fa; }
}
.pb-draft-item-title { font-size: 13.5px; font-weight: 600; color: #0f1115; }
.pb-draft-item-meta { font-size: 11.5px; color: #8a8f9b; }
.pb-draft-empty { padding: 16px; text-align: center; font-size: 13px; color: #8a8f9b; }

.pb-editor-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  overflow: hidden;
}
.pb-title-wrap { padding: 16px 20px 8px; border-bottom: 1px solid #f0f1f6; }
.pb-title-input {
  width: 100%; border: none; outline: none; background: transparent;
  font-size: 20px; font-weight: 700; color: #0f1115; font-family: inherit;
  padding: 4px 0; height: 38px; line-height: 38px;
  &::placeholder { color: #c5c8d0; }
}
.pb-title-count { font-size: 11px; color: #8a8f9b; line-height: 16.5px; margin-top: 2px; }

.pb-toolbar {
  padding: 8px 20px; border-bottom: 1px solid #f0f1f6;
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.pb-tb {
  padding: 4px 8px; font-size: 12.5px; font-weight: 500; color: #5b606a;
  background: transparent; border: none; border-radius: 6px; cursor: pointer; font-family: inherit;
  transition: background 0.15s, color 0.15s;
  &:hover { background: #f5f6fa; color: #0f1115; }
}
.pb-tb--active { background: #f5f6fa; color: #0f1115; font-weight: 600; }
.pb-tb--img { color: #0f9d6b; }
.pb-tb-sep { display: inline-block; width: 1px; height: 16px; background: #e6e8ee; margin: 0 4px; }

.pb-editor-hint-bar {
  display: flex; padding: 8px 16px; border-bottom: 1px solid #f0f1f6; background: #fffbf0;
}
.pb-editor-hint { font-size: 11.5px; color: #8a6300; line-height: 17.25px; }

.pb-editor {
  min-height: 260px; padding: 14px 16px; font-size: 14.5px; line-height: 1.85;
  color: #2a2d36; outline: none; overflow-y: auto;
  &:empty::before { content: attr(data-ph); color: #c5c8d0; }
}

.pb-editor-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;
  margin-top: 10px; padding: 0 16px 12px; font-size: 12px; color: #5b606a;
}
.pb-editor-count {
  font-size: 12px; color: #5b606a; line-height: 18px;
  strong { font-weight: 600; color: #0f1115; }
}
.pb-footer-right { display: flex; align-items: center; gap: 8px; }

.pb-sm {
  display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 6px 12px;
  font-size: 12px; font-weight: 600; border-radius: 8px; cursor: pointer; font-family: inherit;
  border: 1px solid; transition: background 0.15s;
}
.pb-sm--purple { color: #6452ff; background: #efecff; border-color: #6452ff; &:hover { background: #e6e0ff; } }
.pb-sm--gray { color: #2a2d36; background: #fff; border-color: #e6e8ee; &:hover { background: #f5f6fa; } }
.pb-sm--purple-out { color: #6452ff; background: #fff; border-color: #6452ff; &:hover { background: #efecff; } }

.pb-md {
  display: inline-flex; align-items: center; gap: 6px; height: 39.5px; padding: 9px 16px;
  font-size: 13px; font-weight: 600; border-radius: 9px; cursor: pointer; font-family: inherit;
  border: 1px solid; transition: background 0.15s;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.pb-md--purple { color: #6452ff; background: #efecff; border-color: #6452ff; &:hover { background: #e6e0ff; } }
.pb-md--gray { color: #2a2d36; background: #fff; border-color: #e6e8ee; &:hover { background: #f5f6fa; } }
.pb-md--dark { color: #fff; background: #0f1115; border-color: #0f1115; &:hover { background: #1a1d24; } }

.pb-combo {
  height: 38px; padding: 0 10px; font-size: 13px; color: #2a2d36; background: #fff;
  border: 1px solid #e6e8ee; border-radius: 8px; outline: none; cursor: pointer; font-family: inherit;
  &:hover { border-color: #c7d2fe; }
}
.pb-combo--full { width: 100%; }

.pb-remark-card, .pb-setting-card, .pb-media-card, .pb-notice-card {
  background: #fff; border: 1px solid #e6e8ee; border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
}
.pb-remark-card { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.pb-panel-icon { color: #6452ff; flex-shrink: 0; }
.pb-remark-head, .pb-setting-head { display: flex; align-items: center; gap: 6px; }
.pb-remark-title, .pb-setting-title, .pb-media-title {
  font-size: 14px; font-weight: 700; color: #0f1115;
}
.pb-remark-body { display: flex; flex-direction: column; gap: 8px; }
.pb-remark-tip { margin: 0; font-size: 12px; color: #8a8f9b; line-height: 18px; }

.pb-setting-card { padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }
.pb-setting-body { display: flex; flex-direction: column; gap: 12px; }
.pb-setting-actions { display: flex; align-items: center; gap: 10px; }
.pb-schedule-wrap { width: fit-content; }
.pb-schedule-input {
  height: 38px; padding: 0 12px; border: 1px solid #e6e8ee; border-radius: 8px;
  font-size: 13px; font-family: inherit; color: #2a2d36; background: #fff;
}
.pb-schedule-tip { margin: 8px 0 0; font-size: 12px; color: #8a8f9b; line-height: 18px; }

.pb-media-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.pb-media-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.pb-media-empty {
  font-size: 13px; color: #8a8f9b; line-height: 20px; padding: 24px; text-align: center;
  background: #f5f6fa; border: 1px dashed #e6e8ee; border-radius: 10px;
}
.pb-media-selected { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.pb-media-chip {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px;
  background: #f5f6fa; border: 1px solid #e6e8ee; border-radius: 999px; font-size: 12.5px;
}
.pb-media-chip-logo {
  width: 20px; height: 20px; border-radius: 50%; color: #fff;
  display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;
}
.pb-media-chip-name { font-weight: 600; color: #0f1115; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pb-media-chip-pts { color: #ea580c; font-weight: 600; }
.pb-media-chip-x {
  border: none; background: transparent; color: #8a8f9b; cursor: pointer; font-size: 14px; line-height: 1; padding: 0 2px;
  &:hover { color: #0f1115; }
}
.pb-media-total { width: 100%; font-size: 12.5px; color: #5b606a; margin-top: 4px; strong { color: #ea580c; } }
.pb-media-bottom { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }

.pb-notice-card { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.pb-notice-head {
  display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: #0f1115;
  svg { color: #8a8f9b; flex-shrink: 0; }
}
.pb-notice-list {
  list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px;
  li {
    font-size: 12px; color: #5b606a; line-height: 22.8px; padding-left: 12px; position: relative;
    &::before {
      content: ''; position: absolute; left: 0; top: 10px;
      width: 4px; height: 4px; border-radius: 50%; background: #c5c8d0;
    }
  }
}

/* modals */
.pb-modal-mask {
  position: fixed; inset: 0; z-index: 1000; background: rgba(15, 17, 21, 0.4);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.pb-modal {
  width: min(720px, 100%); max-height: 88vh; display: flex; flex-direction: column;
  background: #fff; border-radius: 16px; overflow: hidden;
  box-shadow: rgba(15, 17, 21, 0.25) 0px 20px 60px;
}
.pb-modal--sm { width: min(480px, 100%); }
.pb-modal--media { width: min(1080px, 100%); height: min(820px, 92vh); }
.pb-modal-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 16px 18px; border-bottom: 1px solid #e6e8ee;
}
.pb-modal-title { font-size: 14.5px; font-weight: 700; color: #0f1115; }
.pb-modal-sub { font-size: 11.5px; color: #8a8f9b; margin-top: 2px; }
.pb-modal-x {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: 1px solid #e6e8ee; background: #fff; color: #5b606a;
  border-radius: 8px; cursor: pointer;
}
.pb-modal-body { padding: 16px 18px 20px; }
.pb-check-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid #f0f1f6; font-size: 13.5px; color: #2a2d36;
}
.pb-check-badge {
  font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
  &--ok { color: #0f9d6b; background: #e8f8f1; }
  &--fail { color: #e11d48; background: #ffe4e8; }
}
.pb-check-note {
  margin-top: 14px; padding: 12px 14px; border-radius: 10px; font-size: 12.5px; line-height: 1.6;
  &--ok { background: #e8f8f1; color: #0f6b4a; }
  &--warn { background: #fff7ed; color: #9a3412; }
}
.pb-preview-body { padding: 22px 26px; overflow-y: auto; max-height: 66vh; }
.pb-preview-title { font-size: 22px; font-weight: 700; color: #0f1115; line-height: 1.4; }
.pb-preview-meta { font-size: 12px; color: #8a8f9b; margin: 8px 0 18px; }
.pb-preview-content { font-size: 14.5px; color: #2a2d36; line-height: 1.85; :deep(img) { max-width: 100%; } }

.pb-mp-toolbar {
  display: flex; align-items: center; gap: 12px; padding: 12px 18px 0;
}
.pb-mp-search {
  flex: 1; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 10px 0 12px;
  border: 1px solid #e6e8ee; border-radius: 10px; color: #8a8f9b;
  input { flex: 1; border: none; outline: none; font-size: 13px; font-family: inherit; color: #0f1115; background: transparent; }
}
.pb-mp-search-btn {
  height: 28px; padding: 0 10px; border: none; border-radius: 7px; background: #f5f6fa;
  color: #2a2d36; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
}
.pb-mp-count { font-size: 12px; color: #8a8f9b; white-space: nowrap; }
.pb-mp-filters {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 12px 18px;
  label {
    display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #5b606a;
    select {
      height: 32px; border: 1px solid #e6e8ee; border-radius: 8px; padding: 0 8px;
      font-size: 12.5px; font-family: inherit; background: #fff; color: #2a2d36;
    }
  }
}
.pb-mp-select-all {
  margin-left: auto; height: 32px; padding: 0 12px; border: 1px solid #e6e8ee; border-radius: 8px;
  background: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.pb-mp-body { flex: 1; min-height: 0; display: flex; border-top: 1px solid #f0f1f6; }
.pb-mp-side {
  width: 140px; flex-shrink: 0; border-right: 1px solid #f0f1f6; padding: 12px 8px;
  display: flex; flex-direction: column; gap: 2px; overflow: auto;
  button {
    text-align: left; border: none; background: transparent; padding: 8px 10px; border-radius: 8px;
    font-size: 13px; color: #2a2d36; cursor: pointer; font-family: inherit;
    &.on { background: #efecff; color: #6452ff; font-weight: 600; }
    &:hover:not(.on) { background: #f5f6fa; }
  }
}
.pb-mp-side-label { font-size: 11px; color: #8a8f9b; padding: 10px 10px 4px; }
.pb-mp-list { flex: 1; overflow: auto; padding: 8px 12px; }
.pb-mp-item {
  display: flex; gap: 12px; padding: 12px 10px; border-bottom: 1px solid #f0f1f6; cursor: pointer;
  &:hover { background: #fafbff; }
}
.pb-mp-logo {
  width: 36px; height: 36px; border-radius: 50%; color: #fff; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center; font-weight: 700;
}
.pb-mp-main { flex: 1; min-width: 0; }
.pb-mp-name { font-size: 14px; font-weight: 700; color: #0f1115; }
.pb-mp-engines { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.pb-mp-eng {
  font-size: 10.5px; padding: 1px 6px; border-radius: 999px; color: #fff; font-weight: 600;
  &.eng-doubao { background: #f59e0b; }
  &.eng-deepseek { background: #4f46e5; }
  &.eng-wenxin { background: #ec4899; }
  &.eng-qwen { background: #6366f1; }
  &.eng-yuanbao { background: #0ea5e9; }
}
.pb-mp-meta { margin-top: 6px; font-size: 12px; display: flex; gap: 8px; align-items: center; }
.pb-mp-area, .pb-mp-case { color: #6452ff; text-decoration: none; }
.pb-mp-note { margin-top: 4px; font-size: 11.5px; color: #8a8f9b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pb-mp-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; min-width: 110px;
}
.pb-mp-plat {
  font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #efecff; color: #6452ff; font-weight: 600;
}
.pb-mp-rate { font-size: 11.5px; color: #5b606a; }
.pb-mp-pts { font-size: 13px; font-weight: 700; color: #ea580c; em { font-style: normal; color: #c5c8d0; margin-left: 4px; font-weight: 500; } }
.pb-mp-star {
  border: none; background: transparent; cursor: pointer; color: #c5c8d0; font-size: 16px;
  &.on { color: #f59e0b; }
}
.pb-mp-radio {
  width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #c5c8d0;
  &.on { border-color: #6452ff; background: radial-gradient(circle at center, #6452ff 0 45%, transparent 48%); }
}
.pb-mp-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-top: 1px solid #e6e8ee; font-size: 13px; color: #5b606a;
}
.pb-mp-foot-actions { display: flex; gap: 8px; }
</style>
