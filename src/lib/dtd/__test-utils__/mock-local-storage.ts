/**
 * Reusable localStorage mock for tests that interact with browser storage.
 *
 * Usage:
 *   import { installMockLocalStorage, getMockStorage } from ".../mock-local-storage";
 *
 *   let restore: () => void;
 *   beforeEach(() => { restore = installMockLocalStorage(); });
 *   afterEach(() => { restore(); });
 *
 *   // Access raw storage data:
 *   getMockStorage()["myKey"] = JSON.stringify({ foo: 1 });
 */

import { mock } from "bun:test";

let _storage: Record<string, string> = {};

/**
 * Install a mock localStorage on globalThis. Returns a cleanup function
 * that restores the original localStorage.
 */
export function installMockLocalStorage(): () => void {
	const original = (globalThis as Record<string, unknown>).localStorage;
	_storage = {};

	const mockLocalStorage = {
		getItem: mock((key: string) => _storage[key] ?? null),
		setItem: mock((key: string, value: string) => {
			_storage[key] = value;
		}),
		removeItem: mock((key: string) => {
			delete _storage[key];
		}),
		clear: mock(() => {
			_storage = {};
		}),
		get length() {
			return Object.keys(_storage).length;
		},
		key: mock((i: number) => Object.keys(_storage)[i] ?? null),
	};
	(globalThis as Record<string, unknown>).localStorage = mockLocalStorage;

	return () => {
		(globalThis as Record<string, unknown>).localStorage = original;
	};
}

/** Direct access to the underlying storage object (for seeding data in tests). */
export function getMockStorage(): Record<string, string> {
	return _storage;
}
