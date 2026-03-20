import { Highlight } from "./Highlight";
import { QREF_DATA } from "./qref-data";

interface WeaponPropertiesSectionProps {
	searchWords: string[];
}

export function WeaponPropertiesSection({ searchWords }: WeaponPropertiesSectionProps) {
	const filtered = QREF_DATA.weaponProperties.filter((p) => {
		if (searchWords.length === 0) return true;
		const text = `${p.name} ${p.desc}`.toLowerCase();
		return searchWords.every((w) => text.includes(w));
	});

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-sm max-[600px]:grid-cols-1">
			{filtered.map((p) => (
				<div className="rounded-r-sm border-l-[3px] border-l-accent-dim bg-surface px-md py-sm" key={p.name}>
					<strong className="text-[0.88rem] text-accent">
						<Highlight text={p.name} words={searchWords} />
					</strong>
					<span className="mt-[2px] block text-[0.82rem] text-text-muted">
						<Highlight text={p.desc} words={searchWords} />
					</span>
				</div>
			))}
		</div>
	);
}
