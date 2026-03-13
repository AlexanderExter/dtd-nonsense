import { BG_BUDGET, BG_XP_PER_DOT, FREE_BG_CAP } from "../constants";
import { DotControl } from "../shared/DotControl";
import { useBuilderStore } from "../store";

export function BackgroundsStep() {
	const data = useBuilderStore((s) => s.gameData);
	const char = useBuilderStore((s) => s.char);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	if (!data?.backgrounds?.backgrounds) return <p>Loading background data…</p>;

	const backgrounds = data.backgrounds.backgrounds as any[];
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

		const hasAny = useBuilderStore.getState().char.backgrounds.length > 0;
		if (hasAny !== useBuilderStore.getState().meta.stepsCompleted[5]) {
			updateMeta((m) => {
				m.stepsCompleted[5] = hasAny;
			});
		}
	};

	const _canIncrease = (bgId: string): boolean => {
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
		<div>
			<div className="flex justify-between items-center px-md py-sm bg-surface rounded-sm mb-md text-[0.9rem]">
				<strong>Free Dots:</strong> {freeRemaining} / {BG_BUDGET} remaining
			</div>

			<div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-md">
				{backgrounds.map((bg: any) => {
					const dots = getDots(bg.id || bg.name);
					const xpDots = Math.max(0, dots - FREE_BG_CAP);

					return (
						<div key={bg.id || bg.name} className="bg-surface border border-border rounded-md p-md">
							<h4 className="text-accent mb-xs text-[0.95rem]">{bg.name}</h4>
							{bg.description && (
								<p className="text-[0.8rem] text-text-dim mb-sm leading-[1.4]">{bg.description}</p>
							)}
							<DotControl
								value={dots}
								max={5}
								min={0}
								xpDots={xpDots}
								onChange={(v) => setDots(bg.id || bg.name, v)}
							/>
							{xpDots > 0 && (
								<span className="block text-xs text-warning text-center mt-xs">
									+{xpDots * BG_XP_PER_DOT} XP cost
								</span>
							)}
							{dots > 0 && bg.dots?.[dots - 1] && (
								<p className="text-[0.8rem] text-text-muted mt-sm pt-sm border-t border-border min-h-[1.5em]">
									{bg.dots[dots - 1]}
								</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
