import type { ReactNode } from "react";

/**
 * Label + input wrapper with vertical (default) or inline layout.
 *
 * ```tsx
 * <FormGroup label="Name">
 *   <input type="text" value={name} />
 * </FormGroup>
 * ```
 */
type FormGroupLayout = "vertical" | "inline";

interface FormGroupProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	label: string;
	layout?: FormGroupLayout;
	children: ReactNode;
}

const LAYOUT_CLS: Record<FormGroupLayout, string> = {
	vertical: "flex flex-col gap-[2px] m-0",
	inline: "inline-flex items-center gap-xs m-0",
};

const LABEL_CLS: Record<FormGroupLayout, string> = {
	vertical: "text-[0.7rem] uppercase tracking-[0.5px] text-text-dim font-semibold",
	inline: "text-[0.85rem] text-text-muted",
};

export function FormGroup({ label, layout = "vertical", className: cls, children, ...rest }: FormGroupProps) {
	const containerCls = [LAYOUT_CLS[layout], cls].filter(Boolean).join(" ");

	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: children contains the input element
		<label className={containerCls} {...rest}>
			<span className={LABEL_CLS[layout]}>{label}</span>
			{children}
		</label>
	);
}
