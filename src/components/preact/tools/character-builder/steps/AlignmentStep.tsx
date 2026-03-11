import { signal } from "@preact/signals";
import { Button } from "@/components/preact/ui";
import { charSignal, gameData, updateChar, updateMeta } from "../CharacterBuilderApp";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";

const pantheonFilter = signal<string>("all");
const selectedPreview = signal<any>(null);

export function AlignmentStep() {
	const data = gameData.value;
	if (!data?.alignments?.alignments) return <p>Loading alignment data…</p>;

	const alignments = data.alignments.alignments as any[];
	const char = charSignal.value;
	const preview = selectedPreview.value;

	// Unique pantheons for filter
	const pantheons = [...new Set(alignments.map((a: any) => a.pantheon).filter(Boolean))];

	const filtered =
		pantheonFilter.value === "all"
			? alignments
			: alignments.filter((a: any) => a.pantheon === pantheonFilter.value);

	const selectAlignment = (al: any) => {
		updateChar((c) => {
			c.alignment = al.id || al.name;
			c.devotion = 6;
		});
		updateMeta((m) => {
			m.stepsCompleted[6] = true;
		});
		selectedPreview.value = al;
	};

	return (
		<div>
			<div class="flex items-center gap-sm flex-wrap px-md py-sm bg-surface rounded-sm mb-md">
				<label class="text-[0.85rem] text-text-dim m-0">
					Pantheon:{" "}
					<select
						class="px-sm py-xs text-[0.85rem] max-w-[200px]"
						value={pantheonFilter.value}
						onChange={(e) => {
							pantheonFilter.value = (e.target as HTMLSelectElement).value;
						}}
					>
						<option value="all">All</option>
						{pantheons.map((p) => (
							<option key={p} value={p}>
								{p}
							</option>
						))}
					</select>
				</label>
			</div>

			<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm mb-md">
				{filtered.map((al: any) => (
					<SelectionCard
						key={al.id || al.name}
						title={al.name}
						subtitle={al.pantheon}
						preview={al.description?.slice(0, 80)}
						selected={char.alignment === (al.id || al.name)}
						onClick={() => {
							selectedPreview.value = al;
						}}
					/>
				))}
			</div>

			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					{preview.pantheon && (
						<p>
							<strong>Pantheon:</strong> {preview.pantheon}
						</p>
					)}
					{preview.description && <p>{preview.description}</p>}

					{preview.commandments?.length > 0 && (
						<div>
							<strong>Commandments:</strong>
							<ul>
								{preview.commandments.map((cmd: string, i: number) => (
									<li key={i}>{cmd}</li>
								))}
							</ul>
						</div>
					)}

					{preview.restriction && (
						<p>
							<strong>Restriction:</strong> {preview.restriction}
						</p>
					)}

					{preview.sins?.length > 0 && (
						<div>
							<strong>Sins:</strong>
							<table>
								<thead>
									<tr>
										<th>Devotion</th>
										<th>Sin</th>
									</tr>
								</thead>
								<tbody>
									{preview.sins.map((s: any, i: number) => (
										<tr key={i}>
											<td>{s.devotion}</td>
											<td>{s.sin}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					<p>
						<strong>Starting Devotion:</strong> 6
					</p>

					<div class="mt-md flex gap-sm">
						<Button variant="primary" onClick={() => selectAlignment(preview)}>
							{char.alignment === (preview.id || preview.name) ? "Selected ✓" : "Select"}
						</Button>
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
