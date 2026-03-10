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
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
				<thead>
					<tr>
						<th class="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
							Condition
						</th>
						<th class="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
							Effect
						</th>
						<th class="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
							Duration
						</th>
					</tr>
				</thead>
				<tbody>
					{filtered.map((c) => (
						<tr key={c.name} class="even:bg-stripe hover:bg-surface">
							<td class="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
								<strong>
									<Highlight text={c.name} words={searchWords} />
								</strong>
							</td>
							<td class="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
								<Highlight text={c.effect} words={searchWords} />
							</td>
							<td class="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
								<Highlight text={c.duration} words={searchWords} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
