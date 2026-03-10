import { ConsoleSlots } from "./ConsoleSlots";
import { CrewConfig } from "./CrewConfig";
import { HullSelector } from "./HullSelector";
import { ShieldPicker } from "./ShieldPicker";
import { SummaryPanel } from "./SummaryPanel";
import { TorpedoSlots } from "./TorpedoSlots";
import { WeaponSlots } from "./WeaponSlots";

export function BuilderPanel() {
	return (
		<div class="builder-layout">
			<div class="build-panel">
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
