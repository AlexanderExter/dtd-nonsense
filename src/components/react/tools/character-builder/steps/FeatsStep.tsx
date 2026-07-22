import { useState } from "react";
import { Button } from "@/components/react/ui/Button";
import { GameInput } from "@/components/react/ui/GameInput";
import { GameSelect } from "@/components/react/ui/GameSelect";
import { useDebounce } from "@/hooks/use-debounce";
import { AH_CATS, capitalize, FEAT_CATS, filterByRestrictions } from "../constants";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";
import { useBuilderStore } from "../store";

export function FeatsStep() {
	const [featCatFilter, setFeatCatFilter] = useState("all");
	const [ahCatFilter, setAhCatFilter] = useState("all");
	const [searchInput, setSearchInput] = useState("");
	const searchQuery = useDebounce(searchInput, 200);
	const [selectedFeatPreview, setSelectedFeatPreview] = useState<any>(null);
	const [selectedAHPreview, setSelectedAHPreview] = useState<any>(null);

	const data = useBuilderStore((s) => s.gameData);
	const char = useBuilderStore((s) => s.char);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	if (!data?.feats?.feats) return <p>Loading feat data…</p>;

	const allFeats = data.feats.feats;
	const raceName = char.race || null;
	const exaltName = char.exaltation || null;

	// Split feats vs assets/hindrances
	const feats = allFeats.filter((f) => FEAT_CATS.includes(f.category));
	const ahItems = allFeats.filter((f) => AH_CATS.includes(f.category));

	// Apply restrictions
	const availableFeats = filterByRestrictions(feats, raceName, exaltName);
	const availableAH = filterByRestrictions(ahItems, raceName, exaltName);

	// Apply feat filters
	let filteredFeats = availableFeats;
	if (featCatFilter !== "all") {
		filteredFeats = filteredFeats.filter((f) => f.category === featCatFilter);
	}
	const q = searchQuery.toLowerCase();
	if (q) {
		filteredFeats = filteredFeats.filter(
			(f) => f.name?.toLowerCase().includes(q) || f.effect?.toLowerCase().includes(q),
		);
	}

	// Apply AH filter
	let filteredAH = availableAH;
	if (ahCatFilter !== "all") {
		filteredAH = filteredAH.filter((f) => f.category === ahCatFilter);
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
		setSearchInput(value);
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
								className="inline-flex items-center gap-1 rounded-full border border-accent-dim bg-accent-bg-medium px-2.5 py-2xs text-accent text-xs"
								key={f.name}
							>
								{f.name}
								<button
									aria-label={`Remove ${f.name}`}
									className="ml-0.5 cursor-pointer border-none bg-transparent p-0 text-sm text-text-dim hover:text-error"
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
					{filteredFeats.map((f) => {
						const id = f.id || f.name;
						return (
							<SelectionCard
								key={id}
								onClick={() => {
									setSelectedFeatPreview(f);
								}}
								preview={f.effect?.slice(0, 60)}
								selected={selectedFeatIds.has(id)}
								subtitle={capitalize(f.category)}
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
								<strong>Category:</strong> {capitalize(featPreview.category)}
							</p>
						)}
						{featPreview.prerequisites?.length > 0 && (
							<p>
								<strong>Prerequisites:</strong> {featPreview.prerequisites.join(", ")}
							</p>
						)}
						{featPreview.effect && <p>{featPreview.effect}</p>}
						<p className="text-text-muted text-xs">Cost: 100 XP</p>
						<div className="mt-md flex gap-sm">
							<Button
								onClick={() => toggleFeat(featPreview)}
								variant={selectedFeatIds.has(featPreview.id || featPreview.name) ? "danger" : "primary"}
							>
								{selectedFeatIds.has(featPreview.id || featPreview.name) ? "Remove" : "Add"}
							</Button>
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
								className="inline-flex items-center gap-1 rounded-full border border-success bg-success-bg-light px-2.5 py-2xs text-success text-xs"
								key={a.name}
							>
								{a.name}
								<button
									aria-label={`Remove ${a.name}`}
									className="ml-0.5 cursor-pointer border-none bg-transparent p-0 text-sm text-text-dim hover:text-error"
									onClick={() => toggleAH({ id: a.name, category: "asset" })}
									type="button"
								>
									×
								</button>
							</span>
						))}
						{char.hindrances.map((h) => (
							<span
								className="inline-flex items-center gap-1 rounded-full border border-error bg-error-bg-light px-2.5 py-2xs text-error text-xs"
								key={h.name}
							>
								{h.name}
								<button
									aria-label={`Remove ${h.name}`}
									className="ml-0.5 cursor-pointer border-none bg-transparent p-0 text-sm text-text-dim hover:text-error"
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
									<Button
										onClick={() => toggleAH(ahPreview)}
										variant={isSelected ? "danger" : "primary"}
									>
										{isSelected ? "Remove" : "Add"}
									</Button>
								);
							})()}
						</div>
					</DetailPanel>
				)}
			</section>
		</div>
	);
}
