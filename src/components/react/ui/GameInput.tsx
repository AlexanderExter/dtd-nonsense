import { cn } from "@/lib/utils";

/**
 * Styled native `<input>` with consistent compact appearance for game tools.
 * Drop-in replacement for raw `<input>` — same API, consistent WH40K styling.
 */
export function GameInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={cn(
				"w-full rounded-[3px] border border-border bg-bg px-1 py-0.5 text-text-primary text-xs",
				"focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
