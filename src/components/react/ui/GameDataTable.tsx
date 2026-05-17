/**
 * GameDataTable — A pre-configured DataTable for embedding in MDX documentation.
 *
 * Renders sortable, filterable tables from JSON game data.
 * Use with `client:load` or `client:visible` in Astro/MDX files.
 *
 * Example MDX usage:
 * ```mdx
 * import { SchoolTechniquesTable } from '@/components/react/ui/GameDataTable';
 * <SchoolTechniquesTable schoolId="desertWind" client:visible />
 * ```
 */

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { SchoolDefinition, SchoolTechnique } from "@/lib/dtd/attacks-data";
import combatTechniques from "../../../../data/combat-techniques.json";
import { DataTable } from "./DataTable";

// =============================================================================
// School Techniques Table (for Sword Schools / Gun Kata docs)
// =============================================================================

interface SchoolTechniquesTableProps {
	/** Show all schools in one table */
	all?: boolean;
	/** Filter to a specific school by id */
	schoolId?: string;
	/** Filter by attack type */
	type?: "melee" | "ranged";
}

interface TechniqueRow {
	cost: number;
	effect: string;
	name: string;
	rank: number;
	school: string;
	stackable: boolean;
	type: string;
}

const techniqueColumns: ColumnDef<TechniqueRow, unknown>[] = [
	{
		accessorKey: "school",
		header: "School",
	},
	{
		accessorKey: "rank",
		header: "Rank",
	},
	{
		accessorKey: "name",
		header: "Technique",
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ getValue }) => {
			const val = getValue() as string;
			const color =
				val === "restriction" ? "text-error" : val === "advantage" ? "text-success" : "text-text-muted";
			return <span className={color}>{val}</span>;
		},
	},
	{
		accessorKey: "cost",
		header: "SP",
		cell: ({ getValue }) => {
			const val = getValue() as number;
			if (val === 0) return <span className="text-text-dim">—</span>;
			const color = val < 0 ? "text-error" : "text-accent";
			return <span className={`font-mono ${color}`}>{val > 0 ? `+${val}` : val}</span>;
		},
	},
	{
		accessorKey: "effect",
		header: "Effect",
	},
	{
		accessorKey: "stackable",
		header: "Stack",
		cell: ({ getValue }) => (getValue() ? "✓" : ""),
	},
];

function getSchoolData(props: SchoolTechniquesTableProps): TechniqueRow[] {
	const allSchools = [...combatTechniques.swordSchools, ...combatTechniques.gunKata] as SchoolDefinition[];

	let schools: SchoolDefinition[];

	if (props.schoolId) {
		schools = allSchools.filter((s) => s.id === props.schoolId);
	} else if (props.type) {
		schools = allSchools.filter((s) => s.attackType === props.type);
	} else {
		schools = allSchools;
	}

	return schools.flatMap((school) =>
		school.techniques.map((tech) => ({
			school: school.name,
			rank: tech.rank,
			name: tech.name,
			type: tech.type,
			cost: tech.cost,
			effect: tech.effect,
			stackable: tech.stackable ?? false,
		})),
	);
}

export function SchoolTechniquesTable({ schoolId, type, all }: SchoolTechniquesTableProps) {
	const data = useMemo(() => getSchoolData({ schoolId, type, all }), [schoolId, type, all]);

	// If showing a single school, hide the "School" column
	const columns = useMemo(() => {
		if (schoolId) {
			return techniqueColumns.filter((c) => (c as { accessorKey?: string }).accessorKey !== "school");
		}
		return techniqueColumns;
	}, [schoolId]);

	return <DataTable columns={columns} compact data={data} filterable filterPlaceholder="Search techniques..." />;
}

// =============================================================================
// Universal Modifiers Table
// =============================================================================

export function UniversalModifiersTable() {
	const data = useMemo(
		() => [
			...(combatTechniques.universalAdvantages as SchoolTechnique[]).map((t) => ({
				...t,
				school: "Universal",
				stackable: t.stackable ?? false,
			})),
			...(combatTechniques.universalRestrictions as SchoolTechnique[]).map((t) => ({
				...t,
				school: "Universal",
				stackable: t.stackable ?? false,
			})),
		],
		[],
	);

	const columns: ColumnDef<TechniqueRow, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: "Modifier",
			},
			{
				accessorKey: "type",
				header: "Type",
				cell: ({ getValue }) => {
					const val = getValue() as string;
					const color = val === "restriction" ? "text-error" : "text-success";
					return <span className={color}>{val}</span>;
				},
			},
			{
				accessorKey: "cost",
				header: "SP",
				cell: ({ getValue }) => {
					const val = getValue() as number;
					const color = val < 0 ? "text-error" : "text-accent";
					return <span className={`font-mono ${color}`}>{val > 0 ? `+${val}` : val}</span>;
				},
			},
			{
				accessorKey: "effect",
				header: "Effect",
			},
			{
				accessorKey: "stackable",
				header: "Stack",
				cell: ({ getValue }) => (getValue() ? "✓" : ""),
			},
		],
		[],
	);

	return <DataTable columns={columns} compact data={data} />;
}

// =============================================================================
// School Overview Table (comparison of all schools)
// =============================================================================

interface SchoolOverviewRow {
	attackType: string;
	id: string;
	keySkill: string;
	name: string;
	techniqueCount: number;
	weaponType: string;
}

export function SchoolOverviewTable({ type }: { type?: "melee" | "ranged" }) {
	const data = useMemo(() => {
		const allSchools = [...combatTechniques.swordSchools, ...combatTechniques.gunKata] as SchoolDefinition[];

		const filtered = type ? allSchools.filter((s) => s.attackType === type) : allSchools;

		return filtered.map((s) => ({
			id: s.id,
			name: s.name,
			attackType: s.attackType,
			keySkill: s.keySkill,
			weaponType: s.weaponType,
			techniqueCount: s.techniques.length,
		}));
	}, [type]);

	const columns: ColumnDef<SchoolOverviewRow, unknown>[] = useMemo(
		() => [
			{ accessorKey: "name", header: "School" },
			{ accessorKey: "attackType", header: "Type" },
			{ accessorKey: "keySkill", header: "Key Skill" },
			{ accessorKey: "weaponType", header: "Weapon" },
			{ accessorKey: "techniqueCount", header: "Techniques" },
		],
		[],
	);

	return <DataTable columns={columns} compact data={data} filterable filterPlaceholder="Search schools..." />;
}
