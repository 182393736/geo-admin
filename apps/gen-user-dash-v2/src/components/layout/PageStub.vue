<script setup lang="ts">
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-6 py-8">
    <PageHeader :title="title" :description="description || '界面预览 · 功能待接入'">
      <template #actions>
        <Button variant="outline" size="sm">导出</Button>
        <Button size="sm">主要操作</Button>
      </template>
    </PageHeader>

    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="i in 3" :key="i">
        <CardHeader class="pb-2">
          <CardDescription>指标 {{ i }}</CardDescription>
          <CardTitle class="text-2xl tabular-nums">—</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-xs text-muted-foreground">占位卡片，后续接真实数据</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="text-base">{{ title }} · 内容区</CardTitle>
            <CardDescription>shadcn Card / Badge / Button 默认样式</CardDescription>
          </div>
          <Badge variant="secondary">预览</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          功能未实现 · 仅展示页面骨架
        </div>
      </CardContent>
    </Card>
  </div>
</template>
