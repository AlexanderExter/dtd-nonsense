import { cn } from "@/lib/utils";

/**
 * Styled native `<textarea>` with consistent compact appearance for game tools.
 * Drop-in replacement for raw `<textarea>` — same API, consistent WH40K styling.
 */
export function GameTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			className={cn(
				"w-full min-h-[60px] resize-y py-0.5 px-1 text-[0.82rem] bg-bg border border-border rounded-[3px] text-text-primary",
				"focus:border-accent focus:outline-none",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				className,
			)}
			{...props}
		/>
	);
}
