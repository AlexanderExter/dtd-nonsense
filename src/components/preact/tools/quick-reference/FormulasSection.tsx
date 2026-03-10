import { Highlight } from "./Highlight";
import { QREF_DATA } from "./qref-data";

interface FormulasSectionProps {
	searchWords: string[];
}

export function FormulasSection({ searchWords }: FormulasSectionProps) {
	const filtered = QREF_DATA.formulas.filter((f) => {
		if (searchWords.length === 0) return true;
		const text = `${f.metric} ${f.formula}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	return (
		<div class="table-wrap">
			<table class="qref-table">
				<thead>
					<tr>
						<th>Metric</th>
						<th>Formula</th>
					</tr>
				</thead>
				<tbody>
					{filtered.map((f) => (
						<tr key={f.metric}>
							<td>
								<strong>
									<Highlight text={f.metric} words={searchWords} />
								</strong>
							</td>
							<td>
								<span class="formula">
									<Highlight text={f.formula} words={searchWords} />
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
