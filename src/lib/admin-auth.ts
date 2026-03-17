type AdminSession = {
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
};

type AttemptsState = {
  count: number;
  firstAt: number;
  lockUntil: number;
  lockLevel: number;
};

const ADMIN_EMAIL = "viniciusrbassini@gmail.com";
const PBKDF2_SALT = "foca-no-cell-admin-v1";
const PBKDF2_ITERATIONS = 120000;
const PBKDF2_LENGTH_BITS = 256;
const ADMIN_PASSWORD_HASH_B64 = "FKQGdmHOnboAgAUUFJjbX38F4D4yvXrV2wJxcsym3tI=";

const SESSION_KEY = "adminAuth.session";
const ATTEMPTS_KEY = "adminAuth.attempts";
const AUTH_EVENT = "admin-auth-changed";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const BASE_LOCK_MS = 2 * 60 * 1000;
const MAX_LOCK_LEVEL = 6;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function nowMs() {
  return Date.now();
}

function normalizeEmail(input: string) {
  return String(input ?? "").trim().toLowerCase();
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function bytesToBase64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function constantTimeEqual(a: string, b: string) {
  const aStr = String(a);
  const bStr = String(b);
  const len = Math.max(aStr.length, bStr.length);
  let out = 0;
  for (let i = 0; i < len; i++) {
    const ac = i < aStr.length ? aStr.charCodeAt(i) : 0;
    const bc = i < bStr.length ? bStr.charCodeAt(i) : 0;
    out |= ac ^ bc;
  }
  return out === 0 && aStr.length === bStr.length;
}

function dispatchAuthEvent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function getAttemptsState(storage: Storage) {
  const initial: AttemptsState = { count: 0, firstAt: 0, lockUntil: 0, lockLevel: 0 };
  const parsed = safeParseJson<AttemptsState>(storage.getItem(ATTEMPTS_KEY));
  if (!parsed) return initial;
  return {
    count: Number.isFinite(parsed.count) ? Math.max(0, Math.floor(parsed.count)) : 0,
    firstAt: Number.isFinite(parsed.firstAt) ? Math.max(0, Math.floor(parsed.firstAt)) : 0,
    lockUntil: Number.isFinite(parsed.lockUntil) ? Math.max(0, Math.floor(parsed.lockUntil)) : 0,
    lockLevel: Number.isFinite(parsed.lockLevel) ? Math.max(0, Math.floor(parsed.lockLevel)) : 0,
  };
}

function setAttemptsState(storage: Storage, next: AttemptsState) {
  storage.setItem(ATTEMPTS_KEY, JSON.stringify(next));
}

function clearAttempts(storage: Storage) {
  storage.removeItem(ATTEMPTS_KEY);
}

function getLockInfo(storage: Storage) {
  const st = getAttemptsState(storage);
  const n = nowMs();
  if (st.lockUntil > n) {
    return { locked: true, retryAfterMs: st.lockUntil - n, remaining: 0 } as const;
  }
  const windowStart = st.firstAt > 0 && n - st.firstAt <= WINDOW_MS ? st.firstAt : 0;
  const count = windowStart > 0 ? st.count : 0;
  const remaining = Math.max(0, MAX_ATTEMPTS - count);
  return { locked: false, retryAfterMs: 0, remaining } as const;
}

function recordFailedAttempt(storage: Storage) {
  const n = nowMs();
  const st = getAttemptsState(storage);
  if (st.lockUntil > n) return;

  if (st.firstAt === 0 || n - st.firstAt > WINDOW_MS) {
    const next: AttemptsState = { count: 1, firstAt: n, lockUntil: 0, lockLevel: st.lockLevel };
    setAttemptsState(storage, next);
    return;
  }

  const nextCount = st.count + 1;
  if (nextCount < MAX_ATTEMPTS) {
    setAttemptsState(storage, { ...st, count: nextCount });
    return;
  }

  const level = Math.min(MAX_LOCK_LEVEL, st.lockLevel + 1);
  const lockMs = BASE_LOCK_MS * Math.pow(2, Math.max(0, level - 1));
  const next: AttemptsState = { count: 0, firstAt: n, lockUntil: n + lockMs, lockLevel: level };
  setAttemptsState(storage, next);
}

async function derivePasswordHashBase64(password: string) {
  if (!globalThis.crypto?.subtle) throw new Error("Criptografia indisponível neste navegador.");
  const enc = new TextEncoder();
  const passBytes = enc.encode(String(password ?? ""));
  const key = await crypto.subtle.importKey("raw", passBytes, { name: "PBKDF2" }, false, ["deriveBits"]);
  const saltBytes = enc.encode(PBKDF2_SALT);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    PBKDF2_LENGTH_BITS,
  );
  return bytesToBase64(new Uint8Array(bits));
}

