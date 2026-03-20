import type { DerivedStats, NPCData, TraitDef } from "./constants";
import { CHAR_ABBREV, CHAR_KEYS, formatWeapon } from "./constants";

interface StatCardProps {
	derivedStats: DerivedStats;
	npc: NPCData;
	traitsData: TraitDef[];
}

export function StatCard({ npc, derivedStats, traitsData }: StatCardProps) {
	const d = derivedStats;

	return (
		<div className="stat-card flex-1 rounded-md border-2 border-border bg-surface p-lg">
			<h2 className="m-0 mb-md border-b-2 border-b-accent-dim pb-sm text-[1.4rem] text-accent">
				{npc.name || "New NPC"}
			</h2>

			{/* Characteristics table */}
			<table className="m-0 mb-md w-auto">
				<thead>
					<tr>
						{CHAR_KEYS.map((key) => (
							<th
								className="min-w-[36px] border-border border-b bg-transparent px-sm py-xs text-center text-[0.75rem] text-text-muted"
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
									className="min-w-[36px] border-b-0 px-sm py-xs text-center font-bold text-[0.9rem]"
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
			<div className="mb-md text-[0.9rem] text-text-primary leading-[1.8]">
				<strong className="text-accent">Speed:</strong> {npc.speed} |{" "}
				<strong className="text-accent">Size/Resilience:</strong> {npc.size}/{d.resilience} |{" "}
				<strong className="text-accent">SD:</strong> {d.sd} | <strong className="text-accent">HP:</strong>{" "}
				{d.hp} | <strong className="text-accent">Level:</strong> {npc.level}
			</div>

			{/* Body sections */}
			<div className="text-[0.9rem] leading-[1.7]">
				{npc.skills.length > 0 && (
					<div className="mb-xs">
						<span className="font-bold text-text-primary">Skills:</span>{" "}
						{npc.skills.map((s) => `${s.name} ${s.dots}`).join(", ")}
					</div>
				)}

				{npc.feats.length > 0 && (
					<div className="mb-xs">
						<span className="font-bold text-text-primary">Feats:</span> {npc.feats.join(", ")}
					</div>
				)}

				<div className="mb-xs">
					<span className="font-bold text-text-primary">Armor:</span>{" "}
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
					<div className="mb-xs">
						<span className="font-bold text-text-primary">Attacks:</span>{" "}
						{npc.weapons.map((w) => formatWeapon(w)).join(", ")}
					</div>
				)}

				{npc.abilities.length > 0 && (
					<>
						<div className="mb-xs">
							<span className="font-bold text-text-primary">Abilities:</span>
						</div>
						{npc.abilities.map((a) => (
							<div className="mb-xs ml-md" key={a.name}>
								- <span className="font-semibold text-accent">{a.name}</span>
								{a.description ? ` - ${a.description}` : ""}
							</div>
						))}
					</>
				)}

				{npc.traits.length > 0 && (
					<div className="mb-xs">
						<span className="font-bold text-text-primary">Traits:</span>{" "}
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
					<div className="mb-xs">
						<span className="font-bold text-text-primary">Gear:</span> {npc.gear}
					</div>
				)}
			</div>
		</div>
	);
}
