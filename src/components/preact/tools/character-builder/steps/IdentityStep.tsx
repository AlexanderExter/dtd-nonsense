import { charSignal, updateChar, updateMeta } from "../CharacterBuilderApp";

export function IdentityStep() {
	const char = charSignal.value;

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
		<div class="step-identity">
			<div class="form-group">
				<label for="char-name">Name *</label>
				<input
					type="text"
					id="char-name"
					value={char.name}
					placeholder="Character name"
					onInput={(e) => handleInput("name", (e.target as HTMLInputElement).value)}
				/>
			</div>
			<div class="form-group">
				<label for="char-player">Player</label>
				<input
					type="text"
					id="char-player"
					value={char.player}
					placeholder="Player name"
					onInput={(e) => handleInput("player", (e.target as HTMLInputElement).value)}
				/>
			</div>
			<div class="form-group">
				<label for="char-concept">Concept</label>
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
