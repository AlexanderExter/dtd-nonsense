import { cn } from "@/lib/utils";

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	label: string;
}

export function AddButton({ label, className, ...rest }: AddButtonProps) {
	return (
		<button className={cn("btn btn-ghost btn-sm", className)} type="button" {...rest}>
			+ Add {label}
		</button>
	);
}
