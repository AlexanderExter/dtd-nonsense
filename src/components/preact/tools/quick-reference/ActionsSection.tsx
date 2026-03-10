import { computed, type Signal } from "@preact/signals";
import { Highlight } from "./Highlight";
import { QREF_DATA } from "./qref-data";

interface ActionsSectionProps {
	searchWords: string[];
	typeFilters: Signal<Set<string>>;
	subtypeFilters: Signal<Set<string>>;
}

const TYPE_OPTIONS = ["H", "F", "R", "Fr", "V"];
const SUBTYPE_OPTIONS = ["Attack", "Defense", "Movement", "Melee", "Ranged", "Misc"];

function badgeClass(type: string): string {
	return `badge badge-${type.trim()}`;
}

export function ActionsSection({ searchWords, typeFilters, subtypeFilters }: ActionsSectionProps) {
	const filteredActions = computed(() => {
		const types = typeFilters.value;
		const subtypes = subtypeFilters.value;

		return QREF_DATA.actions.filter((a) => {
			// Search filter
			if (searchWords.length > 0) {
				const text = `${a.name} ${a.desc} ${a.subtypes.join(" ")}`.toLowerCase();
				if (!searchWords.every((w) => text.includes(w))) return false;
			}
			// Type filter (OR within category)
			if (types.size > 0) {
				const rowTypes = a.type.replace(/\//g, " ").trim().split(/\s+/);
				if (!rowTypes.some((t) => types.has(t))) return false;
			}
			// Subtype filter (OR within category)
			if (subtypes.size > 0) {
				if (!a.subtypes.some((s) => subtypes.has(s))) return false;
			}
			return true;
		});
	});

	function toggleType(t: string) {
		const next = new Set(typeFilters.value);
		if (next.has(t)) next.delete(t);
		else next.add(t);
		typeFilters.value = next;
	}

	function toggleSubtype(s: string) {
		const next = new Set(subtypeFilters.value);
		if (next.has(s)) next.delete(s);
		else next.add(s);
		subtypeFilters.value = next;
	}

	return (
		<>
			<div class="filter-bar">
				<span class="filter-group-label">Type</span>
				{TYPE_OPTIONS.map((t) => (
					<button
						type="button"
						key={t}
						class={`filter-btn badge-filter${typeFilters.value.has(t) ? " active" : ""}`}
						onClick={() => toggleType(t)}
					>
						{t}
					</button>
				))}
				<span class="sep" />
				<span class="filter-group-label">Subtype</span>
				{SUBTYPE_OPTIONS.map((s) => (
					<button
						type="button"
						key={s}
						class={`filter-btn subtype-filter${subtypeFilters.value.has(s) ? " active" : ""}`}
						onClick={() => toggleSubtype(s)}
					>
						{s}
					</button>
				))}
			</div>
			<div class="table-wrap">
				<table class="qref-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Type</th>
							<th>Subtypes</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						{filteredActions.value.map((a) => (
							<tr key={a.name}>
								<td>
									<strong>
										<Highlight text={a.name} words={searchWords} />
									</strong>
								</td>
								<td>
									{a.type.split("/").map((t) => (
										<span key={t} class={badgeClass(t)}>
											{t.trim()}
										</span>
									))}
								</td>
								<td>
									{a.subtypes.map((s) => (
										<span key={s} class="subtype-tag">
											{s}
										</span>
									))}
								</td>
								<td>
									<Highlight text={a.desc} words={searchWords} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
