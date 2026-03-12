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
						<th className="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
							Metric
						</th>
						<th className="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
							Formula
						</th>
					</tr>
				</thead>
				<tbody>
					{filtered.map((f) => (
						<tr key={f.metric} className="even:bg-stripe hover:bg-surface">
							<td className="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
								<strong>
									<Highlight text={f.metric} words={searchWords} />
								</strong>
							</td>
							<td className="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
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
