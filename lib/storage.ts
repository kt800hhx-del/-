import { EMPTY_BACKGROUND } from "./constants";
import { STORAGE_KEY, type PersistedState, type UserBackground } from "./types";

export const DEFAULT_STATE: PersistedState = {
  version: 1,
  step: 0,
  background: EMPTY_BACKGROUND,
  selectedRoleId: null,
  updatedAt: "",
};

const listeners = new Set<() => void>();
let cache: { raw: string | null; value: PersistedState } = {
  raw: "__uninitialized__",
  value: DEFAULT_STATE,
};

function parse(raw: string | null): PersistedState {
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1 || !parsed.background) return DEFAULT_STATE;
    return {
      version: 1,
      step: Number.isFinite(parsed.step) ? Math.min(Math.max(parsed.step, 0), 4) : 0,
      background: { ...EMPTY_BACKGROUND, ...parsed.background },
      selectedRoleId: parsed.selectedRoleId ?? null,
      updatedAt: parsed.updatedAt ?? "",
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getSnapshot(): PersistedState {
  const raw = readRaw();
  if (raw === cache.raw) return cache.value;
  cache = { raw, value: parse(raw) };
  return cache.value;
}

export function getServerSnapshot(): PersistedState {
  return DEFAULT_STATE;
}

export function subscribeState(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function saveState(state: Omit<PersistedState, "version" | "updatedAt">) {
  if (typeof window === "undefined") return;
  const payload: PersistedState = {
    version: 1,
    updatedAt: new Date().toISOString(),
    ...state,
  };
  const raw = JSON.stringify(payload);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cache = { raw, value: payload };
  emit();
}

export function clearState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  cache = { raw: null, value: DEFAULT_STATE };
  emit();
}

export function mergeBackground(partial: Partial<UserBackground>): UserBackground {
  return { ...EMPTY_BACKGROUND, ...partial };
}
