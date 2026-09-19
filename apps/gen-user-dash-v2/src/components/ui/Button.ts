import type { HTMLAttributes } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

export const Button = defineComponent({
  name: 'UiButton',
  props: {
    variant: { type: String as () => ButtonVariants['variant'], default: 'default' },
    size: { type: String as () => ButtonVariants['size'], default: 'default' },
    type: { type: String as () => 'button' | 'submit' | 'reset', default: 'button' },
    class: { type: String, default: '' },
  },
  setup(props, { slots, attrs }) {
    const classes = computed(() =>
      cn(buttonVariants({ variant: props.variant, size: props.size }), props.class),
    )
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: props.type,
          class: classes.value,
        },
        slots.default?.(),
      )
  },
})

export type ButtonProps = HTMLAttributes & ButtonVariants
