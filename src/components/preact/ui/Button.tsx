import type { ComponentChildren, JSX } from "preact";

/**
 * Styled button wrapping the `.btn` CSS class family.
 *
 * ```tsx
 * <Button variant="primary" onClick={save}>Save</Button>
 * <Button variant="danger" size="sm" onClick={del}>Delete</Button>
 * ```
 */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type ButtonSize = "xs" | "sm" | "md";

interface ButtonProps extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, "size"> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	children: ComponentChildren;
}

const SIZE_CLS: Record<ButtonSize, string> = {
	xs: "btn-xs",
	sm: "btn-sm",
	md: "",
};

const VARIANT_CLS: Record<ButtonVariant, string> = {
	primary: "btn-primary",
	accent: "btn-accent",
	secondary: "btn-secondary",
	ghost: "btn-ghost",
	danger: "btn-danger",
};

export function Button({ variant = "secondary", size = "md", class: cls, children, ...rest }: ButtonProps) {
	const classes = ["btn", VARIANT_CLS[variant], SIZE_CLS[size], cls].filter(Boolean).join(" ");

	return (
		<button type="button" class={classes} {...rest}>
			{children}
		</button>
	);
}
