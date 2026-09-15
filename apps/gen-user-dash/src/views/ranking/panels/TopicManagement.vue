<template>
  <div class="geo-page">
    <div class="geo-page-header">
      <div class="geo-page-header__text">
        <h1 class="geo-page-title">监控问题管理</h1>
        <p class="geo-page-desc">配置实际发送给 AI 的监控问题。</p>
      </div>
      <div class="geo-page-header__actions flex gap-4 items-center">
        <div class="flex items-stretch bg-white border border-gray-100 rounded-xl shadow-sm">
          <div class="px-5 py-2.5 flex flex-col justify-center border-r border-gray-100 bg-gradient-to-b from-white to-gray-50 rounded-l-xl">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">总占用 · 全部分类</span>
            </div>
            <span class="text-xl font-extrabold leading-none text-gray-900">
              {{ totalUsed }}<span class="text-xs text-gray-400 font-normal"> / {{ totalLimit }}</span>
            </span>
          </div>
          <div class="px-5 py-2.5 flex flex-col justify-center border-r border-gray-100 relative group cursor-help bg-white">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">本页 · {{ pageScopeLabel }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 group-hover:text-indigo-500 transition-colors"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            </div>
            <div class="absolute top-full left-0 mt-2 w-72 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none leading-relaxed">
              <span class="text-indigo-300 font-bold">总占用 · 全部分类</span>：排名词 + 口碑词 全部已占用额度，是计费依据。<br>
              <span class="text-indigo-300 font-bold">本页 · {{ pageScopeLabel }}</span>：仅当前分类下的问题条数，所以会小于总占用，属正常现象。
              <div class="absolute bottom-full left-8 border-4 border-transparent border-b-gray-900"></div>
            </div>
            <span class="text-xl font-extrabold leading-none text-indigo-600">
              {{ pageCount }}<span class="text-xs text-gray-400 font-normal">个</span>
            </span>
          </div>
          <div class="px-5 py-2.5 flex flex-col justify-center border-r border-gray-100 bg-white">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">待释放</span>
            </div>
            <span class="text-xl font-extrabold leading-none text-amber-600">
              {{ pendingRelease }}<span class="text-xs text-gray-400 font-normal">个</span>
            </span>
          </div>
          <button
            type="button"
            class="px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-l border-indigo-100 transition-colors flex flex-col items-center justify-center gap-1 rounded-r-xl min-w-[52px]"
            title="扩容额度"
            @click="goPricing"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
            <span class="text-[10px] font-bold">扩容</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 max-w-[1600px] mx-auto pb-24 relative">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col relative min-h-[400px]">
        <!-- 卡片头 -->
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between flex-wrap gap-3">
          <div class="qm-card-title text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 w-fit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            问题列表 ({{ filteredRows.length }})
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
              <input
                v-model="search"
                placeholder="搜索问题..."
                class="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 w-48 transition-all"
              />
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!filteredRows.length"
              @click="exportList"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
              导出
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-300 hover:bg-indigo-50 shadow-sm transition-all"
              @click="openImport"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
              导入问题
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="remainQuota <= 0"
              @click="openAdd"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              增加新问题
            </button>
          </div>
        </div>

        <!-- 分组 Tabs -->
        <div class="px-6 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap bg-white">
          <button
            type="button"
            :class="groupTabCls(activeGroup === 'all')"
            @click="activeGroup = 'all'"
          >全部</button>
          <button
            type="button"
            :class="groupTabCls(activeGroup === 'ungrouped', true)"
            @click="activeGroup = 'ungrouped'"
          >
            未分组 <b class="font-bold" :class="activeGroup === 'ungrouped' ? 'text-indigo-100' : 'text-gray-400'">{{ ungroupedCount }}</b>
          </button>
          <button
            v-for="g in groups"
            :key="g.group_id"
            type="button"
            :class="groupTabCls(activeGroup === g.group_id, true)"
            @click="activeGroup = g.group_id"
          >
            {{ g.name }} <b class="font-bold" :class="activeGroup === g.group_id ? 'text-indigo-100' : 'text-gray-400'">{{ g.query_count }}</b>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border border-dashed border-gray-300 text-gray-500 bg-gray-50 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            @click="openCreateGroup"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            新建分组
          </button>
        </div>

        <!-- 表头 -->
        <div class="grid grid-cols-[2fr_6fr_1.6fr_auto_auto_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider select-none items-center">
          <div>监控类型</div>
          <div>问题</div>
          <div class="text-center">分组</div>
          <div class="w-[88px] text-center">添加时间</div>
          <div class="w-[80px] text-center">状态</div>
          <div class="w-[68px] text-center">操作</div>
        </div>

        <!-- 行 -->
        <div class="divide-y divide-gray-100 bg-white">
          <div
            v-for="q in filteredRows"
            :key="q.id"
            class="qm-row grid grid-cols-[2fr_6fr_1.6fr_auto_auto_auto] gap-4 px-6 py-4 items-start transition-all group relative hover:bg-gray-50/80 cursor-grab active:cursor-grabbing"
            draggable="true"
            @dragstart="onDragStart(q.id, $event)"
            @dragover.prevent
            @drop="onDrop(q.id)"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors bg-transparent group-hover:bg-indigo-300"></div>
            <div>
              <span :class="typeBadgeCls(q.query_type)">{{ TYPE_LABEL[q.query_type] || q.query_type }}</span>
            </div>
            <div class="relative">
              <span class="qm-question-text text-sm font-bold text-gray-900 py-1.5 inline-flex items-center gap-2 flex-wrap">{{ q.query }}</span>
            </div>
            <div class="min-w-0 pt-1">
              <select
                class="block w-full min-w-0 max-w-full truncate text-xs px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:border-indigo-300 cursor-pointer"
                :value="q.group_id || ''"
                @change="onMoveGroup(q.id, ($event.target as HTMLSelectElement).value)"
              >
                <option value="">未分组</option>
                <option v-for="g in groups" :key="g.group_id" :value="g.group_id">{{ g.name }}</option>
              </select>
            </div>
            <div class="w-[88px] flex justify-center pt-2">
              <span class="text-[11px] text-gray-400 whitespace-nowrap">{{ fmtDate(q.created_at) }}</span>
            </div>
            <div class="w-[80px] flex justify-center pt-2">
              <button
                type="button"
                class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border transition-colors"
                :class="q.query_status
                  ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'"
                :title="q.query_status ? '点击停用' : '点击启用'"
                @click="toggleStatus(q)"
              >
                <span class="w-1.5 h-1.5 rounded-full mr-1" :class="q.query_status ? 'bg-green-500' : 'bg-gray-300'"></span>
                {{ q.query_status ? '监控中' : '已停用' }}
              </button>
            </div>
            <div class="w-[68px] flex items-center justify-center gap-1">
              <button type="button" class="p-1 rounded transition-colors text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="编辑问题" @click="openEdit(q)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
              </button>
              <button type="button" class="p-1 rounded transition-colors text-gray-300 hover:text-red-500 hover:bg-red-50" title="删除" @click="confirmDelete(q)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div v-if="loading" class="px-6 py-16 flex justify-center">
            <div class="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <div v-else-if="!filteredRows.length" class="px-6 py-10 text-center text-sm text-gray-400">暂无监控问题</div>
        </div>
      </div>
    </div>

    <!-- 添加 / 导入 弹窗 -->
    <Teleport to="body">
      <div v-if="addOpen" class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 p-4" @click.self="closeAdd">
        <div class="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <span class="text-indigo-600">+</span> {{ addMode === 'import' ? '导入监控问题' : '添加监控问题' }}
            </h3>
            <button type="button" class="p-1 text-gray-400 hover:text-gray-600" @click="closeAdd">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div v-if="addStep === 1" class="px-6 py-5 space-y-5">
            <div>
              <div class="text-sm font-semibold text-gray-600 mb-2">输入监控问题</div>
              <textarea
                v-model="addText"
                rows="6"
                class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-y"
                placeholder="输入您想监控的问题，每行一个，支持批量添加...&#10;例如：&#10;智能手机推荐&#10;AI手机对比"
              />
            </div>
            <div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold text-gray-800">问题内容拓写</div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="generalize"
                  :aria-label="generalize ? '已开启：把问题改写成自然提问' : '已关闭：保持原文'"
                  class="relative w-10 h-6 rounded-full transition-colors"
                  :class="generalize ? 'bg-indigo-600' : 'bg-gray-300'"
                  @click="generalize = !generalize"
                >
                  <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" :class="generalize ? 'translate-x-4' : ''" />
                </button>
              </div>
              <p class="mt-2 text-xs text-gray-500 leading-relaxed">
                把简短问题改写成用户真实向 AI 提问的自然语气，监测更贴合实际。关闭后将保持你输入的原文。
              </p>
              <div class="mt-3 rounded-lg bg-indigo-50/80 px-3 py-2 text-xs text-gray-600">
                例 <span class="text-gray-800">电动汽车排名</span>
                <span class="text-indigo-500 mx-1">→</span>
                <span class="text-indigo-700">我想买一辆电动汽车，请帮我推荐几款</span>
              </div>
            </div>
          </div>

          <div v-else class="px-6 py-5 space-y-4">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold text-gray-700">确认预览</div>
              <div class="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">将占用 {{ previewLines.length }} 个额度</div>
            </div>
            <div class="max-h-64 overflow-y-auto space-y-2">
              <div v-for="(line, i) in previewLines" :key="i" class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                {{ line }}
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <div class="text-xs text-gray-400">剩余额度：{{ remainQuota }}</div>
            <div class="flex items-center gap-2">
              <button v-if="addStep === 2" type="button" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900" @click="addStep = 1">上一步</button>
              <button
                v-if="addStep === 1"
                type="button"
                class="px-5 py-2.5 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
                :disabled="!parsedLines.length || submitting"
                @click="goAddNext"
              >下一步 →</button>
              <button
                v-else
                type="button"
                class="px-5 py-2.5 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 inline-flex items-center gap-2"
                :disabled="!previewLines.length || submitting"
                @click="submitAdd"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
                确认添加
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 编辑弹窗 -->
    <Teleport to="body">
      <div v-if="editOpen" class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 p-4" @click.self="editOpen = false">
        <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <span class="text-indigo-600">✦</span> 确认并优化配置
            </h3>
            <button type="button" class="p-1 text-gray-400 hover:text-gray-600" @click="editOpen = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="px-6 py-5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold text-gray-700">编辑预览</div>
              <div class="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">修改问题数据后即时生效</div>
            </div>
            <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div class="text-xs font-semibold text-gray-500 mb-2">监控问题 (限50字)</div>
              <textarea
                v-model="editText"
                maxlength="50"
                rows="3"
                class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                placeholder="监控问题（必填），不理想可自行修改…"
              />
              <div class="text-right text-[11px] text-gray-400 mt-1">{{ editText.length }}/50</div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <button type="button" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900" @click="editOpen = false">上一步</button>
            <button
              type="button"
              class="flex-1 max-w-xs ml-auto px-5 py-2.5 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 inline-flex items-center justify-center gap-2"
              :disabled="!editText.trim() || submitting"
              @click="submitEdit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
              确认并更新
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 新建分组 -->
    <Teleport to="body">
      <div v-if="groupOpen" class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 p-4" @click.self="groupOpen = false">
        <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900">新建分组</h3>
            <button type="button" class="p-1 text-gray-400 hover:text-gray-600" @click="groupOpen = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="px-5 py-4">
            <input
              v-model="groupName"
              maxlength="30"
              placeholder="输入分组名称"
              class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              @keydown.enter="submitGroup"
            />
          </div>
          <div class="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
            <button type="button" class="px-4 py-2 text-sm font-semibold text-gray-500" @click="groupOpen = false">取消</button>
            <button type="button" class="px-4 py-2 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40" :disabled="!groupName.trim() || submitting" @click="submitGroup">创建</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { monitorApi } from '@/api/modules/monitor';
