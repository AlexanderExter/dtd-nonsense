import { signal } from "@preact/signals";
import { charSignal, gameData, updateChar, updateMeta } from "../CharacterBuilderApp";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";

const selectedPreview = signal<any>(null);

export function ExaltationStep() {
	const data = gameData.value;
	if (!data?.exaltations?.exaltations) return <p>Loading exaltation data…</p>;

	const exaltations = data.exaltations.exaltations as any[];
	const currentExalt = charSignal.value.exaltation;
	const preview = selectedPreview.value;

	const selectExaltation = (ex: any) => {
		updateChar((c) => {
			c.exaltation = ex.id || ex.name;
			c.powerStat = 1;
		});
		updateMeta((m) => {
			m.stepsCompleted[2] = true;
		});
		selectedPreview.value = ex;
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
			<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm mb-md">
				{exaltations.map((ex: any) => (
					<SelectionCard
						key={ex.id || ex.name}
						title={ex.name}
						preview={ex.theme || ex.description?.slice(0, 60)}
						selected={currentExalt === (ex.id || ex.name)}
						onClick={() => {
							selectedPreview.value = ex;
						}}
					/>
				))}
			</div>

			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					{preview.description && <p>{preview.description}</p>}

					{preview.staticPowers?.length > 0 && (
						<div>
							<strong>Static Powers:</strong>
							<ul>
								{preview.staticPowers.map((p: any, i: number) => (
									<li key={i}>
										{typeof p === "string" ? (
											p
										) : (
											<>
												<strong>{p.name}:</strong> {p.effect}
											</>
										)}
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
										<th>Level</th>
										<th>Benefit</th>
									</tr>
								</thead>
								<tbody>
									{preview.progression.map((row: any, i: number) => (
										<tr key={i}>
											<td>{row.level ?? i + 1}</td>
											<td>{row.benefit || row.effect || row.name}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					<div class="mt-md flex gap-sm">
						{currentExalt === (preview.id || preview.name) ? (
							<button type="button" class="btn btn-danger" onClick={removeExaltation}>
								Remove
							</button>
						) : (
							<button type="button" class="btn btn-primary" onClick={() => selectExaltation(preview)}>
								Select
							</button>
						)}
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
