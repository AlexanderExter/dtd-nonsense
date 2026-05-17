import { cn } from "@/lib/utils";

/**
 * Styled native `<select>` with consistent appearance across tools.
 * Drop-in replacement for raw `<select>` — same API, consistent WH40K styling.
 */
export function GameSelect({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
	return (
		<select
			className={cn(
				"w-full rounded-[3px] border border-border bg-bg px-1.5 py-1 text-sm text-text-primary",
				"focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
