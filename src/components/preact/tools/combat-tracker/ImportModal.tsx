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
		<div class="modal-overlay">
			<div class="modal-content" ref={contentRef}>
				<div class="modal-header">
					<h2>Import from Character Sheet</h2>
					<button type="button" class="btn btn-sm" onClick={onClose}>
						&times;
					</button>
				</div>
				<div class="modal-body">
					{characters.length === 0 ? (
						<p class="empty-state">
							No saved characters found. Create one in the Character Sheet tool first.
						</p>
					) : (
						<div class="import-char-list">
							{characters.map((ch) => (
								<div class="import-char-card" key={ch.id}>
									<span class="import-char-name">{ch.name}</span>
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
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
