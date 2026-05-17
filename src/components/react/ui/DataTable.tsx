import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
	className?: string;
	columns: ColumnDef<TData, unknown>[];
	/** Compact row density */
	compact?: boolean;
	data: TData[];
	/** Show the global filter input */
	filterable?: boolean;
	/** Placeholder text for the global filter */
	filterPlaceholder?: string;
}

export function DataTable<TData>({
	columns,
	data,
	className,
	filterable = false,
	filterPlaceholder = "Filter...",
	compact = false,
}: DataTableProps<TData>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = useState("");

	const table = useReactTable({
		data,
		columns,
		state: { sorting, columnFilters, columnVisibility, globalFilter },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	return (
		<div className={cn("w-full", className)}>
			{filterable && (
				<div className="mb-sm">
					<input
						className="w-full max-w-sm rounded-sm border border-border bg-bg px-2 py-1 text-sm text-text-primary placeholder:text-text-dim focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
						onChange={(e) => setGlobalFilter(e.target.value)}
						placeholder={filterPlaceholder}
						type="text"
						value={globalFilter}
					/>
				</div>
			)}
			<div className="overflow-x-auto rounded-md border border-border">
				<table className="w-full border-collapse text-sm">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr className="border-border border-b bg-surface" key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										className={cn(
											"text-left font-semibold text-text-muted text-xs uppercase tracking-wide",
											compact ? "px-2 py-1" : "px-3 py-2",
											header.column.getCanSort() &&
												"cursor-pointer select-none hover:text-accent",
										)}
										key={header.id}
										onClick={header.column.getToggleSortingHandler()}
									>
										<span className="inline-flex items-center gap-1">
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
											{header.column.getIsSorted() === "asc" && " ▴"}
											{header.column.getIsSorted() === "desc" && " ▾"}
										</span>
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length === 0 ? (
							<tr>
								<td className="py-6 text-center text-text-dim" colSpan={columns.length}>
									No results.
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr
									className="border-border border-b transition-colors last:border-b-0 hover:bg-surface-raised/50"
									key={row.id}
								>
									{row.getVisibleCells().map((cell) => (
										<td
											className={cn(
												"text-text-primary",
												compact ? "px-2 py-1 text-xs" : "px-3 py-2",
											)}
											key={cell.id}
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			{filterable && (
				<p className="mt-1 text-right text-text-dim text-xs">
					{table.getFilteredRowModel().rows.length} of {data.length} row(s)
				</p>
			)}
		</div>
	);
}
