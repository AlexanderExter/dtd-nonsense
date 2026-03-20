import { ConsoleSlots } from "./ConsoleSlots";
import { CrewConfig } from "./CrewConfig";
import { HullSelector } from "./HullSelector";
import { ShieldPicker } from "./ShieldPicker";
import { SummaryPanel } from "./SummaryPanel";
import { TorpedoSlots } from "./TorpedoSlots";
import { WeaponSlots } from "./WeaponSlots";

export function BuilderPanel() {
	return (
		<div className="grid min-h-[calc(100vh-50px)] grid-cols-[1fr_340px] gap-0 max-[900px]:grid-cols-1">
			<div className="overflow-y-auto p-lg">
				<HullSelector />
				<ConsoleSlots />
				<WeaponSlots />
				<TorpedoSlots />
				<ShieldPicker />
				<CrewConfig />
			</div>
			<SummaryPanel />
		</div>
	);
}
