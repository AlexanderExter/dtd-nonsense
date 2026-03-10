import { character } from "@/lib/dtd/character";
import { CHAR_GROUPS, CHAR_NAMES } from "@/lib/dtd/constants";
import { derived } from "@/lib/dtd/derived";
import { charSignal, gameData, metaSignal, updateChar } from "../CharacterBuilderApp";
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

export function ReviewStep() {
	const char = charSignal.value;
	const data = gameData.value;
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
		const fresh = character.createDefault();
		for (const key of Object.keys(fresh.characteristics) as Array<keyof typeof fresh.characteristics>) {
			fresh.characteristics[key] = BASE_CHAR_DOT;
		}
		updateChar(() => {
			// Full replacement via signal
		});
		charSignal.value = fresh;
		metaSignal.value = createDefaultMeta();
	};

	// Non-zero skills
	const activeSkills = Object.entries(char.skills).filter(([, v]) => v > 0);

	return (
		<div class="step-review">
			{/* Warnings */}
			{warnings.length > 0 && (
				<div class="warning-banner">
					<strong>⚠ Issues:</strong>
					<ul>
						{warnings.map((w, i) => (
							<li key={i}>{w}</li>
						))}
					</ul>
				</div>
			)}

			{/* Identity */}
			<section class="review-section">
				<h3>Identity</h3>
				<div class="review-grid">
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
			<section class="review-section">
				<h3>Derived Stats</h3>
				<div class="derived-grid">
					<span>
						<strong>SD:</strong> {sd}
					</span>
					<span>
						<strong>HP:</strong> {hp}
					</span>
					<span>
						<strong>MD:</strong> {md}
					</span>
					<span>
						<strong>Resolve:</strong> {resolve}
					</span>
					<span>
						<strong>Speed:</strong> {speed}
					</span>
					<span>
						<strong>Resilience:</strong> {resilience}
					</span>
					<span>
						<strong>Initiative:</strong> {initiative}
					</span>
				</div>
			</section>

			{/* Characteristics */}
			<section class="review-section">
				<h3>Characteristics</h3>
				<div class="char-review-columns">
					{Object.entries(CHAR_GROUPS).map(([groupKey, group]) => (
						<div key={groupKey}>
							<h4>{group.label}</h4>
							{group.chars.map((ch) => (
								<div key={ch}>
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
				<section class="review-section">
					<h3>Skills</h3>
					<div class="review-list">
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
				<section class="review-section">
					<h3>Backgrounds</h3>
					<div class="review-list">
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
				<section class="review-section">
					<h3>Classes</h3>
					<div class="review-list">
						{char.classes.map((c) => (
							<span key={c.classId}>{capitalize(c.classId)}</span>
						))}
					</div>
				</section>
			)}

			{/* Feats / Assets / Hindrances */}
			{(char.feats.length > 0 || char.assets.length > 0 || char.hindrances.length > 0) && (
				<section class="review-section">
					<h3>Feats, Assets &amp; Hindrances</h3>
					{char.feats.length > 0 && (
						<div class="review-list">
							<strong>Feats:</strong> {char.feats.map((f) => f.name).join(", ")}
						</div>
					)}
					{char.assets.length > 0 && (
						<div class="review-list">
							<strong>Assets:</strong> {char.assets.map((a) => a.name).join(", ")}
						</div>
					)}
					{char.hindrances.length > 0 && (
						<div class="review-list">
							<strong>Hindrances:</strong> {char.hindrances.map((h) => h.name).join(", ")}
						</div>
					)}
				</section>
			)}

			{/* Equipment */}
			{char.equipment && (
				<section class="review-section">
					<h3>Equipment</h3>
					<p>{char.equipment}</p>
				</section>
			)}

			{/* XP Budget */}
			<section class="review-section">
				<h3>XP Budget</h3>
				<div class="xp-summary">
					<span>
						<strong>Total:</strong> {TOTAL_XP}
					</span>
					{xp.breakdown.classes > 0 && <span>Classes: {xp.breakdown.classes}</span>}
					{xp.breakdown.feats > 0 && <span>Feats: {xp.breakdown.feats}</span>}
					{xp.breakdown.assets > 0 && <span>Assets: {xp.breakdown.assets}</span>}
					{xp.breakdown.hindrances < 0 && <span>Hindrances: {xp.breakdown.hindrances} (bonus)</span>}
					{xp.breakdown.backgrounds > 0 && <span>Backgrounds: {xp.breakdown.backgrounds}</span>}
					<span class={xp.remaining < 0 ? "over-budget" : ""}>
						<strong>Remaining:</strong> {xp.remaining}
					</span>
				</div>
			</section>

			{/* Actions */}
			<div class="review-actions">
				<button type="button" class="btn btn-primary" onClick={handleOpenInSheet}>
					Open in Sheet
				</button>
				<button type="button" class="btn btn-secondary" onClick={handleExport}>
					Export JSON
				</button>
				<button type="button" class="btn btn-danger" onClick={handleStartOver}>
					Start Over
				</button>
			</div>
		</div>
	);
}
