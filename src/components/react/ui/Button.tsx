import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex cursor-pointer items-center justify-center gap-sm rounded-sm border border-transparent font-medium text-[0.9rem] no-underline transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				primary: "bg-accent text-bg hover:bg-accent-hover",
				accent: "bg-accent text-bg hover:bg-accent-hover",
				secondary: "border-border bg-surface-raised text-text-primary hover:border-accent hover:text-accent",
				ghost: "border-border bg-transparent text-text-muted hover:border-accent hover:text-accent",
				danger: "bg-error text-bg hover:opacity-85",
			},
			size: {
				xs: "px-[0.4rem] py-[0.15rem] text-[0.7rem]",
				sm: "px-2 py-1 text-[0.8rem]",
				md: "px-md py-sm",
			},
		},
		defaultVariants: {
			variant: "secondary",
			size: "md",
		},
	},
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants> & {
		children: ReactNode;
	};

export { buttonVariants };

export function Button({ variant, size, className, children, ...rest }: ButtonProps) {
	return (
		<button className={cn(buttonVariants({ variant, size }), className)} type="button" {...rest}>
			{children}
		</button>
	);
}
