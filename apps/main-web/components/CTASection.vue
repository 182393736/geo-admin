<script setup lang="ts">
</script>

<template>
  <section class="cta section--tight">
    <div class="container">
      <h2 class="section-title" style="font-size:44px;">从"看见"，到被 <em>AI</em> 引用</h2>
      <p class="section-sub" style="max-width:660px;">免费注册，先用中立监测看清品牌的真实 AI 排名；需要时，再按需开通洞察建议、循证写作与精准发稿——闭环的每一步，都由数据说了算。</p>
      <div class="cta-actions">
        <NuxtLink to="/register" class="cta-primary">免费诊断我的品牌</NuxtLink>
        <NuxtLink to="/contact" class="cta-ghost">预约商务演示</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta { background: #fff; padding: 96px 0; border-top: 1px solid #f0f0f4; }
.section-title {
  em { font-style: normal; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
}
.cta-actions { display: flex; justify-content: center; gap: 14px; margin-top: 36px; }
.cta-primary {
  padding: 0 32px; height: 50px; border-radius: 999px; display: inline-flex; align-items: center;
  background: #0a0a0a; color: #fff; font-size: 15px; font-weight: 600;
  transition: transform .15s ease, box-shadow .15s ease;
  &:hover { transform: translateY(-1px); }
}
.cta-ghost {
  padding: 0 32px; height: 50px; border-radius: 999px; display: inline-flex; align-items: center;
  background: #fff; color: #0f0f0f; border: 1px solid #e5e5ea; font-size: 15px; font-weight: 600;
  transition: all .15s ease;
  &:hover { border-color: #c7c7d1; }
}
</style>
