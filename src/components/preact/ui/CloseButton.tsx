import type { JSX } from "preact";

/**
 * Close/dismiss button rendering × with `aria-label="Close"`.
 *
 * ```tsx
 * <CloseButton onClick={onDismiss} />
 * ```
 */
interface CloseButtonProps extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, "size"> {
	size?: "sm" | "md";
}

const SIZE_CLS = {
	sm: "btn-sm",
	md: "",
};

export function CloseButton({ size = "sm", class: cls, ...rest }: CloseButtonProps) {
	const classes = ["btn", SIZE_CLS[size], cls].filter(Boolean).join(" ");

	return (
		<button type="button" class={classes} aria-label="Close" {...rest}>
			&times;
		</button>
	);
}
