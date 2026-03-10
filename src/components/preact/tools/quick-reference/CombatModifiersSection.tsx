import { computed, signal } from "@preact/signals";
import { Highlight } from "./Highlight";
import { QREF_DATA } from "./qref-data";

interface CombatModifiersSectionProps {
	searchWords: string[];
}

const weaponRange = signal(30);
const distance = signal(15);

const combatAdvantage = signal(false);
const gangUp = signal(0);
const higherGround = signal(false);
const offHand = signal(false);
const twoWeapons = signal(false);
const shootingIntoMelee = signal(false);
const difficultTerrain = signal(false);

const rangeResult = computed(() => {
	const wpn = weaponRange.value;
	const dist = distance.value;
	if (wpn <= 0) return { band: "", mod: "", note: "Enter weapon range." };
	if (dist <= 2) return { band: "Point Blank", mod: "+2k1", note: " — Does not apply if engaged in melee" };
	const ratio = dist / wpn;
	if (ratio < 0.5) return { band: "Short Range", mod: "+1k0", note: "" };
	if (ratio <= 2) return { band: "Normal Range", mod: "— (no modifier)", note: "" };
	if (ratio <= 3) return { band: "Long Range", mod: "−1k0", note: "" };
	return { band: "Extreme Range", mod: "−3k0", note: " — No maximum range in rules; this is the worst penalty" };
});

const modifierResult = computed(() => {
	let totalR = 0;
	const totalK = 0;
	let freeRaise = false;
	const labels: string[] = [];

	if (combatAdvantage.value) {
		freeRaise = true;
		labels.push("Combat Advantage");
	}
	if (gangUp.value === 1) {
		totalR += 1;
		labels.push("Ganging Up 2:1");
	} else if (gangUp.value === 2) {
		totalR += 2;
		labels.push("Ganging Up 3:1+");
	}
	if (higherGround.value) {
		totalR += 1;
		labels.push("Higher Ground");
	}
	if (offHand.value) {
		totalR += -2;
		labels.push("Off Hand");
	}
	if (twoWeapons.value) {
		totalR += -3;
		labels.push("Two Weapons");
	}
	if (shootingIntoMelee.value) {
		totalR += -2;
		labels.push("Shooting into Melee");
	}
	if (difficultTerrain.value) {
		totalR += -1;
		labels.push("Difficult Terrain");
	}

	return { totalR, totalK, freeRaise, labels };
});

