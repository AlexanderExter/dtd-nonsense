import { cn } from "@/lib/utils";

/**
 * Styled native `<input>` with consistent compact appearance for game tools.
 * Drop-in replacement for raw `<input>` — same API, consistent WH40K styling.
 */
export function GameInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={cn(
				"w-full py-0.5 px-1 text-[0.82rem] bg-bg border border-border rounded-[3px] text-text-primary",
				"focus:border-accent focus:outline-none",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				className,
			)}
			{...props}
		/>
	);
}
