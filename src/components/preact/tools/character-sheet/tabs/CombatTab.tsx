import { charSignal, updateChar } from "../CharacterSheetApp";
import { LOCATIONS } from "../constants";
import { ArmorSection } from "../shared/ArmorSection";
import { WeaponTable } from "../shared/WeaponTable";

export function CombatTab() {
	const char = charSignal.value;
	const armor = char.armor || [];
	const naturalAP = char.naturalArmor || 0;

	// Calculate aggregate AP per location
	const locationAP: Record<string, number> = {};
	for (const loc of LOCATIONS) {
		let total = naturalAP;
		for (const a of armor) {
			if ((a.locations || []).includes(loc)) {
				total += a.ap || 0;
			}
		}
		locationAP[loc] = total;
	}

	return (
		<section class="tab-panel panel-combat">
			{/* ---------- Armor Location Display ---------- */}
			<div class="card">
				<h3>Armor by Location</h3>
				<div class="location-grid">
					{LOCATIONS.map((loc) => (
						<div key={loc} class="location-cell">
							<span class="loc-name">{loc}</span>
							<span class="loc-ap">{locationAP[loc]}</span>
						</div>
					))}
				</div>
			</div>

			{/* ---------- Natural Armor & Aura ---------- */}
			<div class="card">
				<h3>Natural Armor &amp; Aura</h3>
				<div class="form-row">
					<label>
						Natural Armor
						<input
							type="number"
							value={char.naturalArmor || 0}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.naturalArmor = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<label>
						Aura
						<input
							type="number"
							value={char.aura || 0}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.aura = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<label>
						Aura Source
						<input
							type="text"
							value={char.auraSource || ""}
							onInput={(e) =>
								updateChar((c) => {
									c.auraSource = (e.target as HTMLInputElement).value;
								})
							}
						/>
					</label>
				</div>
			</div>

			{/* ---------- Armor List ---------- */}
			<div class="card">
				<ArmorSection />
			</div>

			{/* ---------- Melee Weapons ---------- */}
			<div class="card">
				<WeaponTable type="melee" />
			</div>

			{/* ---------- Ranged Weapons ---------- */}
			<div class="card">
				<WeaponTable type="ranged" />
			</div>
		</section>
	);
}
