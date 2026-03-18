import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
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

	const packages = data.equipment.packages as any[];
	const preview = selectedPkg;

	const selectPackage = (pkg: any) => {
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
		const items = (pkg.items || []).map((item: any, idx: number) => {
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
			<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm mb-md">
				{packages.map((pkg: any) => {
					const id = pkg.id || pkg.name;
					const previewItems = (pkg.items || [])
						.slice(0, 3)
						.map((i: any) => i.name || i)
						.join(", ");

					return (
						<SelectionCard
							key={id}
							title={pkg.name}
							subtitle={pkg.description?.slice(0, 40)}
							preview={previewItems}
							selected={meta.equipmentPkg === id}
							onClick={() => {
								setSelectedPkg(pkg);
							}}
						/>
					);
				})}
			</div>

			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					{preview.description && <p>{preview.description}</p>}

					<ul className="list-none p-0 m-0">
						{(preview.items || []).map((item: any, idx: number) => (
							<li
								// biome-ignore lint/suspicious/noArrayIndexKey: items may share names, position is stable identity
								key={`${item.name || "item"}-${idx}`}
								className="py-xs border-b border-border text-[0.9rem] last:border-b-0"
							>
								{item.choice && item.options?.length > 0 ? (
									<span>
										<label>
											{item.name || "Choose"}:{" "}
											<select
												value={meta.equipmentChoices[idx] || item.options[0]}
												onChange={(e) =>
													handleChoice(idx, (e.target as HTMLSelectElement).value)
												}
											>
												{item.options.map((opt: string) => (
													<option key={opt} value={opt}>
														{opt}
													</option>
												))}
											</select>
										</label>
									</span>
								) : (
									<span>{item.name || item}</span>
								)}
							</li>
						))}
					</ul>

					<div className="mt-md flex gap-sm">
						<Button variant="primary" onClick={() => selectPackage(preview)}>
							{meta.equipmentPkg === (preview.id || preview.name) ? "Selected ✓" : "Select Package"}
						</Button>
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