function getSession(sessionStorageRef: Storage) {
  const parsed = safeParseJson<AdminSession>(sessionStorageRef.getItem(SESSION_KEY));
  if (!parsed) return null;
  const email = normalizeEmail(parsed.email);
  const expiresAt = Number.isFinite(parsed.expiresAt) ? Math.floor(parsed.expiresAt) : 0;
  if (email !== ADMIN_EMAIL || expiresAt <= nowMs()) return null;
  return parsed;
}

function isAuthed() {
  if (typeof window === "undefined") return false;
  return Boolean(getSession(window.sessionStorage));
}

function logout() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
  dispatchAuthEvent();
}

function sanitizeAdminDestination(dest: unknown) {
  const raw = typeof dest === "string" ? dest.trim() : "";
  if (!raw.startsWith("/admin")) return "/admin";
  if (raw.startsWith("//")) return "/admin";
  if (raw.includes("://")) return "/admin";
  return raw;
}

async function login(email: string, password: string) {
  if (typeof window === "undefined") return { ok: false as const, error: "Ambiente inválido." };
  const lock = getLockInfo(window.localStorage);
  if (lock.locked) {
    const seconds = Math.max(1, Math.ceil(lock.retryAfterMs / 1000));
    return { ok: false as const, error: `Muitas tentativas. Tente novamente em ${seconds}s.` };
  }

  const emailNorm = normalizeEmail(email);
  if (emailNorm !== ADMIN_EMAIL) {
    recordFailedAttempt(window.localStorage);
    return { ok: false as const, error: "Credenciais inválidas." };
  }

  const derived = await derivePasswordHashBase64(password);
  if (!constantTimeEqual(derived, ADMIN_PASSWORD_HASH_B64)) {
    recordFailedAttempt(window.localStorage);
    return { ok: false as const, error: "Credenciais inválidas." };
  }

  clearAttempts(window.localStorage);
  const tokenBytes = new Uint8Array(16);
  if (!globalThis.crypto?.getRandomValues) return { ok: false as const, error: "Criptografia indisponível neste navegador." };
  crypto.getRandomValues(tokenBytes);
  const token = bytesToBase64(tokenBytes);
  const createdAt = nowMs();
  const session: AdminSession = { token, email: ADMIN_EMAIL, createdAt, expiresAt: createdAt + SESSION_TTL_MS };
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  dispatchAuthEvent();
  return { ok: true as const };
}

const __private = {
  ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH_B64,
  SESSION_KEY,
  ATTEMPTS_KEY,
  AUTH_EVENT,
  PBKDF2_SALT,
  PBKDF2_ITERATIONS,
  PBKDF2_LENGTH_BITS,
  MAX_ATTEMPTS,
  WINDOW_MS,
  BASE_LOCK_MS,
  MAX_LOCK_LEVEL,
  SESSION_TTL_MS,
  getAttemptsState,
  setAttemptsState,
  clearAttempts,
  recordFailedAttempt,
  derivePasswordHashBase64,
  getSession,
  dispatchAuthEvent,
  normalizeEmail,
  constantTimeEqual,
};

export {
  getLockInfo,
  isAuthed,
  login,
  logout,
  sanitizeAdminDestination,
  __private,
  type AdminSession,
};
