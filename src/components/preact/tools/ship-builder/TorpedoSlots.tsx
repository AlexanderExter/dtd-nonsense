import { useCallback } from "preact/hooks";
import { ship, shipData, updateShip } from "./ShipBuilderApp";

export function TorpedoSlots() {
	const data = shipData.value;
	const currentShip = ship.value;

	if (!data) return null;

	const handleToggleTube = useCallback((e: Event) => {
		const checked = (e.target as HTMLInputElement).checked;
		updateShip((s) => ({ ...s, hasTorpedoTube: checked }));
	}, []);

	const handleTorpedoChange = useCallback((idx: number, torpedoId: string) => {
		updateShip((s) => {
			const torpedoes = [...s.torpedoes];
			torpedoes[idx] = torpedoId;
			return { ...s, torpedoes };
		});
	}, []);

	return (
		<section class="build-section">
			<h2 class="section-title">Torpedoes</h2>
			<div class="torpedo-controls">
				<label class="toggle-row">
					<input type="checkbox" checked={currentShip.hasTorpedoTube} onChange={handleToggleTube} />
					<span>Torpedo Tube ({data.torpedoTubeCost} BP) — holds 5 torpedoes</span>
				</label>
				{currentShip.hasTorpedoTube && (
					<div class="torpedo-loadout">
						<h4>Torpedo Loadout (5 slots)</h4>
						{Array.from({ length: 5 }, (_, i) => {
							const current = currentShip.torpedoes[i] || "";
							const selectedTorpedo = current ? data.torpedoes.find((t) => t.id === current) : null;

							return (
								<div key={i} class="torpedo-slot">
									<span>#{i + 1}</span>
									<select
										class="torpedo-select"
										value={current}
										onChange={(e) => handleTorpedoChange(i, (e.target as HTMLSelectElement).value)}
									>
										<option value="">— Empty —</option>
										{data.torpedoes.map((t) => (
											<option key={t.id} value={t.id}>
												{t.name} ({t.cost} BP)
											</option>
										))}
									</select>
									<span class="torpedo-cost">
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
