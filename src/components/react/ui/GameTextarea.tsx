import { cn } from "@/lib/utils";

/**
 * Styled native `<textarea>` with consistent compact appearance for game tools.
 * Drop-in replacement for raw `<textarea>` — same API, consistent WH40K styling.
 */
export function GameTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			className={cn(
				"min-h-[60px] w-full resize-y rounded-[3px] border border-border bg-bg px-1 py-0.5 text-text-primary text-xs",
				"focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
