import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Highlight } from "./Highlight";
import { QREF_DATA } from "./qref-data";

interface ActionsSectionProps {
	onToggleSubtype: (subtype: string) => void;
	onToggleType: (type: string) => void;
	searchWords: string[];
	subtypeFilters: Set<string>;
	typeFilters: Set<string>;
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
			if (subtypes.size > 0 && !a.subtypes.some((s) => subtypes.has(s))) return false;
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
			<div className="mb-md flex flex-wrap gap-xs border-border border-b pb-md">
				<span className="mr-xs self-center text-[0.75rem] text-text-dim uppercase tracking-[0.5px]">Type</span>
				{TYPE_OPTIONS.map((t) => (
					<button
						className={cn(
							"cursor-pointer rounded-sm border border-border bg-surface px-[10px] py-[3px] font-[inherit] text-[0.78rem] text-text-muted transition-all duration-150 hover:border-accent hover:text-text-primary",
							typeFilters.has(t) ? "border-accent bg-accent-bg text-accent" : "",
						)}
						key={t}
						onClick={() => toggleType(t)}
						type="button"
					>
						{t}
					</button>
				))}
				<span className="mx-sm w-px self-stretch bg-border" />
				<span className="mr-xs self-center text-[0.75rem] text-text-dim uppercase tracking-[0.5px]">
					Subtype
				</span>
				{SUBTYPE_OPTIONS.map((s) => (
					<button
						className={cn(
							"cursor-pointer rounded-sm border border-border bg-surface px-[10px] py-[3px] font-[inherit] text-[0.78rem] text-text-muted transition-all duration-150 hover:border-accent hover:text-text-primary",
							subtypeFilters.has(s) ? "border-accent bg-accent-bg text-accent" : "",
						)}
						key={s}
						onClick={() => toggleSubtype(s)}
						type="button"
					>
						{s}
					</button>
				))}
			</div>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-[0.88rem] max-[600px]:text-[0.8rem]">
					<thead>
						<tr>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Name
							</th>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Type
							</th>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Subtypes
							</th>
							<th className="sticky top-0 border-border border-b bg-surface px-md py-sm text-left font-semibold text-[0.78rem] text-text-muted uppercase tracking-[0.5px] max-[600px]:px-sm max-[600px]:py-xs">
								Description
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredActions.map((a) => (
							<tr className="even:bg-stripe hover:bg-surface" key={a.name}>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									<strong>
										<Highlight text={a.name} words={searchWords} />
									</strong>
								</td>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									{a.type.split("/").map((t) => (
										<span className={badgeClass(t)} key={t}>
											{t.trim()}
										</span>
									))}
								</td>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
									{a.subtypes.map((s) => (
										<span
											className="m-[1px] inline-block rounded-[3px] bg-surface-raised px-[6px] py-[1px] text-[0.7rem] text-text-muted"
											key={s}
										>
											{s}
										</span>
									))}
								</td>
								<td className="border-border border-b px-md py-sm text-left max-[600px]:px-sm max-[600px]:py-xs">
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
