import { useCallback } from "preact/hooks";

interface FeatListProps {
	feats: string[];
	onChange: (feats: string[]) => void;
}

export function FeatList({ feats, onChange }: FeatListProps) {
	const addFeat = useCallback(
		(value = "") => {
			onChange([...feats, value]);
		},
		[feats, onChange],
	);

	const removeFeat = useCallback(
		(index: number) => {
			onChange(feats.filter((_, i) => i !== index));
		},
		[feats, onChange],
	);

	const updateFeat = useCallback(
		(index: number, value: string) => {
			const updated = feats.map((f, i) => (i === index ? value : f));
			onChange(updated);
		},
		[feats, onChange],
	);

	return (
		<div class="input-section">
			<div class="section-header">
				<h2 class="section-title">Feats</h2>
				<button type="button" class="btn btn-ghost btn-sm" onClick={() => addFeat()}>
					+ Add
				</button>
			</div>
			<div class="list-entries">
				{feats.map((feat, i) => (
					<div class="list-entry feat-entry" key={i}>
						<input
							type="text"
							class="entry-name"
							value={feat}
							placeholder="Feat name"
							onInput={(e) => updateFeat(i, (e.target as HTMLInputElement).value)}
						/>
						<button type="button" class="entry-remove" title="Remove" onClick={() => removeFeat(i)}>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
