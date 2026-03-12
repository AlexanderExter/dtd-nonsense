import { useBuilderStore } from "../store";

export function IdentityStep() {
	const char = useBuilderStore((s) => s.char);
	const updateChar = useBuilderStore((s) => s.updateChar);
	const updateMeta = useBuilderStore((s) => s.updateMeta);

	const handleInput = (field: "name" | "player" | "concept", value: string) => {
		updateChar((c) => {
			c[field] = value;
		});
		if (field === "name") {
			updateMeta((m) => {
				m.stepsCompleted[0] = value.trim().length > 0;
			});
		}
	};

	return (
		<div>
			<div className="mb-md flex-1">
				<label className="block text-[0.85rem] text-text-muted mb-xs" htmlFor="char-name">
					Name *
				</label>
				<input
					type="text"
					id="char-name"
					value={char.name}
					placeholder="Character name"
					onInput={(e) => handleInput("name", (e.target as HTMLInputElement).value)}
				/>
			</div>
			<div className="mb-md flex-1">
				<label className="block text-[0.85rem] text-text-muted mb-xs" htmlFor="char-player">
					Player
				</label>
				<input
					type="text"
					id="char-player"
					value={char.player}
					placeholder="Player name"
					onInput={(e) => handleInput("player", (e.target as HTMLInputElement).value)}
				/>
			</div>
			<div className="mb-md flex-1">
				<label className="block text-[0.85rem] text-text-muted mb-xs" htmlFor="char-concept">
					Concept
				</label>
				<input
					type="text"
					id="char-concept"
					value={char.concept}
					placeholder="Character concept"
					onInput={(e) => handleInput("concept", (e.target as HTMLInputElement).value)}
				/>
			</div>
		</div>
	);
}
