import { signal } from "@preact/signals";
import { gameData, metaSignal, updateChar, updateMeta } from "../CharacterBuilderApp";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";

const selectedPkg = signal<any>(null);

export function EquipmentStep() {
	const data = gameData.value;
	if (!data?.equipment?.packages) return <p>Loading equipment data…</p>;

	const packages = data.equipment.packages as any[];
	const meta = metaSignal.value;
	const preview = selectedPkg.value;

	const selectPackage = (pkg: any) => {
		const pkgId = pkg.id || pkg.name;
		updateMeta((m) => {
			m.equipmentPkg = pkgId;
			m.equipmentChoices = {};
			m.stepsCompleted[9] = true;
		});
		resolveEquipment(pkg, {});
		selectedPkg.value = pkg;
	};

	const handleChoice = (itemIndex: number, choice: string) => {
		updateMeta((m) => {
			m.equipmentChoices[itemIndex] = choice;
		});
		if (preview) {
			resolveEquipment(preview, { ...meta.equipmentChoices, [itemIndex]: choice });
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
		<div class="step-equipment">
			<div class="selection-grid">
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
								selectedPkg.value = pkg;
							}}
						/>
					);
				})}
			</div>

			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					{preview.description && <p>{preview.description}</p>}

					<ul class="equipment-list">
						{(preview.items || []).map((item: any, idx: number) => (
							<li key={idx}>
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

					<div class="detail-actions">
						<button type="button" class="btn btn-primary" onClick={() => selectPackage(preview)}>
							{meta.equipmentPkg === (preview.id || preview.name) ? "Selected ✓" : "Select Package"}
						</button>
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
