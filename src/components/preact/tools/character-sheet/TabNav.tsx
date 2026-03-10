import { activeTab } from "./CharacterSheetApp";
import { TAB_LABELS, type TabId } from "./constants";

export function TabNav() {
	const current = activeTab.value;

	const handleClick = (id: TabId) => {
		activeTab.value = id;
	};

	return (
		<nav class="tab-nav">
			{TAB_LABELS.map((t) => (
				<button
					key={t.id}
					type="button"
					class={`tab-btn ${current === t.id ? "active" : ""}`}
					onClick={() => handleClick(t.id)}
				>
					{t.label}
				</button>
			))}
		</nav>
	);
}
