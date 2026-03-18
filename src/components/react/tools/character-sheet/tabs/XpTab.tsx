import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
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
		if (!incomeLabel.trim() || !amt || amt <= 0) return;
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
		if (!spendLabel.trim() || !amt || amt <= 0) return;
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
		<table className="w-full border-collapse text-[0.85rem]">
			<thead>
				<tr>
					<th className="py-1 px-2 border border-border text-left bg-surface font-semibold text-[0.78rem] uppercase tracking-[0.04em]">
						Description
					</th>
					<th className="py-1 px-2 border border-border text-right bg-surface font-semibold text-[0.78rem] uppercase tracking-[0.04em] w-[80px]">
						XP
					</th>
					<th className="py-1 px-2 border border-border text-center bg-surface font-semibold text-[0.78rem] uppercase tracking-[0.04em] w-[40px]" />
				</tr>
			</thead>
			<tbody>
				{entries.length === 0 && (
					<tr>
						<td
							colSpan={3}
							className="py-2 px-2 border border-border text-center text-text-dim text-[0.82rem]"
						>
							No entries yet
						</td>
					</tr>
				)}
				{entries.map((entry, i) => (
					<tr key={`${entry.timestamp}-${entry.label}-${entry.amount}`}>
						<td className="py-1 px-2 border border-border">{entry.label}</td>
						<td className="py-1 px-2 border border-border text-right font-bold text-accent">
							{entry.amount}
						</td>
						<td className="py-1 px-2 border border-border text-center">
							<button
								type="button"
								className="bg-transparent border-none text-error cursor-pointer text-sm leading-none"
								onClick={() => onRemove(i)}
								title="Remove entry"
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
			<div className="flex items-center gap-lg px-lg py-md bg-surface-raised border border-border rounded-md mb-md flex-wrap">
				<div className="flex flex-col items-center">
					<span className="text-[0.72rem] text-text-muted uppercase tracking-[0.5px]">Earned</span>
					<span className="text-xl font-bold text-accent">{totalEarned}</span>
				</div>
				<span className="text-text-dim text-xl">−</span>
				<div className="flex flex-col items-center">
					<span className="text-[0.72rem] text-text-muted uppercase tracking-[0.5px]">Spent</span>
					<span className="text-xl font-bold text-text-primary">{totalSpent}</span>
				</div>
				<span className="text-text-dim text-xl">=</span>
				<div className="flex flex-col items-center">
					<span className="text-[0.72rem] text-text-muted uppercase tracking-[0.5px]">Remaining</span>
					<span className={`text-xl font-bold ${remaining < 0 ? "text-error" : "text-accent"}`}>
						{remaining}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-md">
				{/* ---------- XP Income ---------- */}
				<div className="section-card bg-surface border border-border rounded-md p-lg">
					<h3 className="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">XP Income</h3>
					{renderLogTable(char.xpLog || [], removeIncome)}
					<div className="flex gap-xs mt-md items-end">
						<label className="flex flex-col flex-1 text-[0.75rem] uppercase tracking-[0.3px]">
							Description
							<input
								type="text"
								className="w-full"
								value={incomeLabel}
								onInput={(e) => setIncomeLabel((e.target as HTMLInputElement).value)}
								placeholder="e.g. Session 3"
							/>
						</label>
						<label className="flex flex-col w-[80px] text-[0.75rem] uppercase tracking-[0.3px]">
							XP
							<input
								type="number"
								className="w-full"
								value={incomeAmount}
								min={1}
								onInput={(e) => setIncomeAmount((e.target as HTMLInputElement).value)}
								placeholder="100"
							/>
						</label>
						<Button size="sm" onClick={addIncome}>
							+ Add
						</Button>
					</div>
				</div>

				{/* ---------- XP Spending ---------- */}
				<div className="section-card bg-surface border border-border rounded-md p-lg">
					<h3 className="m-0 mb-md text-accent text-[1.05rem] pb-sm border-b border-border">XP Spending</h3>
					{renderLogTable(char.xpSpendLog || [], removeSpend)}
					<div className="flex gap-xs mt-md items-end">
						<label className="flex flex-col flex-1 text-[0.75rem] uppercase tracking-[0.3px]">
							Description
							<input
								type="text"
								className="w-full"
								value={spendLabel}
								onInput={(e) => setSpendLabel((e.target as HTMLInputElement).value)}
								placeholder="e.g. +1 Dexterity"
							/>
						</label>
						<label className="flex flex-col w-[80px] text-[0.75rem] uppercase tracking-[0.3px]">
							XP
							<input
								type="number"
								className="w-full"
								value={spendAmount}
								min={1}
								onInput={(e) => setSpendAmount((e.target as HTMLInputElement).value)}
								placeholder="100"
							/>
						</label>
						<Button size="sm" onClick={addSpend}>
							+ Add
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
