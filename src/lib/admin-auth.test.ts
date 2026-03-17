import { beforeEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";

import { __private, isAuthed, login, logout, sanitizeAdminDestination } from "@/lib/admin-auth";

class MemoryStorage implements Storage {
  #m = new Map<string, string>();

  get length() {
    return this.#m.size;
  }
  clear() {
    this.#m.clear();
  }
  getItem(key: string) {
    return this.#m.has(key) ? this.#m.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.#m.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.#m.delete(key);
  }
  setItem(key: string, value: string) {
    this.#m.set(String(key), String(value));
  }
}

if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto });
}

describe("admin-auth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const ls = new MemoryStorage();
    const ss = new MemoryStorage();
    vi.stubGlobal("localStorage", ls);
    vi.stubGlobal("sessionStorage", ss);
    (window as unknown as { localStorage: Storage }).localStorage = ls;
    (window as unknown as { sessionStorage: Storage }).sessionStorage = ss;
    logout();
  });

  it("accepts only the specified hardcoded credentials", async () => {
    expect(isAuthed()).toBe(false);

    const wrongEmail = await login("nope@example.com", "Dio157");
    expect(wrongEmail.ok).toBe(false);
    expect(isAuthed()).toBe(false);

    const wrongPassword = await login(__private.ADMIN_EMAIL, "wrong");
    expect(wrongPassword.ok).toBe(false);
    expect(isAuthed()).toBe(false);

    const ok = await login("VINICIUSRBASSINI@gmail.com", "Dio157");
    expect(ok.ok).toBe(true);
    expect(isAuthed()).toBe(true);

    logout();
    expect(isAuthed()).toBe(false);
  });

  it("locks out after too many failed attempts and allows after lock expires", async () => {
    let t = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => t);

    for (let i = 0; i < __private.MAX_ATTEMPTS; i++) {
      const resp = await login(__private.ADMIN_EMAIL, "wrong");
      expect(resp.ok).toBe(false);
      expect(resp.error).toMatch(/Credenciais inválidas/);
    }

    const locked = await login(__private.ADMIN_EMAIL, "wrong");
    expect(locked.ok).toBe(false);
    expect(locked.error).toMatch(/Muitas tentativas/);

    t += __private.BASE_LOCK_MS + 5;
    const ok = await login(__private.ADMIN_EMAIL, "Dio157");
    expect(ok.ok).toBe(true);
  });

  it("sanitizes redirect destinations to /admin only", () => {
    expect(sanitizeAdminDestination("/admin/products")).toBe("/admin/products");
    expect(sanitizeAdminDestination("/produtos")).toBe("/admin");
    expect(sanitizeAdminDestination("https://evil.com/admin")).toBe("/admin");
    expect(sanitizeAdminDestination("//evil.com/admin")).toBe("/admin");
  });
});
