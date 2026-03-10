interface DotControlProps {
	value: number;
	max: number;
	min?: number;
	racialDots?: number;
	xpDots?: number;
	disabled?: boolean;
	onChange: (value: number) => void;
}

export function DotControl({
	value,
	max,
	min = 0,
	racialDots = 0,
	xpDots = 0,
	disabled = false,
	onChange,
}: DotControlProps) {
	const dots = [];
	for (let i = 1; i <= max; i++) {
		let cls = "dot";
		if (i <= value - racialDots - xpDots) cls += " filled";
		else if (i <= value - xpDots && racialDots > 0) cls += " filled racial";
		else if (i <= value && xpDots > 0) cls += " filled xp-cost";
		dots.push(<span key={i} class={cls} />);
	}

	return (
		<span class="dot-control">
			<button
				type="button"
				class="dot-btn"
				disabled={disabled || value <= min}
				onClick={() => onChange(value - 1)}
				aria-label="Decrease"
			>
				−
			</button>
			<span class="dots">{dots}</span>
			<button
				type="button"
				class="dot-btn"
				disabled={disabled || value >= max}
				onClick={() => onChange(value + 1)}
				aria-label="Increase"
			>
				+
			</button>
		</span>
	);
}
