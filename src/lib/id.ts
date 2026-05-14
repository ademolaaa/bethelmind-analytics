export function getOrCreateId(storageKey: string) {
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(storageKey, id);
  return id;
}

