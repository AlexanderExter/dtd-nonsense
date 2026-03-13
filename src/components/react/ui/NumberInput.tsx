/**
 * Styled number `<input>` with optional label and configurable width.
 *
 * ```tsx
 * <NumberInput width="sm" value={5} min={0} max={10} onInput={handle} />
 * ```
 */
type InputWidth = "xs" | "sm" | "md";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
	width?: InputWidth;
	label?: string;
}

const WIDTH_CLS: Record<InputWidth, string> = {
	xs: "w-[38px]",
	sm: "w-11",
	md: "w-[60px]",
};

const BASE_CLS =
	"py-0.5 px-1 text-center font-semibold text-[0.9rem] bg-bg border border-border rounded-[3px] text-text-primary focus:border-accent focus:outline-none";

export function NumberInput({ width = "sm", label, className: cls, id, ...rest }: NumberInputProps) {
	const inputCls = [BASE_CLS, WIDTH_CLS[width], cls].filter(Boolean).join(" ");

	if (label) {
		return (
			<label className="flex flex-col gap-[2px] m-0">
				<span className="text-[0.7rem] uppercase tracking-[0.5px] text-text-dim font-semibold">{label}</span>
				<input type="number" id={id} className={inputCls} {...rest} />
			</label>
		);
	}

	return <input type="number" id={id} className={inputCls} {...rest} />;
}
