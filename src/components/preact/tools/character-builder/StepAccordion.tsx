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
		<div class="step-accordion">
			{STEP_LABELS.map((label, i) => {
				const stepNum = i + 1;
				const isOpen = active === stepNum;
				const isDone = meta.stepsCompleted[i];
				const StepComponent = STEP_COMPONENTS[i];
				const summary = stepSummary(i);

				return (
					<div key={stepNum} class={`accordion-item${isOpen ? " open" : ""}${isDone ? " done" : ""}`}>
						<button
							type="button"
							class="accordion-header"
							onClick={() => {
								currentStep.value = isOpen ? 0 : stepNum;
							}}
							aria-expanded={isOpen}
						>
							<span class="step-number">{stepNum}</span>
							<span class="step-title">{label}</span>
							{isDone && summary && <span class="step-summary">{summary}</span>}
							<span class="accordion-arrow">{isOpen ? "▾" : "▸"}</span>
						</button>
						{isOpen && (
							<div class="accordion-body">
								<StepComponent />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
