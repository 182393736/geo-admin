<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { ChevronsUpDown, PanelLeftClose, PanelLeftOpen, Plus, Settings2 } from 'lucide-vue-next'
import { bottomRailItems, matchRailKey, railItems, type RailItem } from '@/navigation'
import { railIcons, subIconFor } from '@/components/layout/nav-icons'
import UserMenu from '@/components/layout/UserMenu.vue'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeKey = computed(() => matchRailKey(route.path, route.query as Record<string, unknown>))
const brandOpen = ref(false)
const userOpen = ref(false)
const subPanelCollapsed = ref(false)

const activeRail = computed(() => {
  const all = [...railItems, ...bottomRailItems]
  return all.find((i) => i.key === activeKey.value) ?? railItems[1]
})

const showSub = computed(() => Boolean(activeRail.value?.groups?.length))
const brandInitial = computed(() => (auth.activeBrand?.name || '?').slice(0, 1))

function isSubActive(path: string) {
  const [p, q] = path.split('?')
  if (route.path !== p) return false
  const brandMode = route.query.type === 'brand' || route.query.from === 'sentiment'
  if (!q) return !brandMode
  const params = new URLSearchParams(q)
  if (params.has('type')) return params.get('type') === (route.query.type as string | undefined) || (params.get('type') === 'brand' && brandMode)
  if (params.has('from')) return params.get('from') === route.query.from
  return !brandMode
}

function goRail(item: RailItem) {
  router.push(item.path)
  if (item.groups?.length) subPanelCollapsed.value = false
}

function toggleSubPanel() {
  subPanelCollapsed.value = !subPanelCollapsed.value
}

function onSelectBrand(brandId: string) {
  brandOpen.value = false
  if (brandId === auth.activeBrandId) return
  auth.switchBrand(brandId)
}

function onAddBrand() {
  brandOpen.value = false
  router.push({ path: '/trial', query: { from: 'add_brand' } })
}

function onDocClick() {
  brandOpen.value = false
}

