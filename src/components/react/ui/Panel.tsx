import type { ReactNode } from "react";

/**
 * Card container wrapping the `.panel` CSS class (surface background, border, rounded).
 *
 * ```tsx
 * <Panel>Content here</Panel>
 * ```
 */
interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
}

export function Panel({ className: cls, children, ...rest }: PanelProps) {
	const classes = ["panel", cls].filter(Boolean).join(" ");

	return (
		<div className={classes} {...rest}>
			{children}
		</div>
	);
}
