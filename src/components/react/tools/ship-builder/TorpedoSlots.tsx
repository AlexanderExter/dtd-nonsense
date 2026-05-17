import { useCallback } from "react";
import { GameCheckbox } from "@/components/react/ui/GameCheckbox";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { useShipStore } from "./store";

export function TorpedoSlots() {
	const { shipData, ship, updateShip } = useShipStore();
	const data = shipData;
	const currentShip = ship;

	const handleToggleTube = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const checked = (e.target as HTMLInputElement).checked;
			updateShip((s) => {
				s.hasTorpedoTube = checked;
			});
		},
		[updateShip],
	);

	const handleTorpedoChange = useCallback(
		(idx: number, torpedoId: string) => {
			updateShip((s) => {
				s.torpedoes[idx] = torpedoId;
			});
		},
		[updateShip],
	);

	if (!data) return null;

	return (
		<section className="mb-xl">
			<h2 className="mb-md border-border border-b pb-xs text-accent text-xl">Torpedoes</h2>
			<div>
				<label className="mb-sm flex cursor-pointer items-center gap-sm text-sm">
					<GameCheckbox checked={currentShip.hasTorpedoTube} onChange={handleToggleTube} />
					<span>Torpedo Tube ({data.torpedoTubeCost} BP) — holds 5 torpedoes</span>
				</label>
				{currentShip.hasTorpedoTube && (
					<div>
						<h4>Torpedo Loadout (5 slots)</h4>
						{Array.from({ length: 5 }, (_, i) => {
							const current = currentShip.torpedoes[i] || "";
							const selectedTorpedo = current ? data.torpedoes.find((t) => t.id === current) : null;

							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: fixed-position torpedo slots identified by index
								<div className="flex items-center gap-sm py-xs" key={i}>
									<span>#{i + 1}</span>
									<GameSelect
										className="flex-1"
										onChange={(e) => handleTorpedoChange(i, (e.target as HTMLSelectElement).value)}
										value={current}
									>
										<option value="">— Empty —</option>
										{data.torpedoes.map((t) => (
											<option key={t.id} value={t.id}>
												{t.name} ({t.cost} BP)
											</option>
										))}
									</GameSelect>
									<span className="min-w-10 text-right text-accent text-xs">
										{selectedTorpedo ? `${selectedTorpedo.cost} BP` : ""}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</section>
	);
}
