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
				selected && "border-accent bg-accent-bg-subtle",
			)}
			onClick={onClick}
			type="button"
		>
			<strong className="m-0 mb-xs block text-accent text-base">{title}</strong>
			{subtitle && <span className="mb-xs block text-text-dim text-xs">{subtitle}</span>}
			{preview && <span className="line-clamp-2 block text-text-muted text-xs leading-[1.4]">{preview}</span>}
		</button>
	);
}
