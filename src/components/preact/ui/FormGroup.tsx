import type { ComponentChildren, JSX } from "preact";

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

interface FormGroupProps extends JSX.HTMLAttributes<HTMLLabelElement> {
	label: string;
	layout?: FormGroupLayout;
	children: ComponentChildren;
}

const LAYOUT_CLS: Record<FormGroupLayout, string> = {
	vertical: "flex flex-col gap-[2px] m-0",
	inline: "inline-flex items-center gap-xs m-0",
};

const LABEL_CLS: Record<FormGroupLayout, string> = {
	vertical: "text-[0.7rem] uppercase tracking-[0.5px] text-text-dim font-semibold",
	inline: "text-[0.85rem] text-text-muted",
};

export function FormGroup({ label, layout = "vertical", class: cls, children, ...rest }: FormGroupProps) {
	const containerCls = [LAYOUT_CLS[layout], cls].filter(Boolean).join(" ");

	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: children contains the input element
		<label class={containerCls} {...rest}>
			<span class={LABEL_CLS[layout]}>{label}</span>
			{children}
		</label>
	);
}
