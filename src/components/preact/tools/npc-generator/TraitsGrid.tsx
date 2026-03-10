import { useCallback } from "preact/hooks";
import type { TraitDef } from "./constants";

interface TraitsGridProps {
	activeTraits: Array<{ id: string; param?: string | number }>;
	traitsData: TraitDef[];
	onChange: (traits: Array<{ id: string; param?: string | number }>) => void;
}

export function TraitsGrid({ activeTraits, traitsData, onChange }: TraitsGridProps) {
	const isActive = useCallback((traitId: string) => activeTraits.some((t) => t.id === traitId), [activeTraits]);

	const getParam = useCallback(
		(traitId: string): string | number | undefined => {
			const match = activeTraits.find((t) => t.id === traitId);
			return match?.param;
		},
		[activeTraits],
	);

	const toggleTrait = useCallback(
		(traitId: string, checked: boolean) => {
			if (checked) {
				onChange([...activeTraits, { id: traitId }]);
			} else {
				onChange(activeTraits.filter((t) => t.id !== traitId));
			}
		},
		[activeTraits, onChange],
	);

	const updateParam = useCallback(
		(traitId: string, rawValue: string) => {
			const updated = activeTraits.map((t) => {
				if (t.id !== traitId) return t;
				const trimmed = rawValue.trim();
				if (!trimmed) return { id: t.id };
				const numVal = Number(trimmed);
				return { id: t.id, param: Number.isNaN(numVal) ? trimmed : numVal };
			});
			onChange(updated);
		},
		[activeTraits, onChange],
	);

	return (
		<div class="input-section">
			<h2 class="section-title">Traits</h2>
			<div class="traits-grid">
				{traitsData.map((trait) => {
					const active = isActive(trait.id);
					const paramValue = getParam(trait.id);
					return (
						<div class={`trait-item${active ? " active" : ""}`} key={trait.id}>
							<input
								type="checkbox"
								id={`trait-${trait.id}`}
								checked={active}
								onChange={(e) => toggleTrait(trait.id, (e.target as HTMLInputElement).checked)}
							/>
							<label class="trait-label" htmlFor={`trait-${trait.id}`}>
								{trait.name}
							</label>
							{trait.parameterized && (
								<input
									type="text"
									class={
										trait.paramType === "caster" || trait.paramType === "resource"
											? "trait-param trait-param-wide"
											: "trait-param"
									}
									placeholder={trait.paramLabel || "X"}
									disabled={!active}
									value={paramValue != null ? String(paramValue) : ""}
									onInput={(e) => updateParam(trait.id, (e.target as HTMLInputElement).value)}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
