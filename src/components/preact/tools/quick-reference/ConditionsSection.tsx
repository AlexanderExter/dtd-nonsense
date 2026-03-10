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
		<div class="table-wrap">
			<table class="qref-table">
				<thead>
					<tr>
						<th>Condition</th>
						<th>Effect</th>
						<th>Duration</th>
					</tr>
				</thead>
				<tbody>
					{filtered.map((c) => (
						<tr key={c.name}>
							<td>
								<strong>
									<Highlight text={c.name} words={searchWords} />
								</strong>
							</td>
							<td>
								<Highlight text={c.effect} words={searchWords} />
							</td>
							<td>
								<Highlight text={c.duration} words={searchWords} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
