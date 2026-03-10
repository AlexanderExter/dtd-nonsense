import { signal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { charSignal, gameData, metaSignal, updateChar, updateMeta } from "../CharacterBuilderApp";
import { AH_CATS, FEAT_CATS, filterByRestrictions } from "../constants";
import { DetailPanel } from "../shared/DetailPanel";
import { SelectionCard } from "../shared/SelectionCard";

const featCatFilter = signal<string>("all");
const ahCatFilter = signal<string>("all");
const searchQuery = signal("");
const selectedFeatPreview = signal<any>(null);
const selectedAHPreview = signal<any>(null);

export function FeatsStep() {
	const data = gameData.value;
	if (!data?.feats?.feats) return <p>Loading feat data…</p>;

	const allFeats = data.feats.feats as any[];
	const char = charSignal.value;
	const raceName = char.race || null;
	const exaltName = char.exaltation || null;
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Split feats vs assets/hindrances
	const feats = allFeats.filter((f: any) => FEAT_CATS.includes(f.category));
	const ahItems = allFeats.filter((f: any) => AH_CATS.includes(f.category));

	// Apply restrictions
	const availableFeats = filterByRestrictions(feats, raceName, exaltName);
	const availableAH = filterByRestrictions(ahItems, raceName, exaltName);

	// Apply feat filters
	let filteredFeats = availableFeats;
	if (featCatFilter.value !== "all") {
		filteredFeats = filteredFeats.filter((f: any) => f.category === featCatFilter.value);
	}
	const q = searchQuery.value.toLowerCase();
	if (q) {
		filteredFeats = filteredFeats.filter(
			(f: any) => f.name?.toLowerCase().includes(q) || f.effect?.toLowerCase().includes(q),
		);
	}

	// Apply AH filter
	let filteredAH = availableAH;
	if (ahCatFilter.value !== "all") {
		filteredAH = filteredAH.filter((f: any) => f.category === ahCatFilter.value);
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
		const c = charSignal.value;
		const hasAny = (c.feats?.length || 0) + (c.assets?.length || 0) + (c.hindrances?.length || 0) > 0;
		if (hasAny !== metaSignal.value.stepsCompleted[8]) {
			updateMeta((m) => {
				m.stepsCompleted[8] = hasAny;
			});
		}
	};

	const handleSearch = (value: string) => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			searchQuery.value = value;
		}, 200);
	};

	const featPreview = selectedFeatPreview.value;
	const ahPreview = selectedAHPreview.value;

	return (
		<div class="step-feats">
			{/* ===== Feats Section ===== */}
			<section class="feats-section">
				<h3>Feats</h3>
				<div class="filter-bar">
					<select
						value={featCatFilter.value}
						onChange={(e) => {
							featCatFilter.value = (e.target as HTMLSelectElement).value;
						}}
					>
						<option value="all">All Categories</option>
						<option value="general">General</option>
						<option value="racial">Racial</option>
						<option value="supplementary">Supplementary</option>
					</select>
					<input
						type="text"
						placeholder="Search feats…"
						onInput={(e) => handleSearch((e.target as HTMLInputElement).value)}
					/>
				</div>

				{/* Selected feats */}
				{char.feats.length > 0 && (
					<div class="tag-list">
						{char.feats.map((f) => (
							<span key={f.name} class="tag tag-feat">
								{f.name}
								<button
									type="button"
									class="tag-remove"
									onClick={() => toggleFeat({ id: f.name })}
									aria-label={`Remove ${f.name}`}
								>
									×
								</button>
							</span>
						))}
					</div>
				)}

				<div class="selection-grid">
					{filteredFeats.map((f: any) => {
						const id = f.id || f.name;
						return (
							<SelectionCard
								key={id}
								title={f.name}
								subtitle={f.category}
								preview={f.effect?.slice(0, 60)}
								selected={selectedFeatIds.has(id)}
								onClick={() => {
									selectedFeatPreview.value = f;
								}}
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
						<p class="xp-cost">Cost: 100 XP</p>
						<div class="detail-actions">
							<button
								type="button"
								class={`btn ${selectedFeatIds.has(featPreview.id || featPreview.name) ? "btn-danger" : "btn-primary"}`}
								onClick={() => toggleFeat(featPreview)}
							>
								{selectedFeatIds.has(featPreview.id || featPreview.name) ? "Remove" : "Add"}
							</button>
						</div>
					</DetailPanel>
				)}
			</section>

			{/* ===== Assets & Hindrances Section ===== */}
			<section class="ah-section">
				<h3>Assets &amp; Hindrances</h3>
				<div class="filter-bar">
					<select
						value={ahCatFilter.value}
						onChange={(e) => {
							ahCatFilter.value = (e.target as HTMLSelectElement).value;
						}}
					>
						<option value="all">All</option>
						<option value="asset">Assets</option>
						<option value="exaltedAsset">Exalted Assets</option>
						<option value="hindrance">Hindrances</option>
					</select>
				</div>

				{/* Selected assets/hindrances */}
				{(char.assets.length > 0 || char.hindrances.length > 0) && (
					<div class="tag-list">
						{char.assets.map((a) => (
							<span key={a.name} class="tag tag-asset">
								{a.name}
								<button
									type="button"
									class="tag-remove"
									onClick={() => toggleAH({ id: a.name, category: "asset" })}
									aria-label={`Remove ${a.name}`}
								>
									×
								</button>
							</span>
						))}
						{char.hindrances.map((h) => (
							<span key={h.name} class="tag tag-hindrance">
								{h.name}
								<button
									type="button"
									class="tag-remove"
									onClick={() => toggleAH({ id: h.name, category: "hindrance" })}
									aria-label={`Remove ${h.name}`}
								>
									×
								</button>
							</span>
						))}
					</div>
				)}

				<div class="selection-grid">
					{filteredAH.map((item: any) => {
						const id = item.id || item.name;
						const isHindrance = item.category === "hindrance";
						const selected = isHindrance ? selectedHindranceIds.has(id) : selectedAssetIds.has(id);

						return (
							<SelectionCard
								key={id}
								title={item.name}
								subtitle={
									isHindrance
										? "Hindrance (+100 XP)"
										: item.category === "exaltedAsset"
											? "Exalted Asset (100 XP)"
											: "Asset (100 XP)"
								}
								preview={item.effect?.slice(0, 60)}
								selected={selected}
								onClick={() => {
									selectedAHPreview.value = item;
								}}
							/>
						);
					})}
				</div>

				{ahPreview && (
					<DetailPanel>
						<h4>{ahPreview.name}</h4>
						<p>
							<strong>Type:</strong>{" "}
							{ahPreview.category === "hindrance" ? "Hindrance (+100 XP bonus)" : `Asset (100 XP)`}
						</p>
						{ahPreview.prerequisites?.length > 0 && (
							<p>
								<strong>Prerequisites:</strong> {ahPreview.prerequisites.join(", ")}
							</p>
						)}
						{ahPreview.effect && <p>{ahPreview.effect}</p>}
						<div class="detail-actions">
							{(() => {
								const id = ahPreview.id || ahPreview.name;
								const isHindrance = ahPreview.category === "hindrance";
								const isSelected = isHindrance
									? selectedHindranceIds.has(id)
									: selectedAssetIds.has(id);
								return (
									<button
										type="button"
										class={`btn ${isSelected ? "btn-danger" : "btn-primary"}`}
										onClick={() => toggleAH(ahPreview)}
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
