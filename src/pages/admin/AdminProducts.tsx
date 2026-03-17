import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { formatMoney } from "@/lib/money";
import { getSupabase } from "@/lib/supabase";
import { buildWhatsAppUrl, formatWhatsAppItemMessage } from "@/lib/whatsapp";

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  images: string[];
};

type ProductsResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: ProductRow[];
};

export default function AdminProducts() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") ?? "";
  const includeInactive = sp.get("inactive") === "1";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "products", { q, includeInactive }],
    queryFn: async () => {
      const supabase = getSupabase();
      const page = 1;
      const pageSize = 200;

      let query = supabase
        .from("products")
        .select("id, title, slug, description, price_cents, currency, category, stock, is_active, created_at, images", {
          count: "exact",
        });

      if (!includeInactive) query = query.eq("is_active", true);

      const qTrim = q.trim();
      if (qTrim.length > 0) {
        const like = `%${qTrim}%`;
        query = query.or(`title.ilike.${like},description.ilike.${like}`);
      }

      const resp = await query.order("created_at", { ascending: false }).range(0, pageSize - 1);
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
          isActive: r.is_active,
          createdAt: r.created_at,
          images: Array.isArray(r.images) ? (r.images as string[]) : [],
        })),
      } satisfies ProductsResponse;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">Gerencie catálogo, preço, estoque e imagens.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Atualizar
          </Button>
          <Button asChild>
            <Link to="/admin/products/new">Novo produto</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Lista</CardTitle>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={q}
              onChange={(e) => {
                const n = new URLSearchParams(sp);
                const v = e.target.value;
                if (v.trim().length === 0) n.delete("q");
                else n.set("q", v);
                setSp(n);
              }}
              placeholder="Buscar por nome"
            />
            <Button
              variant={includeInactive ? "secondary" : "outline"}
              onClick={() => {
                const n = new URLSearchParams(sp);
                if (includeInactive) n.delete("inactive");
                else n.set("inactive", "1");
                setSp(n);
              }}
            >
              {includeInactive ? "Mostrando inativos" : "Incluir inativos"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground">Carregando...</div>
          ) : error ? (
            <div className="text-destructive">Falha ao carregar produtos.</div>
          ) : (
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.items ?? []).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold">{p.title}</TableCell>
                      <TableCell className="text-muted-foreground">{p.category}</TableCell>
                      <TableCell>{formatMoney(p.priceCents, p.currency)}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell>{p.isActive ? "Ativo" : "Inativo"}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              const message = formatWhatsAppItemMessage({
                                kind: "produto",
                                title: p.title,
                                description: p.description,
                                priceCents: p.priceCents,
                                currency: p.currency,
                                category: p.category,
                                imageUrl: p.images?.[0] ?? null,
                              });
                              window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
                            }}
                          >
                            Enviar via WhatsApp
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/admin/products/${p.id}`}>Editar</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              const ok = window.confirm("Excluir (desativar) este produto?");
                              if (!ok) return;
                              const resp = await getSupabase().from("products").update({ is_active: false }).eq("id", p.id);
                              if (resp.error) throw resp.error;
                              await refetch();
                            }}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(data?.items?.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        Nenhum produto cadastrado.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
