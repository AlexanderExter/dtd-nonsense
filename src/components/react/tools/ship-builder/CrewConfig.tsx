import { useCallback } from "react";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { OFFICER_POSITIONS } from "./constants";
import { useShipStore } from "./store";

export function CrewConfig() {
	const { shipData, ship, updateShip } = useShipStore();
	const data = shipData;
	const currentShip = ship;

	const handleQualityChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const val = Number.parseInt((e.target as HTMLSelectElement).value, 10);
			updateShip((s) => {
				s.crewQuality = val;
			});
		},
		[updateShip],
	);

	const handleOfficerName = useCallback(
		(posId: string, name: string) => {
			updateShip((s) => {
				if (!s.officers[posId]) s.officers[posId] = { name: "", skill: 0 };
				s.officers[posId].name = name;
			});
		},
		[updateShip],
	);

	const handleOfficerSkill = useCallback(
		(posId: string, skill: number) => {
			updateShip((s) => {
				if (!s.officers[posId]) s.officers[posId] = { name: "", skill: 0 };
				s.officers[posId].skill = skill;
			});
		},
		[updateShip],
	);

	if (!data) return null;

	return (
		<section className="mb-xl">
			<h2 className="mb-md border-border border-b pb-xs text-accent text-xl">Crew</h2>
			<div>
				<div className="mb-sm">
					<label className="text-xs" htmlFor="crew-quality">
						Crew Quality
					</label>
					<GameSelect id="crew-quality" onChange={handleQualityChange} value={currentShip.crewQuality}>
						<option value="1">1 (−5 BP)</option>
						<option value="2">2 (Base)</option>
						<option value="3">3 (+10 BP)</option>
						<option value="4">4 (+20 BP)</option>
						<option value="5">5 (+30 BP)</option>
					</GameSelect>
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
								className="grid grid-cols-[150px_1fr_80px_60px] items-center gap-sm rounded-sm bg-surface-raised px-sm py-xs max-tool-lg:grid-cols-2"
								key={pos.id}
							>
								<span className="font-semibold text-sm">{pos.title}</span>
								<GameInput
									onInput={(e) => handleOfficerName(pos.id, (e.target as HTMLInputElement).value)}
									placeholder="Name"
									type="text"
									value={officer.name}
								/>
								<span className="text-right text-text-muted text-xs">{pos.skill}</span>
								<GameInput
									className="w-[50px]"
									max={10}
									min={0}
									onInput={(e) =>
										handleOfficerSkill(
											pos.id,
											Number.parseInt((e.target as HTMLInputElement).value, 10) || 0,
										)
									}
									type="number"
									value={officer.skill}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
