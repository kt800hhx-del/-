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
let memoryState: PersistedState = DEFAULT_STATE;
let hydrated = false;

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

function hydrateFromStorage() {
  if (hydrated) return;
  memoryState = parse(readRaw());
  hydrated = true;
}

export function getSnapshot(): PersistedState {
  hydrateFromStorage();
  return memoryState;
}

export function getServerSnapshot(): PersistedState {
  return DEFAULT_STATE;
}

export function subscribeState(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => {
    try {
      memoryState = parse(readRaw());
    } catch {
      /* keep memoryState */
    }
    listener();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function saveState(state: Omit<PersistedState, "version" | "updatedAt">) {
  const payload: PersistedState = {
    version: 1,
    updatedAt: new Date().toISOString(),
    ...state,
  };
  memoryState = payload;
  hydrated = true;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Private mode, quota, or policy: keep in-memory navigation working.
    }
  }
  emit();
}

export function clearState() {
  memoryState = DEFAULT_STATE;
  hydrated = true;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  emit();
}

export function mergeBackground(partial: Partial<UserBackground>): UserBackground {
  return { ...EMPTY_BACKGROUND, ...partial };
}
