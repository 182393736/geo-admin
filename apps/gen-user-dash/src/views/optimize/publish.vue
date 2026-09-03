<template>
  <div class="pb-page">
    <!-- 头部 -->
    <div class="pb-header">
      <h2 class="pb-title">发布稿件</h2>
      <p class="pb-desc">多媒体编辑 · 一键分发到 AI 引擎收录的内容平台 · 让稿件被豆包 / DeepSeek / 文心一言引用</p>
    </div>

    <!-- 上传区域 -->
    <div class="pb-upload-row">
      <button class="pb-btn-up" type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
        上传文档
      </button>
      <button class="pb-btn-sel" type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
        选择已有稿件
      </button>
    </div>

    <div class="pb-drag-area">
      <svg class="pb-drag-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
      <div class="pb-drag-text">拖入文档，或点击从本地选择</div>
      <div class="pb-drag-hint">支持 Word(.docx)、Markdown、纯文本 · 自动转为可编辑正文，Word 内嵌图片自动转存图床</div>
    </div>

    <!-- 编辑器卡片 -->
    <div class="pb-editor-card">
      <!-- 标题输入 -->
      <div class="pb-title-wrap">
        <input class="pb-title-input" type="text" placeholder="输入稿件标题…" maxlength="30" v-model="titleText" />
        <div class="pb-title-count">{{ titleText.length }} / 30 · 建议标题 30 字符以内</div>
      </div>

      <!-- 工具栏 -->
      <div class="pb-toolbar">
        <button class="pb-tb pb-tb--active" type="button">正文</button>
        <button class="pb-tb" type="button">H2</button>
        <button class="pb-tb" type="button">H3</button>
        <span class="pb-tb-sep"></span>
        <button class="pb-tb" type="button">B</button>
        <button class="pb-tb" type="button">I</button>
        <button class="pb-tb" type="button">U</button>
        <span class="pb-tb-sep"></span>
        <button class="pb-tb" type="button">• 列表</button>
        <button class="pb-tb" type="button">1. 列表</button>
        <button class="pb-tb" type="button">❝ 引用</button>
        <button class="pb-tb" type="button">链接</button>
        <span class="pb-tb-sep"></span>
        <button class="pb-tb" type="button">🖼 图片</button>
        <button class="pb-tb" type="button">▶ 视频</button>
        <button class="pb-tb" type="button">— 分隔线</button>
        <span class="pb-tb-sep"></span>
        <button class="pb-tb" type="button">清除格式</button>
      </div>

      <!-- 编辑器提示（工具栏与编辑器之间） -->
      <div class="pb-editor-hint-bar">
        <span class="pb-editor-hint">粘贴网页/文档内容时，图片会自动搬运到本站图床；但 Word 本地图片(截图另存的)可能搬运失败，若提示失败请用「🖼 图片」重新上传。图片单张 &lt; 5M，上传后自动压缩。</span>
      </div>

      <!-- 编辑器内容 -->
      <div class="pb-editor" contenteditable="true" data-ph="在这里撰写或粘贴正文，可插入图片、视频、链接……"></div>

      <!-- 底部状态行：左字数统计 / 右操作按钮 -->
      <div class="pb-editor-footer">
        <span class="pb-editor-count">字数 <strong>0</strong> · 预计阅读 <strong>1</strong> 分钟</span>
        <span class="pb-footer-right">
          <button class="pb-sm pb-sm--purple" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            内容校验
          </button>
          <button class="pb-sm pb-sm--gray" type="button">
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
        <select class="pb-combo pb-combo--full">
          <option value="">无（不填）</option>
          <option value="1">标题不接受修改，如原标题不能发请拒稿</option>
          <option value="2">什么值得买发文不接受转载（推荐）模式</option>
          <option value="3">列举网指定地区…（自定义地区）</option>
        </select>
        <p class="pb-remark-tip">平台备注仅接受以上固定指令，将随订单提交给发稿平台。</p>
      </div>
    </div>

    <!-- 发布设置 -->
    <div class="pb-setting-card">
      <div class="pb-setting-head">
        <svg class="pb-panel-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        <span class="pb-setting-title">发布设置</span>
      </div>
      <div class="pb-setting-body">
        <div class="pb-setting-actions">
          <button class="pb-md pb-md--purple" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            立即发布
          </button>
          <button class="pb-md pb-md--gray" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            定时发布
          </button>
        </div>
      </div>
    </div>

    <!-- 发布媒体 -->
    <div class="pb-media-card">
      <div class="pb-media-head">
        <span class="pb-media-title">发布媒体</span>
        <button class="pb-sm pb-sm--purple-out" type="button">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          选择媒体
        </button>
      </div>
      <div class="pb-media-empty">尚未选择发布媒体 · 点击从信源库挑选，优先选择引热度高的信源平台</div>
      <div class="pb-media-bottom">
        <button class="pb-md pb-md--gray" type="button">存为草稿</button>
        <button class="pb-md pb-md--dark" type="button">选择媒体后发布</button>
      </div>
    </div>

    <!-- 注意事项 -->
    <div class="pb-notice-card">
      <div class="pb-notice-head">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
