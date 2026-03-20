import { Button } from "@/components/react/ui/Button";
import { character } from "@/lib/dtd/character";
import { CHAR_GROUPS, CHAR_NAMES } from "@/lib/dtd/constants";
import { derived } from "@/lib/dtd/derived";
import {
	BASE_CHAR_DOT,
	calcXP,
	capitalize,
	createDefaultMeta,
	findRaceData,
	getLevel,
	getSize,
	getTotalChars,
	TOTAL_XP,
} from "../constants";
import { createDefaultChar, useBuilderStore } from "../store";

export function ReviewStep() {
	const char = useBuilderStore((s) => s.char);
	const data = useBuilderStore((s) => s.gameData);
	const raceData = findRaceData(data, char.race);
	const totalChars = getTotalChars(char, raceData);
	const size = getSize(raceData);
	const level = getLevel(char);
	const xp = calcXP(char);
	const isHalfling = char.race?.toLowerCase() === "halfling";

	// Derived stats
	const sd = derived.calculateSD(totalChars.dexterity || 1, totalChars.wisdom || 1, size, isHalfling);
	const hp = derived.calculateHP(totalChars.constitution || 1, totalChars.willpower || 1);
	const md = derived.calculateMentalDefense(totalChars.composure || 1);
	const resolve = derived.calculateResolve(totalChars.willpower || 1, totalChars.composure || 1);
	const speed = derived.calculateSpeed(totalChars.strength || 1, totalChars.dexterity || 1);
	const resilience = derived.calculateResilience(size, level);
	const initiative = derived.calculateInitiativeBase(totalChars.dexterity || 1, totalChars.composure || 1);

	// Warnings
	const warnings: string[] = [];
	if (!char.name) warnings.push("No name set");
	if (!char.race) warnings.push("No race selected");
	if (!char.exaltation) warnings.push("No exaltation selected");
	if (xp.remaining < 0) warnings.push(`Over budget by ${Math.abs(xp.remaining)} XP`);

	const handleOpenInSheet = () => {
		const validated = character.validate(char);
		character.save(validated.id || char.id, validated);
		window.location.href = `/tools/character-sheet/?id=${encodeURIComponent(validated.id || char.id)}`;
	};

	const handleExport = () => {
		character.exportJSON(char);
	};

	const handleStartOver = () => {
		if (!confirm("Start over? All progress will be lost.")) return;
		useBuilderStore.getState().setChar(createDefaultChar());
		useBuilderStore.getState().setMeta(createDefaultMeta());
	};

	// Non-zero skills
	const activeSkills = Object.entries(char.skills).filter(([, v]) => v > 0);

	return (
		<div className="grid gap-md">
			{/* Warnings */}
			{warnings.length > 0 && (
				<div className="rounded-sm border border-error bg-[rgba(248,113,113,0.1)] px-md py-sm font-semibold text-[0.9rem] text-error">
					<strong>⚠ Issues:</strong>
					<ul>
						{warnings.map((w) => (
							<li key={w}>{w}</li>
						))}
					</ul>
				</div>
			)}

			{/* Identity */}
			<section className="rounded-md border border-border bg-surface p-md">
				<h3 className="mb-sm border-border border-b pb-xs text-accent text-base">Identity</h3>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-sm text-[0.9rem]">
					<span>
						<strong>Name:</strong> {char.name || "—"}
					</span>
					<span>
						<strong>Race:</strong> {char.race || "—"}
						{char.raceCharBonus ? ` (+${capitalize(char.raceCharBonus)})` : ""}
					</span>
					<span>
						<strong>Exaltation:</strong> {char.exaltation || "—"}
					</span>
					<span>
						<strong>Alignment:</strong> {char.alignment || "—"}
					</span>
					<span>
						<strong>Size:</strong> {size}
					</span>
					<span>
						<strong>Level:</strong> {level}
					</span>
				</div>
			</section>

			{/* Derived Stats */}
			<section className="rounded-md border border-border bg-surface p-md">
				<h3 className="mb-sm border-border border-b pb-xs text-accent text-base">Derived Stats</h3>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-sm">
					{[
						["SD", sd],
						["HP", hp],
						["MD", md],
						["Resolve", resolve],
						["Speed", speed],
						["Resilience", resilience],
						["Initiative", initiative],
					].map(([label, value]) => (
						<div className="rounded-sm bg-surface-raised p-sm text-center" key={label}>
							<span className="block text-[0.7rem] text-text-dim uppercase">{label}</span>
							<span className="block font-bold text-[1.3rem] text-accent">{value}</span>
						</div>
					))}
				</div>
			</section>

			{/* Characteristics */}
			<section className="rounded-md border border-border bg-surface p-md">
				<h3 className="mb-sm border-border border-b pb-xs text-accent text-base">Characteristics</h3>
				<div className="grid grid-cols-3 gap-md max-[900px]:grid-cols-1">
					{Object.entries(CHAR_GROUPS).map(([groupKey, group]) => (
						<div key={groupKey}>
							<h4 className="mb-xs text-[0.85rem] text-accent">{group.label}</h4>
							{group.chars.map((ch) => (
								<div className="border-border border-b py-xs text-[0.9rem] last:border-b-0" key={ch}>
									{CHAR_NAMES[ch] || capitalize(ch)}:{" "}
									<strong>{totalChars[ch] || BASE_CHAR_DOT}</strong>
								</div>
							))}
						</div>
					))}
				</div>
			</section>

			{/* Skills */}
			{activeSkills.length > 0 && (
				<section className="rounded-md border border-border bg-surface p-md">
					<h3 className="mb-sm border-border border-b pb-xs text-accent text-base">Skills</h3>
					<div className="flex flex-wrap gap-sm text-[0.9rem]">
						{activeSkills.map(([key, val]) => (
							<span key={key}>
								{capitalize(key)}: {val}
							</span>
						))}
					</div>
				</section>
			)}

			{/* Backgrounds */}
			{char.backgrounds.length > 0 && (
				<section className="rounded-md border border-border bg-surface p-md">
					<h3 className="mb-sm border-border border-b pb-xs text-accent text-base">Backgrounds</h3>
					<div className="flex flex-wrap gap-sm text-[0.9rem]">
						{char.backgrounds.map((b) => (
							<span key={b.name}>
								{capitalize(b.name)}: {b.dots}
							</span>
						))}
					</div>
				</section>
			)}

			{/* Classes */}
			{char.classes.length > 0 && (
				<section className="rounded-md border border-border bg-surface p-md">
					<h3 className="mb-sm border-border border-b pb-xs text-accent text-base">Classes</h3>
					<div className="flex flex-wrap gap-sm text-[0.9rem]">
						{char.classes.map((c) => (
							<span key={c.classId}>{capitalize(c.classId)}</span>
						))}
					</div>
				</section>
			)}

			{/* Feats / Assets / Hindrances */}
			{(char.feats.length > 0 || char.assets.length > 0 || char.hindrances.length > 0) && (
				<section className="rounded-md border border-border bg-surface p-md">
					<h3 className="mb-sm border-border border-b pb-xs text-accent text-base">
						Feats, Assets &amp; Hindrances
					</h3>
					{char.feats.length > 0 && (
						<div className="mb-xs text-[0.9rem]">
							<strong>Feats:</strong> {char.feats.map((f) => f.name).join(", ")}
						</div>
					)}
					{char.assets.length > 0 && (
						<div className="mb-xs text-[0.9rem]">
							<strong>Assets:</strong> {char.assets.map((a) => a.name).join(", ")}
						</div>
					)}
					{char.hindrances.length > 0 && (
						<div className="text-[0.9rem]">
							<strong>Hindrances:</strong> {char.hindrances.map((h) => h.name).join(", ")}
						</div>
					)}
				</section>
			)}

			{/* Equipment */}
			{char.equipment && (
				<section className="rounded-md border border-border bg-surface p-md">
					<h3 className="mb-sm border-border border-b pb-xs text-accent text-base">Equipment</h3>
					<p>{char.equipment}</p>
				</section>
			)}

			{/* XP Budget */}
			<section className="rounded-md border border-border bg-surface p-md">
				<h3 className="mb-sm border-border border-b pb-xs text-accent text-base">XP Budget</h3>
				<div className="flex flex-wrap gap-sm text-[0.9rem]">
					<span>
						<strong>Total:</strong> {TOTAL_XP}
					</span>
					{xp.breakdown.classes > 0 && <span>Classes: {xp.breakdown.classes}</span>}
					{xp.breakdown.feats > 0 && <span>Feats: {xp.breakdown.feats}</span>}
					{xp.breakdown.assets > 0 && <span>Assets: {xp.breakdown.assets}</span>}
					{xp.breakdown.hindrances < 0 && <span>Hindrances: {xp.breakdown.hindrances} (bonus)</span>}
					{xp.breakdown.backgrounds > 0 && <span>Backgrounds: {xp.breakdown.backgrounds}</span>}
					<span className={xp.remaining < 0 ? "font-semibold text-error" : ""}>
						<strong>Remaining:</strong> {xp.remaining}
					</span>
				</div>
			</section>

			{/* Actions */}
			<div className="mt-md flex gap-sm">
				<Button onClick={handleOpenInSheet} variant="primary">
					Open in Sheet
				</Button>
				<Button onClick={handleExport}>Export JSON</Button>
				<Button onClick={handleStartOver} variant="danger">
					Start Over
				</Button>
			</div>
		</div>
	);
}
