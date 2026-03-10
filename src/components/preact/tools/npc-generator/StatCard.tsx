import type { DerivedStats, NPCData, TraitDef } from "./constants";
import { CHAR_ABBREV, CHAR_KEYS, formatWeapon } from "./constants";

interface StatCardProps {
	npc: NPCData;
	derivedStats: DerivedStats;
	traitsData: TraitDef[];
}

export function StatCard({ npc, derivedStats, traitsData }: StatCardProps) {
	const d = derivedStats;

	return (
		<div class="stat-card bg-surface border-2 border-border rounded-md p-lg flex-1">
			<h2 class="text-accent text-[1.4rem] m-0 mb-md pb-sm border-b-2 border-b-accent-dim">
				{npc.name || "New NPC"}
			</h2>

			{/* Characteristics table */}
			<table class="m-0 mb-md w-auto">
				<thead>
					<tr>
						{CHAR_KEYS.map((key) => (
							<th
								class="text-center px-sm py-xs min-w-[36px] text-[0.75rem] text-text-muted bg-transparent border-b border-border"
								key={key}
							>
								{CHAR_ABBREV[key]}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					<tr>
						{CHAR_KEYS.map((key) => {
							const val = npc.characteristics[key];
							return (
								<td
									class="text-center px-sm py-xs min-w-[36px] text-[0.9rem] font-bold border-b-0"
									key={key}
								>
									{val === 0 ? "-" : val}
								</td>
							);
						})}
					</tr>
				</tbody>
			</table>

			{/* Stats line */}
			<div class="text-[0.9rem] mb-md text-text-primary leading-[1.8]">
				<strong class="text-accent">Speed:</strong> {npc.speed} |{" "}
				<strong class="text-accent">Size/Resilience:</strong> {npc.size}/{d.resilience} |{" "}
				<strong class="text-accent">SD:</strong> {d.sd} | <strong class="text-accent">HP:</strong> {d.hp} |{" "}
				<strong class="text-accent">Level:</strong> {npc.level}
			</div>

			{/* Body sections */}
			<div class="text-[0.9rem] leading-[1.7]">
				{npc.skills.length > 0 && (
					<div class="mb-xs">
						<span class="font-bold text-text-primary">Skills:</span>{" "}
						{npc.skills.map((s) => `${s.name} ${s.dots}`).join(", ")}
					</div>
				)}

				{npc.feats.length > 0 && (
					<div class="mb-xs">
						<span class="font-bold text-text-primary">Feats:</span> {npc.feats.join(", ")}
					</div>
				)}

				<div class="mb-xs">
					<span class="font-bold text-text-primary">Armor:</span>{" "}
					{npc.armor.length > 0
						? npc.armor
								.map((a) => {
									const locs = a.locations.length ? a.locations.join(", ") : "";
									return `${a.name} (${a.ap} AP${locs ? `; ${locs}` : ""})`;
								})
								.join(", ")
						: "None"}
				</div>

				{npc.weapons.length > 0 && (
					<div class="mb-xs">
						<span class="font-bold text-text-primary">Attacks:</span>{" "}
						{npc.weapons.map((w) => formatWeapon(w)).join(", ")}
					</div>
				)}

				{npc.abilities.length > 0 && (
					<>
						<div class="mb-xs">
							<span class="font-bold text-text-primary">Abilities:</span>
						</div>
						{npc.abilities.map((a, i) => (
							<div class="ml-md mb-xs" key={i}>
								- <span class="font-semibold text-accent">{a.name}</span>
								{a.description ? ` - ${a.description}` : ""}
							</div>
						))}
					</>
				)}

				{npc.traits.length > 0 && (
					<div class="mb-xs">
						<span class="font-bold text-text-primary">Traits:</span>{" "}
						{npc.traits
							.map((t) => {
								const def = traitsData.find((d) => d.id === t.id);
								const name = def ? def.name : t.id;
								return t.param != null ? `${name} (${t.param})` : name;
							})
							.join(", ")}
					</div>
				)}

				{npc.gear && (
					<div class="mb-xs">
						<span class="font-bold text-text-primary">Gear:</span> {npc.gear}
					</div>
				)}
			</div>
		</div>
	);
}
