import { useCallback } from "react";
import { CONSOLE_LABELS, CONSOLE_TYPES, getConsoleOptions } from "./constants";
import { useShipStore } from "./store";

export function ConsoleSlots() {
	const { shipData, ship, updateShip } = useShipStore();
	const data = shipData;
	const currentShip = ship;

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);

	if (!hull) {
		return (
			<section className="mb-xl">
				<h2 className="text-accent text-xl mb-md pb-xs border-b border-border">Console Slots</h2>
				<p className="text-text-dim italic">Select a hull first</p>
			</section>
		);
	}

	const handleConsoleChange = useCallback((slotKey: string, consoleId: string) => {
		updateShip((s) => {
			s.consoles = { ...s.consoles, [slotKey]: consoleId };
			return s;
		});
	}, []);

	const badgeColors: Record<string, string> = {
		arcana: "bg-[#9b59b6]",
		command: "bg-[#e74c3c]",
		engineering: "bg-[#f39c12]",
		tactical: "bg-[#3498db]",
		universal: "bg-[#2ecc71]",
	};

	return (
		<section className="mb-xl">
			<h2 className="text-accent text-xl mb-md pb-xs border-b border-border">Console Slots</h2>
			{CONSOLE_TYPES.map((type) => {
				const count = hull.consoles[type];
				if (!count || count === 0) return null;

				const options = getConsoleOptions(data, type);
				const badgeClass = `inline-block w-5 h-5 rounded-[4px] text-center leading-5 text-[0.7rem] font-bold text-bg ${badgeColors[type] || ""}`;

				return (
					<div key={type} className="mb-md">
						<h4 className="text-[0.9rem] mb-sm flex items-center gap-sm">
							<span className={badgeClass}>{type.charAt(0).toUpperCase()}</span> {CONSOLE_LABELS[type]} (
							{count})
						</h4>
						{Array.from({ length: count }, (_, i) => {
							const slotKey = `${type}-${i}`;
							const currentId = currentShip.consoles[slotKey] || "";
							const selectedConsole = currentId ? data.consoles.find((c) => c.id === currentId) : null;

							return (
								<div
									key={slotKey}
									className="flex items-center gap-sm p-sm mb-xs bg-surface-raised border border-border rounded-sm"
								>
									<span className={badgeClass}>{type.charAt(0).toUpperCase()}</span>
									<select
										className="flex-1 py-1 px-2 text-[0.85rem]"
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
									<span className="text-[0.8rem] text-accent min-w-10 text-right">
										{selectedConsole ? `${selectedConsole.cost} BP` : ""}
									</span>
									{selectedConsole && (
										<div className="text-xs text-text-dim px-sm py-0.5 mb-xs">
											{selectedConsole.effect}
										</div>
									)}
								</div>
							);
						})}
					</div>
				);
			})}
		</section>
	);
}
