import { useCallback } from "preact/hooks";
import { Button } from "@/components/preact/ui";

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
		<div class="mb-lg pb-md border-b border-border last:border-b-0">
			<div class="flex items-center justify-between mb-sm">
				<h2 class="text-[0.9rem] uppercase tracking-[0.5px] text-accent m-0">Feats</h2>
				<Button variant="ghost" size="sm" onClick={() => addFeat()}>
					+ Add
				</Button>
			</div>
			<div class="flex flex-col gap-xs">
				{feats.map((feat, i) => (
					<div
						class="flex items-center gap-sm px-sm py-xs bg-surface border border-border rounded-sm"
						key={i}
					>
						<input
							type="text"
							class="flex-1 min-w-0 py-[2px] px-xs text-[0.85rem]"
							value={feat}
							placeholder="Feat name"
							onInput={(e) => updateFeat(i, (e.target as HTMLInputElement).value)}
						/>
						<button
							type="button"
							class="bg-transparent border-none text-text-dim cursor-pointer px-[4px] py-[2px] text-base leading-none hover:text-error"
							title="Remove"
							onClick={() => removeFeat(i)}
						>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
