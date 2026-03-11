import type { JSX } from "preact";

/**
 * Ghost button that renders "+ Add {label}". Use for list/table add actions.
 *
 * ```tsx
 * <AddButton label="Weapon" onClick={addWeapon} />
 * ```
 */
interface AddButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
	label: string;
}

export function AddButton({ label, class: cls, ...rest }: AddButtonProps) {
	const classes = ["btn btn-ghost btn-sm", cls].filter(Boolean).join(" ");

	return (
		<button type="button" class={classes} {...rest}>
			+ Add {label}
		</button>
	);
}
