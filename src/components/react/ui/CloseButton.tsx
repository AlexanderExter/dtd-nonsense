import { cn } from "@/lib/utils";

interface CloseButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
	size?: "sm" | "md";
}

const SIZE_CLS = {
	sm: "btn-sm",
	md: "",
};

export function CloseButton({ size = "sm", className, ...rest }: CloseButtonProps) {
	return (
		<button aria-label="Close" className={cn("btn", SIZE_CLS[size], className)} type="button" {...rest}>
			&times;
		</button>
	);
}
