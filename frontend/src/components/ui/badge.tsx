import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-secondary text-secondary border bg-secondary/10 [a&]:hover:bg-secondary/20",
        destructive: "border-destructive text-destructive border bg-destructive/10 [a&]:hover:bg-destructive/20",
        outline: "text-foreground border-foreground bg-transparent [a&]:hover:bg-accent/10 [a&]:hover:text-accent-foreground",
        draft: "border-blue-600 text-blue-700 border bg-blue-100/40 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-400",
        active: "border-green-600 text-green-700 border bg-green-100/40 dark:bg-green-900/40 dark:text-green-300 dark:border-green-400",
        completed: "border-gray-600 text-gray-700 border bg-gray-100/40 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-400",
        expired: "border-red-600 text-red-700 border bg-red-100/40 dark:bg-red-900/40 dark:text-red-300 dark:border-red-400",
        discontinued: "border-orange-600 text-orange-700 border bg-orange-100/40 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-400",
        pending: "border-yellow-600 text-yellow-700 border bg-yellow-100/40 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-400",
        confirmed: "border-green-600 text-green-700 border bg-green-100/40 dark:bg-green-900/40 dark:text-green-300 dark:border-green-400",
        scheduled: "border-blue-600 text-blue-700 border bg-blue-100/40 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-400",
        cancelled: "border-red-600 text-red-700 border bg-red-100/40 dark:bg-red-900/40 dark:text-red-300 dark:border-red-400",
        in_progress: "border-yellow-600 text-yellow-700 border bg-yellow-100/40 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-400",
        no_show: "border-orange-600 text-orange-700 border bg-orange-100/40 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  asChild?: boolean
  icon?: React.ReactNode
}

function Badge({
  className,
  variant,
  asChild = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {icon ? icon : null}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
