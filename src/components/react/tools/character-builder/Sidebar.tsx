import { Button } from "@/components/react/ui/Button";
import { character } from "@/lib/dtd/character";
import { derived } from "@/lib/dtd/derived";
import {
	calcXP,
	createDefaultMeta,
	findRaceData,
	getLevel,
	getSize,
	getTotalChars,
	STEP_LABELS,
	TOTAL_XP,
} from "./constants";
import { createDefaultChar, useBuilderStore } from "./store";

export function Sidebar() {
	const char = useBuilderStore((s) => s.char);
	const meta = useBuilderStore((s) => s.meta);
	const data = useBuilderStore((s) => s.gameData);
	const currentStep = useBuilderStore((s) => s.currentStep);
	const setChar = useBuilderStore((s) => s.setChar);
	const setMeta = useBuilderStore((s) => s.setMeta);
	const setCurrentStep = useBuilderStore((s) => s.setCurrentStep);
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
		setChar(createDefaultChar());
		setMeta(createDefaultMeta());
	};

	return (
		<aside className="sticky top-md max-h-[calc(100vh-2*var(--space-md))] overflow-y-auto bg-surface border border-border rounded-md p-md flex flex-col gap-md max-[900px]:static max-[900px]:max-h-none">
			{/* Character identity */}
			<div className="text-center pb-md border-b border-border">
				<h2 className="text-[1.15rem] font-bold text-accent mb-xs break-words">
					{char.name || "New Character"}
				</h2>
				<div className="flex gap-xs justify-center flex-wrap">
					{char.race && (
						<span className="inline-block px-2 py-0.5 bg-surface-raised border border-accent-dim rounded-sm text-xs text-accent">
							{char.race}
						</span>
					)}
					{char.exaltation && (
						<span className="inline-block px-2 py-0.5 bg-surface-raised border border-accent-dim rounded-sm text-xs text-accent">
							{char.exaltation}
						</span>
					)}
				</div>
			</div>

			{/* Derived Stats */}
			<div>
				<h3 className="text-xs uppercase tracking-[0.06em] text-text-dim mb-sm">Derived Stats</h3>
				<div className="grid grid-cols-2 gap-x-sm gap-y-0.5 text-[0.85rem]">
					<span className="text-text-muted">SD</span>
					<span className="text-text-primary font-semibold tabular-nums text-right">{sd}</span>
					<span className="text-text-muted">HP</span>
					<span className="text-text-primary font-semibold tabular-nums text-right">{hp}</span>
					<span className="text-text-muted">MD</span>
					<span className="text-text-primary font-semibold tabular-nums text-right">{md}</span>
					<span className="text-text-muted">Resolve</span>
					<span className="text-text-primary font-semibold tabular-nums text-right">{resolve}</span>
					<span className="text-text-muted">Speed</span>
					<span className="text-text-primary font-semibold tabular-nums text-right">{speed}</span>
					<span className="text-text-muted">Resilience</span>
					<span className="text-text-primary font-semibold tabular-nums text-right">{resilience}</span>
					<span className="text-text-muted">Initiative</span>
					<span className="text-text-primary font-semibold tabular-nums text-right">{initiative}</span>
				</div>
			</div>

			{/* XP Budget */}
			<div>
				<h3 className="text-xs uppercase tracking-[0.06em] text-text-dim mb-sm">XP Budget</h3>
				<div
					className={["text-[0.8rem] text-text-muted text-center mb-sm", xp.remaining < 0 && "text-error"]
						.filter(Boolean)
						.join(" ")}
				>
					<strong className={xp.remaining < 0 ? "text-error" : "text-accent"}>{xp.remaining}</strong> /{" "}
					{TOTAL_XP} remaining
				</div>
				<div className="text-xs text-text-dim">
					{xp.breakdown.classes > 0 && (
						<div className="flex justify-between py-[1px]">
							<span>Classes</span>
							<span>{xp.breakdown.classes}</span>
						</div>
					)}
					{xp.breakdown.feats > 0 && (
						<div className="flex justify-between py-[1px]">
							<span>Feats</span>
							<span>{xp.breakdown.feats}</span>
						</div>
					)}
					{xp.breakdown.assets > 0 && (
						<div className="flex justify-between py-[1px]">
							<span>Assets</span>
							<span>{xp.breakdown.assets}</span>
						</div>
					)}
					{xp.breakdown.hindrances < 0 && (
						<div className="flex justify-between py-[1px]">
							<span>Hindrances</span>
							<span>{xp.breakdown.hindrances}</span>
						</div>
					)}
					{xp.breakdown.backgrounds > 0 && (
						<div className="flex justify-between py-[1px]">
							<span>Backgrounds</span>
							<span>{xp.breakdown.backgrounds}</span>
						</div>
					)}
				</div>
			</div>

			{/* Step Checklist */}
			<div>
				<h3 className="text-xs uppercase tracking-[0.06em] text-text-dim mb-sm">Steps</h3>
				<ol className="list-none p-0 m-0 text-[0.8rem]">
					{STEP_LABELS.map((label, i) => {
						const isDone = meta.stepsCompleted[i];
						const isActive = currentStep === i + 1;
						return (
							<li key={label}>
								<button
									type="button"
									className={[
										"flex items-center gap-xs py-[3px] cursor-pointer bg-transparent border-none p-0 text-left w-full text-[0.8rem] hover:text-text-primary",
										isActive
											? "text-accent font-semibold"
											: isDone
												? "text-success"
												: "text-text-dim",
									].join(" ")}
									onClick={() => {
										setCurrentStep(i + 1);
									}}
								>
									<span className="w-[14px] text-center shrink-0">{isDone ? "✓" : i + 1}</span>
									{label}
								</button>
							</li>
						);
					})}
				</ol>
			</div>

			{/* Actions */}
			<div className="flex flex-col gap-xs pt-md border-t border-border mt-auto">
				<Button variant="primary" onClick={handleOpenInSheet}>
					Open in Sheet
				</Button>
				<Button onClick={handleExport}>Export JSON</Button>
				<Button variant="danger" onClick={handleStartOver}>
					Start Over
				</Button>
			</div>
		</aside>
	);
}