const titleText = ref('');
</script>

<style lang="scss" scoped>
/* ===================================================
   优化 - 发布稿件 (像素级复刻)
   对标: geo.timus.cn/dashboard/publish-article

   精确色值:
   主文本 #0f1115 / 次文本 #5b606a / 元文本 #8a8f9b
   表格文本 #2a2d36 / 边框 #e6e8ee / 浅边框 #f0f1f6
   紫色 #6452ff / 紫色背景 #efecff / 表头背景 #f5f6fa
   卡片白底 #fff / 页面背景 #f8fafc / 圆角 14px
   阴影 rgba(16,18,30,0.04) 0px 2px 10px 0px
   =================================================== */

.pb-page {
  margin: -16px auto -16px;
  padding: 28px 36px 80px;
  background: #f8fafc;
  min-height: calc(100vh - 32px);
  max-width: 1240px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: #0f1115;
  font-size: 16px;
}

/* ====== 头部 ====== */
.pb-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pb-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f1115;
  line-height: 33px;
  letter-spacing: -0.3px;
}

.pb-desc {
  margin: 0;
  font-size: 12.5px;
  font-weight: 400;
  color: #5b606a;
  line-height: 18.75px;
}

/* ====== 上传按钮 ====== */
.pb-upload-row {
  display: flex;
  gap: 8px;
}

.pb-btn-up,
.pb-btn-sel {
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
  border: 1px solid;
  transition: background 0.15s;
}

.pb-btn-up {
  color: #6452ff;
  background: #efecff;
  border-color: #6452ff;
  &:hover { background: #e6e0ff; }
}

.pb-btn-sel {
  color: #2a2d36;
  background: #fff;
  border-color: #e6e8ee;
  &:hover { background: #f5f6fa; }
}

/* ====== 拖拽区 ====== */
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
  &:hover {
    border-color: #6452ff;
    background: #f0f0ff;
  }
}

.pb-drag-icon {
  color: #8a8f9b;
  margin-bottom: 2px;
}

.pb-drag-text {
  font-size: 13.5px;
  font-weight: 600;
  color: #0f1115;
  line-height: 20.25px;
}

.pb-drag-hint {
  font-size: 11.5px;
  font-weight: 400;
  color: #8a8f9b;
  line-height: 17.25px;
  text-align: center;
}

/* ====== 编辑器卡片 ====== */
.pb-editor-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  overflow: hidden;
}

/* 标题输入 */
.pb-title-wrap {
  padding: 16px 20px 8px;
  border-bottom: 1px solid #f0f1f6;
}

.pb-title-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  color: #0f1115;
  font-family: inherit;
  padding: 4px 0;
  height: 38px;
  line-height: 38px;
  &::placeholder { color: #c5c8d0; }
}

.pb-title-count {
  font-size: 11px;
  font-weight: 400;
  color: #8a8f9b;
  line-height: 16.5px;
  margin-top: 2px;
}

