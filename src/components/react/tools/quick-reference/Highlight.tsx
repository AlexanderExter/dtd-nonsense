export function Highlight({ text, words }: { text: string; words: string[] }) {
	if (!words.length) return <>{text}</>;
	const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
	const regex = new RegExp(`(${escaped.join("|")})`, "gi");
	const parts = text.split(regex);
	return (
		<>
			{parts.map((part, i) => {
				// Reset lastIndex not needed since we use a fresh non-global regex for test
				const testRegex = new RegExp(`^(${escaped.join("|")})$`, "i");
				return testRegex.test(part) ? (
					// biome-ignore lint/suspicious/noArrayIndexKey: text fragments from split may repeat, position is identity
					<mark className="rounded-[2px] bg-mark px-[1px] text-inherit" key={`${part}-${i}`}>
						{part}
					</mark>
				) : (
					part
				);
			})}
		</>
	);
}
