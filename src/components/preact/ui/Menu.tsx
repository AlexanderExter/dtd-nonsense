import {
	Menu as AriakitMenu,
	MenuButton as AriakitMenuButton,
	MenuItem as AriakitMenuItem,
	MenuProvider,
} from "@ariakit/react";
import type { ComponentChildren } from "preact";

/**
 * Dropdown menu backed by Ariakit Menu. Renders a trigger button
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
	trigger: ComponentChildren;
	items: MenuItemDef[];
	class?: string;
}

export function Menu({ trigger, items, class: cls }: MenuProps) {
	return (
		<MenuProvider>
			<AriakitMenuButton class="btn btn-sm">{trigger}</AriakitMenuButton>
			<AriakitMenu
				gutter={4}
				class={[
					"z-[300] bg-surface-raised border border-border rounded-md p-xs min-w-[140px] shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
					cls,
				]
					.filter(Boolean)
					.join(" ")}
			>
				{items.map((item) => (
					<AriakitMenuItem
						key={item.label}
						class={[
							"block w-full py-1 px-sm bg-transparent border-none text-[0.85rem] text-left cursor-pointer rounded-sm hover:bg-surface",
							item.danger ? "text-error hover:text-error" : "text-text-primary hover:text-accent",
							"disabled:opacity-40 disabled:pointer-events-none",
						]
							.filter(Boolean)
							.join(" ")}
						disabled={item.disabled}
						onClick={item.onClick}
					>
						{item.label}
					</AriakitMenuItem>
				))}
			</AriakitMenu>
		</MenuProvider>
	);
}
