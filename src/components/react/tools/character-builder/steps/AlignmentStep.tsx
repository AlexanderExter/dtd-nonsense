import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";
import { useBuilderStore } from "../store";

export function AlignmentStep() {
	const [selectedPreview, setSelectedPreview] = useState<any>(null);

	const data = useBuilderStore((s) => s.gameData);
	const char = useBuilderStore((s) => s.char);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	if (!data?.alignments?.alignments) return <p>Loading alignment data…</p>;

	const alignments = data.alignments.alignments;
	const pantheonMap = data.alignments.pantheons ?? {};
	const preview = selectedPreview;

	const getPantheonName = (key: string) => pantheonMap[key]?.name ?? key;

	// Group alignments by pantheon
	const pantheons = [...new Set(alignments.map((a) => a.pantheon).filter(Boolean))];
	const grouped = pantheons.map((key) => ({
		key,
		name: getPantheonName(key),
		description: pantheonMap[key]?.description ?? "",
		alignments: alignments.filter((a) => a.pantheon === key),
	}));

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
			{grouped.map((group) => (
				<div className="mb-lg" key={group.key}>
					<h3 className="mb-2xs text-accent">{group.name}</h3>
					{group.description && <p className="mb-sm text-text-muted text-xs">{group.description}</p>}
					<div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-sm">
						{group.alignments.map((al) => (
							<SelectionCard
								key={al.id || al.name}
								onClick={() => {
									setSelectedPreview(al);
								}}
								preview={al.description?.slice(0, 80)}
								selected={char.alignment === (al.id || al.name)}
								title={al.name}
							/>
						))}
					</div>
				</div>
			))}

			{preview && (
				<DetailPanel>
					<h3>{preview.name}</h3>
					{preview.pantheon && (
						<p>
							<strong>Pantheon:</strong> {getPantheonName(preview.pantheon)}
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
