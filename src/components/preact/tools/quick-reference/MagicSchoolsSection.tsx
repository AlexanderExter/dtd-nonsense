import { Highlight } from "./Highlight";
import type { QRefWarpEntry } from "./qref-data";
import { QREF_DATA } from "./qref-data";

interface MagicSchoolsSectionProps {
	searchWords: string[];
}

function WarpTable({ title, entries }: { title: string; entries: readonly QRefWarpEntry[] }) {
	return (
		<details class="mt-md border border-border rounded-md overflow-hidden">
			<summary class="px-md py-sm bg-surface cursor-pointer text-accent font-semibold text-[0.9rem] hover:bg-surface-highlight select-none">
				{title}
			</summary>
			<div class="overflow-x-auto max-h-[400px] overflow-y-auto">
				<table class="w-full border-collapse text-[0.82rem]">
					<thead class="sticky top-0">
						<tr>
							<th class="px-md py-xs text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] w-[70px]">
								Roll
							</th>
							<th class="px-md py-xs text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] w-[160px]">
								Effect
							</th>
							<th class="px-md py-xs text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px]">
								Description
							</th>
						</tr>
					</thead>
					<tbody>
						{entries.map((e) => (
							<tr key={e.roll} class="even:bg-stripe hover:bg-surface">
								<td class="px-md py-xs border-b border-border font-mono text-[0.8rem]">{e.roll}</td>
								<td class="px-md py-xs border-b border-border font-semibold text-accent">{e.name}</td>
								<td class="px-md py-xs border-b border-border text-text-muted">{e.effect}</td>
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
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
					<thead>
						<tr>
							<th class="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
								School
							</th>
							<th class="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
								Characteristic
							</th>
							<th class="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
								Theme
							</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((m) => (
							<tr key={m.school} class="even:bg-stripe hover:bg-surface">
								<td class="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
									<strong>
										<Highlight text={m.school} words={searchWords} />
									</strong>
								</td>
								<td class="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={m.char} words={searchWords} />
								</td>
								<td class="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={m.theme} words={searchWords} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-md mt-md max-[600px]:grid-cols-1">
				<div class="bg-surface border border-border rounded-sm p-md">
					<h4 class="text-accent m-0 mb-xs text-[0.9rem]">Fettered</h4>
					<p class="m-0 text-[0.85rem] text-text-muted">Halve rolled dice. No Psychic Phenomena risk.</p>
				</div>
				<div class="bg-surface border border-border rounded-sm p-md">
					<h4 class="text-accent m-0 mb-xs text-[0.9rem]">Unfettered</h4>
					<p class="m-0 text-[0.85rem] text-text-muted">
						Full dice. If keeping exploded 10s, roll Psychic Phenomena.
					</p>
				</div>
				<div class="bg-surface border border-border rounded-sm p-md">
					<h4 class="text-accent m-0 mb-xs text-[0.9rem]">Push</h4>
					<p class="m-0 text-[0.85rem] text-text-muted">
						+1 to +3 school rating (Sanctioned) or +4 (Unsanctioned). Forced Phenomena roll.
					</p>
				</div>
			</div>
			<WarpTable title="Psychic Phenomena (1d100)" entries={QREF_DATA.psychicPhenomena} />
			<WarpTable title="Perils of the Warp (1d100)" entries={QREF_DATA.perilsOfTheWarp} />
		</>
	);
}