watch(userOpen, (v) => {
  if (v) brandOpen.value = false
})

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <!-- Rail -->
    <aside class="relative z-30 flex h-full w-[76px] shrink-0 flex-col items-center border-r border-border/80 bg-card py-3">
      <!-- 子菜单折叠后的展开按钮 -->
      <button
        v-if="showSub && subPanelCollapsed"
        type="button"
        class="absolute right-0 top-[18px] z-40 flex h-10 w-5 translate-x-1/2 items-center justify-center rounded-r-md border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        title="展开菜单"
        aria-label="展开菜单"
        @click="subPanelCollapsed = false"
      >
        <PanelLeftOpen class="h-3 w-3" />
      </button>
      <div class="relative mb-3">
        <button
          type="button"
          data-testid="brand-switcher"
          class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm ring-2 ring-primary/20 transition hover:ring-primary/40"
          :title="auth.activeBrand?.name || '切换品牌'"
          :aria-expanded="brandOpen"
          aria-haspopup="listbox"
          aria-label="切换品牌"
          @click.stop="brandOpen = !brandOpen; userOpen = false"
        >
          {{ brandInitial }}
          <span
            class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-card bg-background text-muted-foreground shadow-sm"
            aria-hidden="true"
          >
            <ChevronsUpDown class="h-2.5 w-2.5" />
          </span>
        </button>
        <div
          v-if="brandOpen"
          class="absolute left-[calc(100%+12px)] top-0 z-50 w-64 rounded-xl border bg-card p-2 shadow-lg"
          @click.stop
        >
          <button
            type="button"
            data-testid="brand-add"
            class="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
            @click="onAddBrand"
          >
            <Plus class="h-4 w-4 text-muted-foreground" />
            添加新品牌
          </button>
          <button
            type="button"
            class="mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
            @click="brandOpen = false; router.push('/dashboard/brand-card')"
          >
            <Settings2 class="h-4 w-4 text-muted-foreground" />
            编辑品牌信息
          </button>
          <div class="max-h-64 overflow-auto border-t pt-1">
            <button
              v-for="b in auth.brands"
              :key="b.brand_id"
              type="button"
              data-testid="brand-item"
              :class="
                cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent',
                  b.brand_id === auth.activeBrandId && 'bg-secondary font-medium',
                )
              "
              @click="onSelectBrand(b.brand_id)"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary"
              >
                {{ (b.name || '?').slice(0, 1) }}
              </span>
              <span class="truncate" data-testid="brand-item-name">{{ b.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mb-2 h-px w-10 bg-border" />

      <nav class="flex flex-1 flex-col items-center gap-0.5 overflow-y-auto px-1.5 py-1">
        <button
          v-for="item in railItems"
          :key="item.key"
          type="button"
          :title="item.label"
          :class="
            cn(
              'group relative flex h-[58px] w-[60px] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium tracking-wide text-muted-foreground transition-all hover:bg-accent hover:text-foreground',
              activeKey === item.key &&
                'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
            )
          "
          @click="goRail(item)"
        >
          <span
            v-if="activeKey === item.key"
            class="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
          />
          <component
            :is="railIcons[item.key]"
            class="h-[18px] w-[18px] stroke-[1.75]"
            :class="activeKey === item.key ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'"
          />
          <span class="leading-none">{{ item.label }}</span>
        </button>
      </nav>

      <div class="mt-1 h-px w-10 bg-border" />

      <div class="relative mt-1.5 flex flex-col items-center gap-0.5 px-1.5 pb-1">
        <button
          v-for="item in bottomRailItems"
          :key="item.key"
          type="button"
          :title="item.label"
          :class="
            cn(
              'group relative flex h-[58px] w-[60px] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium tracking-wide text-muted-foreground transition-all hover:bg-accent hover:text-foreground',
              activeKey === item.key &&
                'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
            )
          "
          @click="goRail(item)"
        >
          <span
            v-if="activeKey === item.key"
            class="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
          />
          <component
            :is="railIcons[item.key]"
            class="h-[18px] w-[18px] stroke-[1.75]"
            :class="activeKey === item.key ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'"
          />
          <span class="leading-none">{{ item.label }}</span>
        </button>

        <UserMenu v-model:open="userOpen" class="mt-1.5" @close="brandOpen = false" />
      </div>
    </aside>

    <!-- Sub menu -->
    <aside
      v-if="showSub"
      :class="
        cn(
          'flex h-full shrink-0 flex-col overflow-hidden border-r border-border/80 bg-muted/30 transition-[width,opacity,border] duration-[240ms] ease-in-out',
          subPanelCollapsed
            ? 'w-0 border-r-0 opacity-0 pointer-events-none'
            : 'w-56 opacity-100',
        )
      "
    >
      <div class="mb-3 flex min-w-[13.5rem] items-center justify-between gap-2 border-b border-border px-3 pb-3 pt-5">
        <span class="truncate text-sm font-bold text-foreground">{{ activeRail.label }}</span>
        <button
          type="button"
          class="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          title="收起侧边栏"
          aria-label="收起侧边栏"
          @click="toggleSubPanel"
        >
          <PanelLeftClose class="h-4 w-4" />
        </button>
      </div>
      <nav class="min-w-[13.5rem] flex-1 overflow-y-auto px-3 pb-5">
        <template v-for="(group, gi) in activeRail.groups" :key="gi">
          <div
            v-if="group.label"
            class="mb-1.5 mt-3 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80"
          >
            {{ group.label }}
          </div>
          <RouterLink
            v-for="sub in group.items"
            :key="sub.path"
            :to="sub.path"
            :class="
              cn(
                'mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                isSubActive(sub.path) && 'bg-secondary font-medium text-foreground shadow-sm',
              )
            "
          >
            <component
              :is="subIconFor(sub.path)"
              class="h-4 w-4 shrink-0 stroke-[1.75]"
              :class="isSubActive(sub.path) ? 'text-primary' : 'text-muted-foreground'"
            />
            <span class="truncate">{{ sub.label }}</span>
          </RouterLink>
        </template>
      </nav>
    </aside>

    <!-- Main -->
    <main class="min-h-0 min-w-0 flex-1 overflow-y-auto bg-muted/40">
      <RouterView :key="`${route.fullPath}::${auth.activeBrandId}`" />
    </main>
  </div>
</template>
