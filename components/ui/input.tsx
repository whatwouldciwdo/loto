import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-neon focus:border-transparent focus:shadow-md focus:shadow-neon/20 transition-all disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
