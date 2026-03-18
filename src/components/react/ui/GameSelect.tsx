import { cn } from "@/lib/utils";

/**
 * Styled native `<select>` with consistent appearance across tools.
 * Drop-in replacement for raw `<select>` — same API, consistent WH40K styling.
 */
export function GameSelect({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
	return (
		<select
			className={cn(
				"w-full py-1 px-1.5 text-[0.85rem] bg-bg border border-border rounded-[3px] text-text-primary",
				"focus:border-accent focus:outline-none",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				className,
			)}
			{...props}
		/>
	);
}
