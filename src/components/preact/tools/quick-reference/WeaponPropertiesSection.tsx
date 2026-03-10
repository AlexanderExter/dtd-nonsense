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
		<div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-sm max-[600px]:grid-cols-1">
			{filtered.map((p) => (
				<div class="px-md py-sm border-l-[3px] border-l-accent-dim bg-surface rounded-r-sm" key={p.name}>
					<strong class="text-accent text-[0.88rem]">
						<Highlight text={p.name} words={searchWords} />
					</strong>
					<span class="block text-[0.82rem] text-text-muted mt-[2px]">
						<Highlight text={p.desc} words={searchWords} />
					</span>
				</div>
			))}
		</div>
	);
}
