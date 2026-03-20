interface DotControlProps {
	disabled?: boolean;
	max: number;
	min?: number;
	onChange: (value: number) => void;
	racialDots?: number;
	value: number;
	xpDots?: number;
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
		const isRegular = i <= value - racialDots - xpDots;
		const isRacial = !isRegular && i <= value - xpDots && racialDots > 0;
		const isXp = !(isRegular || isRacial) && i <= value && xpDots > 0;

		const cls = [
			"w-[11px] h-[11px] border-[1.5px] rounded-full",
			isRacial
				? "border-success bg-success"
				: isXp
					? "border-warning bg-warning"
					: isRegular
						? "border-accent bg-accent"
						: "border-accent bg-transparent",
		].join(" ");

		dots.push(<span className={cls} key={i} />);
	}

	const btnCls =
		"w-[22px] h-[22px] border border-border rounded-sm bg-surface-raised text-text-primary cursor-pointer flex items-center justify-center text-[0.9rem] p-0 transition-all duration-100 hover:border-accent hover:text-accent disabled:opacity-25 disabled:cursor-not-allowed";

	return (
		<span className="flex items-center gap-[3px]">
			<button
				aria-label="Decrease"
				className={btnCls}
				disabled={disabled || value <= min}
				onClick={() => onChange(value - 1)}
				type="button"
			>
				−
			</button>
			<span className="flex gap-0.5">{dots}</span>
			<button
				aria-label="Increase"
				className={btnCls}
				disabled={disabled || value >= max}
				onClick={() => onChange(value + 1)}
				type="button"
			>
				+
			</button>
		</span>
	);
}