import { userApi } from '@/api/modules/user';
import { downloadAoaSheets } from '@/utils/xlsxExport';

const TYPE_LABEL: Record<string, string> = { industry: '排名词', brand: '口碑词' };
const fmtDate = (d: string) => (d || '').slice(0, 10).replace(/-/g, '/');

type Row = {
  id: number;
  query: string;
  query_type: 'industry' | 'brand';
  group_id: string | null;
  created_at: string;
  query_status: boolean;
};

type Group = { group_id: string; name: string; query_count: number };

const route = useRoute();
const router = useRouter();

/** 口碑菜单 ?type=brand → 仅口碑词；排名入口展示全部分类（对标） */
const isBrandPage = computed(() => route.query.type === 'brand');
const listType = computed<'industry' | 'brand' | 'all'>(() => (isBrandPage.value ? 'brand' : 'all'));
const defaultAddType = computed<'industry' | 'brand'>(() => (isBrandPage.value ? 'brand' : 'industry'));
const pageScopeLabel = computed(() => (isBrandPage.value ? '口碑词' : '当前分类'));

const rows = ref<Row[]>([]);
const groups = ref<Group[]>([]);
const totalUsed = ref(0);
const totalLimit = ref(0);
const pendingRelease = ref(0);
const loading = ref(false);
const search = ref('');
const activeGroup = ref<string>('all');

