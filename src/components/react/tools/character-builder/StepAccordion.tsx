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
import { useBuilderStore } from "./store";

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
	const meta = useBuilderStore.getState().meta;
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
	const active = useBuilderStore((s) => s.currentStep);
	const meta = useBuilderStore((s) => s.meta);
	const setCurrentStep = useBuilderStore((s) => s.setCurrentStep);

	return (
		<div className="overflow-hidden rounded-md border border-border">
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
					<div className="border-border border-b last:border-b-0" key={stepNum}>
						<button
							aria-expanded={isOpen}
							className="flex w-full cursor-pointer items-center gap-md border-none bg-surface px-lg py-md text-left font-semibold text-base text-text-primary transition-colors duration-150 hover:bg-surface-raised"
							onClick={() => {
								setCurrentStep(isOpen ? 0 : stepNum);
							}}
							type="button"
						>
							<span className={stepNumCls}>{stepNum}</span>
							<span className="flex-1">{label}</span>
							{isDone && summary && (
								<span className="font-normal text-[0.85rem] text-text-muted">{summary}</span>
							)}
							<span>{isOpen ? "▾" : "▸"}</span>
						</button>
						{isOpen && (
							<div className="border-border border-t bg-bg p-lg">
								<StepComponent />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
