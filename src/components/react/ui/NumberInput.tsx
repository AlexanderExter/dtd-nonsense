import { cn } from "@/lib/utils";

interface NumberInputProps {
	className?: string;
	disabled?: boolean;
	id?: string;
	max?: number;
	min?: number;
	onChange: (value: number) => void;
	step?: number;
	title?: string;
	value: number;
}

export function NumberInput({ value, onChange, min, max, step = 1, className, disabled, id, title }: NumberInputProps) {
	const clamp = (v: number) => {
		let n = v;
		if (min !== undefined) n = Math.max(min, n);
		if (max !== undefined) n = Math.min(max, n);
		return n;
	};

	return (
		<div className={cn("inline-flex items-center gap-0", className)}>
			<button
				aria-label="Decrease value"
				className="flex h-[26px] w-[22px] cursor-pointer items-center justify-center rounded-l-[3px] border border-border bg-surface text-text-muted text-xs leading-none hover:bg-bg hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
				disabled={disabled || (min !== undefined && value <= min)}
				onClick={() => onChange(clamp(value - step))}
				tabIndex={-1}
				type="button"
			>
				−
			</button>
			<input
				className="h-[26px] w-[42px] border-border border-y bg-bg px-0.5 text-center text-text-primary text-xs [appearance:textfield] focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				disabled={disabled}
				id={id}
				max={max}
				min={min}
				onInput={(e) => {
					const v = Number((e.target as HTMLInputElement).value);
					if (!Number.isNaN(v)) onChange(clamp(v));
				}}
				step={step}
				title={title}
				type="number"
				value={value}
			/>
			<button
				aria-label="Increase value"
				className="flex h-[26px] w-[22px] cursor-pointer items-center justify-center rounded-r-[3px] border border-border bg-surface text-text-muted text-xs leading-none hover:bg-bg hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
				disabled={disabled || (max !== undefined && value >= max)}
				onClick={() => onChange(clamp(value + step))}
				tabIndex={-1}
				type="button"
			>
				+
			</button>
		</div>
	);
}
