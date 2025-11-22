import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@workspace/ui/lib/utils';

const textVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-[28px] font-semibold tracking-tight',
      h2: 'text-[20px] font-semibold tracking-tight',
      h3: 'text-[16px] font-semibold',
      body: 'text-[13px]',
      bodyLarge: 'text-[15px]',
      label: 'text-[12px] font-medium',
      caption: 'text-[11px]',
      mono: 'font-mono text-[12px] tabular-nums',
    },
    muted: {
      true: 'text-muted-foreground',
      false: 'text-foreground',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
  },
  defaultVariants: {
    variant: 'body',
    muted: false,
    weight: 'normal',
  },
});

export interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  asChild?: boolean;
  as?: 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3';
}

function Text({ className, variant, muted, weight, asChild = false, as: Component = 'span', ...props }: TextProps) {
  const Comp = asChild ? Slot : Component;

  return <Comp data-slot='text' className={cn(textVariants({ variant, muted, weight }), className)} {...props} />;
}

export { Text, textVariants };

