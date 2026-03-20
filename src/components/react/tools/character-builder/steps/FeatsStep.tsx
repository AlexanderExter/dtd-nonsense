import { useRef, useState } from "react";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { AH_CATS, FEAT_CATS, filterByRestrictions } from "../constants";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";
import { useBuilderStore } from "../store";

export function FeatsStep() {
	const [featCatFilter, setFeatCatFilter] = useState("all");
	const [ahCatFilter, setAhCatFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFeatPreview] = useState<any>(null);
	const [selectedAHPreview, setSelectedAHPreview] = useState<any>(null);

	const data = useBuilderStore((s) => s.gameData);
	const char = useBuilderStore((s) => s.char);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	if (!data?.feats?.feats) return <p>Loading feat data…</p>;

	const allFeats = data.feats.feats as any[];
	const raceName = char.race || null;
	const exaltName = char.exaltation || null;

	// Split feats vs assets/hindrances
	const feats = allFeats.filter((f: any) => FEAT_CATS.includes(f.category));
	const ahItems = allFeats.filter((f: any) => AH_CATS.includes(f.category));

	// Apply restrictions
	const availableFeats = filterByRestrictions(feats, raceName, exaltName);
	const availableAH = filterByRestrictions(ahItems, raceName, exaltName);

	// Apply feat filters
	let filteredFeats = availableFeats;
	if (featCatFilter !== "all") {
		filteredFeats = filteredFeats.filter((f: any) => f.category === featCatFilter);
	}
	const q = searchQuery.toLowerCase();
	if (q) {
		filteredFeats = filteredFeats.filter(
			(f: any) => f.name?.toLowerCase().includes(q) || f.effect?.toLowerCase().includes(q),
		);
	}

	// Apply AH filter
	let filteredAH = availableAH;
	if (ahCatFilter !== "all") {
		filteredAH = filteredAH.filter((f: any) => f.category === ahCatFilter);
	}

	const selectedFeatIds = new Set((char.feats || []).map((f) => f.name));
	const selectedAssetIds = new Set((char.assets || []).map((f) => f.name));
	const selectedHindranceIds = new Set((char.hindrances || []).map((f) => f.name));

	const toggleFeat = (feat: any) => {
		const id = feat.id || feat.name;
		updateChar((c) => {
			const idx = c.feats.findIndex((f) => f.name === id);
			if (idx >= 0) {
				c.feats.splice(idx, 1);
			} else {
				c.feats.push({ name: id, notes: "" });
			}
		});
		markStepComplete();
	};

	const toggleAH = (item: any) => {
		const id = item.id || item.name;
		const isHindrance = item.category === "hindrance";
		const list = isHindrance ? "hindrances" : "assets";

		updateChar((c) => {
			const arr = c[list] as Array<{ name: string; notes: string }>;
			const idx = arr.findIndex((f) => f.name === id);
			if (idx >= 0) {
				arr.splice(idx, 1);
			} else {
				arr.push({ name: id, notes: "" });
			}
		});
		markStepComplete();
	};

	const markStepComplete = () => {
		const c = useBuilderStore.getState().char;
		const hasAny = (c.feats?.length || 0) + (c.assets?.length || 0) + (c.hindrances?.length || 0) > 0;
		if (hasAny !== useBuilderStore.getState().meta.stepsCompleted[8]) {
			updateMeta((m) => {
				m.stepsCompleted[8] = hasAny;
			});
		}
	};

	const handleSearch = (value: string) => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setSearchQuery(value);
		}, 200);
	};

	const featPreview = selectedFeatPreview;
	const ahPreview = selectedAHPreview;

	return (
		<div>
			{/* ===== Feats Section ===== */}
			<section className="mb-lg">
				<h3>Feats</h3>
				<div className="mb-md flex flex-wrap items-center gap-sm rounded-sm bg-surface px-md py-sm">
					<GameSelect
						onChange={(e) => {
							setFeatCatFilter((e.target as HTMLSelectElement).value);
						}}
						value={featCatFilter}
					>
						<option value="all">All Categories</option>
						<option value="general">General</option>
						<option value="racial">Racial</option>
						<option value="supplementary">Supplementary</option>
					</GameSelect>
					<GameInput
						onInput={(e) => handleSearch((e.target as HTMLInputElement).value)}
						placeholder="Search feats…"
						type="text"
					/>
				</div>

				{/* Selected feats */}
				{char.feats.length > 0 && (
					<div className="mb-md flex flex-wrap gap-xs">
						{char.feats.map((f) => (
							<span
								className="inline-flex items-center gap-1 rounded-full border border-accent-dim bg-[rgba(212,168,75,0.12)] px-2.5 py-[3px] text-[0.8rem] text-accent"
								key={f.name}
							>
								{f.name}
								<button
									aria-label={`Remove ${f.name}`}
									className="ml-0.5 cursor-pointer border-none bg-transparent p-0 text-[0.9rem] text-text-dim hover:text-error"
									onClick={() => toggleFeat({ id: f.name })}
									type="button"
								>
									×
								</button>
							</span>
						))}
					</div>
				)}

				<div className="mb-md grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
					{filteredFeats.map((f: any) => {
						const id = f.id || f.name;
						return (
							<SelectionCard
								key={id}
								onClick={() => {
									selectedFeatPreview.value = f;
								}}
								preview={f.effect?.slice(0, 60)}
								selected={selectedFeatIds.has(id)}
								subtitle={f.category}
								title={f.name}
							/>
						);
					})}
				</div>

				{featPreview && (
					<DetailPanel>
						<h4>{featPreview.name}</h4>
						{featPreview.category && (
							<p>
								<strong>Category:</strong> {featPreview.category}
							</p>
						)}
						{featPreview.prerequisites?.length > 0 && (
							<p>
								<strong>Prerequisites:</strong> {featPreview.prerequisites.join(", ")}
							</p>
						)}
						{featPreview.effect && <p>{featPreview.effect}</p>}
						<p className="text-[0.8rem] text-text-muted">Cost: 100 XP</p>
						<div className="mt-md flex gap-sm">
							<button
								className={`btn ${selectedFeatIds.has(featPreview.id || featPreview.name) ? "btn-danger" : "btn-primary"}`}
								onClick={() => toggleFeat(featPreview)}
								type="button"
							>
								{selectedFeatIds.has(featPreview.id || featPreview.name) ? "Remove" : "Add"}
							</button>
						</div>
					</DetailPanel>
				)}
			</section>

			{/* ===== Assets & Hindrances Section ===== */}
			<section>
				<h3>Assets &amp; Hindrances</h3>
				<div className="mb-md flex flex-wrap items-center gap-sm rounded-sm bg-surface px-md py-sm">
					<GameSelect
						onChange={(e) => {
							setAhCatFilter((e.target as HTMLSelectElement).value);
						}}
						value={ahCatFilter}
					>
						<option value="all">All</option>
						<option value="asset">Assets</option>
						<option value="exaltedAsset">Exalted Assets</option>
						<option value="hindrance">Hindrances</option>
					</GameSelect>
				</div>

				{/* Selected assets/hindrances */}
				{(char.assets.length > 0 || char.hindrances.length > 0) && (
					<div className="mb-md flex flex-wrap gap-xs">
						{char.assets.map((a) => (
							<span
								className="inline-flex items-center gap-1 rounded-full border border-success bg-[rgba(74,222,128,0.1)] px-2.5 py-[3px] text-[0.8rem] text-success"
								key={a.name}
							>
								{a.name}
								<button
									aria-label={`Remove ${a.name}`}
									className="ml-0.5 cursor-pointer border-none bg-transparent p-0 text-[0.9rem] text-text-dim hover:text-error"
									onClick={() => toggleAH({ id: a.name, category: "asset" })}
									type="button"
								>
									×
								</button>
							</span>
						))}
						{char.hindrances.map((h) => (
							<span
								className="inline-flex items-center gap-1 rounded-full border border-error bg-[rgba(248,113,113,0.1)] px-2.5 py-[3px] text-[0.8rem] text-error"
								key={h.name}
							>
								{h.name}
								<button
									aria-label={`Remove ${h.name}`}
									className="ml-0.5 cursor-pointer border-none bg-transparent p-0 text-[0.9rem] text-text-dim hover:text-error"
									onClick={() => toggleAH({ id: h.name, category: "hindrance" })}
									type="button"
								>
									×
								</button>
							</span>
						))}
					</div>
				)}

				<div className="mb-md grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-sm">
					{filteredAH.map((item: any) => {
						const id = item.id || item.name;
						const isHindrance = item.category === "hindrance";
						const selected = isHindrance ? selectedHindranceIds.has(id) : selectedAssetIds.has(id);

						return (
							<SelectionCard
								key={id}
								onClick={() => {
									setSelectedAHPreview(item);
								}}
								preview={item.effect?.slice(0, 60)}
								selected={selected}
								subtitle={
									isHindrance
										? "Hindrance (+100 XP)"
										: item.category === "exaltedAsset"
											? "Exalted Asset (100 XP)"
											: "Asset (100 XP)"
								}
								title={item.name}
							/>
						);
					})}
				</div>

				{ahPreview && (
					<DetailPanel>
						<h4>{ahPreview.name}</h4>
						<p>
							<strong>Type:</strong>{" "}
							{ahPreview.category === "hindrance" ? "Hindrance (+100 XP bonus)" : "Asset (100 XP)"}
						</p>
						{ahPreview.prerequisites?.length > 0 && (
							<p>
								<strong>Prerequisites:</strong> {ahPreview.prerequisites.join(", ")}
							</p>
						)}
						{ahPreview.effect && <p>{ahPreview.effect}</p>}
						<div className="mt-md flex gap-sm">
							{(() => {
								const id = ahPreview.id || ahPreview.name;
								const isHindrance = ahPreview.category === "hindrance";
								const isSelected = isHindrance
									? selectedHindranceIds.has(id)
									: selectedAssetIds.has(id);
								return (
									<button
										className={`btn ${isSelected ? "btn-danger" : "btn-primary"}`}
										onClick={() => toggleAH(ahPreview)}
										type="button"
									>
										{isSelected ? "Remove" : "Add"}
									</button>
								);
							})()}
						</div>
					</DetailPanel>
				)}
			</section>
		</div>
	);
}
