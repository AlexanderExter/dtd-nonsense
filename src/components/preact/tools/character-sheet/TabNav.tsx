import { activeTab } from "./CharacterSheetApp";
import { TAB_LABELS, type TabId } from "./constants";

export function TabNav() {
	const current = activeTab.value;

	const handleClick = (id: TabId) => {
		activeTab.value = id;
	};

	return (
		<nav class="flex gap-0.5 border-b-2 border-border mb-md overflow-x-auto [scrollbar-width:thin]">
			{TAB_LABELS.map((t) => (
				<button
					key={t.id}
					type="button"
					class={[
						"px-md py-sm bg-transparent border-0 border-b-2 -mb-[2px] text-[0.9rem] font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 font-[inherit] hover:text-text-primary",
						current === t.id ? "text-accent border-b-accent" : "text-text-muted border-b-transparent",
					]
						.filter(Boolean)
						.join(" ")}
					onClick={() => handleClick(t.id)}
				>
					{t.label}
				</button>
			))}
		</nav>
	);
}
