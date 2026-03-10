import { charSignal, gameData, metaSignal, updateChar, updateMeta } from "../CharacterBuilderApp";
import { BG_BUDGET, BG_XP_PER_DOT, FREE_BG_CAP } from "../constants";
import { DotControl } from "../shared/DotControl";

export function BackgroundsStep() {
	const data = gameData.value;
	if (!data?.backgrounds?.backgrounds) return <p>Loading background data…</p>;

	const backgrounds = data.backgrounds.backgrounds as any[];
	const char = charSignal.value;
	const charBgs = char.backgrounds || [];

	// Calculate free dots remaining
	const totalFreeDots = charBgs.reduce((sum, b) => sum + Math.min(b.dots, FREE_BG_CAP), 0);
	const freeRemaining = BG_BUDGET - totalFreeDots;

	const getDots = (bgId: string): number => {
		const entry = charBgs.find((b) => b.name === bgId);
		return entry?.dots || 0;
	};

	const setDots = (bgId: string, dots: number) => {
		updateChar((c) => {
			const idx = c.backgrounds.findIndex((b) => b.name === bgId);
			if (dots === 0) {
				if (idx >= 0) c.backgrounds.splice(idx, 1);
			} else if (idx >= 0) {
				c.backgrounds[idx].dots = dots;
			} else {
				c.backgrounds.push({ name: bgId, dots, notes: "" });
			}
		});

		const hasAny = charSignal.value.backgrounds.length > 0;
		if (hasAny !== metaSignal.value.stepsCompleted[5]) {
			updateMeta((m) => {
				m.stepsCompleted[5] = hasAny;
			});
		}
	};

	const canIncrease = (bgId: string): boolean => {
		const current = getDots(bgId);
		if (current >= 5) return false;
		// If next dot is within free cap and we have budget, allow
		if (current < FREE_BG_CAP && freeRemaining > 0) return true;
		// Beyond free cap costs XP — always allow (XP tracking separate)
		if (current >= FREE_BG_CAP) return true;
		// At free cap, next dot costs XP
		if (current === FREE_BG_CAP - 1 && freeRemaining > 0) return true;
		return current >= FREE_BG_CAP;
	};

	return (
		<div class="step-backgrounds">
			<div class="budget-bar">
				<strong>Free Dots:</strong> {freeRemaining} / {BG_BUDGET} remaining
			</div>

			<div class="bg-grid">
				{backgrounds.map((bg: any) => {
					const dots = getDots(bg.id || bg.name);
					const xpDots = Math.max(0, dots - FREE_BG_CAP);

					return (
						<div key={bg.id || bg.name} class="bg-card">
							<h4>{bg.name}</h4>
							{bg.description && <p class="bg-desc">{bg.description}</p>}
							<DotControl
								value={dots}
								max={5}
								min={0}
								xpDots={xpDots}
								onChange={(v) => setDots(bg.id || bg.name, v)}
							/>
							{xpDots > 0 && <span class="xp-warning">+{xpDots * BG_XP_PER_DOT} XP cost</span>}
							{dots > 0 && bg.dots?.[dots - 1] && <p class="bg-effect">{bg.dots[dots - 1]}</p>}
						</div>
					);
				})}
			</div>
		</div>
	);
}
