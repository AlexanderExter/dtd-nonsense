import { character } from "@/lib/dtd/character";
import { derived } from "@/lib/dtd/derived";
import { charSignal, currentStep, gameData, metaSignal } from "./CharacterBuilderApp";
import {
	BASE_CHAR_DOT,
	calcXP,
	createDefaultMeta,
	findRaceData,
	getLevel,
	getSize,
	getTotalChars,
	STEP_LABELS,
	TOTAL_XP,
} from "./constants";

export function Sidebar() {
	const char = charSignal.value;
	const meta = metaSignal.value;
	const data = gameData.value;
	const raceData = findRaceData(data, char.race);
	const totalChars = getTotalChars(char, raceData);
	const size = getSize(raceData);
	const level = getLevel(char);
	const isHalfling = char.race?.toLowerCase() === "halfling";
	const xp = calcXP(char);

	// Derived stats
	const sd = derived.calculateSD(totalChars.dexterity || 1, totalChars.wisdom || 1, size, isHalfling);
	const hp = derived.calculateHP(totalChars.constitution || 1, totalChars.willpower || 1);
	const md = derived.calculateMentalDefense(totalChars.composure || 1);
	const resolve = derived.calculateResolve(totalChars.willpower || 1, totalChars.composure || 1);
	const speed = derived.calculateSpeed(totalChars.strength || 1, totalChars.dexterity || 1);
	const resilience = derived.calculateResilience(size, level);
	const initiative = derived.calculateInitiativeBase(totalChars.dexterity || 1, totalChars.composure || 1);

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
		charSignal.value = fresh;
		metaSignal.value = createDefaultMeta();
	};

	return (
		<aside class="builder-sidebar">
			{/* Character identity */}
			<div class="sidebar-identity">
				<h2>{char.name || "New Character"}</h2>
				{char.race && <span class="badge badge-race">{char.race}</span>}
				{char.exaltation && <span class="badge badge-exalt">{char.exaltation}</span>}
			</div>

			{/* Derived Stats */}
			<div class="sidebar-section">
				<h3>Derived Stats</h3>
				<div class="stat-grid">
					<span>
						SD: <strong>{sd}</strong>
					</span>
					<span>
						HP: <strong>{hp}</strong>
					</span>
					<span>
						MD: <strong>{md}</strong>
					</span>
					<span>
						Resolve: <strong>{resolve}</strong>
					</span>
					<span>
						Speed: <strong>{speed}</strong>
					</span>
					<span>
						Resilience: <strong>{resilience}</strong>
					</span>
					<span>
						Initiative: <strong>{initiative}</strong>
					</span>
				</div>
			</div>

			{/* XP Budget */}
			<div class="sidebar-section">
				<h3>XP Budget</h3>
				<div class={`xp-remaining${xp.remaining < 0 ? " over-budget" : ""}`}>
					<strong>{xp.remaining}</strong> / {TOTAL_XP} remaining
				</div>
				<div class="xp-breakdown">
					{xp.breakdown.classes > 0 && <span>Classes: {xp.breakdown.classes}</span>}
					{xp.breakdown.feats > 0 && <span>Feats: {xp.breakdown.feats}</span>}
					{xp.breakdown.assets > 0 && <span>Assets: {xp.breakdown.assets}</span>}
					{xp.breakdown.hindrances < 0 && <span>Hindrances: {xp.breakdown.hindrances}</span>}
					{xp.breakdown.backgrounds > 0 && <span>Backgrounds: {xp.breakdown.backgrounds}</span>}
				</div>
			</div>

			{/* Step Checklist */}
			<div class="sidebar-section">
				<h3>Steps</h3>
				<ol class="step-checklist">
					{STEP_LABELS.map((label, i) => {
						const isDone = meta.stepsCompleted[i];
						const isActive = currentStep.value === i + 1;
						return (
							<li key={i} class={`${isDone ? "done" : ""}${isActive ? " active" : ""}`}>
								<button
									type="button"
									class="checklist-btn"
									onClick={() => {
										currentStep.value = i + 1;
									}}
								>
									<span class="check-icon">{isDone ? "✓" : i + 1}</span>
									{label}
								</button>
							</li>
						);
					})}
				</ol>
			</div>

			{/* Actions */}
			<div class="sidebar-actions">
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
		</aside>
	);
}
