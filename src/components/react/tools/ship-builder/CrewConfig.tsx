import { useCallback } from "react";
import { OFFICER_POSITIONS } from "./constants";
import { useShipStore } from "./store";

export function CrewConfig() {
	const { shipData, ship, updateShip } = useShipStore();
	const data = shipData;
	const currentShip = ship;

	if (!data) return null;

	const handleQualityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		const val = Number.parseInt((e.target as HTMLSelectElement).value, 10);
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
		<section className="mb-xl">
			<h2 className="text-accent text-xl mb-md pb-xs border-b border-border">Crew</h2>
			<div>
				<div className="mb-sm">
					<label htmlFor="crew-quality" className="text-[0.8rem]">
						Crew Quality
					</label>
					<select id="crew-quality" value={currentShip.crewQuality} onChange={handleQualityChange}>
						<option value="1">1 (−5 BP)</option>
						<option value="2">2 (Base)</option>
						<option value="3">3 (+10 BP)</option>
						<option value="4">4 (+20 BP)</option>
						<option value="5">5 (+30 BP)</option>
					</select>
				</div>
				<h4>Bridge Officers</h4>
				<div className="flex flex-col gap-sm">
					{OFFICER_POSITIONS.map((pos) => {
						const officer = currentShip.officers[pos.id] || {
							name: "",
							skill: 0,
						};
						return (
							<div
								key={pos.id}
								className="grid grid-cols-[150px_1fr_80px_60px] gap-sm items-center px-sm py-xs bg-surface-raised rounded-sm max-[900px]:grid-cols-2"
							>
								<span className="font-semibold text-[0.85rem]">{pos.title}</span>
								<input
									type="text"
									className="py-1 px-2 text-[0.85rem]"
									placeholder="Name"
									value={officer.name}
									onInput={(e) => handleOfficerName(pos.id, (e.target as HTMLInputElement).value)}
								/>
								<span className="text-[0.8rem] text-text-muted text-right">{pos.skill}</span>
								<input
									type="number"
									className="w-[50px] p-1 text-[0.85rem] text-center"
									min={0}
									max={10}
									value={officer.skill}
									onInput={(e) =>
										handleOfficerSkill(
											pos.id,
											Number.parseInt((e.target as HTMLInputElement).value, 10) || 0,
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
