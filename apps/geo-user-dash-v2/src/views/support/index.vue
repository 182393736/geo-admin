<script setup lang="ts">
import { Headphones, Mail, Phone, Users } from 'lucide-vue-next'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Card, CardContent } from '@/components/ui'

type ContactChannel = {
  key: string
  badge: string
  title: string
  subtitle: string
  name?: string
  phone?: string
  qr: string
  qrAlt: string
  qrHint: string
}

const channels: ContactChannel[] = [
  {
    key: 'support',
    badge: '服',
    title: '客户支持',
    subtitle: '产品使用、账号与账单问题',
    name: '王心',
    phone: '13121121073',
    qr: '/support/p_e24af577db47.jpg',
    qrAlt: '客户支持微信二维码',
    qrHint: '微信扫码联系',
  },
  {
    key: 'brand',
    badge: '品',
    title: '品牌合作',
    subtitle: '大客户、品牌客户等',
    name: 'KA客户-闫守涛',
    phone: '15611186501',
    qr: '/support/p_ca8affc659db.jpg',
    qrAlt: '品牌合作微信二维码',
    qrHint: '微信扫码联系',
  },
  {
    key: 'channel',
    badge: '渠',
    title: '渠道合作',
    subtitle: 'OEM、API、代理等',
    name: '渠道负责人-刘月池',
    phone: '13520355137',
    qr: '/support/p_f06ec9231ec2.jpg',
    qrAlt: '渠道合作微信二维码',
    qrHint: '微信扫码联系',
  },
  {
    key: 'community',
    badge: '社',
    title: '用户社群',
    subtitle: '透镜 GEO 排名监控平台核心用户群',
    qr: '/support/p_f832089882a6.png',
    qrAlt: '用户社群二维码',
    qrHint: '微信扫码加入社群',
  },
]

const email = 'support@hanyuai.com'
</script>

<template>
  <div class="mx-auto max-w-[1080px] space-y-6 px-6 py-8">
    <PageHeader
      title="联系客服"
      description="产品使用、品牌合作、渠道合作或加入用户社群——选择对应入口，我们会尽快与您对接"
    />

    <Card>
      <CardContent class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Headphones class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-sm font-semibold">工作时间</h2>
            <p class="mt-0.5 text-sm text-muted-foreground">
              工作日 10:00–19:00（法定节假日除外）· 扫码添加后请备注品牌与账号
            </p>
          </div>
        </div>
        <a
          :href="`mailto:${email}`"
          class="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Mail class="h-3.5 w-3.5" />
          {{ email }}
        </a>
      </CardContent>
    </Card>

    <div class="grid gap-4 sm:grid-cols-2">
      <Card
        v-for="c in channels"
        :key="c.key"
        class="overflow-hidden"
      >
        <CardContent class="flex h-full flex-col gap-4 p-5">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-secondary-foreground">
              {{ c.badge }}
            </span>
            <div class="min-w-0">
              <h3 class="text-sm font-semibold tracking-tight">{{ c.title }}</h3>
              <p class="text-xs text-muted-foreground">{{ c.subtitle }}</p>
            </div>
          </div>

          <dl v-if="c.name || c.phone" class="space-y-2 text-sm">
            <div v-if="c.name" class="flex items-center justify-between gap-3">
              <dt class="text-muted-foreground">姓名</dt>
              <dd class="font-medium">{{ c.name }}</dd>
            </div>
            <div v-if="c.phone" class="flex items-center justify-between gap-3">
              <dt class="text-muted-foreground">电话</dt>
              <dd>
                <a
                  :href="`tel:${c.phone}`"
                  class="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  <Phone class="h-3 w-3" />
                  {{ c.phone }}
                </a>
              </dd>
            </div>
          </dl>

          <div
            v-else
            class="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
          >
            <Users class="h-3.5 w-3.5 shrink-0" />
            扫码加入，获取产品动态与使用交流
          </div>

          <div class="mt-auto flex flex-col items-center gap-2 border-t pt-4">
            <div class="overflow-hidden rounded-xl border bg-white p-2 shadow-sm">
              <img
                :src="c.qr"
                :alt="c.qrAlt"
                class="h-[148px] w-[148px] object-cover"
                loading="lazy"
                decoding="async"
              >
            </div>
            <span class="text-xs text-muted-foreground">{{ c.qrHint }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
