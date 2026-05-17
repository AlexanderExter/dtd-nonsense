import { GameInput } from "@/components/react/ui/GameInput";
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
				<label className="mb-xs block text-sm text-text-muted" htmlFor="char-name">
					Name *
				</label>
				<GameInput
					id="char-name"
					onInput={(e) => handleInput("name", (e.target as HTMLInputElement).value)}
					placeholder="Character name"
					type="text"
					value={char.name}
				/>
			</div>
			<div className="mb-md flex-1">
				<label className="mb-xs block text-sm text-text-muted" htmlFor="char-player">
					Player
				</label>
				<GameInput
					id="char-player"
					onInput={(e) => handleInput("player", (e.target as HTMLInputElement).value)}
					placeholder="Player name"
					type="text"
					value={char.player}
				/>
			</div>
			<div className="mb-md flex-1">
				<label className="mb-xs block text-sm text-text-muted" htmlFor="char-concept">
					Concept
				</label>
				<GameInput
					id="char-concept"
					onInput={(e) => handleInput("concept", (e.target as HTMLInputElement).value)}
					placeholder="Character concept"
					type="text"
					value={char.concept}
				/>
			</div>
		</div>
	);
}
