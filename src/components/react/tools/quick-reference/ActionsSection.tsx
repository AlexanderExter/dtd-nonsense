import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Highlight } from "./Highlight";
import { QREF_DATA } from "./qref-data";

interface ActionsSectionProps {
	searchWords: string[];
	typeFilters: Set<string>;
	subtypeFilters: Set<string>;
	onToggleType: (type: string) => void;
	onToggleSubtype: (subtype: string) => void;
}

const TYPE_OPTIONS = ["H", "F", "R", "Fr", "V"];
const SUBTYPE_OPTIONS = ["Attack", "Defense", "Movement", "Melee", "Ranged", "Misc"];

const BADGE_CLASSES: Record<string, string> = {
	H: "bg-badge-half text-badge-half-text",
	F: "bg-badge-full text-badge-full-text",
	R: "bg-badge-reaction text-badge-reaction-text",
	Fr: "bg-badge-free text-badge-free-text",
	V: "bg-badge-variable text-badge-variable-text",
};

function badgeClass(type: string): string {
	const t = type.trim();
	return `inline-block px-[8px] py-[2px] rounded-sm text-[0.75rem] font-bold uppercase tracking-[0.5px] leading-[1.4] align-middle whitespace-nowrap ${BADGE_CLASSES[t] ?? ""}`;
}

export function ActionsSection({
	searchWords,
	typeFilters,
	subtypeFilters,
	onToggleType,
	onToggleSubtype,
}: ActionsSectionProps) {
	const filteredActions = useMemo(() => {
		const types = typeFilters;
		const subtypes = subtypeFilters;

		return QREF_DATA.actions.filter((a) => {
			// Search filter
			if (searchWords.length > 0) {
				const text = `${a.name} ${a.desc} ${a.subtypes.join(" ")}`.toLowerCase();
				if (!searchWords.every((w) => text.includes(w))) return false;
			}
			// Type filter (OR within category)
			if (types.size > 0) {
				const rowTypes = a.type.replace(/\//g, " ").trim().split(/\s+/);
				if (!rowTypes.some((t) => types.has(t))) return false;
			}
			// Subtype filter (OR within category)
			if (subtypes.size > 0) {
				if (!a.subtypes.some((s) => subtypes.has(s))) return false;
			}
			return true;
		});
	}, [searchWords, typeFilters, subtypeFilters]);

	function toggleType(t: string) {
		onToggleType(t);
	}

	function toggleSubtype(s: string) {
		onToggleSubtype(s);
	}

	return (
		<>
			<div className="flex flex-wrap gap-xs mb-md pb-md border-b border-border">
				<span className="text-[0.75rem] text-text-dim uppercase tracking-[0.5px] self-center mr-xs">Type</span>
				{TYPE_OPTIONS.map((t) => (
					<button
						type="button"
						key={t}
						className={cn(
							"px-[10px] py-[3px] bg-surface border border-border rounded-sm text-text-muted text-[0.78rem] cursor-pointer transition-all duration-150 font-[inherit] hover:border-accent hover:text-text-primary",
							typeFilters.has(t) ? "bg-accent-bg border-accent text-accent" : "",
						)}
						onClick={() => toggleType(t)}
					>
						{t}
					</button>
				))}
				<span className="w-px bg-border self-stretch mx-sm" />
				<span className="text-[0.75rem] text-text-dim uppercase tracking-[0.5px] self-center mr-xs">
					Subtype
				</span>
				{SUBTYPE_OPTIONS.map((s) => (
					<button
						type="button"
						key={s}
						className={cn(
							"px-[10px] py-[3px] bg-surface border border-border rounded-sm text-text-muted text-[0.78rem] cursor-pointer transition-all duration-150 font-[inherit] hover:border-accent hover:text-text-primary",
							subtypeFilters.has(s) ? "bg-accent-bg border-accent text-accent" : "",
						)}
						onClick={() => toggleSubtype(s)}
					>
						{s}
					</button>
				))}
			</div>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
					<thead>
						<tr>
							<th className="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
								Name
							</th>
							<th className="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
								Type
							</th>
							<th className="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
								Subtypes
							</th>
							<th className="px-md py-sm text-left border-b border-border bg-surface text-text-muted font-semibold text-[0.78rem] uppercase tracking-[0.5px] sticky top-0 max-[600px]:px-sm max-[600px]:py-xs">
								Description
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredActions.map((a) => (
							<tr key={a.name} className="even:bg-stripe hover:bg-surface">
								<td className="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
									<strong>
										<Highlight text={a.name} words={searchWords} />
									</strong>
								</td>
								<td className="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
									{a.type.split("/").map((t) => (
										<span key={t} className={badgeClass(t)}>
											{t.trim()}
										</span>
									))}
								</td>
								<td className="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
									{a.subtypes.map((s) => (
										<span
											key={s}
											className="inline-block px-[6px] py-[1px] bg-surface-raised rounded-[3px] text-[0.7rem] text-text-muted m-[1px]"
										>
											{s}
										</span>
									))}
								</td>
								<td className="px-md py-sm text-left border-b border-border max-[600px]:px-sm max-[600px]:py-xs">
									<Highlight text={a.desc} words={searchWords} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
