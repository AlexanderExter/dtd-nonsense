import type { ReactNode } from "react";

/**
 * Uppercase accent heading for panel sections. Renders h4 by default.
 *
 * ```tsx
 * <SectionHeading>Weapons</SectionHeading>
 * <SectionHeading as="h3">Equipment</SectionHeading>
 * ```
 */
type HeadingLevel = "h2" | "h3" | "h4";

interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "children"> {
	as?: HeadingLevel;
	children: ReactNode;
}

const BASE_CLS = "m-0 mb-sm text-accent text-[0.85rem] uppercase tracking-[0.5px]";

export function SectionHeading({ as: Tag = "h4", className: cls, children, ...rest }: SectionHeadingProps) {
	const classes = [BASE_CLS, cls].filter(Boolean).join(" ");

	return (
		<Tag className={classes} {...rest}>
			{children}
		</Tag>
	);
}
