/**
 * Creates a debounced autosave function that coalesces rapid saves into one.
 * Use in Zustand stores to replace manual _saveTimer patterns.
 *
 * ```ts
 * const scheduleSave = createAutosave(() => {
 *   localStorage.setItem(KEY, JSON.stringify(getState()));
 * }, 800);
 *
 * // In store actions:
 * scheduleSave(); // Debounced — only last call within 800ms executes
 * scheduleSave.flush(); // Force immediate save (e.g., on unmount)
 * scheduleSave.cancel(); // Cancel pending save
 * ```
 */
export function createAutosave(saveFn: () => void, delay: number) {
	let timer: ReturnType<typeof setTimeout> | null = null;

	function schedule() {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
			saveFn();
		}, delay);
	}

	schedule.flush = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
			saveFn();
		}
	};

	schedule.cancel = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};

	return schedule;
}
