import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-block rounded-sm font-semibold uppercase tracking-tight-px", {
	variants: {
		variant: {
			success: "bg-success-bg text-success",
			warning: "bg-warning-bg text-warning",
			error: "bg-error-bg text-error",
			info: "bg-info-bg text-info",
			accent: "bg-accent-bg text-accent",
			muted: "bg-badge-free text-text-muted",
		},
		size: {
			sm: "px-[5px] py-[1px] text-xs",
			md: "px-2 py-0.5 text-xs",
		},
	},
	defaultVariants: {
		variant: "accent",
		size: "sm",
	},
});

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
	VariantProps<typeof badgeVariants> & {
		children: ReactNode;
	};

export function Badge({ variant, size, className, children, ...rest }: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ variant, size }), className)} {...rest}>
			{children}
		</span>
	);
}
