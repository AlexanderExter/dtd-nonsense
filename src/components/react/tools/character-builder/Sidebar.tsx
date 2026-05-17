import { Button } from "@/components/react/ui/Button";
import { character } from "@/lib/dtd/character";
import { derived } from "@/lib/dtd/derived";
import { cn } from "@/lib/utils";
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
		<aside className="sticky top-md flex max-h-[calc(100vh-2*var(--space-md))] flex-col gap-md overflow-y-auto rounded-md border border-border bg-surface p-md max-tool-lg:static max-tool-lg:max-h-none">
			{/* Character identity */}
			<div className="border-border border-b pb-md text-center">
				<h2 className="mb-xs break-words font-bold text-[1.15rem] text-accent">
					{char.name || "New Character"}
				</h2>
				<div className="flex flex-wrap justify-center gap-xs">
					{char.race && (
						<span className="inline-block rounded-sm border border-accent-dim bg-surface-raised px-2 py-0.5 text-accent text-xs">
							{char.race}
						</span>
					)}
					{char.exaltation && (
						<span className="inline-block rounded-sm border border-accent-dim bg-surface-raised px-2 py-0.5 text-accent text-xs">
							{char.exaltation}
						</span>
					)}
				</div>
			</div>

			{/* Derived Stats */}
			<div>
				<h3 className="mb-sm text-text-dim text-xs uppercase tracking-[0.06em]">Derived Stats</h3>
				<div className="grid grid-cols-2 gap-x-sm gap-y-0.5 text-sm">
					<span className="text-text-muted">SD</span>
					<span className="text-right font-semibold text-text-primary tabular-nums">{sd}</span>
					<span className="text-text-muted">HP</span>
					<span className="text-right font-semibold text-text-primary tabular-nums">{hp}</span>
					<span className="text-text-muted">MD</span>
					<span className="text-right font-semibold text-text-primary tabular-nums">{md}</span>
					<span className="text-text-muted">Resolve</span>
					<span className="text-right font-semibold text-text-primary tabular-nums">{resolve}</span>
					<span className="text-text-muted">Speed</span>
					<span className="text-right font-semibold text-text-primary tabular-nums">{speed}</span>
					<span className="text-text-muted">Resilience</span>
					<span className="text-right font-semibold text-text-primary tabular-nums">{resilience}</span>
					<span className="text-text-muted">Initiative</span>
					<span className="text-right font-semibold text-text-primary tabular-nums">{initiative}</span>
				</div>
			</div>

			{/* XP Budget */}
			<div>
				<h3 className="mb-sm text-text-dim text-xs uppercase tracking-[0.06em]">XP Budget</h3>
				<div className={cn("mb-sm text-center text-text-muted text-xs", xp.remaining < 0 && "text-error")}>
					<strong className={xp.remaining < 0 ? "text-error" : "text-accent"}>{xp.remaining}</strong> /{" "}
					{TOTAL_XP} remaining
				</div>
				<div className="text-text-dim text-xs">
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
				<h3 className="mb-sm text-text-dim text-xs uppercase tracking-[0.06em]">Steps</h3>
				<ol className="m-0 list-none p-0 text-xs">
					{STEP_LABELS.map((label, i) => {
						const isDone = meta.stepsCompleted[i];
						const isActive = currentStep === i + 1;
						return (
							<li key={label}>
								<button
									className={[
										"flex w-full cursor-pointer items-center gap-xs border-none bg-transparent p-0 py-2xs text-left text-xs hover:text-text-primary",
										isActive
											? "font-semibold text-accent"
											: isDone
												? "text-success"
												: "text-text-dim",
									].join(" ")}
									onClick={() => {
										setCurrentStep(i + 1);
									}}
									type="button"
								>
									<span className="w-[14px] shrink-0 text-center">{isDone ? "✓" : i + 1}</span>
									{label}
								</button>
							</li>
						);
					})}
				</ol>
			</div>

			{/* Actions */}
			<div className="mt-auto flex flex-col gap-xs border-border border-t pt-md">
				<Button onClick={handleOpenInSheet} variant="primary">
					Open in Sheet
				</Button>
				<Button onClick={handleExport}>Export JSON</Button>
				<Button onClick={handleStartOver} variant="danger">
					Start Over
				</Button>
			</div>
		</aside>
	);
}
