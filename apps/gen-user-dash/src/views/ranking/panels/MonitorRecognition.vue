<template>
  <div class="max-w-[1240px] w-full mx-auto px-9 pb-20 pt-7 min-w-0">
    <div class="min-w-0 animate-fade-in">

      <header class="mb-5">
        <h1 class="m-0 text-[22px] font-extrabold text-gray-950">监控识别管理</h1>
        <p class="mt-1.5 text-[13px] leading-5 text-gray-500">告诉 AI 哪些说法算「你」、哪些算「对手」，榜单与统计口径由此决定</p>
      </header>

      <div class="mb-5 inline-flex w-full rounded-lg border border-gray-200 bg-white p-[3px] sm:w-auto">
        <button class="h-8 flex-1 rounded-md px-5 text-[13px] transition-colors sm:flex-none bg-gray-950 font-bold text-white shadow-sm">识别词</button>
        <button class="h-8 flex-1 rounded-md px-5 text-[13px] transition-colors sm:flex-none font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800">竞品名</button>
      </div>

      <p class="mb-4 text-[13px] leading-5 text-gray-500">AI 回答中出现以下任一说法，都算作提到你 —— 可以是品牌名称、产品名称、系列名或门店名</p>

      <div>
        <div>
          <!-- 识别词卡片 -->
          <section class="rounded-2xl px-[22px] pt-5 pb-[22px] flex flex-col gap-[18px] transition-all duration-150 hover:border-[rgba(100,82,255,.25)] hover:shadow-[0_8px_24px_rgba(20,20,40,.06)] mb-7" style="background: rgb(255, 255, 255); border: 1px solid rgb(230, 232, 238);">
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 flex-wrap text-[12.5px]">
                <span class="font-bold text-[13px]" style="color: rgb(15, 17, 21);">识别词（品牌名称 / 产品名称）</span>
                <span class="px-1.5 py-[1px] rounded text-[10px] font-bold bg-red-50 text-red-500 border border-red-100">必填</span>
                <span class="text-[11.5px]" style="color: rgb(138, 143, 155);">剩余修改次数 <strong class="font-bold" style="color: rgb(42, 45, 54);">{{ data.remainingEdits }}</strong> 次</span>
                <button class="ml-auto flex items-center gap-1 px-2 py-1 rounded text-[11.5px] font-semibold transition-colors hover:bg-[#fafafe] disabled:opacity-40" style="color: rgb(91, 96, 106); border: 1px solid rgb(230, 232, 238);">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                  修改
                </button>
              </div>
              <input readonly class="rm-brand-input h-[38px] px-3 rounded-lg text-[14px] font-semibold cursor-pointer" :value="data.brandName" style="background: rgb(245, 246, 250); border: 1px solid rgb(230, 232, 238); color: rgb(15, 17, 21);" />
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 flex-wrap text-[12.5px]">
                <span class="font-bold text-[13px]" style="color: rgb(15, 17, 21);">相似识别词</span>
                <span class="text-[11.5px]" style="color: rgb(138, 143, 155);">已登记 <span class="font-bold" style="color: rgb(42, 45, 54);">{{ data.aliases.length }}</span> 个 · 监控统计时合并为「{{ data.brandName }}」</span>
                <button class="ml-auto flex items-center gap-1 px-2 py-1 rounded text-[11.5px] font-semibold transition-colors hover:bg-[#fafafe]" style="color: rgb(91, 96, 106); border: 1px solid rgb(230, 232, 238);">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                  修改
                </button>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap p-1.5 rounded-lg transition-colors" style="border: 1px solid rgb(230, 232, 238); background: rgb(245, 246, 250); min-height: 40px;">
                <span v-for="alias in data.aliases" :key="alias" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold" style="background: rgb(239, 236, 255); color: rgb(74, 56, 224); height: 24px;">
                  <span>{{ alias }}</span>
                </span>
                <span v-if="!data.aliases.length" class="text-xs text-gray-400">暂无相似识别词</span>
              </div>
            </div>
          </section>

          <!-- 行业/官网/简介卡片 -->
          <section class="rounded-2xl px-[22px] pt-5 pb-[22px] transition-all duration-150 hover:border-[rgba(100,82,255,.25)] hover:shadow-[0_8px_24px_rgba(20,20,40,.06)] mt-[18px]" style="background: rgb(255, 255, 255); border: 1px solid rgb(230, 232, 238);">
            <div class="grid gap-y-4 gap-x-[18px] grid-cols-1 md:grid-cols-2">
              <div class="flex flex-col gap-1.5 min-w-0">
                <label class="text-[12.5px] font-semibold tracking-wide">所属行业</label>
                <input class="h-[38px] px-3 rounded-lg text-[13px] outline-none transition-all focus:border-[#6452ff] focus:shadow-[0_0_0_3px_#efecff]" placeholder="例如:家电 · 空调" :value="data.industry" style="border: 1px solid rgb(230, 232, 238);" />
              </div>
              <div class="flex flex-col gap-1.5 min-w-0">
                <label class="text-[12.5px] font-semibold tracking-wide">官网 / 主链接</label>
                <div class="flex h-[38px] rounded-lg overflow-hidden focus-within:border-[#6452ff] focus-within:shadow-[0_0_0_3px_#efecff]" style="border: 1px solid rgb(230, 232, 238); background: rgb(255, 255, 255);">
                  <select class="appearance-none px-3 pr-7 text-[12.5px] font-semibold outline-none cursor-pointer" style="background: rgb(245, 246, 250); border-right: 1px solid rgb(230, 232, 238);">
                    <option>https://</option>
                    <option>http://</option>
                  </select>
                  <input class="flex-1 min-w-0 px-3 text-[13px] outline-none bg-transparent" placeholder="example.com/path" :value="data.websiteUrl" />
                </div>
              </div>
              <div class="flex flex-col gap-1.5 min-w-0 col-span-1 md:col-span-2">
                <label class="text-[12.5px] font-semibold tracking-wide">品牌简介</label>
                <textarea class="px-3 py-2.5 rounded-lg text-[13px] outline-none leading-[1.6] resize-y overflow-hidden min-h-[80px] transition-all focus:border-[#6452ff] focus:shadow-[0_0_0_3px_#efecff]" rows="4" placeholder="一段话描述品牌的背景与定位..." style="border: 1px solid rgb(230, 232, 238);">{{ data.brandIntro }}</textarea>
              </div>
            </div>
          </section>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { brandApi } from '@/api/modules/brand';

const data = reactive({
  remainingEdits: 0,
  brandName: '',
  aliases: [] as string[],
  industry: '',
  websiteUrl: '',
  brandIntro: '',
});

onMounted(async () => {
  try {
    const summary = await brandApi.summary();
    data.brandName = summary.brand?.name || '';
    data.remainingEdits = summary.brand?.rename_remaining ?? 0;
    data.aliases = (summary.aliases || []).map(a => a.alias);
    data.industry = summary.brand?.industry || '';
    data.websiteUrl = summary.brand?.website || '';
    data.brandIntro = summary.profile?.description || summary.brand?.business_desc || '';
  } catch { /* 空态 */ }
});
</script>
