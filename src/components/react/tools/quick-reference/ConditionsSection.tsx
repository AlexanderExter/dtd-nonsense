import { Highlight } from "./Highlight";
import { QREF_DATA } from "./qref-data";

interface ConditionsSectionProps {
	searchWords: string[];
}

export function ConditionsSection({ searchWords }: ConditionsSectionProps) {
	const filtered = QREF_DATA.conditions.filter((c) => {
		if (searchWords.length === 0) return true;
		const text = `${c.name} ${c.effect} ${c.duration}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
				<thead>
					<tr>
						<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
							Condition
						</th>
						<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
							Effect
						</th>
						<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
							Duration
						</th>
					</tr>
				</thead>
				<tbody>
					{filtered.map((c) => (
						<tr className="even:bg-stripe hover:bg-surface" key={c.name}>
							<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
								<strong>
									<Highlight text={c.name} words={searchWords} />
								</strong>
							</td>
							<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
								<Highlight text={c.effect} words={searchWords} />
							</td>
							<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
								<Highlight text={c.duration} words={searchWords} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
