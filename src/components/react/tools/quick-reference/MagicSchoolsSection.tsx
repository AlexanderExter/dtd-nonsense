import { Highlight } from "./Highlight";
import type { QRefWarpEntry } from "./qref-data";
import { QREF_DATA } from "./qref-data";

interface MagicSchoolsSectionProps {
	searchWords: string[];
}

function WarpTable({ title, entries }: { title: string; entries: readonly QRefWarpEntry[] }) {
	return (
		<details className="mt-md overflow-hidden rounded-md border border-border">
			<summary className="cursor-pointer select-none bg-surface px-md py-sm font-semibold text-[0.9rem] text-accent hover:bg-surface-highlight">
				{title}
			</summary>
			<div className="max-h-[400px] overflow-x-auto overflow-y-auto">
				<table className="w-full border-collapse text-[0.82rem]">
					<thead className="sticky top-0">
						<tr>
							<th className="w-[70px] border-border border-b bg-surface px-md py-xs text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px]">
								Roll
							</th>
							<th className="w-[160px] border-border border-b bg-surface px-md py-xs text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px]">
								Effect
							</th>
							<th className="border-border border-b bg-surface px-md py-xs text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px]">
								Description
							</th>
						</tr>
					</thead>
					<tbody>
						{entries.map((e) => (
							<tr className="even:bg-stripe hover:bg-surface" key={e.roll}>
								<td className="border-border border-b px-md py-xs font-mono text-[0.8rem]">{e.roll}</td>
								<td className="border-border border-b px-md py-xs font-semibold text-accent">
									{e.name}
								</td>
								<td className="border-border border-b px-md py-xs text-text-muted">{e.effect}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</details>
	);
}

export function MagicSchoolsSection({ searchWords }: MagicSchoolsSectionProps) {
	const filtered = QREF_DATA.magicSchools.filter((m) => {
		if (searchWords.length === 0) return true;
		const text = `${m.school} ${m.char} ${m.theme}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	return (
		<>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
					<thead>
						<tr>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								School
							</th>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Characteristic
							</th>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Theme
							</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((m) => (
							<tr className="even:bg-stripe hover:bg-surface" key={m.school}>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<strong>
										<Highlight text={m.school} words={searchWords} />
									</strong>
								</td>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={m.char} words={searchWords} />
								</td>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={m.theme} words={searchWords} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="mt-md grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-md max-[600px]:grid-cols-1">
				<div className="rounded-sm border border-border bg-surface p-md">
					<h4 className="m-0 mb-xs text-[0.9rem] text-accent">Fettered</h4>
					<p className="m-0 text-[0.85rem] text-text-muted">Halve rolled dice. No Psychic Phenomena risk.</p>
				</div>
				<div className="rounded-sm border border-border bg-surface p-md">
					<h4 className="m-0 mb-xs text-[0.9rem] text-accent">Unfettered</h4>
					<p className="m-0 text-[0.85rem] text-text-muted">
						Full dice. If keeping exploded 10s, roll Psychic Phenomena.
					</p>
				</div>
				<div className="rounded-sm border border-border bg-surface p-md">
					<h4 className="m-0 mb-xs text-[0.9rem] text-accent">Push</h4>
					<p className="m-0 text-[0.85rem] text-text-muted">
						+1 to +3 school rating (Sanctioned) or +4 (Unsanctioned). Forced Phenomena roll.
					</p>
				</div>
			</div>
			<WarpTable entries={QREF_DATA.psychicPhenomena} title="Psychic Phenomena (1d100)" />
			<WarpTable entries={QREF_DATA.perilsOfTheWarp} title="Perils of the Warp (1d100)" />
		</>
	);
}
