import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameInput } from "@/components/react/ui/GameInput";
import type { XpLogEntry } from "@/lib/dtd/types";
import { useCharSheetStore } from "../store";

export function XpTab() {
	const char = useCharSheetStore((s) => s.char);
	const updateChar = useCharSheetStore((s) => s.updateChar);
	const [incomeLabel, setIncomeLabel] = useState("");
	const [incomeAmount, setIncomeAmount] = useState("");
	const [spendLabel, setSpendLabel] = useState("");
	const [spendAmount, setSpendAmount] = useState("");

	const totalEarned = (char.xpLog || []).reduce((sum, e) => sum + e.amount, 0);
	const totalSpent = (char.xpSpendLog || []).reduce((sum, e) => sum + e.amount, 0);
	const remaining = totalEarned - totalSpent;

	const addIncome = () => {
		const amt = Number(incomeAmount);
		if (!(incomeLabel.trim() && amt) || amt <= 0) return;
		updateChar((c) => {
			if (!c.xpLog) c.xpLog = [];
			c.xpLog.push({ label: incomeLabel.trim(), amount: amt, timestamp: Date.now() });
			c.totalXP = (c.xpLog || []).reduce((s, e) => s + e.amount, 0);
			c.xpSpent = (c.xpSpendLog || []).reduce((s, e) => s + e.amount, 0);
		});
		setIncomeLabel("");
		setIncomeAmount("");
	};

	const addSpend = () => {
		const amt = Number(spendAmount);
		if (!(spendLabel.trim() && amt) || amt <= 0) return;
		updateChar((c) => {
			if (!c.xpSpendLog) c.xpSpendLog = [];
			c.xpSpendLog.push({ label: spendLabel.trim(), amount: amt, timestamp: Date.now() });
			c.totalXP = (c.xpLog || []).reduce((s, e) => s + e.amount, 0);
			c.xpSpent = (c.xpSpendLog || []).reduce((s, e) => s + e.amount, 0);
		});
		setSpendLabel("");
		setSpendAmount("");
	};

	const removeIncome = (idx: number) => {
		updateChar((c) => {
			c.xpLog = (c.xpLog || []).filter((_, i) => i !== idx);
			c.totalXP = c.xpLog.reduce((s, e) => s + e.amount, 0);
			c.xpSpent = (c.xpSpendLog || []).reduce((s, e) => s + e.amount, 0);
		});
	};

	const removeSpend = (idx: number) => {
		updateChar((c) => {
			c.xpSpendLog = (c.xpSpendLog || []).filter((_, i) => i !== idx);
			c.totalXP = (c.xpLog || []).reduce((s, e) => s + e.amount, 0);
			c.xpSpent = c.xpSpendLog.reduce((s, e) => s + e.amount, 0);
		});
	};

	const renderLogTable = (entries: XpLogEntry[], onRemove: (idx: number) => void) => (
		<table className="w-full border-collapse text-sm">
			<thead>
				<tr>
					<th className="border border-border bg-surface px-2 py-1 text-left font-semibold text-xs uppercase tracking-[0.04em]">
						Description
					</th>
					<th className="w-[80px] border border-border bg-surface px-2 py-1 text-right font-semibold text-xs uppercase tracking-[0.04em]">
						XP
					</th>
					<th className="w-[40px] border border-border bg-surface px-2 py-1 text-center font-semibold text-xs uppercase tracking-[0.04em]" />
				</tr>
			</thead>
			<tbody>
				{entries.length === 0 && (
					<tr>
						<td className="border border-border px-2 py-2 text-center text-text-dim text-xs" colSpan={3}>
							No entries yet
						</td>
					</tr>
				)}
				{entries.map((entry, i) => (
					<tr key={`${entry.timestamp}-${entry.label}-${entry.amount}`}>
						<td className="border border-border px-2 py-1">{entry.label}</td>
						<td className="border border-border px-2 py-1 text-right font-bold text-accent">
							{entry.amount}
						</td>
						<td className="border border-border px-2 py-1 text-center">
							<button
								className="cursor-pointer border-none bg-transparent text-error text-sm leading-none"
								onClick={() => onRemove(i)}
								title="Remove entry"
								type="button"
							>
								×
							</button>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);

	return (
		<section className="tab-panel">
			{/* ---------- XP Summary Bar ---------- */}
			<div className="mb-md flex flex-wrap items-center gap-lg rounded-md border border-border bg-surface-raised px-lg py-md">
				<div className="flex flex-col items-center">
					<span className="text-text-muted text-xs uppercase tracking-wide-px">Earned</span>
					<span className="font-bold text-accent text-xl">{totalEarned}</span>
				</div>
				<span className="text-text-dim text-xl">−</span>
				<div className="flex flex-col items-center">
					<span className="text-text-muted text-xs uppercase tracking-wide-px">Spent</span>
					<span className="font-bold text-text-primary text-xl">{totalSpent}</span>
				</div>
				<span className="text-text-dim text-xl">=</span>
				<div className="flex flex-col items-center">
					<span className="text-text-muted text-xs uppercase tracking-wide-px">Remaining</span>
					<span className={`font-bold text-xl ${remaining < 0 ? "text-error" : "text-accent"}`}>
						{remaining}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-md md:grid-cols-2">
				{/* ---------- XP Income ---------- */}
				<div className="section-card rounded-md border border-border bg-surface p-lg">
					<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">XP Income</h3>
					{renderLogTable(char.xpLog || [], removeIncome)}
					<div className="mt-md flex items-end gap-xs">
						<label className="flex flex-1 flex-col text-xs uppercase tracking-tight-px">
							Description
							<GameInput
								onInput={(e) => setIncomeLabel((e.target as HTMLInputElement).value)}
								placeholder="e.g. Session 3"
								type="text"
								value={incomeLabel}
							/>
						</label>
						<label className="flex w-[80px] flex-col text-xs uppercase tracking-tight-px">
							XP
							<GameInput
								min={1}
								onInput={(e) => setIncomeAmount((e.target as HTMLInputElement).value)}
								placeholder="100"
								type="number"
								value={incomeAmount}
							/>
						</label>
						<Button onClick={addIncome} size="sm">
							+ Add
						</Button>
					</div>
				</div>

				{/* ---------- XP Spending ---------- */}
				<div className="section-card rounded-md border border-border bg-surface p-lg">
					<h3 className="m-0 mb-md border-border border-b pb-sm text-accent text-tool-base">XP Spending</h3>
					{renderLogTable(char.xpSpendLog || [], removeSpend)}
					<div className="mt-md flex items-end gap-xs">
						<label className="flex flex-1 flex-col text-xs uppercase tracking-tight-px">
							Description
							<GameInput
								onInput={(e) => setSpendLabel((e.target as HTMLInputElement).value)}
								placeholder="e.g. +1 Dexterity"
								type="text"
								value={spendLabel}
							/>
						</label>
						<label className="flex w-[80px] flex-col text-xs uppercase tracking-tight-px">
							XP
							<GameInput
								min={1}
								onInput={(e) => setSpendAmount((e.target as HTMLInputElement).value)}
								placeholder="100"
								type="number"
								value={spendAmount}
							/>
						</label>
						<Button onClick={addSpend} size="sm">
							+ Add
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
