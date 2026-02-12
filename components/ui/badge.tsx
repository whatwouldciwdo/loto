import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-lg border-0 px-3 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neon focus:ring-offset-2",
    {
        variants: {
            variant: {
                // Neon green background - from design
                default: "bg-neon text-dark",
                // Dark background - from design  
                dark: "bg-dark text-white",
                // Outline
                outline: "border-2 border-dark bg-transparent text-dark",
                // Status variants
                draft: "bg-gray-100 text-gray-800",
                progress: "bg-neon-100 text-dark",
                completed: "bg-dark text-neon",
                cancelled: "bg-red-100 text-red-800",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
