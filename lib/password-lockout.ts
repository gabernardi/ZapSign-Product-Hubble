type LockState = {
  consecutiveFailures: number;
  lockedUntil: number | null;
};

const LOCK_MS = 30 * 60 * 1000;
const MAX_CONSECUTIVE_FAILURES = 3;

const globalStore = globalThis as typeof globalThis & {
  __sitePasswordLock?: Map<string, LockState>;
};

function getStore(): Map<string, LockState> {
  if (!globalStore.__sitePasswordLock) {
    globalStore.__sitePasswordLock = new Map();
  }
  return globalStore.__sitePasswordLock;
}

export function getPasswordLockClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  const ua = (request.headers.get("user-agent") ?? "").slice(0, 160);
  return `${ip}|${ua}`;
}

function normalizeState(key: string): LockState {
  const store = getStore();
  const raw = store.get(key);
  if (!raw) {
    return { consecutiveFailures: 0, lockedUntil: null };
  }
  if (raw.lockedUntil !== null && Date.now() >= raw.lockedUntil) {
    store.delete(key);
    return { consecutiveFailures: 0, lockedUntil: null };
  }
  return raw;
}

export function evaluatePasswordAttempt(
  request: Request,
  passwordOk: boolean
): "ok" | "locked" | "invalid" {
  const key = getPasswordLockClientKey(request);
  const store = getStore();
  const state = normalizeState(key);

  if (state.lockedUntil !== null && Date.now() < state.lockedUntil) {
    return "locked";
  }

  if (passwordOk) {
    store.delete(key);
    return "ok";
  }

  const nextFails = state.consecutiveFailures + 1;
  if (nextFails >= MAX_CONSECUTIVE_FAILURES) {
    store.set(key, {
      consecutiveFailures: 0,
      lockedUntil: Date.now() + LOCK_MS,
    });
    return "locked";
  }

  store.set(key, {
    consecutiveFailures: nextFails,
    lockedUntil: null,
  });
  return "invalid";
}
