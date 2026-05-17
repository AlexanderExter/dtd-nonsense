import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";
import { useBuilderStore } from "../store";

export function AlignmentStep() {
	const [pantheonFilter, setPantheonFilter] = useState("all");
	const [selectedPreview, setSelectedPreview] = useState<any>(null);

	const data = useBuilderStore((s) => s.gameData);
	const char = useBuilderStore((s) => s.char);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	if (!data?.alignments?.alignments) return <p>Loading alignment data…</p>;

	const alignments = data.alignments.alignments;
	const preview = selectedPreview;

	// Unique pantheons for filter
	const pantheons = [...new Set(alignments.map((a) => a.pantheon).filter(Boolean))];

	const filtered = pantheonFilter === "all" ? alignments : alignments.filter((a) => a.pantheon === pantheonFilter);

	const selectAlignment = (al) => {
		updateChar((c) => {
			c.alignment = al.id || al.name;
			c.devotion = 6;
		});
		updateMeta((m) => {
			m.stepsCompleted[6] = true;
		});
		setSelectedPreview(al);
	};

	return (
		<div>
			<div className="mb-md flex flex-wrap items-center gap-sm rounded-sm bg-surface px-md py-sm">
				<label className="m-0 text-sm text-text-dim">
					Pantheon:{" "}
					<GameSelect
						onChange={(e) => {
							setPantheonFilter((e.target as HTMLSelectElement).value);
						}}
						value={pantheonFilter}
					>
						<option value="all">All</option>
						{pantheons.map((p) => (
							<option key={p} value={p}>
								{p}
							</option>
						))}
					</GameSelect>
				</label>
			</div>

			<div className="mb-md grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
				{filtered.map((al) => (
					<SelectionCard
						key={al.id || al.name}
						onClick={() => {
							setSelectedPreview(al);
						}}
						preview={al.description?.slice(0, 80)}
						selected={char.alignment === (al.id || al.name)}
						subtitle={al.pantheon}
						title={al.name}
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
								{preview.commandments.map((cmd: string) => (
									<li key={cmd}>{cmd}</li>
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
									{preview.sins.map((s) => (
										<tr key={`${s.devotion}-${s.sin}`}>
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

					<div className="mt-md flex gap-sm">
						<Button onClick={() => selectAlignment(preview)} variant="primary">
							{char.alignment === (preview.id || preview.name) ? "Selected ✓" : "Select"}
						</Button>
					</div>
				</DetailPanel>
			)}
		</div>
	);
}
