import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  [
    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 py-1 text-sm file:h-6 file:text-xs',
        md: 'h-9 px-3 py-1 text-base md:text-sm file:h-7 file:text-sm',
        lg: 'h-10 px-3.5 py-1.5 text-base file:h-8 file:text-sm',
        xl: 'h-11 px-4 py-2 text-base file:h-9 file:text-base',
        '2xl': 'h-12 px-4 py-2 text-lg file:h-10 file:text-base',
        '3xl': 'h-14 px-5 py-2.5 text-xl file:h-11 file:text-lg',
        '4xl': 'h-16 px-6 py-3 text-2xl file:h-12 file:text-xl',
      },
      hasIcon: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Add left padding when icon is present
      { hasIcon: true, size: 'sm', className: 'pl-8' },
      { hasIcon: true, size: 'md', className: 'pl-9' },
      { hasIcon: true, size: 'lg', className: 'pl-10' },
      { hasIcon: true, size: 'xl', className: 'pl-11' },
      { hasIcon: true, size: '2xl', className: 'pl-12' },
      { hasIcon: true, size: '3xl', className: 'pl-14' },
      { hasIcon: true, size: '4xl', className: 'pl-16' },
    ],
    defaultVariants: {
      size: 'xl',
      hasIcon: false,
    },
  }
)

const iconSizeMap = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-4',
  xl: 'size-5',
  '2xl': 'size-5',
  '3xl': 'size-6',
  '4xl': 'size-7',
} as const

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode
}

function Input({ className, type, size, icon, ...props }: InputProps) {
  const hasIcon = !!icon

  if (icon) {
    return (
      <div className='relative w-full'>
        <div
          className={cn(
            'text-muted-foreground pointer-events-none absolute left-3 top-2/5 -translate-y-1/2',
            iconSizeMap[size ?? 'md']
          )}>
          {icon}
        </div>
        <input
          type={type}
          data-slot='input'
          className={cn(inputVariants({ size, hasIcon }), className)}
          {...props}
        />
      </div>
    )
  }

  return (
    <input
      type={type}
      data-slot='input'
      className={cn(inputVariants({ size, hasIcon }), className)}
      {...props}
    />
  )
}

export { Input }
