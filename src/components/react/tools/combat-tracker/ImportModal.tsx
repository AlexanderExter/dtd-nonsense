import { Button } from "@/components/react/ui/Button";
import { Modal } from "@/components/react/ui/Modal";

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
				<p className="text-center px-lg py-xl text-text-dim">
					No saved characters found. Create one in the Character Sheet tool first.
				</p>
			) : (
				<div className="flex flex-col gap-sm">
					{characters.map((ch) => (
						<div
							className="flex items-center justify-between px-md py-sm bg-bg border border-border rounded-sm cursor-pointer transition-colors duration-150 hover:border-accent"
							key={ch.id}
						>
							<span className="font-semibold text-text-primary">{ch.name}</span>
							<Button variant="primary" size="sm" onClick={() => onImport(ch.id)}>
								Import
							</Button>
						</div>
					))}
				</div>
			)}
			<div className="flex justify-end gap-sm mt-lg">
				<Button onClick={onClose}>Cancel</Button>
			</div>
		</Modal>
	);
}
