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
		<section class="tab-panel">
			{/* ---------- Armor Location Display ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Armor by Location</h3>
				<div class="grid grid-cols-6 gap-sm my-md max-[768px]:grid-cols-3">
					{LOCATIONS.map((loc) => (
						<div key={loc} class="text-center p-sm bg-bg border border-border rounded-sm">
							<span class="block text-[0.65rem] text-text-muted uppercase tracking-[0.3px] mb-0.5">
								{loc}
							</span>
							<span class="text-[1.2rem] font-bold text-accent">{locationAP[loc]}</span>
						</div>
					))}
				</div>
			</div>

			{/* ---------- Natural Armor & Aura ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 class="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">
					Natural Armor &amp; Aura
				</h3>
				<div class="flex gap-md mb-md flex-wrap">
					<label class="flex flex-col flex-1 min-w-[140px] text-[0.78rem] uppercase tracking-[0.3px]">
						Natural Armor
						<input
							type="number"
							class="w-full"
							value={char.naturalArmor || 0}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.naturalArmor = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<label class="flex flex-col flex-1 min-w-[140px] text-[0.78rem] uppercase tracking-[0.3px]">
						Aura
						<input
							type="number"
							class="w-full"
							value={char.aura || 0}
							min={0}
							onInput={(e) =>
								updateChar((c) => {
									c.aura = Number((e.target as HTMLInputElement).value);
								})
							}
						/>
					</label>
					<label class="flex flex-col flex-1 min-w-[140px] text-[0.78rem] uppercase tracking-[0.3px]">
						Aura Source
						<input
							type="text"
							class="w-full"
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
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<ArmorSection />
			</div>

			{/* ---------- Melee Weapons ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<WeaponTable type="melee" />
			</div>

			{/* ---------- Ranged Weapons ---------- */}
			<div class="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<WeaponTable type="ranged" />
			</div>
		</section>
	);
}
