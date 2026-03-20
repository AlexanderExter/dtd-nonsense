import { AccordionItem } from "@/components/react/ui/Accordion";
import { Badge } from "@/components/react/ui/Badge";
import { Button } from "@/components/react/ui/Button";
import { CloseButton } from "@/components/react/ui/CloseButton";
import { GameInput } from "@/components/react/ui/GameInput";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

const ACTION_TYPE_BADGE_VARIANT: Record<string, "success" | "warning" | "info" | "muted"> = {
	H: "success",
	F: "warning",
	R: "info",
	Fr: "muted",
};

export function ReferenceSidebar({
	isOpen,
	onClose,
	onRollLocation,
	hitLocationResult,
	damageResult,
	onCalcDamage,
}: ReferenceSidebarProps) {
	const [actionFilter, setActionFilter] = useState("");
	const [dmgRaw, setDmgRaw] = useState(10);
	const [dmgAp, setDmgAp] = useState(4);
	const [dmgPen, setDmgPen] = useState(0);
	const [dmgRes, setDmgRes] = useState(3);

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

	const sidebarClasses = cn(
		"w-[340px] shrink-0 bg-surface border-l border-border p-md overflow-y-auto max-h-[calc(100vh-60px-48px)] sticky top-[60px]",
		"max-[1099px]:fixed max-[1099px]:top-0 max-[1099px]:right-0 max-[1099px]:bottom-0 max-[1099px]:z-[150] max-[1099px]:translate-x-full max-[1099px]:transition-transform max-[1099px]:duration-[250ms] max-[1099px]:max-h-screen",
		"max-[768px]:w-full",
		isOpen && "max-[1099px]:translate-x-0",
	);

	return (
		<aside className={sidebarClasses}>
			<div className="flex justify-between items-center mb-sm">
				<h2 className="m-0 text-accent">Reference</h2>
				<CloseButton className="hidden max-[1099px]:block" onClick={onClose} />
			</div>

			<div>
				{/* Actions */}
				<AccordionItem title="Actions" defaultOpen>
					<GameInput
						type="text"
						className="mb-sm"
						placeholder="Filter actions..."
						value={actionFilter}
						onInput={(e) => setActionFilter((e.target as HTMLInputElement).value)}
					/>
					<table className="w-full text-[0.8rem]">
						<thead>
							<tr>
								<th className="text-[0.7rem]">Action</th>
								<th className="text-[0.7rem]">Type</th>
								<th className="text-[0.7rem]">Description</th>
							</tr>
						</thead>
						<tbody>
							{filteredActions.map((a) => (
								<tr key={a.name}>
									<td>{a.name}</td>
									<td>
										<Badge variant={ACTION_TYPE_BADGE_VARIANT[a.type] || "muted"}>
											{ACTION_TYPE_LABELS[a.type]}
										</Badge>
									</td>
									<td>{a.desc}</td>
								</tr>
							))}
						</tbody>
					</table>
				</AccordionItem>

				{/* Conditions */}
				<AccordionItem title="Conditions">
					<table className="w-full text-[0.8rem]">
						<thead>
							<tr>
								<th className="text-[0.7rem]">Condition</th>
								<th className="text-[0.7rem]">Effect</th>
								<th className="text-[0.7rem]">Leveled</th>
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
				</AccordionItem>

				{/* Situational Modifiers */}
				<AccordionItem title="Situational Modifiers">
					<table className="w-full text-[0.8rem]">
						<thead>
							<tr>
								<th className="text-[0.7rem]">Modifier</th>
								<th className="text-[0.7rem]">Effect</th>
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
				</AccordionItem>

				{/* Hit Locations */}
				<AccordionItem title="Hit Locations">
					<table className="w-full text-[0.8rem]">
						<thead>
							<tr>
								<th className="text-[0.7rem]">Roll</th>
								<th className="text-[0.7rem]">Location</th>
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
					<Button size="sm" className="mt-sm" onClick={onRollLocation}>
						Roll Hit Location
					</Button>
					{hitLocationResult && (
						<div className="mt-sm px-md py-sm bg-bg border border-border rounded-sm text-[0.9rem] text-center min-h-8">
							{hitLocationResult}
						</div>
					)}
				</AccordionItem>

				{/* Damage Calculator */}
				<AccordionItem title="Damage Calculator">
					<div className="flex flex-wrap gap-md items-end mt-sm">
						<label className="flex-none min-w-[90px] max-w-[120px]">
							<span>Raw Damage</span>
							<GameInput
								type="number"
								min={0}
								value={dmgRaw}
								onInput={(e) => setDmgRaw(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px]">
							<span>Armor Points</span>
							<GameInput
								type="number"
								min={0}
								value={dmgAp}
								onInput={(e) => setDmgAp(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px]">
							<span>Penetration</span>
							<GameInput
								type="number"
								min={0}
								value={dmgPen}
								onInput={(e) => setDmgPen(parseInt((e.target as HTMLInputElement).value, 10) || 0)}
							/>
						</label>
						<label className="flex-none min-w-[90px] max-w-[120px]">
							<span>Resilience</span>
							<GameInput
								type="number"
								min={1}
								value={dmgRes}
								onInput={(e) => setDmgRes(parseInt((e.target as HTMLInputElement).value, 10) || 1)}
							/>
						</label>
						<Button variant="primary" size="sm" onClick={handleCalcDamage}>
							Calculate
						</Button>
					</div>
					{damageResult && (
						<div className="mt-sm px-md py-sm bg-bg border border-border rounded-sm text-[0.9rem] text-center min-h-8">
							{damageResult}
						</div>
					)}
				</AccordionItem>
			</div>
		</aside>
	);
}
