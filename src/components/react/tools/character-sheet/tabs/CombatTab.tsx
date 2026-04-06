import { GameInput } from "@/components/react/ui/GameInput";
import { NumberInput } from "@/components/react/ui/NumberInput";
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
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">Armor by Location</h3>
				<div className="my-md grid grid-cols-6 gap-sm max-[768px]:grid-cols-3">
					{LOCATIONS.map((loc) => (
						<div className="rounded-sm border border-border bg-bg p-sm text-center" key={loc}>
							<span className="mb-0.5 block text-[0.65rem] text-text-muted uppercase tracking-[0.3px]">
								{loc}
							</span>
							<span className="font-bold text-[1.2rem] text-accent">{locationAP[loc]}</span>
						</div>
					))}
				</div>
			</div>

			{/* ---------- Natural Armor & Aura ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<h3 className="m-0 mb-md border-border border-b pb-sm text-[1.05rem] text-accent">
					Natural Armor &amp; Aura
				</h3>
				<div className="mb-md flex flex-wrap gap-md">
					<label
						className="flex min-w-[140px] flex-1 flex-col text-[0.78rem] uppercase tracking-[0.3px]"
						htmlFor="combat-natural-armor"
					>
						Natural Armor
						<NumberInput
							id="combat-natural-armor"
							min={0}
							onChange={(v) =>
								updateChar((c) => {
									c.naturalArmor = v;
								})
							}
							value={char.naturalArmor || 0}
						/>
					</label>
					<label
						className="flex min-w-[140px] flex-1 flex-col text-[0.78rem] uppercase tracking-[0.3px]"
						htmlFor="combat-aura"
					>
						Aura
						<NumberInput
							id="combat-aura"
							min={0}
							onChange={(v) =>
								updateChar((c) => {
									c.aura = v;
								})
							}
							value={char.aura || 0}
						/>
					</label>
					<label className="flex min-w-[140px] flex-1 flex-col text-[0.78rem] uppercase tracking-[0.3px]">
						Aura Source
						<GameInput
							onInput={(e) =>
								updateChar((c) => {
									c.auraSource = (e.target as HTMLInputElement).value;
								})
							}
							type="text"
							value={char.auraSource || ""}
						/>
					</label>
				</div>
			</div>

			{/* ---------- Armor List ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<ArmorSection />
			</div>

			{/* ---------- Melee Weapons ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<WeaponTable type="melee" />
			</div>

			{/* ---------- Ranged Weapons ---------- */}
			<div className="section-card mb-md rounded-md border border-border bg-surface p-lg">
				<WeaponTable type="ranged" />
			</div>
		</section>
	);
}
