interface SelectionCardProps {
	title: string;
	subtitle?: string;
	preview?: string;
	selected?: boolean;
	onClick: () => void;
}

export function SelectionCard({ title, subtitle, preview, selected = false, onClick }: SelectionCardProps) {
	return (
		<button type="button" class={`selection-card${selected ? " selected" : ""}`} onClick={onClick}>
			<strong class="card-title">{title}</strong>
			{subtitle && <span class="card-subtitle">{subtitle}</span>}
			{preview && <span class="card-preview">{preview}</span>}
		</button>
	);
}
