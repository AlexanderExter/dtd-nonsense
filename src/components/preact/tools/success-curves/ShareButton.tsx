interface ShareButtonProps {
	onShare: () => void;
}

export function ShareButton({ onShare }: ShareButtonProps) {
	return (
		<button type="button" class="btn btn-ghost" title="Copy shareable URL" onClick={onShare}>
			Share
		</button>
	);
}
