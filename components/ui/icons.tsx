import React from 'react'
import { cn } from '@/lib/utils'

interface IconProps extends React.SVGProps<SVGSVGElement> {
    variant?: 'neon' | 'dark' | 'default'
    size?: 'sm' | 'md' | 'lg'
}

// Arrow Icon from design
export function ArrowIcon({ variant = 'default', size = 'md', className, ...props }: IconProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    }

    const colorClasses = {
        neon: 'text-neon',
        dark: 'text-dark',
        default: 'text-current',
    }

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(sizeClasses[size], colorClasses[variant], className)}
            {...props}
        >
            <path d="M7 7l10 10M17 7v10H7" />
        </svg>
    )
}

// Star Icon for Logo (from design)
export function StarIcon({ variant = 'dark', size = 'md', className, ...props }: IconProps) {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    }

    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn(sizeClasses[size], variant === 'neon' ? 'text-neon' : 'text-dark', className)}
            {...props}
        >
            <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
        </svg>
    )
}

// Circular Icon Button Background (from design)
export function CircleIconButton({
    children,
    variant = 'dark',
    size = 'md',
    className,
}: {
    children: React.ReactNode
    variant?: 'neon' | 'dark' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    }

    const variantClasses = {
        neon: 'bg-neon text-dark',
        dark: 'bg-dark text-neon',
        outline: 'border-2 border-dark bg-transparent text-dark',
    }

    return (
        <div
            className={cn(
                'inline-flex items-center justify-center rounded-full',
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
        >
            {children}
        </div>
    )
}

// Plus/Minus Icons (from design)
export function PlusIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={cn('w-5 h-5', className)}
            {...props}
        >
            <path d="M12 5v14M5 12h14" />
        </svg>
    )
}

export function MinusIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={cn('w-5 h-5', className)}
            {...props}
        >
            <path d="M5 12h14" />
        </svg>
    )
}
