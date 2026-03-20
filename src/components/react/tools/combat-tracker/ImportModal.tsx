import { Button } from "@/components/react/ui/Button";
import { Modal } from "@/components/react/ui/Modal";

interface ImportModalProps {
	characters: Array<{ id: string; name: string }>;
	isOpen: boolean;
	onClose: () => void;
	onImport: (charId: string) => void;
}

export function ImportModal({ isOpen, characters, onImport, onClose }: ImportModalProps) {
	return (
		<Modal onClose={onClose} open={isOpen} title="Import from Character Sheet">
			{characters.length === 0 ? (
				<p className="px-lg py-xl text-center text-text-dim">
					No saved characters found. Create one in the Character Sheet tool first.
				</p>
			) : (
				<div className="flex flex-col gap-sm">
					{characters.map((ch) => (
						<div
							className="flex cursor-pointer items-center justify-between rounded-sm border border-border bg-bg px-md py-sm transition-colors duration-150 hover:border-accent"
							key={ch.id}
						>
							<span className="font-semibold text-text-primary">{ch.name}</span>
							<Button onClick={() => onImport(ch.id)} size="sm" variant="primary">
								Import
							</Button>
						</div>
					))}
				</div>
			)}
			<div className="mt-lg flex justify-end gap-sm">
				<Button onClick={onClose}>Cancel</Button>
			</div>
		</Modal>
	);
}
