import { Highlight } from "./Highlight";
import { QREF_DATA } from "./qref-data";

interface MagicSchoolsSectionProps {
	searchWords: string[];
}

export function MagicSchoolsSection({ searchWords }: MagicSchoolsSectionProps) {
	const filtered = QREF_DATA.magicSchools.filter((m) => {
		if (searchWords.length === 0) return true;
		const text = `${m.school} ${m.char} ${m.theme}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	return (
		<>
			<div class="table-wrap">
				<table class="qref-table">
					<thead>
						<tr>
							<th>School</th>
							<th>Characteristic</th>
							<th>Theme</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((m) => (
							<tr key={m.school}>
								<td>
									<strong>
										<Highlight text={m.school} words={searchWords} />
									</strong>
								</td>
								<td>
									<Highlight text={m.char} words={searchWords} />
								</td>
								<td>
									<Highlight text={m.theme} words={searchWords} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div class="casting-modes">
				<div class="casting-mode">
					<h4>Fettered</h4>
					<p>Halve rolled dice. No Psychic Phenomena risk.</p>
				</div>
				<div class="casting-mode">
					<h4>Unfettered</h4>
					<p>Full dice. If keeping exploded 10s, roll Psychic Phenomena.</p>
				</div>
				<div class="casting-mode">
					<h4>Push</h4>
					<p>+1 to +3 school rating (Sanctioned) or +4 (Unsanctioned). Forced Phenomena roll.</p>
				</div>
			</div>
		</>
	);
}
