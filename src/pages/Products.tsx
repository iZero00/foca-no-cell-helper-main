import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { formatMoney } from "@/lib/money";
import { getSupabase } from "@/lib/supabase";

type ProductListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  stock: number;
  images: string[];
};

type ProductsResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: ProductListItem[];
};

function clampPage(page: number) {
  if (!Number.isFinite(page)) return 1;
  return Math.max(1, Math.min(9999, Math.floor(page)));
}

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "todos";
  const page = clampPage(Number(sp.get("page") ?? "1"));

  const { data: categoriesData } = useQuery({
    queryKey: ["store", "categories"],
    queryFn: async () => {
      const supabase = getSupabase();
      const resp = await supabase.from("products").select("category").eq("is_active", true).limit(1000);
      if (resp.error) throw resp.error;
      const categories = Array.from(
        new Set(resp.data.map((r) => r.category).filter((c): c is string => typeof c === "string" && c.length > 0)),
      ).sort((a, b) => a.localeCompare(b, "pt-BR"));
      return { items: categories };
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["store", "products", { q, category, page }],
    queryFn: async () => {
      const supabase = getSupabase();
      const pageSize = 12;
      const offset = (page - 1) * pageSize;

      let query = supabase
        .from("products")
        .select("id, title, slug, description, price_cents, currency, category, stock, images", { count: "exact" })
        .eq("is_active", true);

      const qTrim = q.trim();
      if (qTrim.length > 0) {
        const like = `%${qTrim}%`;
        query = query.or(`title.ilike.${like},description.ilike.${like}`);
      }

      if (category !== "todos") {
        query = query.eq("category", category);
      }

      const resp = await query.order("created_at", { ascending: false }).range(offset, offset + pageSize - 1);
      if (resp.error) throw resp.error;

      return {
        page,
        pageSize,
        total: resp.count ?? 0,
        items: resp.data.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          description: r.description,
          priceCents: r.price_cents,
          currency: r.currency,
          category: r.category,
          stock: r.stock,
          images: Array.isArray(r.images) ? (r.images as string[]) : [],
        })),
      } satisfies ProductsResponse;
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const setParam = React.useCallback(
    (next: Partial<{ q: string; category: string; page: number }>) => {
      const n = new URLSearchParams(sp);
      if (typeof next.q === "string") {
        if (next.q.trim().length === 0) n.delete("q");
        else n.set("q", next.q);
      }
      if (typeof next.category === "string") {
        if (next.category === "todos") n.delete("category");
        else n.set("category", next.category);
      }
      if (typeof next.page === "number") {
        const p = clampPage(next.page);
        if (p <= 1) n.delete("page");
        else n.set("page", String(p));
      }
      setSp(n);
    },
    [setSp, sp],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Produtos</h1>
            <p className="text-sm text-muted-foreground">Navegue, filtre e encontre o que você precisa.</p>
          </div>
          <div className="grid gap-3 sm:flex sm:items-center">
            <div className="w-full sm:w-72">
              <Input
                value={q}
                onChange={(e) => setParam({ q: e.target.value, page: 1 })}
                placeholder="Buscar produtos"
                aria-label="Buscar produtos"
              />
            </div>
            <Select value={category} onValueChange={(v) => setParam({ category: v, page: 1 })}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as categorias</SelectItem>
                {(categoriesData?.items ?? []).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="text-muted-foreground">Carregando...</div>
          ) : error ? (
            <div className="text-destructive">Falha ao carregar produtos.</div>
          ) : (data?.items?.length ?? 0) === 0 ? (
            <div className="text-muted-foreground">Nenhum produto encontrado.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.items.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    <div className="text-sm font-semibold text-primary">{formatMoney(p.priceCents, p.currency)}</div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card/40">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                          Sem imagem
                        </div>
                      )}
                    </div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">{p.description}</div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-muted-foreground">{p.category}</div>
                      <Button asChild size="sm">
                        <Link to={`/produto/${encodeURIComponent(p.slug || p.id)}`}>Ver detalhes</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParam({ page: page - 1 })}>
            Anterior
          </Button>
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setParam({ page: page + 1 })}
          >
            Próxima
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
