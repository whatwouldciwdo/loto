import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                // Dark button - #191A23 background
                default: "bg-dark text-white hover:bg-dark-300 shadow-lg hover:shadow-xl transform hover:scale-105",
                // Neon/Green button - #B9FF66 background
                neon: "bg-neon text-dark hover:bg-neon-600 shadow-lg hover:shadow-xl transform hover:scale-105",
                // Outline button
                outline: "border-2 border-dark bg-transparent text-dark hover:bg-dark hover:text-white",
                // Ghost button
                ghost: "hover:bg-gray-100 text-dark",
                // Destructive
                destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg",
                // Link
                link: "text-dark underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 rounded-lg px-3",
                lg: "h-12 rounded-xl px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
