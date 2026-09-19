import { computed, defineComponent, h } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

type BadgeVariants = VariantProps<typeof badgeVariants>

export const Badge = defineComponent({
  name: 'UiBadge',
  props: {
    variant: { type: String as () => BadgeVariants['variant'], default: 'default' },
    class: { type: String, default: '' },
  },
  setup(props, { slots, attrs }) {
    const classes = computed(() => cn(badgeVariants({ variant: props.variant }), props.class))
    return () => h('div', { ...attrs, class: classes.value }, slots.default?.())
  },
})
