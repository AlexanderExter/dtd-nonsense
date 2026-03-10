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
		<div class="property-grid">
			{filtered.map((p) => (
				<div class="property-item" key={p.name}>
					<strong>
						<Highlight text={p.name} words={searchWords} />
					</strong>
					<span>
						<Highlight text={p.desc} words={searchWords} />
					</span>
				</div>
			))}
		</div>
	);
}
