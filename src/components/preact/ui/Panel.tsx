import type { ComponentChildren, JSX } from "preact";

/**
 * Card container wrapping the `.panel` CSS class (surface background, border, rounded).
 *
 * ```tsx
 * <Panel>Content here</Panel>
 * ```
 */
interface PanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children: ComponentChildren;
}

export function Panel({ class: cls, children, ...rest }: PanelProps) {
	const classes = ["panel", cls].filter(Boolean).join(" ");

	return (
		<div class={classes} {...rest}>
			{children}
		</div>
	);
}
