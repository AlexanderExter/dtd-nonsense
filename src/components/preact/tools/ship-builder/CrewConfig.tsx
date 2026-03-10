import { useCallback } from "preact/hooks";
import { OFFICER_POSITIONS } from "./constants";
import { ship, shipData, updateShip } from "./ShipBuilderApp";

export function CrewConfig() {
	const data = shipData.value;
	const currentShip = ship.value;

	if (!data) return null;

	const handleQualityChange = useCallback((e: Event) => {
		const val = Number.parseInt((e.target as HTMLSelectElement).value);
		updateShip((s) => ({ ...s, crewQuality: val }));
	}, []);

	const handleOfficerName = useCallback((posId: string, name: string) => {
		updateShip((s) => ({
			...s,
			officers: {
				...s.officers,
				[posId]: { ...s.officers[posId], name },
			},
		}));
	}, []);

	const handleOfficerSkill = useCallback((posId: string, skill: number) => {
		updateShip((s) => ({
			...s,
			officers: {
				...s.officers,
				[posId]: { ...s.officers[posId], skill },
			},
		}));
	}, []);

	return (
		<section class="build-section">
			<h2 class="section-title">Crew</h2>
			<div class="crew-config">
				<div class="field-row">
					<label for="crew-quality">Crew Quality</label>
					<select id="crew-quality" value={currentShip.crewQuality} onChange={handleQualityChange}>
						<option value="1">1 (−5 BP)</option>
						<option value="2">2 (Base)</option>
						<option value="3">3 (+10 BP)</option>
						<option value="4">4 (+20 BP)</option>
						<option value="5">5 (+30 BP)</option>
					</select>
				</div>
				<h4>Bridge Officers</h4>
				<div class="officer-grid">
					{OFFICER_POSITIONS.map((pos) => {
						const officer = currentShip.officers[pos.id] || {
							name: "",
							skill: 0,
						};
						return (
							<div key={pos.id} class="officer-row">
								<span class="officer-title">{pos.title}</span>
								<input
									type="text"
									class="officer-name"
									placeholder="Name"
									value={officer.name}
									onInput={(e) => handleOfficerName(pos.id, (e.target as HTMLInputElement).value)}
								/>
								<span class="officer-skill">{pos.skill}</span>
								<input
									type="number"
									class="officer-skill-val"
									min={0}
									max={10}
									value={officer.skill}
									onInput={(e) =>
										handleOfficerSkill(
											pos.id,
											Number.parseInt((e.target as HTMLInputElement).value) || 0,
										)
									}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
