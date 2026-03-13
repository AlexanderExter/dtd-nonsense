interface SelectionCardProps {
	title: string;
	subtitle?: string;
	preview?: string;
	selected?: boolean;
	onClick: () => void;
}

export function SelectionCard({ title, subtitle, preview, selected = false, onClick }: SelectionCardProps) {
	return (
		<button
			type="button"
			className={[
				"bg-surface border-2 border-border rounded-md p-md cursor-pointer transition-all duration-150 hover:border-border-light hover:bg-surface-raised hover:-translate-y-px text-left w-full",
				selected && "border-accent bg-[rgba(212,168,75,0.08)]",
			]
				.filter(Boolean)
				.join(" ")}
			onClick={onClick}
		>
			<strong className="block m-0 mb-xs text-[0.95rem] text-accent">{title}</strong>
			{subtitle && <span className="block text-xs text-text-dim mb-xs">{subtitle}</span>}
			{preview && (
				<span className="block text-[0.8rem] text-text-muted leading-[1.4] line-clamp-2">{preview}</span>
			)}
		</button>
	);
}
