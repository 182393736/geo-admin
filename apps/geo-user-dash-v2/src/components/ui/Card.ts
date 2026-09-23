import { defineComponent, h } from 'vue'
import { cn } from '@/lib/utils'

export const Card = defineComponent({
  name: 'UiCard',
  props: { class: { type: String, default: '' } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'div',
        { ...attrs, class: cn('rounded-lg border bg-card text-card-foreground shadow-sm', props.class) },
        slots.default?.(),
      )
  },
})

export const CardHeader = defineComponent({
  name: 'UiCardHeader',
  props: { class: { type: String, default: '' } },
  setup(props, { slots, attrs }) {
    return () =>
      h('div', { ...attrs, class: cn('flex flex-col space-y-1.5 p-6', props.class) }, slots.default?.())
  },
})

export const CardTitle = defineComponent({
  name: 'UiCardTitle',
  props: { class: { type: String, default: '' } },
  setup(props, { slots, attrs }) {
    return () =>
      h('h3', { ...attrs, class: cn('font-semibold leading-none tracking-tight', props.class) }, slots.default?.())
  },
})

export const CardDescription = defineComponent({
  name: 'UiCardDescription',
  props: { class: { type: String, default: '' } },
  setup(props, { slots, attrs }) {
    return () =>
      h('p', { ...attrs, class: cn('text-sm text-muted-foreground', props.class) }, slots.default?.())
  },
})

export const CardContent = defineComponent({
  name: 'UiCardContent',
  props: { class: { type: String, default: '' } },
  setup(props, { slots, attrs }) {
    return () => h('div', { ...attrs, class: cn('p-6 pt-0', props.class) }, slots.default?.())
  },
})
