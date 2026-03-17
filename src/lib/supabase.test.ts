import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(() => ({ __client: true })),
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("getSupabase", () => {
  it("throws when env vars are missing", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    const { getSupabase } = await import("@/lib/supabase");
    expect(() => getSupabase()).toThrow(/Supabase não configurado/);
  });

  it("caches the client instance", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon_key");
    const { getSupabase } = await import("@/lib/supabase");
    expect(getSupabase()).toBe(getSupabase());
  });
});

