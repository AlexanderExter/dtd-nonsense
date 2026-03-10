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
		<aside class="sticky top-md max-h-[calc(100vh-2*var(--space-md))] overflow-y-auto bg-surface border border-border rounded-md p-md flex flex-col gap-md max-[900px]:static max-[900px]:max-h-none">
			{/* Character identity */}
			<div class="text-center pb-md border-b border-border">
				<h2 class="text-[1.15rem] font-bold text-accent mb-xs break-words">{char.name || "New Character"}</h2>
				<div class="flex gap-xs justify-center flex-wrap">
					{char.race && (
						<span class="inline-block px-2 py-0.5 bg-surface-raised border border-accent-dim rounded-sm text-xs text-accent">
							{char.race}
						</span>
					)}
					{char.exaltation && (
						<span class="inline-block px-2 py-0.5 bg-surface-raised border border-accent-dim rounded-sm text-xs text-accent">
							{char.exaltation}
						</span>
					)}
				</div>
			</div>

			{/* Derived Stats */}
			<div>
				<h3 class="text-xs uppercase tracking-[0.06em] text-text-dim mb-sm">Derived Stats</h3>
				<div class="grid grid-cols-2 gap-x-sm gap-y-0.5 text-[0.85rem]">
					<span class="text-text-muted">SD</span>
					<span class="text-text-primary font-semibold tabular-nums text-right">{sd}</span>
					<span class="text-text-muted">HP</span>
					<span class="text-text-primary font-semibold tabular-nums text-right">{hp}</span>
					<span class="text-text-muted">MD</span>
					<span class="text-text-primary font-semibold tabular-nums text-right">{md}</span>
					<span class="text-text-muted">Resolve</span>
					<span class="text-text-primary font-semibold tabular-nums text-right">{resolve}</span>
					<span class="text-text-muted">Speed</span>
					<span class="text-text-primary font-semibold tabular-nums text-right">{speed}</span>
					<span class="text-text-muted">Resilience</span>
					<span class="text-text-primary font-semibold tabular-nums text-right">{resilience}</span>
					<span class="text-text-muted">Initiative</span>
					<span class="text-text-primary font-semibold tabular-nums text-right">{initiative}</span>
				</div>
			</div>

			{/* XP Budget */}
			<div>
				<h3 class="text-xs uppercase tracking-[0.06em] text-text-dim mb-sm">XP Budget</h3>
				<div
					class={["text-[0.8rem] text-text-muted text-center mb-sm", xp.remaining < 0 && "text-error"]
						.filter(Boolean)
						.join(" ")}
				>
					<strong class={xp.remaining < 0 ? "text-error" : "text-accent"}>{xp.remaining}</strong> / {TOTAL_XP}{" "}
					remaining
				</div>
				<div class="text-xs text-text-dim">
					{xp.breakdown.classes > 0 && (
						<div class="flex justify-between py-[1px]">
							<span>Classes</span>
							<span>{xp.breakdown.classes}</span>
						</div>
					)}
					{xp.breakdown.feats > 0 && (
						<div class="flex justify-between py-[1px]">
							<span>Feats</span>
							<span>{xp.breakdown.feats}</span>
						</div>
					)}
					{xp.breakdown.assets > 0 && (
						<div class="flex justify-between py-[1px]">
							<span>Assets</span>
							<span>{xp.breakdown.assets}</span>
						</div>
					)}
					{xp.breakdown.hindrances < 0 && (
						<div class="flex justify-between py-[1px]">
							<span>Hindrances</span>
							<span>{xp.breakdown.hindrances}</span>
						</div>
					)}
					{xp.breakdown.backgrounds > 0 && (
						<div class="flex justify-between py-[1px]">
							<span>Backgrounds</span>
							<span>{xp.breakdown.backgrounds}</span>
						</div>
					)}
				</div>
			</div>

			{/* Step Checklist */}
			<div>
				<h3 class="text-xs uppercase tracking-[0.06em] text-text-dim mb-sm">Steps</h3>
				<ol class="list-none p-0 m-0 text-[0.8rem]">
					{STEP_LABELS.map((label, i) => {
						const isDone = meta.stepsCompleted[i];
						const isActive = currentStep.value === i + 1;
						return (
							<li key={i}>
								<button
									type="button"
									class={[
										"flex items-center gap-xs py-[3px] cursor-pointer bg-transparent border-none p-0 text-left w-full text-[0.8rem] hover:text-text-primary",
										isActive
											? "text-accent font-semibold"
											: isDone
												? "text-success"
												: "text-text-dim",
									].join(" ")}
									onClick={() => {
										currentStep.value = i + 1;
									}}
								>
									<span class="w-[14px] text-center shrink-0">{isDone ? "✓" : i + 1}</span>
									{label}
								</button>
							</li>
						);
					})}
				</ol>
			</div>

			{/* Actions */}
			<div class="flex flex-col gap-xs pt-md border-t border-border mt-auto">
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
