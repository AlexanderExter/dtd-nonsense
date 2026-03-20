import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "info" | "accent" | "muted";
type BadgeSize = "sm" | "md";

interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "size"> {
	children: ReactNode;
	size?: BadgeSize;
	variant?: BadgeVariant;
}

const VARIANT_CLS: Record<BadgeVariant, string> = {
	success: "bg-success-bg text-success",
	warning: "bg-warning-bg text-warning",
	error: "bg-error-bg text-error",
	info: "bg-info-bg text-info",
	accent: "bg-accent-bg text-accent",
	muted: "bg-[rgba(148,146,157,0.2)] text-text-muted",
};

const SIZE_CLS: Record<BadgeSize, string> = {
	sm: "text-[0.7rem] px-[5px] py-[1px]",
	md: "text-[0.75rem] px-[8px] py-[2px]",
};

export function Badge({ variant = "accent", size = "sm", className, children, ...rest }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-block rounded-sm font-semibold uppercase tracking-[0.3px]",
				VARIANT_CLS[variant],
				SIZE_CLS[size],
				className,
			)}
			{...rest}
		>
			{children}
		</span>
	);
}
