import { DropdownMenu } from "radix-ui";
import type { ReactNode } from "react";

/**
 * Dropdown menu backed by Radix DropdownMenu. Renders a trigger button
 * and a list of action items.
 *
 * ```tsx
 * <Menu
 *   trigger="Actions"
 *   items={[
 *     { label: "Edit", onClick: edit },
 *     { label: "Delete", onClick: del, danger: true },
 *   ]}
 * />
 * ```
 */

interface MenuItemDef {
	label: string;
	onClick: () => void;
	danger?: boolean;
	disabled?: boolean;
}

interface MenuProps {
	trigger: ReactNode;
	items: MenuItemDef[];
	className?: string;
}

export function Menu({ trigger, items, className }: MenuProps) {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button type="button" className="btn btn-sm">
					{trigger}
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					sideOffset={4}
					className={[
						"z-[300] bg-surface-raised border border-border rounded-md p-xs min-w-[140px] shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
						className,
					]
						.filter(Boolean)
						.join(" ")}
				>
					{items.map((item) => (
						<DropdownMenu.Item
							key={item.label}
							className={[
								"block w-full py-1 px-sm bg-transparent border-none text-[0.85rem] text-left cursor-pointer rounded-sm outline-none hover:bg-surface data-[highlighted]:bg-surface",
								item.danger
									? "text-error hover:text-error data-[highlighted]:text-error"
									: "text-text-primary hover:text-accent data-[highlighted]:text-accent",
								"data-[disabled]:opacity-40 data-[disabled]:pointer-events-none",
							]
								.filter(Boolean)
								.join(" ")}
							disabled={item.disabled}
							onSelect={item.onClick}
						>
							{item.label}
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
