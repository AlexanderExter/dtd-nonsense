import { useCallback } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameInput } from "@/components/react/ui/GameInput";

interface FeatListProps {
	featNames?: string[];
	feats: string[];
	onChange: (feats: string[]) => void;
}

export function FeatList({ feats, onChange, featNames }: FeatListProps) {
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
		<div className="mb-lg border-border border-b pb-md last:border-b-0">
			{featNames && featNames.length > 0 && (
				<datalist id="dl-feat-names">
					{featNames.map((n) => (
						<option key={n} value={n} />
					))}
				</datalist>
			)}
			<div className="mb-sm flex items-center justify-between">
				<h2 className="m-0 text-[0.9rem] text-accent uppercase tracking-[0.5px]">Feats</h2>
				<Button onClick={() => addFeat()} size="sm" variant="ghost">
					+ Add
				</Button>
			</div>
			<div className="flex flex-col gap-xs">
				{feats.map((feat, i) => (
					<div
						className="flex items-center gap-sm rounded-sm border border-border bg-surface px-sm py-xs"
						// biome-ignore lint/suspicious/noArrayIndexKey: editable list identified by position
						key={`feat-${i}`}
					>
						<GameInput
							className="min-w-0 flex-1"
							list={featNames && featNames.length > 0 ? "dl-feat-names" : undefined}
							onInput={(e) => updateFeat(i, (e.target as HTMLInputElement).value)}
							placeholder="Feat name"
							value={feat}
						/>
						<button
							className="cursor-pointer border-none bg-transparent px-[4px] py-[2px] text-base text-text-dim leading-none hover:text-error"
							onClick={() => removeFeat(i)}
							title="Remove"
							type="button"
						>
							×
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
