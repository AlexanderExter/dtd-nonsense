import { Button, Modal } from "@/components/preact/ui";

interface ImportModalProps {
	isOpen: boolean;
	characters: Array<{ id: string; name: string }>;
	onImport: (charId: string) => void;
	onClose: () => void;
}

export function ImportModal({ isOpen, characters, onImport, onClose }: ImportModalProps) {
	return (
		<Modal open={isOpen} onClose={onClose} title="Import from Character Sheet">
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
							<Button variant="primary" size="sm" onClick={() => onImport(ch.id)}>
								Import
							</Button>
						</div>
					))}
				</div>
			)}
			<div class="flex justify-end gap-sm mt-lg">
				<Button onClick={onClose}>Cancel</Button>
			</div>
		</Modal>
	);
}
