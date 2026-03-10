import { useCallback } from "preact/hooks";
import { CONSOLE_LABELS, CONSOLE_TYPES, getConsoleOptions } from "./constants";
import { ship, shipData, updateShip } from "./ShipBuilderApp";

export function ConsoleSlots() {
	const data = shipData.value;
	const currentShip = ship.value;

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);

	if (!hull) {
		return (
			<section class="build-section">
				<h2 class="section-title">Console Slots</h2>
				<p class="section-hint">Select a hull first</p>
			</section>
		);
	}

	const handleConsoleChange = useCallback((slotKey: string, consoleId: string) => {
		updateShip((s) => {
			s.consoles = { ...s.consoles, [slotKey]: consoleId };
			return s;
		});
	}, []);

	return (
		<section class="build-section">
			<h2 class="section-title">Console Slots</h2>
			{CONSOLE_TYPES.map((type) => {
				const count = hull.consoles[type];
				if (!count || count === 0) return null;

				const options = getConsoleOptions(data, type);

				return (
					<div key={type} class="console-slot-group">
						<h4>
							<span class={`slot-type-badge ${type}`}>{type.charAt(0).toUpperCase()}</span>{" "}
							{CONSOLE_LABELS[type]} ({count})
						</h4>
						{Array.from({ length: count }, (_, i) => {
							const slotKey = `${type}-${i}`;
							const currentId = currentShip.consoles[slotKey] || "";
							const selectedConsole = currentId ? data.consoles.find((c) => c.id === currentId) : null;

							return (
								<div key={slotKey} class="console-slot">
									<span class={`slot-type-badge ${type}`}>{type.charAt(0).toUpperCase()}</span>
									<select
										class="console-select"
										value={currentId}
										onChange={(e) =>
											handleConsoleChange(slotKey, (e.target as HTMLSelectElement).value)
										}
									>
										<option value="">— Empty —</option>
										{options.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name} ({c.cost} BP)
											</option>
										))}
									</select>
									<span class="console-cost">
										{selectedConsole ? `${selectedConsole.cost} BP` : ""}
									</span>
									{selectedConsole && <div class="console-effect">{selectedConsole.effect}</div>}
								</div>
							);
						})}
					</div>
				);
			})}
		</section>
	);
}
