import { useState } from "react";
import { AccordionItem } from "@/components/react/ui/Accordion";
import { Badge } from "@/components/react/ui/Badge";
import { Button } from "@/components/react/ui/Button";
import { CloseButton } from "@/components/react/ui/CloseButton";
import { GameInput } from "@/components/react/ui/GameInput";
import { cn } from "@/lib/utils";
import type { ActionDef } from "./constants";
import { ACTIONS, CONDITIONS, HIT_LOCATIONS, SITUATIONAL_MODIFIERS } from "./constants";

interface ReferenceSidebarProps {
	damageResult: string;
	hitLocationResult: string;
	isOpen: boolean;
	onCalcDamage: (raw: number, ap: number, pen: number, resilience: number) => void;
	onClose: () => void;
	onRollLocation: () => void;
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
		"sticky top-[60px] max-h-[calc(100vh-60px-48px)] w-[340px] shrink-0 overflow-y-auto border-border border-l bg-surface p-md",
		"max-[1099px]:fixed max-[1099px]:top-0 max-[1099px]:right-0 max-[1099px]:bottom-0 max-[1099px]:z-[150] max-[1099px]:max-h-screen max-[1099px]:translate-x-full max-[1099px]:transition-transform max-[1099px]:duration-[250ms]",
		"max-[768px]:w-full",
		isOpen && "max-[1099px]:translate-x-0",
	);

	return (
		<aside className={sidebarClasses}>
			<div className="mb-sm flex items-center justify-between">
				<h2 className="m-0 text-accent">Reference</h2>
				<CloseButton className="hidden max-[1099px]:block" onClick={onClose} />
			</div>

			<div>
				{/* Actions */}
				<AccordionItem defaultOpen title="Actions">
					<GameInput
						className="mb-sm"
						onInput={(e) => setActionFilter((e.target as HTMLInputElement).value)}
						placeholder="Filter actions..."
						type="text"
						value={actionFilter}
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
					<Button className="mt-sm" onClick={onRollLocation} size="sm">
						Roll Hit Location
					</Button>
					{hitLocationResult && (
						<div className="mt-sm min-h-8 rounded-sm border border-border bg-bg px-md py-sm text-center text-[0.9rem]">
							{hitLocationResult}
						</div>
					)}
				</AccordionItem>

				{/* Damage Calculator */}
				<AccordionItem title="Damage Calculator">
					<div className="mt-sm flex flex-wrap items-end gap-md">
						<label className="min-w-[90px] max-w-[120px] flex-none">
							<span>Raw Damage</span>
							<GameInput
								min={0}
								onInput={(e) =>
									setDmgRaw(Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
								}
								type="number"
								value={dmgRaw}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none">
							<span>Armor Points</span>
							<GameInput
								min={0}
								onInput={(e) =>
									setDmgAp(Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
								}
								type="number"
								value={dmgAp}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none">
							<span>Penetration</span>
							<GameInput
								min={0}
								onInput={(e) =>
									setDmgPen(Number.parseInt((e.target as HTMLInputElement).value, 10) || 0)
								}
								type="number"
								value={dmgPen}
							/>
						</label>
						<label className="min-w-[90px] max-w-[120px] flex-none">
							<span>Resilience</span>
							<GameInput
								min={1}
								onInput={(e) =>
									setDmgRes(Number.parseInt((e.target as HTMLInputElement).value, 10) || 1)
								}
								type="number"
								value={dmgRes}
							/>
						</label>
						<Button onClick={handleCalcDamage} size="sm" variant="primary">
							Calculate
						</Button>
					</div>
					{damageResult && (
						<div className="mt-sm min-h-8 rounded-sm border border-border bg-bg px-md py-sm text-center text-[0.9rem]">
							{damageResult}
						</div>
					)}
				</AccordionItem>
			</div>
		</aside>
	);
}
