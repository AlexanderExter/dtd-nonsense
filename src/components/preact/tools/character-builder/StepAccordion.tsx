import { currentStep, metaSignal } from "./CharacterBuilderApp";
import { STEP_LABELS } from "./constants";
import { AlignmentStep } from "./steps/AlignmentStep";
import { BackgroundsStep } from "./steps/BackgroundsStep";
import { CharacteristicsStep } from "./steps/CharacteristicsStep";
import { ClassesStep } from "./steps/ClassesStep";
import { EquipmentStep } from "./steps/EquipmentStep";
import { ExaltationStep } from "./steps/ExaltationStep";
import { FeatsStep } from "./steps/FeatsStep";
import { IdentityStep } from "./steps/IdentityStep";
import { RaceStep } from "./steps/RaceStep";
import { ReviewStep } from "./steps/ReviewStep";
import { SkillsStep } from "./steps/SkillsStep";

const STEP_COMPONENTS = [
	IdentityStep,
	RaceStep,
	ExaltationStep,
	CharacteristicsStep,
	SkillsStep,
	BackgroundsStep,
	AlignmentStep,
	ClassesStep,
	FeatsStep,
	EquipmentStep,
	ReviewStep,
];

function stepSummary(index: number): string {
	const meta = metaSignal.value;
	if (!meta.stepsCompleted[index]) return "";

	// Provide brief summaries for completed steps
	switch (index) {
		case 0:
			return ""; // Identity — name shown elsewhere
		case 1:
			return ""; // Race — shown in sidebar
		case 2:
			return ""; // Exaltation — shown in sidebar
		default:
			return "✓";
	}
}

export function StepAccordion() {
	const active = currentStep.value;
	const meta = metaSignal.value;

	return (
		<div class="border border-border rounded-md overflow-hidden">
			{STEP_LABELS.map((label, i) => {
				const stepNum = i + 1;
				const isOpen = active === stepNum;
				const isDone = meta.stepsCompleted[i];
				const StepComponent = STEP_COMPONENTS[i];
				const summary = stepSummary(i);

				const stepNumCls = [
					"inline-flex items-center justify-center w-[1.6rem] h-[1.6rem] rounded-full text-[0.8rem] font-bold shrink-0",
					isOpen ? "bg-accent text-bg" : isDone ? "bg-success text-bg" : "bg-accent-dim text-text-primary",
				].join(" ");

				return (
					<div key={stepNum} class="border-b border-border last:border-b-0">
						<button
							type="button"
							class="flex items-center gap-md w-full px-lg py-md bg-surface border-none text-text-primary text-base font-semibold text-left cursor-pointer transition-colors duration-150 hover:bg-surface-raised"
							onClick={() => {
								currentStep.value = isOpen ? 0 : stepNum;
							}}
							aria-expanded={isOpen}
						>
							<span class={stepNumCls}>{stepNum}</span>
							<span class="flex-1">{label}</span>
							{isDone && summary && (
								<span class="font-normal text-[0.85rem] text-text-muted">{summary}</span>
							)}
							<span>{isOpen ? "▾" : "▸"}</span>
						</button>
						{isOpen && (
							<div class="p-lg bg-bg border-t border-border">
								<StepComponent />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
