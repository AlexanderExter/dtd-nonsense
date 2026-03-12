/**
 * Close/dismiss button rendering × with `aria-label="Close"`.
 *
 * ```tsx
 * <CloseButton onClick={onDismiss} />
 * ```
 */
interface CloseButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
	size?: "sm" | "md";
}

const SIZE_CLS = {
	sm: "btn-sm",
	md: "",
};

export function CloseButton({ size = "sm", className: cls, ...rest }: CloseButtonProps) {
	const classes = ["btn", SIZE_CLS[size], cls].filter(Boolean).join(" ");

	return (
		<button type="button" className={classes} aria-label="Close" {...rest}>
			&times;
		</button>
	);
}
