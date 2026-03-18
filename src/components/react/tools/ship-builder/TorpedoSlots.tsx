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
			updateShip((s) => ({ ...s, hasTorpedoTube: checked }));
		},
		[updateShip],
	);

	const handleTorpedoChange = useCallback(
		(idx: number, torpedoId: string) => {
			updateShip((s) => {
				const torpedoes = [...s.torpedoes];
				torpedoes[idx] = torpedoId;
				return { ...s, torpedoes };
			});
		},
		[updateShip],
	);

	if (!data) return null;

	return (
		<section className="mb-xl">
			<h2 className="text-accent text-xl mb-md pb-xs border-b border-border">Torpedoes</h2>
			<div>
				<label className="flex items-center gap-sm cursor-pointer text-[0.85rem] mb-sm">
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
								<div key={i} className="flex items-center gap-sm py-xs">
									<span>#{i + 1}</span>
									<GameSelect
										className="flex-1"
										value={current}
										onChange={(e) => handleTorpedoChange(i, (e.target as HTMLSelectElement).value)}
									>
										<option value="">— Empty —</option>
										{data.torpedoes.map((t) => (
											<option key={t.id} value={t.id}>
												{t.name} ({t.cost} BP)
											</option>
										))}
									</GameSelect>
									<span className="text-[0.8rem] text-accent min-w-10 text-right">
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
