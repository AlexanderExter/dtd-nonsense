import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type ButtonSize = "xs" | "sm" | "md";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
	children: ReactNode;
	size?: ButtonSize;
	variant?: ButtonVariant;
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

export function Button({ variant = "secondary", size = "md", className, children, ...rest }: ButtonProps) {
	return (
		<button className={cn("btn", VARIANT_CLS[variant], SIZE_CLS[size], className)} type="button" {...rest}>
			{children}
		</button>
	);
}
