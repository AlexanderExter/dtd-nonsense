import { cn } from "@/lib/utils";

/**
 * Styled native `<input type="checkbox">` with consistent appearance.
 * Use for simple boolean toggles in game tools where Radix Checkbox is overkill.
 */
export function GameCheckbox({
	className,
	label,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
	if (label) {
		return (
			<label className="flex cursor-pointer items-center gap-sm text-[0.82rem]">
				<input className={cn("size-4 cursor-pointer accent-accent", className)} type="checkbox" {...props} />
				<span className="text-text-primary">{label}</span>
			</label>
		);
	}

	return <input className={cn("size-4 cursor-pointer accent-accent", className)} type="checkbox" {...props} />;
}
