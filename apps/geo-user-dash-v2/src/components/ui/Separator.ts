import { defineComponent, h } from 'vue'
import { cn } from '@/lib/utils'

export const Separator = defineComponent({
  name: 'UiSeparator',
  props: {
    orientation: { type: String as () => 'horizontal' | 'vertical', default: 'horizontal' },
    class: { type: String, default: '' },
  },
  setup(props, { attrs }) {
    return () =>
      h('div', {
        ...attrs,
        role: 'separator',
        class: cn(
          'shrink-0 bg-border',
          props.orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
          props.class,
        ),
      })
  },
})
