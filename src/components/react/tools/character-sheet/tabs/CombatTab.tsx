import { GameInput } from "@/components/react/ui/GameInput";
import { LOCATIONS } from "../constants";
import { ArmorSection } from "../shared/ArmorSection";
import { WeaponTable } from "../shared/WeaponTable";
import { useCharSheetStore } from "../store";

export function CombatTab() {
	const char = useCharSheetStore((s) => s.char);
	const updateChar = useCharSheetStore((s) => s.updateChar);
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
		<section className="tab-panel">
			{/* ---------- Armor Location Display ---------- */}
			<div className="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 className="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">Armor by Location</h3>
				<div className="grid grid-cols-6 gap-sm my-md max-[768px]:grid-cols-3">
					{LOCATIONS.map((loc) => (
						<div key={loc} className="text-center p-sm bg-bg border border-border rounded-sm">
							<span className="block text-[0.65rem] text-text-muted uppercase tracking-[0.3px] mb-0.5">
								{loc}
							</span>
							<span className="text-[1.2rem] font-bold text-accent">{locationAP[loc]}</span>
						</div>
					))}
				</div>
			</div>

			{/* ---------- Natural Armor & Aura ---------- */}
			<div className="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<h3 className="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">
					Natural Armor &amp; Aura
				</h3>
				<div className="flex gap-md mb-md flex-wrap">
					<label className="flex flex-col flex-1 min-w-[140px] text-[0.78rem] uppercase tracking-[0.3px]">
						Natural Armor
						<GameInput
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
					<label className="flex flex-col flex-1 min-w-[140px] text-[0.78rem] uppercase tracking-[0.3px]">
						Aura
						<GameInput
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
					<label className="flex flex-col flex-1 min-w-[140px] text-[0.78rem] uppercase tracking-[0.3px]">
						Aura Source
						<GameInput
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
			<div className="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<ArmorSection />
			</div>

			{/* ---------- Melee Weapons ---------- */}
			<div className="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<WeaponTable type="melee" />
			</div>

			{/* ---------- Ranged Weapons ---------- */}
			<div className="section-card bg-surface border border-border rounded-md p-lg mb-md">
				<WeaponTable type="ranged" />
			</div>
		</section>
	);
}
