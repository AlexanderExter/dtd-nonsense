import { useCallback } from "react";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { CONSOLE_LABELS, CONSOLE_TYPES, getConsoleOptions } from "./constants";
import { useShipStore } from "./store";

export function ConsoleSlots() {
	const { shipData, ship, updateShip } = useShipStore();
	const data = shipData;
	const currentShip = ship;

	const handleConsoleChange = useCallback(
		(slotKey: string, consoleId: string) => {
			updateShip((s) => {
				s.consoles[slotKey] = consoleId;
			});
		},
		[updateShip],
	);

	if (!data) return null;

	const hull = data.hulls.find((h) => h.id === currentShip.hullId);

	if (!hull) {
		return (
			<section className="mb-xl">
				<h2 className="mb-md border-border border-b pb-xs text-accent text-xl">Console Slots</h2>
				<p className="text-text-dim italic">Select a hull first</p>
			</section>
		);
	}

	const badgeColors: Record<string, string> = {
		arcana: "bg-console-arcana",
		command: "bg-console-command",
		engineering: "bg-console-engineering",
		tactical: "bg-console-tactical",
		universal: "bg-console-universal",
	};

	return (
		<section className="mb-xl">
			<h2 className="mb-md border-border border-b pb-xs text-accent text-xl">Console Slots</h2>
			{CONSOLE_TYPES.map((type) => {
				const count = hull.consoles[type];
				if (!count || count === 0) return null;

				const options = getConsoleOptions(data, type);
				const badgeClass = `inline-block w-5 h-5 rounded-[4px] text-center leading-5 text-xs font-bold text-bg ${badgeColors[type] || ""}`;

				return (
					<div className="mb-md" key={type}>
						<h4 className="mb-sm flex items-center gap-sm text-sm">
							<span className={badgeClass}>{type.charAt(0).toUpperCase()}</span> {CONSOLE_LABELS[type]} (
							{count})
						</h4>
						{Array.from({ length: count }, (_, i) => {
							const slotKey = `${type}-${i}`;
							const currentId = currentShip.consoles[slotKey] || "";
							const selectedConsole = currentId ? data.consoles.find((c) => c.id === currentId) : null;

							return (
								<div
									className="mb-xs flex items-center gap-sm rounded-sm border border-border bg-surface-raised p-sm"
									key={slotKey}
								>
									<span className={badgeClass}>{type.charAt(0).toUpperCase()}</span>
									<GameSelect
										className="flex-1"
										onChange={(e) =>
											handleConsoleChange(slotKey, (e.target as HTMLSelectElement).value)
										}
										value={currentId}
									>
										<option value="">— Empty —</option>
										{options.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name} ({c.cost} BP)
											</option>
										))}
									</GameSelect>
									<span className="min-w-10 text-right text-accent text-xs">
										{selectedConsole ? `${selectedConsole.cost} BP` : ""}
									</span>
									{selectedConsole && (
										<div className="mb-xs px-sm py-0.5 text-text-dim text-xs">
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
