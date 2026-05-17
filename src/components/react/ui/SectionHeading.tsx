import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = "h2" | "h3" | "h4";

interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "children"> {
	as?: HeadingLevel;
	children: ReactNode;
}

export function SectionHeading({ as: Tag = "h4", className, children, ...rest }: SectionHeadingProps) {
	return (
		<Tag className={cn("m-0 mb-sm text-accent text-sm uppercase tracking-wide-px", className)} {...rest}>
			{children}
		</Tag>
	);
}