/* 工具栏 */
.pb-toolbar {
  padding: 8px 20px;
  border-bottom: 1px solid #f0f1f6;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.pb-tb {
  padding: 4px 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: #5b606a;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
  &:hover { background: #f5f6fa; color: #0f1115; }
}

.pb-tb--active {
  background: #f5f6fa;
  color: #0f1115;
  font-weight: 600;
}

.pb-tb-sep {
  display: inline-block;
  width: 1px;
  height: 16px;
  background: #e6e8ee;
  margin: 0 4px;
}

/* 编辑器 */
.pb-editor {
  min-height: 260px;
  padding: 14px 16px;
  font-size: 14.5px;
  color: #2a2d36;
  outline: none;
  overflow-y: auto;
  &:empty::before {
    content: attr(data-ph);
    color: #c5c8d0;
  }
}

/* 编辑器提示（工具栏与编辑器之间） */
.pb-editor-hint-bar {
  display: flex;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f1f6;
  background: #fffbf0;
}

.pb-editor-hint-bar .pb-editor-hint {
  font-size: 11.5px;
  font-weight: 400;
  color: #8a6300;
  line-height: 17.25px;
}

/* 底部状态行：左字数 / 右按钮 */
.pb-editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
  padding: 0 16px 12px;
  font-size: 12px;
  color: #5b606a;
}

.pb-editor-footer .pb-editor-count {
  font-size: 12px;
  font-weight: 400;
  color: #5b606a;
  line-height: 18px;

  strong {
    font-weight: 600;
    color: #0f1115;
  }
}

.pb-footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 小按钮 (32px) */
.pb-sm {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid;
  transition: background 0.15s;
}

.pb-sm--purple {
  color: #6452ff;
  background: #efecff;
  border-color: #6452ff;
  &:hover { background: #e6e0ff; }
}

.pb-sm--gray {
  color: #2a2d36;
  background: #fff;
  border-color: #e6e8ee;
  &:hover { background: #f5f6fa; }
}

.pb-sm--purple-out {
  color: #6452ff;
  background: #fff;
  border-color: #6452ff;
  &:hover { background: #efecff; }
}

/* 中按钮 (39.5px) */
.pb-md {
  display: inline-flex;
  align-items: center;
  height: 39.5px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid;
  transition: background 0.15s;
}

.pb-md--purple {
  color: #6452ff;
  background: #efecff;
  border-color: #6452ff;
  &:hover { background: #e6e0ff; }
}

.pb-md--gray {
  color: #2a2d36;
  background: #fff;
  border-color: #e6e8ee;
  &:hover { background: #f5f6fa; }
}

.pb-md--dark {
  color: #fff;
  background: #0f1115;
  border-color: #0f1115;
  &:hover { background: #1a1d24; }
}

/* 下拉框 */
.pb-combo {
  height: 38px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 400;
  color: #2a2d36;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  &:hover { border-color: #c7d2fe; }
}

/* ====== 发布备注 ====== */
.pb-remark-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* panel 标题前图标（共享） */
.pb-panel-icon {
  color: #6452ff;
  flex-shrink: 0;
}

.pb-remark-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pb-remark-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f1115;
}

.pb-remark-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pb-combo--full {
  width: 100%;
  height: 38px;
}

.pb-remark-tip {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: #8a8f9b;
  line-height: 18px;
}

/* ====== 发布设置 ====== */
.pb-setting-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pb-setting-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pb-setting-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f1115;
}

.pb-setting-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pb-setting-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ====== 发布媒体区域 ====== */
.pb-media-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pb-media-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pb-media-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f1115;
}

.pb-media-empty {
  font-size: 13px;
  font-weight: 400;
  color: #8a8f9b;
  line-height: 20px;
  padding: 24px;
  text-align: center;
  background: #f5f6fa;
  border: 1px dashed #e6e8ee;
  border-radius: 10px;
}

.pb-media-bottom {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* ====== 注意事项 ====== */
.pb-notice-card {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  box-shadow: rgba(16, 18, 30, 0.04) 0px 2px 10px 0px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pb-notice-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #0f1115;

  svg {
    color: #8a8f9b;
    flex-shrink: 0;
  }
}

.pb-notice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  li {
    font-size: 12px;
    font-weight: 400;
    color: #5b606a;
    line-height: 22.8px;
    padding-left: 12px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #c5c8d0;
    }
  }
}
</style>
