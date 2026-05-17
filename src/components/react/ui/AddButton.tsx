import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	label: string;
}

export function AddButton({ label, className, ...rest }: AddButtonProps) {
	return (
		<Button className={cn(className)} size="sm" variant="ghost" {...rest}>
			+ Add {label}
		</Button>
	);
}
