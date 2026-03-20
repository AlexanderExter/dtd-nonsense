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
		<div className="overflow-x-auto">
			<table className="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
				<thead>
					<tr>
						<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
							Metric
						</th>
						<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
							Formula
						</th>
					</tr>
				</thead>
				<tbody>
					{filtered.map((f) => (
						<tr className="even:bg-stripe hover:bg-surface" key={f.metric}>
							<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
								<strong>
									<Highlight text={f.metric} words={searchWords} />
								</strong>
							</td>
							<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
								<span className="font-mono text-[0.88rem] text-accent">
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
