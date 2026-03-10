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

	return (
		<aside class={`reference-sidebar ${isOpen ? "open" : ""}`}>
			<div class="sidebar-header">
				<h2>Reference</h2>
				<button type="button" class="btn btn-sm sidebar-close-btn" onClick={onClose}>
					&times;
				</button>
			</div>

			<div class="sidebar-content">
				{/* Actions */}
				<div class="accordion-section">
					<button
						type="button"
						class={`accordion-header ${openSections.has(0) ? "open" : ""}`}
						onClick={() => toggleSection(0)}
					>
						<span class="accordion-icon">{openSections.has(0) ? "\u25BC" : "\u25B6"}</span>
						Actions
					</button>
					{openSections.has(0) && (
						<div class="accordion-body">
							<input
								type="text"
								class="action-filter"
								placeholder="Filter actions..."
								value={actionFilter}
								onInput={(e) => setActionFilter((e.target as HTMLInputElement).value)}
							/>
							<table class="reference-table">
								<thead>
									<tr>
										<th>Action</th>
										<th>Type</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{filteredActions.map((a) => (
										<tr key={a.name}>
											<td>{a.name}</td>
											<td>
												<span class={`action-type-badge type-${a.type}`}>
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
				<div class="accordion-section">
					<button
						type="button"
						class={`accordion-header ${openSections.has(1) ? "open" : ""}`}
						onClick={() => toggleSection(1)}
					>
						<span class="accordion-icon">{openSections.has(1) ? "\u25BC" : "\u25B6"}</span>
						Conditions
					</button>
					{openSections.has(1) && (
						<div class="accordion-body">
							<table class="reference-table">
								<thead>
									<tr>
										<th>Condition</th>
										<th>Effect</th>
										<th>Leveled</th>
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
				<div class="accordion-section">
					<button
						type="button"
						class={`accordion-header ${openSections.has(2) ? "open" : ""}`}
						onClick={() => toggleSection(2)}
					>
						<span class="accordion-icon">{openSections.has(2) ? "\u25BC" : "\u25B6"}</span>
						Situational Modifiers
					</button>
					{openSections.has(2) && (
						<div class="accordion-body">
							<table class="reference-table">
								<thead>
									<tr>
										<th>Modifier</th>
										<th>Effect</th>
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
				<div class="accordion-section">
					<button
						type="button"
						class={`accordion-header ${openSections.has(3) ? "open" : ""}`}
						onClick={() => toggleSection(3)}
					>
						<span class="accordion-icon">{openSections.has(3) ? "\u25BC" : "\u25B6"}</span>
						Hit Locations
					</button>
					{openSections.has(3) && (
						<div class="accordion-body">
							<table class="reference-table">
								<thead>
									<tr>
										<th>Roll</th>
										<th>Location</th>
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
							<button type="button" class="btn btn-secondary btn-sm" onClick={onRollLocation}>
								Roll Hit Location
							</button>
							{hitLocationResult && <div class="roll-result">{hitLocationResult}</div>}
						</div>
					)}
				</div>

				{/* Damage Calculator */}
				<div class="accordion-section">
					<button
						type="button"
						class={`accordion-header ${openSections.has(4) ? "open" : ""}`}
						onClick={() => toggleSection(4)}
					>
						<span class="accordion-icon">{openSections.has(4) ? "\u25BC" : "\u25B6"}</span>
						Damage Calculator
					</button>
					{openSections.has(4) && (
						<div class="accordion-body">
							<div class="dmg-calc-form">
								<label class="form-group form-group-sm">
									<span>Raw Damage</span>
									<input
										type="number"
										min={0}
										value={dmgRaw}
										onInput={(e) =>
											setDmgRaw(parseInt((e.target as HTMLInputElement).value, 10) || 0)
										}
									/>
								</label>
								<label class="form-group form-group-sm">
									<span>Armor Points</span>
									<input
										type="number"
										min={0}
										value={dmgAp}
										onInput={(e) =>
											setDmgAp(parseInt((e.target as HTMLInputElement).value, 10) || 0)
										}
									/>
								</label>
								<label class="form-group form-group-sm">
									<span>Penetration</span>
									<input
										type="number"
										min={0}
										value={dmgPen}
										onInput={(e) =>
											setDmgPen(parseInt((e.target as HTMLInputElement).value, 10) || 0)
										}
									/>
								</label>
								<label class="form-group form-group-sm">
									<span>Resilience</span>
									<input
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
							{damageResult && <div class="calc-result">{damageResult}</div>}
						</div>
					)}
				</div>
			</div>
		</aside>
	);
}
