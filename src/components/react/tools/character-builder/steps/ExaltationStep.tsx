import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";
import { useBuilderStore } from "../store";

export function ExaltationStep() {
	const [selectedPreview, setSelectedPreview] = useState<any>(null);

	const data = useBuilderStore((s) => s.gameData);
	const char = useBuilderStore((s) => s.char);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	if (!data?.exaltations?.exaltations) return <p>Loading exaltation data…</p>;

	const exaltations = data.exaltations.exaltations;
	const currentExalt = char.exaltation;
	const preview = selectedPreview;

	const selectExaltation = (ex) => {
		updateChar((c) => {
			c.exaltation = ex.id || ex.name;
			c.powerStat = 1;
		});
		updateMeta((m) => {
			m.stepsCompleted[2] = true;
		});
		setSelectedPreview(ex);
	};

	const removeExaltation = () => {
		updateChar((c) => {
			c.exaltation = "";
			c.powerStat = 1;
		});
		updateMeta((m) => {
			m.stepsCompleted[2] = false;
		});
	};

	return (
		<div>
			<div className="mb-md grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
				{exaltations.map((ex) => (
					<SelectionCard
						key={ex.id || ex.name}
						onClick={() => {
							setSelectedPreview(ex);
						}}
						preview={ex.theme || ex.description?.slice(0, 60)}
						selected={currentExalt === (ex.id || ex.name)}
						title={ex.name}
					/>
				))}
			</div>

			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					{preview.description && <p>{preview.description}</p>}

					{preview.tell && (
						<p className="text-sm text-text-muted italic">
							<strong>Tell:</strong> {preview.tell}
						</p>
					)}

					{preview.powerStat?.name && (
						<p>
							<strong>Power Stat:</strong> {preview.powerStat.name}
							{preview.powerStat.description && ` — ${preview.powerStat.description}`}
						</p>
					)}

					{preview.resourceStat?.name && (
						<p>
							<strong>Resource:</strong> {preview.resourceStat.name}
							{preview.resourceStat.formula && ` (${preview.resourceStat.formula})`}
							{preview.resourceStat.recovery && ` — Recovery: ${preview.resourceStat.recovery}`}
						</p>
					)}

					{preview.staticPowers?.length > 0 && (
						<div>
							<strong>Static Powers:</strong>
							<ul>
								{preview.staticPowers.map((p) => (
									<li key={typeof p === "string" ? p : p.name}>
										<strong>{p.name}:</strong> {p.description}
									</li>
								))}
							</ul>
						</div>
					)}

					{preview.progression?.length > 0 && (
						<div>
							<strong>Progression:</strong>
							<table>
								<thead>
									<tr>
										<th>Dots</th>
										<th>Name</th>
										<th>Effect</th>
									</tr>
								</thead>
								<tbody>
									{preview.progression.map((row, i: number) => (
										<tr key={`${row.dots ?? i}-${row.name}`}>
											<td>{row.dots ?? i + 1}</td>
											<td>{row.name}</td>
											<td>{row.description}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					<div className="mt-md flex gap-sm">
						{currentExalt === (preview.id || preview.name) ? (
							<Button onClick={removeExaltation} variant="danger">
								Remove
							</Button>
						) : (
							<Button onClick={() => selectExaltation(preview)} variant="primary">
								Select
							</Button>
						)}
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
