import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  describe.skip("Supabase integration (RLS + CRUD)", () => {
    it("requer SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY", () => {});
  });
} else {
  describe("Supabase integration (RLS + CRUD)", () => {
    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

  let productId: string | null = null;
  let productSlug: string | null = null;
  let serviceId: string | null = null;

  let adminUserId: string | null = null;
  let adminEmail: string | null = null;
  const adminPassword = "TestPassword!123456";

  let adminClient = anon;

  beforeAll(async () => {
    const suffix = Math.random().toString(36).slice(2, 10);

    const productInsert = await service
      .from("products")
      .insert({
        title: `Produto teste ${suffix}`,
        slug: `produto-teste-${suffix}`,
        description: "Produto para teste de integração",
        price_cents: 1234,
        currency: "BRL",
        category: "geral",
        is_active: true,
        stock: 10,
        variations: [],
        images: [],
      })
      .select("id, slug")
      .single();
    if (productInsert.error) throw productInsert.error;
    productId = productInsert.data.id;
    productSlug = productInsert.data.slug;

    const serviceInsert = await service
      .from("services")
      .insert({
        title: `Serviço teste ${suffix}`,
        description: "Serviço para teste de integração",
        price_cents: 0,
        currency: "BRL",
        category: "geral",
        sort_order: 1,
        is_active: true,
        images: [],
      })
      .select("id")
      .single();
    if (serviceInsert.error) throw serviceInsert.error;
    serviceId = serviceInsert.data.id;

    adminEmail = `admin-test-${suffix}@example.com`;
    const created = await service.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });
    if (created.error) throw created.error;
    adminUserId = created.data.user?.id ?? null;
    if (!adminUserId) throw new Error("Falha ao criar usuário admin de teste.");

    const adminRow = await service.from("admins").insert({ user_id: adminUserId, role: "admin" });
    if (adminRow.error) throw adminRow.error;

    adminClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const signIn = await adminClient.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
    if (signIn.error) throw signIn.error;
  });

  afterAll(async () => {
    if (productId) await service.from("products").delete().eq("id", productId);
    if (serviceId) await service.from("services").delete().eq("id", serviceId);
    if (adminUserId) await service.auth.admin.deleteUser(adminUserId);
  });

  it("permite leitura pública de produtos ativos (RLS)", async () => {
    const resp = await anon
      .from("products")
      .select("id, slug, is_active")
      .eq("is_active", true)
      .eq("slug", productSlug!)
      .maybeSingle();
    expect(resp.error).toBeNull();
    expect(resp.data?.id).toBe(productId);
    expect(resp.data?.is_active).toBe(true);
  });

  it("permite leitura pública de serviços ativos (RLS)", async () => {
    const resp = await anon.from("services").select("id, is_active").eq("id", serviceId!).maybeSingle();
    expect(resp.error).toBeNull();
    expect(resp.data?.id).toBe(serviceId);
    expect(resp.data?.is_active).toBe(true);
  });

  it("permite CRUD para usuário admin autenticado (RLS)", async () => {
    const update = await adminClient.from("products").update({ stock: 42 }).eq("id", productId!);
    expect(update.error).toBeNull();

    const check = await service.from("products").select("stock").eq("id", productId!).single();
    expect(check.error).toBeNull();
    expect(check.data.stock).toBe(42);
  });
  });
}
