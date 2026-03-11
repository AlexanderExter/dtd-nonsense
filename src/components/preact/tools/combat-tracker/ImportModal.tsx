import { useEffect, useRef } from "preact/hooks";

interface ImportModalProps {
	isOpen: boolean;
	characters: Array<{ id: string; name: string }>;
	onImport: (charId: string) => void;
	onClose: () => void;
}

export function ImportModal({ isOpen, characters, onImport, onClose }: ImportModalProps) {
	if (!isOpen) return null;

	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
				onClose();
			}
		};
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [onClose]);

	return (
		<div class="fixed inset-0 z-[200] bg-overlay flex items-center justify-center p-lg">
			<div
				class="bg-surface border border-border rounded-lg p-xl max-w-[500px] w-full max-h-[80vh] overflow-y-auto"
				ref={contentRef}
			>
				<div class="flex justify-between items-center">
					<h2 class="m-0 mb-sm text-accent">Import from Character Sheet</h2>
					<button type="button" class="btn btn-sm" onClick={onClose}>
						&times;
					</button>
				</div>
				<div>
					{characters.length === 0 ? (
						<p class="text-center px-lg py-xl text-text-dim">
							No saved characters found. Create one in the Character Sheet tool first.
						</p>
					) : (
						<div class="flex flex-col gap-sm">
							{characters.map((ch) => (
								<div
									class="flex items-center justify-between px-md py-sm bg-bg border border-border rounded-sm cursor-pointer transition-colors duration-150 hover:border-accent"
									key={ch.id}
								>
									<span class="font-semibold text-text-primary">{ch.name}</span>
									<button
										type="button"
										class="btn btn-primary btn-sm"
										onClick={() => onImport(ch.id)}
									>
										Import
									</button>
								</div>
							))}
						</div>
					)}
				</div>
				<div class="flex justify-end gap-sm mt-lg">
					<button type="button" class="btn btn-secondary" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
