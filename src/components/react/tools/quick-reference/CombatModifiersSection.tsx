import { useMemo, useState } from "react";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameInput } from "@/components/react/ui/GameInput";
import { Highlight } from "./Highlight";
import { QREF_DATA } from "./qref-data";

interface CombatModifiersSectionProps {
	searchWords: string[];
}

export function CombatModifiersSection({ searchWords }: CombatModifiersSectionProps) {
	const [weaponRange, setWeaponRange] = useState(30);
	const [distance, setDistance] = useState(15);

	const [combatAdvantage, setCombatAdvantage] = useState(false);
	const [gangUp, setGangUp] = useState(0);
	const [higherGround, setHigherGround] = useState(false);
	const [offHand, setOffHand] = useState(false);
	const [twoWeapons, setTwoWeapons] = useState(false);
	const [shootingIntoMelee, setShootingIntoMelee] = useState(false);
	const [difficultTerrain, setDifficultTerrain] = useState(false);

	const rangeResult = useMemo(() => {
		if (weaponRange <= 0) return { band: "", mod: "", note: "Enter weapon range." };
		if (distance <= 2)
			return {
				band: "Point Blank",
				mod: "+2k1",
				note: " — Does not apply if engaged in melee",
			};
		const ratio = distance / weaponRange;
		if (ratio < 0.5) return { band: "Short Range", mod: "+1k0", note: "" };
		if (ratio <= 2) return { band: "Normal Range", mod: "— (no modifier)", note: "" };
		if (ratio <= 3) return { band: "Long Range", mod: "−1k0", note: "" };
		return {
			band: "Extreme Range",
			mod: "−3k0",
			note: " — No maximum range in rules; this is the worst penalty",
		};
	}, [weaponRange, distance]);

	const modifierResult = useMemo(() => {
		let totalR = 0;
		const totalK = 0;
		let freeRaise = false;
		const labels: string[] = [];

		if (combatAdvantage) {
			freeRaise = true;
			labels.push("Combat Advantage");
		}
		if (gangUp === 1) {
			totalR += 1;
			labels.push("Ganging Up 2:1");
		} else if (gangUp === 2) {
			totalR += 2;
			labels.push("Ganging Up 3:1+");
		}
		if (higherGround) {
			totalR += 1;
			labels.push("Higher Ground");
		}
		if (offHand) {
			totalR += -2;
			labels.push("Off Hand");
		}
		if (twoWeapons) {
			totalR += -3;
			labels.push("Two Weapons");
		}
		if (shootingIntoMelee) {
			totalR += -2;
			labels.push("Shooting into Melee");
		}
		if (difficultTerrain) {
			totalR += -1;
			labels.push("Difficult Terrain");
		}

		return { totalR, totalK, freeRaise, labels };
	}, [combatAdvantage, gangUp, higherGround, offHand, twoWeapons, shootingIntoMelee, difficultTerrain]);
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

	const rr = rangeResult;
	const mr = modifierResult;

	return (
		<>
			{/* Range Calculator */}
			<div className="mb-md rounded-md border border-border bg-surface p-md">
				<h3 className="m-0 mb-sm text-[0.95rem] text-accent">Range Calculator</h3>
				<div className="mb-sm flex flex-wrap gap-md max-[600px]:flex-col">
					<label className="flex flex-col gap-[4px] text-[0.85rem] text-text-muted">
						Weapon Range (m){" "}
						<GameInput
							className="w-[110px]"
							min={1}
							onInput={(e) => {
								setWeaponRange(Number.parseFloat((e.target as HTMLInputElement).value) || 0);
							}}
							type="number"
							value={weaponRange}
						/>
					</label>
					<label className="flex flex-col gap-[4px] text-[0.85rem] text-text-muted">
						Distance to Target (m){" "}
						<GameInput
							className="w-[110px]"
							min={0}
							onInput={(e) => {
								setDistance(Number.parseFloat((e.target as HTMLInputElement).value) || 0);
							}}
							type="number"
							value={distance}
						/>
					</label>
				</div>
				<div className="mt-sm min-h-[1.6em] rounded-r-md border-l-[3px] border-l-accent bg-accent-bg-subtle px-md py-sm text-[0.9rem] text-text-primary">
					{rr.band ? (
						<>
							<strong>{rr.band}</strong> — {rr.mod}
							<span className="ml-sm text-[0.8rem] text-text-muted">
								{" "}
								(distance/range = {(distance / weaponRange).toFixed(2)}){rr.note}
							</span>
						</>
					) : (
						rr.note
					)}
				</div>
			</div>

			{/* Modifier Accumulator */}
			<div className="mb-md rounded-md border border-border bg-surface p-md">
				<h3 className="m-0 mb-sm text-[0.95rem] text-accent">Modifier Accumulator</h3>
				<div className="flex flex-wrap gap-x-md gap-y-[6px]">
					<label className="flex cursor-pointer select-none items-center gap-[6px] text-[0.85rem] text-text-primary">
						<GameCheckbox
							checked={combatAdvantage}
							onChange={(e) => {
								setCombatAdvantage((e.target as HTMLInputElement).checked);
							}}
						/>{" "}
						Combat Advantage
					</label>
					<span className="ml-sm self-center font-semibold text-[0.85rem] text-accent">Ganging Up:</span>
					<label className="flex cursor-pointer select-none items-center gap-[6px] text-[0.85rem] text-text-primary">
						<input
							checked={gangUp === 0}
							className="h-4 w-4 cursor-pointer accent-accent"
							name="gangup"
							onChange={() => {
								setGangUp(0);
							}}
							type="radio"
						/>{" "}
						None
					</label>
					<label className="flex cursor-pointer select-none items-center gap-[6px] text-[0.85rem] text-text-primary">
						<input
							checked={gangUp === 1}
							className="h-4 w-4 cursor-pointer accent-accent"
							name="gangup"
							onChange={() => {
								setGangUp(1);
							}}
							type="radio"
						/>{" "}
						2:1
					</label>
					<label className="flex cursor-pointer select-none items-center gap-[6px] text-[0.85rem] text-text-primary">
						<input
							checked={gangUp === 2}
							className="h-4 w-4 cursor-pointer accent-accent"
							name="gangup"
							onChange={() => {
								setGangUp(2);
							}}
							type="radio"
						/>{" "}
						3:1+
					</label>
					<label className="flex cursor-pointer select-none items-center gap-[6px] text-[0.85rem] text-text-primary">
						<GameCheckbox
							checked={higherGround}
							onChange={(e) => {
								setHigherGround((e.target as HTMLInputElement).checked);
							}}
						/>{" "}
						Higher Ground
					</label>
					<label className="flex cursor-pointer select-none items-center gap-[6px] text-[0.85rem] text-text-primary">
						<GameCheckbox
							checked={offHand}
							onChange={(e) => {
								setOffHand((e.target as HTMLInputElement).checked);
							}}
						/>{" "}
						Off Hand
					</label>
					<label className="flex cursor-pointer select-none items-center gap-[6px] text-[0.85rem] text-text-primary">
						<GameCheckbox
							checked={twoWeapons}
							onChange={(e) => {
								setTwoWeapons((e.target as HTMLInputElement).checked);
							}}
						/>{" "}
						Two Weapons (-3k0 each)
					</label>
					<label className="flex cursor-pointer select-none items-center gap-[6px] text-[0.85rem] text-text-primary">
						<GameCheckbox
							checked={shootingIntoMelee}
							onChange={(e) => {
								setShootingIntoMelee((e.target as HTMLInputElement).checked);
							}}
						/>{" "}
						Shooting into Melee
					</label>
					<label className="flex cursor-pointer select-none items-center gap-[6px] text-[0.85rem] text-text-primary">
						<GameCheckbox
							checked={difficultTerrain}
							onChange={(e) => {
								setDifficultTerrain((e.target as HTMLInputElement).checked);
							}}
						/>{" "}
						Difficult Terrain
					</label>
				</div>
				<div className="mt-sm min-h-[1.6em] rounded-r-md border-l-[3px] border-l-accent bg-accent-bg-subtle px-md py-sm text-[0.9rem] text-text-primary">
					{mr.labels.length === 0 ? (
						"Toggle modifiers above."
					) : (
						<>
							<strong>
								{mr.freeRaise ? "Free Raise + " : ""}
								{mr.totalR >= 0 ? "+" : ""}
								{mr.totalR}k{mr.totalK} to attack roll
							</strong>
							<span className="ml-sm text-[0.8rem] text-text-muted"> ({mr.labels.join(", ")})</span>
						</>
					)}
				</div>
			</div>

			{/* Range Bands Table */}
			<h3>Range Bands</h3>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
					<thead>
						<tr>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Band
							</th>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Range
							</th>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Modifier
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredRangeBands.map((r) => (
							<tr className="even:bg-stripe hover:bg-surface" key={r.band}>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<strong>
										<Highlight text={r.band} words={searchWords} />
									</strong>
								</td>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={r.range} words={searchWords} />
								</td>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={r.mod} words={searchWords} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Situational Modifiers Table */}
			<h3>Situational Modifiers</h3>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
					<thead>
						<tr>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Situation
							</th>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Modifier
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredModifiers.map((m) => (
							<tr className="even:bg-stripe hover:bg-surface" key={m.situation}>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={m.situation} words={searchWords} />
								</td>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={m.mod} words={searchWords} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Cover AP Table */}
			<h3>Cover Armor Points</h3>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
					<thead>
						<tr>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Cover Type
							</th>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								AP
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredCover.map((c) => (
							<tr className="even:bg-stripe hover:bg-surface" key={c.cover}>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={c.cover} words={searchWords} />
								</td>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									{c.ap}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
