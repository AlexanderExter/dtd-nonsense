/**
 * Ghost button that renders "+ Add {label}". Use for list/table add actions.
 *
 * ```tsx
 * <AddButton label="Weapon" onClick={addWeapon} />
 * ```
 */
interface AddButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	label: string;
}

export function AddButton({ label, className: cls, ...rest }: AddButtonProps) {
	const classes = ["btn btn-ghost btn-sm", cls].filter(Boolean).join(" ");

	return (
		<button type="button" className={classes} {...rest}>
			+ Add {label}
		</button>
	);
}