export function CombatModifiersSection({ searchWords }: CombatModifiersSectionProps) {
	const filteredRangeBands = QREF_DATA.rangeBands.filter((r) => {
		if (searchWords.length === 0) return true;
		const text = `${r.band} ${r.range} ${r.mod}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	const filteredModifiers = QREF_DATA.meleeModifiers.filter((m) => {
		if (searchWords.length === 0) return true;
		const text = `${m.situation} ${m.mod}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	const filteredCover = QREF_DATA.coverAP.filter((c) => {
		if (searchWords.length === 0) return true;
		const text = `${c.cover} ${c.ap}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	const rr = rangeResult.value;
	const mr = modifierResult.value;

	return (
		<>
			{/* Range Calculator */}
			<div class="mod-calculator">
				<h3>Range Calculator</h3>
				<div class="calc-row">
					<label>
						Weapon Range (m){" "}
						<input
							type="number"
							min={1}
							value={weaponRange}
							class="calc-input"
							onInput={(e) => {
								weaponRange.value = Number.parseFloat((e.target as HTMLInputElement).value) || 0;
							}}
						/>
					</label>
					<label>
						Distance to Target (m){" "}
						<input
							type="number"
							min={0}
							value={distance}
							class="calc-input"
							onInput={(e) => {
								distance.value = Number.parseFloat((e.target as HTMLInputElement).value) || 0;
							}}
						/>
					</label>
				</div>
				<div class="calc-result">
					{rr.band ? (
						<>
							<strong>{rr.band}</strong> — {rr.mod}
							<span class="calc-detail">
								{" "}
								(distance/range = {(distance.value / weaponRange.value).toFixed(2)}){rr.note}
							</span>
						</>
					) : (
						rr.note
					)}
				</div>
			</div>

			{/* Modifier Accumulator */}
			<div class="mod-calculator">
				<h3>Modifier Accumulator</h3>
				<div class="mod-toggles">
					<label class="mod-toggle">
						<input
							type="checkbox"
							checked={combatAdvantage}
							onChange={(e) => {
								combatAdvantage.value = (e.target as HTMLInputElement).checked;
							}}
						/>{" "}
						Combat Advantage
					</label>
					<span class="mod-group-label">Ganging Up:</span>
					<label class="mod-toggle">
						<input
							type="radio"
							name="gangup"
							checked={gangUp.value === 0}
							onChange={() => {
								gangUp.value = 0;
							}}
						/>{" "}
						None
					</label>
					<label class="mod-toggle">
						<input
							type="radio"
							name="gangup"
							checked={gangUp.value === 1}
							onChange={() => {
								gangUp.value = 1;
							}}
						/>{" "}
						2:1
					</label>
					<label class="mod-toggle">
						<input
							type="radio"
							name="gangup"
							checked={gangUp.value === 2}
							onChange={() => {
								gangUp.value = 2;
							}}
						/>{" "}
						3:1+
					</label>
					<label class="mod-toggle">
						<input
							type="checkbox"
							checked={higherGround}
							onChange={(e) => {
								higherGround.value = (e.target as HTMLInputElement).checked;
							}}
						/>{" "}
						Higher Ground
					</label>
					<label class="mod-toggle">
						<input
							type="checkbox"
							checked={offHand}
							onChange={(e) => {
								offHand.value = (e.target as HTMLInputElement).checked;
							}}
						/>{" "}
						Off Hand
					</label>
					<label class="mod-toggle">
						<input
							type="checkbox"
							checked={twoWeapons}
							onChange={(e) => {
								twoWeapons.value = (e.target as HTMLInputElement).checked;
							}}
						/>{" "}
						Two Weapons (-3k0 each)
					</label>
					<label class="mod-toggle">
						<input
							type="checkbox"
							checked={shootingIntoMelee}
							onChange={(e) => {
								shootingIntoMelee.value = (e.target as HTMLInputElement).checked;
							}}
						/>{" "}
						Shooting into Melee
					</label>
					<label class="mod-toggle">
						<input
							type="checkbox"
							checked={difficultTerrain}
							onChange={(e) => {
								difficultTerrain.value = (e.target as HTMLInputElement).checked;
							}}
						/>{" "}
						Difficult Terrain
					</label>
				</div>
				<div class="calc-result">
					{mr.labels.length === 0 ? (
						"Toggle modifiers above."
					) : (
						<>
							<strong>
								{mr.freeRaise ? "Free Raise + " : ""}
								{mr.totalR >= 0 ? "+" : ""}
								{mr.totalR}k{mr.totalK} to attack roll
							</strong>
							<span class="calc-detail"> ({mr.labels.join(", ")})</span>
						</>
					)}
				</div>
			</div>

			{/* Range Bands Table */}
			<h3>Range Bands</h3>
			<div class="table-wrap">
				<table class="qref-table">
					<thead>
						<tr>
							<th>Band</th>
							<th>Range</th>
							<th>Modifier</th>
						</tr>
					</thead>
					<tbody>
						{filteredRangeBands.map((r) => (
							<tr key={r.band}>
								<td>
									<strong>
										<Highlight text={r.band} words={searchWords} />
									</strong>
								</td>
								<td>
									<Highlight text={r.range} words={searchWords} />
								</td>
								<td>
									<Highlight text={r.mod} words={searchWords} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Situational Modifiers Table */}
			<h3>Situational Modifiers</h3>
			<div class="table-wrap">
				<table class="qref-table">
					<thead>
						<tr>
							<th>Situation</th>
							<th>Modifier</th>
						</tr>
					</thead>
					<tbody>
						{filteredModifiers.map((m) => (
							<tr key={m.situation}>
								<td>
									<Highlight text={m.situation} words={searchWords} />
								</td>
								<td>
									<Highlight text={m.mod} words={searchWords} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Cover AP Table */}
			<h3>Cover Armor Points</h3>
			<div class="table-wrap">
				<table class="qref-table">
					<thead>
						<tr>
							<th>Cover Type</th>
							<th>AP</th>
						</tr>
					</thead>
					<tbody>
						{filteredCover.map((c) => (
							<tr key={c.cover}>
								<td>
									<Highlight text={c.cover} words={searchWords} />
								</td>
								<td>{c.ap}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
