import type { ComponentChildren, JSX } from "preact";

/**
 * Inline status/type indicator with semantic color variants.
 *
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" size="md">★</Badge>
 * ```
 */
type BadgeVariant = "success" | "warning" | "error" | "info" | "accent" | "muted";
type BadgeSize = "sm" | "md";

interface BadgeProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "size"> {
	variant?: BadgeVariant;
	size?: BadgeSize;
	children: ComponentChildren;
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

export function Badge({ variant = "accent", size = "sm", class: cls, children, ...rest }: BadgeProps) {
	const classes = [
		"inline-block rounded-sm font-semibold uppercase tracking-[0.3px]",
		VARIANT_CLS[variant],
		SIZE_CLS[size],
		cls,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<span class={classes} {...rest}>
			{children}
		</span>
	);
}
