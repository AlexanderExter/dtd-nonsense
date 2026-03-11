import { Button } from "@/components/preact/ui";

interface ShareButtonProps {
	onShare: () => void;
}

export function ShareButton({ onShare }: ShareButtonProps) {
	return (
		<Button variant="ghost" title="Copy shareable URL" onClick={onShare}>
			Share
		</Button>
	);
}
