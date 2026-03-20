import { cn } from "@/lib/utils";

interface SelectionCardProps {
	onClick: () => void;
	preview?: string;
	selected?: boolean;
	subtitle?: string;
	title: string;
}

export function SelectionCard({ title, subtitle, preview, selected = false, onClick }: SelectionCardProps) {
	return (
		<button
			className={cn(
				"w-full cursor-pointer rounded-md border-2 border-border bg-surface p-md text-left transition-all duration-150 hover:-translate-y-px hover:border-border-light hover:bg-surface-raised",
				selected && "border-accent bg-[rgba(212,168,75,0.08)]",
			)}
			onClick={onClick}
			type="button"
		>
			<strong className="m-0 mb-xs block text-[0.95rem] text-accent">{title}</strong>
			{subtitle && <span className="mb-xs block text-text-dim text-xs">{subtitle}</span>}
			{preview && (
				<span className="line-clamp-2 block text-[0.8rem] text-text-muted leading-[1.4]">{preview}</span>
			)}
		</button>
	);
}
