import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";
import { useBuilderStore } from "../store";

export function EquipmentStep() {
	const [selectedPkg, setSelectedPkg] = useState<any>(null);

	const data = useBuilderStore((s) => s.gameData);
	const meta = useBuilderStore((s) => s.meta);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	if (!data?.equipment?.packages) return <p>Loading equipment data…</p>;

	const packages = data.equipment.packages;
	const preview = selectedPkg;

	const selectPackage = (pkg) => {
		const pkgId = pkg.id || pkg.name;
		updateMeta((m) => {
			m.equipmentPkg = pkgId;
			m.equipmentChoices = {};
			m.stepsCompleted[9] = true;
		});
		resolveEquipment(pkg, {});
		setSelectedPkg(pkg);
	};

	const handleChoice = (itemIndex: number, choice: string) => {
		updateMeta((m) => {
			m.equipmentChoices[itemIndex] = choice;
		});
		if (preview) {
			resolveEquipment(preview, {
				...meta.equipmentChoices,
				[itemIndex]: choice,
			});
		}
	};

	const resolveEquipment = (pkg: any, choices: Record<number, string>) => {
		const items = (pkg.items || []).map((item, idx: number) => {
			if (item.choice && item.options?.length > 0) {
				return choices[idx] || item.options[0];
			}
			return item.name || item;
		});
		updateChar((c) => {
			c.equipment = items.join(", ");
		});
	};

	return (
		<div>
			<div className="mb-md grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
				{packages.map((pkg) => {
					const id = pkg.id || pkg.name;
					const previewItems = (pkg.items || [])
						.slice(0, 3)
						.map((i) => i.name || i)
						.join(", ");

					return (
						<SelectionCard
							key={id}
							onClick={() => {
								setSelectedPkg(pkg);
							}}
							preview={previewItems}
							selected={meta.equipmentPkg === id}
							subtitle={pkg.description?.slice(0, 40)}
							title={pkg.name}
						/>
					);
				})}
			</div>

			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					{preview.description && <p>{preview.description}</p>}

					<ul className="m-0 list-none p-0">
						{(preview.items || []).map((item, idx: number) => (
							<li
								className="border-border border-b py-xs text-sm last:border-b-0"
								// biome-ignore lint/suspicious/noArrayIndexKey: items may share names, position is stable identity
								key={`${item.name || "item"}-${idx}`}
							>
								{item.choice && item.options?.length > 0 ? (
									<span>
										<label>
											{item.name || "Choose"}:{" "}
											<GameSelect
												onChange={(e) =>
													handleChoice(idx, (e.target as HTMLSelectElement).value)
												}
												value={meta.equipmentChoices[idx] || item.options[0]}
											>
												{item.options.map((opt: string) => (
													<option key={opt} value={opt}>
														{opt}
													</option>
												))}
											</GameSelect>
										</label>
									</span>
								) : (
									<span>{item.name || item}</span>
								)}
							</li>
						))}
					</ul>

					<div className="mt-md flex gap-sm">
						<Button onClick={() => selectPackage(preview)} variant="primary">
							{meta.equipmentPkg === (preview.id || preview.name) ? "Selected ✓" : "Select Package"}
						</Button>
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