const remainQuota = computed(() => Math.max(0, totalLimit.value - totalUsed.value));
const pageCount = computed(() => rows.value.length);
const ungroupedCount = computed(() => rows.value.filter(r => !r.group_id).length);

const filteredRows = computed(() => {
  let list = rows.value;
  if (activeGroup.value === 'ungrouped') list = list.filter(r => !r.group_id);
  else if (activeGroup.value !== 'all') list = list.filter(r => r.group_id === activeGroup.value);
  const q = search.value.trim();
  if (q) list = list.filter(r => r.query.includes(q));
  return list;
});

function groupTabCls(active: boolean, withCount = false) {
  return [
    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-colors',
    active
      ? 'bg-indigo-600 text-white border-indigo-600'
      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300',
    withCount ? '' : '',
  ];
}

function typeBadgeCls(qt: string) {
  return qt === 'brand'
    ? 'px-2 py-1 rounded text-xs font-medium border inline-block bg-orange-50 border-orange-200 text-orange-700'
    : 'px-2 py-1 rounded text-xs font-medium border inline-block bg-indigo-50 border-indigo-200 text-indigo-700';
}

function goPricing() {
  router.push('/dashboard/plan-upgrade');
}

async function load() {
  loading.value = true;
  try {
    const [listResp, groupResp, sub, allResp]: any[] = await Promise.all([
      monitorApi.queryList(listType.value).catch(() => null),
      monitorApi.queryGroupList(listType.value).catch(() => null),
      userApi.subscription().catch(() => null),
      // 总占用始终取全部分类（排名词+口碑词合计）
      monitorApi.queryList('all').catch(() => null),
    ]);
    const list = listResp?.list || [];
    rows.value = list.map((q: any) => ({
      id: q.id ?? q.query_id,
      query: q.query,
      query_type: q.query_type === 'brand' ? 'brand' : 'industry',
      group_id: q.group_id || null,
      created_at: q.created_at,
      query_status: !!q.query_status,
    }));
    groups.value = (groupResp?.groups || []).map((g: any) => ({
      group_id: g.group_id,
      name: g.name,
      query_count: g.query_count || 0,
    }));
    const allList = allResp?.list || [];
    totalUsed.value = allList.length || sub?.query_count || rows.value.length;
    totalLimit.value = sub?.query_limit ?? 0;
    pendingRelease.value = allList.length
      ? allList.filter((q: any) => !q.query_status).length
      : rows.value.filter(r => !r.query_status).length;
  } catch {
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(listType, () => {
  activeGroup.value = 'all';
  load();
});

/* ---------- 添加 / 导入 ---------- */
const addOpen = ref(false);
const addMode = ref<'add' | 'import'>('add');
const addStep = ref<1 | 2>(1);
const addText = ref('');
const generalize = ref(true);
const previewLines = ref<string[]>([]);
const submitting = ref(false);

const parsedLines = computed(() =>
  [...new Set(addText.value.split(/\n+/).map(s => s.trim()).filter(Boolean).map(s => s.slice(0, 50)))],
);

function openAdd() {
  addMode.value = 'add';
  addStep.value = 1;
  addText.value = '';
  generalize.value = true;
  previewLines.value = [];
  addOpen.value = true;
}

function openImport() {
  openAdd();
  addMode.value = 'import';
}

function closeAdd() {
  addOpen.value = false;
}

function rewriteLine(line: string) {
  if (!generalize.value) return line;
  // 轻量拓写：已是疑问句则保留，否则套自然提问模板（对标文案）
  if (/[？?吗呢]$/.test(line) || /怎么样|哪家|推荐|如何|好不好/.test(line)) return line;
  return `我想了解一下「${line}」，请帮我推荐几款`;
}

function goAddNext() {
  previewLines.value = parsedLines.value.map(rewriteLine);
  addStep.value = 2;
}

async function submitAdd() {
  if (!previewLines.value.length) return;
  if (previewLines.value.length > remainQuota.value) {
    alert(`剩余额度不足（剩余 ${remainQuota.value}）`);
    return;
  }
  submitting.value = true;
  try {
    await monitorApi.queryAdd({
      queries: previewLines.value,
      query_type: defaultAddType.value,
    });
    addOpen.value = false;
    await load();
  } catch (e: any) {
    alert(e?.message || '添加失败');
  } finally {
    submitting.value = false;
  }
}

/* ---------- 编辑 ---------- */
const editOpen = ref(false);
const editId = ref(0);
const editText = ref('');

function openEdit(q: Row) {
  editId.value = q.id;
  editText.value = q.query;
  editOpen.value = true;
}

async function submitEdit() {
  const text = editText.value.trim().slice(0, 50);
  if (!text) return;
  submitting.value = true;
  try {
    await monitorApi.queryUpdate({ query_id: editId.value, query: text });
    editOpen.value = false;
    await load();
  } catch (e: any) {
    alert(e?.message || '更新失败');
  } finally {
    submitting.value = false;
  }
}

/* ---------- 删除 / 状态 / 分组 ---------- */
async function confirmDelete(q: Row) {
  if (!confirm(`确定删除监控问题「${q.query}」？删除后将释放 1 个额度。`)) return;
  try {
    await monitorApi.queryDelete(q.id);
    await load();
  } catch (e: any) {
    alert(e?.message || '删除失败');
  }
}

async function toggleStatus(q: Row) {
  try {
    await monitorApi.queryUpdate({ query_id: q.id, query_status: !q.query_status });
    await load();
  } catch (e: any) {
    alert(e?.message || '状态更新失败');
  }
}

async function onMoveGroup(queryId: number, groupId: string) {
  try {
    await monitorApi.queryGroupMove(queryId, groupId || null);
    await load();
  } catch (e: any) {
    alert(e?.message || '移动分组失败');
  }
}

const groupOpen = ref(false);
const groupName = ref('');

function openCreateGroup() {
  groupName.value = '';
  groupOpen.value = true;
}

async function submitGroup() {
  const name = groupName.value.trim();
  if (!name) return;
  submitting.value = true;
  try {
    await monitorApi.queryGroupSave({ name, query_type: defaultAddType.value });
    groupOpen.value = false;
    await load();
  } catch (e: any) {
    alert(e?.message || '创建分组失败');
  } finally {
    submitting.value = false;
  }
}

/* ---------- 导出 / 拖拽排序 ---------- */
function exportList() {
  const header = ['监控类型', '问题', '分组', '添加时间', '状态'];
  const aoa = [
    header,
    ...filteredRows.value.map(r => [
      TYPE_LABEL[r.query_type] || r.query_type,
      r.query,
      groups.value.find(g => g.group_id === r.group_id)?.name || '未分组',
      fmtDate(r.created_at),
      r.query_status ? '监控中' : '已停用',
    ]),
  ];
  downloadAoaSheets(
    [{ name: '监控问题', rows: aoa, cols: [{ wch: 10 }, { wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 10 }] }],
    `监控问题_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

const dragId = ref<number | null>(null);
function onDragStart(id: number, ev: DragEvent) {
  dragId.value = id;
  ev.dataTransfer?.setData('text/plain', String(id));
}
async function onDrop(targetId: number) {
  const fromId = dragId.value;
  dragId.value = null;
  if (!fromId || fromId === targetId) return;
  const list = [...rows.value];
  const fromIdx = list.findIndex(r => r.id === fromId);
  const toIdx = list.findIndex(r => r.id === targetId);
  if (fromIdx < 0 || toIdx < 0) return;
  const [item] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, item);
  rows.value = list;
  try {
    await monitorApi.querySort(list.map((r, i) => ({ query_id: r.id, query_order: i })));
  } catch {
    await load();
  }
}
</script>
