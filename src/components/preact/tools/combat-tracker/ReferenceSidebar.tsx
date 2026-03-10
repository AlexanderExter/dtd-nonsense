import { useCallback, useState } from "preact/hooks";
import type { ActionDef } from "./constants";
import { ACTIONS, CONDITIONS, HIT_LOCATIONS, SITUATIONAL_MODIFIERS } from "./constants";

interface ReferenceSidebarProps {
	isOpen: boolean;
	onClose: () => void;
	onRollLocation: () => void;
	hitLocationResult: string;
	damageResult: string;
	onCalcDamage: (raw: number, ap: number, pen: number, resilience: number) => void;
}

const ACTION_TYPE_LABELS: Record<ActionDef["type"], string> = {
	H: "Half",
	F: "Full",
	R: "Reaction",
	Fr: "Free",
};

const ACTION_TYPE_BADGE_COLORS: Record<string, string> = {
	H: "bg-success-bg text-success",
	F: "bg-warning-bg text-warning",
	R: "bg-info-bg text-info",
	Fr: "bg-[rgba(148,146,157,0.15)] text-text-muted",
};

export function ReferenceSidebar({
	isOpen,
	onClose,
	onRollLocation,
	hitLocationResult,
	damageResult,
	onCalcDamage,
}: ReferenceSidebarProps) {
	const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
	const [actionFilter, setActionFilter] = useState("");
	const [dmgRaw, setDmgRaw] = useState(10);
	const [dmgAp, setDmgAp] = useState(4);
	const [dmgPen, setDmgPen] = useState(0);
	const [dmgRes, setDmgRes] = useState(3);

	const toggleSection = useCallback((idx: number) => {
		setOpenSections((prev) => {
			const next = new Set(prev);
			if (next.has(idx)) next.delete(idx);
			else next.add(idx);
			return next;
		});
	}, []);

	const filteredActions = actionFilter
		? ACTIONS.filter(
				(a) =>
					a.name.toLowerCase().includes(actionFilter.toLowerCase()) ||
					a.desc.toLowerCase().includes(actionFilter.toLowerCase()) ||
					a.type.toLowerCase().includes(actionFilter.toLowerCase()),
			)
		: ACTIONS;

	const handleCalcDamage = () => {
		onCalcDamage(dmgRaw, dmgAp, dmgPen, dmgRes);
	};

	const sidebarClasses = [
		"w-[340px] shrink-0 bg-surface border-l border-border p-md overflow-y-auto max-h-[calc(100vh-60px-48px)] sticky top-[60px]",
		"max-[1099px]:fixed max-[1099px]:top-0 max-[1099px]:right-0 max-[1099px]:bottom-0 max-[1099px]:z-[150] max-[1099px]:translate-x-full max-[1099px]:transition-transform max-[1099px]:duration-[250ms] max-[1099px]:max-h-screen",
		"max-[768px]:w-full",
		isOpen && "max-[1099px]:translate-x-0",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<aside class={sidebarClasses}>
			<div class="flex justify-between items-center mb-sm">
				<h2 class="m-0 text-accent">Reference</h2>
				<button type="button" class="hidden max-[1099px]:block btn btn-sm" onClick={onClose}>
					&times;
				</button>
			</div>

			<div>
				{/* Actions */}
				<div class="border-b border-border">
					<button
						type="button"
						class="flex items-center gap-sm w-full py-sm px-sm bg-transparent border-none text-text-primary text-[0.9rem] font-semibold cursor-pointer text-left hover:text-accent"
						onClick={() => toggleSection(0)}
					>
						<span class="text-accent">{openSections.has(0) ? "\u25BC" : "\u25B6"}</span>
						Actions
					</button>
					{openSections.has(0) && (
						<div class="px-sm pb-md">
							<input
								type="text"
								class="w-full mb-sm px-sm py-xs text-[0.85rem]"
								placeholder="Filter actions..."
								value={actionFilter}
								onInput={(e) => setActionFilter((e.target as HTMLInputElement).value)}
							/>
							<table class="w-full text-[0.8rem]">
								<thead>
									<tr>
										<th class="text-[0.7rem]">Action</th>
										<th class="text-[0.7rem]">Type</th>
										<th class="text-[0.7rem]">Description</th>
									</tr>
								</thead>
								<tbody>
									{filteredActions.map((a) => (
										<tr key={a.name}>
											<td>{a.name}</td>
											<td>
												<span
													class={`inline-flex items-center justify-center min-w-6 h-5 px-1 rounded-sm text-[0.65rem] font-bold uppercase shrink-0 ${ACTION_TYPE_BADGE_COLORS[a.type] || ""}`}
												>
													{ACTION_TYPE_LABELS[a.type]}
												</span>
											</td>
											<td>{a.desc}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Conditions */}
				<div class="border-b border-border">
					<button
						type="button"
						class="flex items-center gap-sm w-full py-sm px-sm bg-transparent border-none text-text-primary text-[0.9rem] font-semibold cursor-pointer text-left hover:text-accent"
						onClick={() => toggleSection(1)}
					>
						<span class="text-accent">{openSections.has(1) ? "\u25BC" : "\u25B6"}</span>
						Conditions
					</button>
					{openSections.has(1) && (
						<div class="px-sm pb-md">
							<table class="w-full text-[0.8rem]">
								<thead>
									<tr>
										<th class="text-[0.7rem]">Condition</th>
										<th class="text-[0.7rem]">Effect</th>
										<th class="text-[0.7rem]">Leveled</th>
									</tr>
								</thead>
								<tbody>
									{CONDITIONS.map((c) => (
										<tr key={c.id}>
											<td>{c.name}</td>
											<td>{c.effect}</td>
											<td>{c.leveled ? "Yes" : "No"}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Situational Modifiers */}
				<div class="border-b border-border">
					<button
						type="button"
						class="flex items-center gap-sm w-full py-sm px-sm bg-transparent border-none text-text-primary text-[0.9rem] font-semibold cursor-pointer text-left hover:text-accent"
						onClick={() => toggleSection(2)}
					>
						<span class="text-accent">{openSections.has(2) ? "\u25BC" : "\u25B6"}</span>
						Situational Modifiers
					</button>
					{openSections.has(2) && (
						<div class="px-sm pb-md">
							<table class="w-full text-[0.8rem]">
								<thead>
									<tr>
										<th class="text-[0.7rem]">Modifier</th>
										<th class="text-[0.7rem]">Effect</th>
									</tr>
								</thead>
								<tbody>
									{SITUATIONAL_MODIFIERS.map((m) => (
										<tr key={m.name}>
											<td>{m.name}</td>
											<td>{m.effect}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Hit Locations */}
				<div class="border-b border-border">
					<button
						type="button"
						class="flex items-center gap-sm w-full py-sm px-sm bg-transparent border-none text-text-primary text-[0.9rem] font-semibold cursor-pointer text-left hover:text-accent"
						onClick={() => toggleSection(3)}
					>
						<span class="text-accent">{openSections.has(3) ? "\u25BC" : "\u25B6"}</span>
						Hit Locations
					</button>
					{openSections.has(3) && (
						<div class="px-sm pb-md">
							<table class="w-full text-[0.8rem]">
								<thead>
									<tr>
										<th class="text-[0.7rem]">Roll</th>
										<th class="text-[0.7rem]">Location</th>
									</tr>
								</thead>
								<tbody>
									{HIT_LOCATIONS.map((h) => (
										<tr key={h.roll}>
											<td>{h.roll}</td>
											<td>{h.location}</td>
										</tr>
									))}
								</tbody>
							</table>
							<button type="button" class="btn btn-secondary btn-sm mt-sm" onClick={onRollLocation}>
								Roll Hit Location
							</button>
							{hitLocationResult && (
								<div class="mt-sm px-md py-sm bg-bg border border-border rounded-sm text-[0.9rem] text-center min-h-8">
									{hitLocationResult}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Damage Calculator */}
				<div class="border-b border-border">
					<button
						type="button"
						class="flex items-center gap-sm w-full py-sm px-sm bg-transparent border-none text-text-primary text-[0.9rem] font-semibold cursor-pointer text-left hover:text-accent"
						onClick={() => toggleSection(4)}
					>
						<span class="text-accent">{openSections.has(4) ? "\u25BC" : "\u25B6"}</span>
						Damage Calculator
					</button>
					{openSections.has(4) && (
						<div class="px-sm pb-md">
							<div class="flex flex-wrap gap-md items-end mt-sm">
								<label class="flex-none min-w-[90px] max-w-[120px]">
									<span>Raw Damage</span>
									<input
										class="w-full"
										type="number"
										min={0}
										value={dmgRaw}
										onInput={(e) =>
											setDmgRaw(parseInt((e.target as HTMLInputElement).value, 10) || 0)
										}
									/>
								</label>
								<label class="flex-none min-w-[90px] max-w-[120px]">
									<span>Armor Points</span>
									<input
										class="w-full"
										type="number"
										min={0}
										value={dmgAp}
										onInput={(e) =>
											setDmgAp(parseInt((e.target as HTMLInputElement).value, 10) || 0)
										}
									/>
								</label>
								<label class="flex-none min-w-[90px] max-w-[120px]">
									<span>Penetration</span>
									<input
										class="w-full"
										type="number"
										min={0}
										value={dmgPen}
										onInput={(e) =>
											setDmgPen(parseInt((e.target as HTMLInputElement).value, 10) || 0)
										}
									/>
								</label>
								<label class="flex-none min-w-[90px] max-w-[120px]">
									<span>Resilience</span>
									<input
										class="w-full"
										type="number"
										min={1}
										value={dmgRes}
										onInput={(e) =>
											setDmgRes(parseInt((e.target as HTMLInputElement).value, 10) || 1)
										}
									/>
								</label>
								<button type="button" class="btn btn-primary btn-sm" onClick={handleCalcDamage}>
									Calculate
								</button>
							</div>
							{damageResult && (
								<div class="mt-sm px-md py-sm bg-bg border border-border rounded-sm text-[0.9rem] text-center min-h-8">
									{damageResult}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</aside>
	);
}
