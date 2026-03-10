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
		<div class="stat-card">
			<h2 class="card-name">{npc.name || "New NPC"}</h2>

			{/* Characteristics table */}
			<table class="char-table">
				<thead>
					<tr>
						{CHAR_KEYS.map((key) => (
							<th key={key}>{CHAR_ABBREV[key]}</th>
						))}
					</tr>
				</thead>
				<tbody>
					<tr>
						{CHAR_KEYS.map((key) => {
							const val = npc.characteristics[key];
							return <td key={key}>{val === 0 ? "-" : val}</td>;
						})}
					</tr>
				</tbody>
			</table>

			{/* Stats line */}
			<div class="card-stats">
				<strong>Speed:</strong> {npc.speed} | <strong>Size/Resilience:</strong> {npc.size}/{d.resilience} |{" "}
				<strong>SD:</strong> {d.sd} | <strong>HP:</strong> {d.hp} | <strong>Level:</strong> {npc.level}
			</div>

			{/* Body sections */}
			<div class="card-body">
				{npc.skills.length > 0 && (
					<div class="card-line">
						<span class="card-line-label">Skills:</span>{" "}
						{npc.skills.map((s) => `${s.name} ${s.dots}`).join(", ")}
					</div>
				)}

				{npc.feats.length > 0 && (
					<div class="card-line">
						<span class="card-line-label">Feats:</span> {npc.feats.join(", ")}
					</div>
				)}

				<div class="card-line">
					<span class="card-line-label">Armor:</span>{" "}
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
					<div class="card-line">
						<span class="card-line-label">Attacks:</span>{" "}
						{npc.weapons.map((w) => formatWeapon(w)).join(", ")}
					</div>
				)}

				{npc.abilities.length > 0 && (
					<>
						<div class="card-line">
							<span class="card-line-label">Abilities:</span>
						</div>
						{npc.abilities.map((a, i) => (
							<div class="card-ability" key={i}>
								- <span class="card-ability-name">{a.name}</span>
								{a.description ? ` - ${a.description}` : ""}
							</div>
						))}
					</>
				)}

				{npc.traits.length > 0 && (
					<div class="card-line">
						<span class="card-line-label">Traits:</span>{" "}
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
					<div class="card-line">
						<span class="card-line-label">Gear:</span> {npc.gear}
					</div>
				)}
			</div>
		</div>
	);
}
