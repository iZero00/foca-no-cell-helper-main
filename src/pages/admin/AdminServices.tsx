import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { formatMoney } from "@/lib/money";
import { getSupabase } from "@/lib/supabase";
import { buildWhatsAppUrl, formatWhatsAppItemMessage } from "@/lib/whatsapp";

type ServiceRow = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  images: string[];
};

type ServicesResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: ServiceRow[];
};

type ServiceDraft = ServiceRow & { priceReais: string; imageUrl: string };

function reaisToCents(input: string) {
  const normalized = input.replace(/[^\d.,]/g, "").replace(".", "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function centsToReais(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default function AdminServices() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: async () => {
      const supabase = getSupabase();
      const resp = await supabase
        .from("services")
        .select("id, title, description, price_cents, currency, category, sort_order, is_active, images", { count: "exact" })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .range(0, 99);
      if (resp.error) throw resp.error;

      return {
        page: 1,
        pageSize: 100,
        total: resp.count ?? 0,
        items: resp.data.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          priceCents: r.price_cents,
          currency: r.currency,
          category: r.category,
          sortOrder: r.sort_order,
          isActive: r.is_active,
          images: Array.isArray(r.images) ? (r.images as string[]) : [],
        })),
      } satisfies ServicesResponse;
    },
  });

  const [create, setCreate] = React.useState({
    title: "",
    category: "geral",
    priceReais: "0,00",
    imageUrl: "",
    sortOrder: "0",
    description: "",
    isActive: true,
  });
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [rowDrafts, setRowDrafts] = React.useState<Record<string, ServiceDraft>>({});

  React.useEffect(() => {
    if (!data?.items) return;
    setRowDrafts((prev) => {
      const next: Record<string, ServiceDraft> = { ...prev };
      for (const s of data.items) {
        if (!next[s.id])
          next[s.id] = {
            ...s,
            priceReais: centsToReais(s.priceCents ?? 0),
            imageUrl: s.images?.[0] ?? "",
          };
      }
      return next;
    });
  }, [data]);

  const createMutation = useMutation({
    mutationFn: async () => {
      setCreateError(null);
      const cents = reaisToCents(create.priceReais);
      if (cents === null) throw new Error("Preço inválido.");
      const images = create.imageUrl.trim().length > 0 ? [create.imageUrl.trim()] : [];
      const payload = {
        title: create.title,
        category: create.category,
        description: create.description,
        price_cents: cents,
        currency: "BRL",
        sort_order: Number.parseInt(create.sortOrder, 10) || 0,
        is_active: create.isActive,
        images,
      };
      const resp = await getSupabase().from("services").insert(payload).select("id").single();
      if (resp.error) throw resp.error;
      return resp.data;
    },
    onSuccess: async () => {
      setCreate({ title: "", category: "geral", priceReais: "0,00", imageUrl: "", sortOrder: "0", description: "", isActive: true });
      await refetch();
    },
    onError: (e) => {
      setCreateError(e instanceof Error ? e.message : "Falha ao criar serviço.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (row: ServiceDraft) => {
      const cents = reaisToCents(row.priceReais);
      if (cents === null) throw new Error("Preço inválido.");
      const images = row.imageUrl.trim().length > 0 ? [row.imageUrl.trim()] : [];
      const payload = {
        title: row.title,
        category: row.category,
        description: row.description,
        price_cents: cents,
        currency: row.currency,
        sort_order: row.sortOrder,
        is_active: row.isActive,
        images,
      };
      const resp = await getSupabase().from("services").update(payload).eq("id", row.id);
      if (resp.error) throw resp.error;
    },
    onSuccess: async () => {
      await refetch();
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (id: string) => {
      const resp = await getSupabase().from("services").update({ is_active: false }).eq("id", id);
      if (resp.error) throw resp.error;
    },
    onSuccess: async () => {
      await refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground">Cadastre preço, descrição, categoria e imagens.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo serviço</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2 sm:col-span-2">
              <Label>Título</Label>
              <Input value={create.title} onChange={(e) => setCreate((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Input value={create.category} onChange={(e) => setCreate((p) => ({ ...p, category: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Preço (R$)</Label>
              <Input value={create.priceReais} onChange={(e) => setCreate((p) => ({ ...p, priceReais: e.target.value }))} />
              <div className="text-xs text-muted-foreground">
                Prévia:{" "}
                {(() => {
                  const c = reaisToCents(create.priceReais) ?? 0;
                  return formatMoney(c, "BRL");
                })()}
              </div>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Imagem (URL)</Label>
              <Input value={create.imageUrl} onChange={(e) => setCreate((p) => ({ ...p, imageUrl: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Ordem</Label>
              <Input value={create.sortOrder} onChange={(e) => setCreate((p) => ({ ...p, sortOrder: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/40 px-4 py-3 sm:col-span-2">
              <div className="grid">
                <div className="text-sm font-semibold">Ativo</div>
                <div className="text-xs text-muted-foreground">Serviços inativos não aparecem para usuários.</div>
              </div>
              <Switch checked={create.isActive} onCheckedChange={(v) => setCreate((p) => ({ ...p, isActive: v }))} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Textarea value={create.description} onChange={(e) => setCreate((p) => ({ ...p, description: e.target.value }))} rows={4} />
          </div>
          {createError ? <div className="text-sm text-destructive">{createError}</div> : null}
          <div className="flex">
            <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
              {createMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground">Carregando...</div>
          ) : error ? (
            <div className="text-destructive">Falha ao carregar serviços.</div>
          ) : (
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.items ?? []).map((s) => {
                    const draft: ServiceDraft = rowDrafts[s.id] ?? {
                      ...s,
                      priceReais: centsToReais(s.priceCents ?? 0),
                      imageUrl: s.images?.[0] ?? "",
                    };
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="w-[110px]">
                          <Input
                            value={String(draft.sortOrder)}
                            onChange={(e) =>
                              setRowDrafts((p) => ({
                                ...p,
                                [s.id]: { ...draft, sortOrder: Number.parseInt(e.target.value || "0", 10) || 0 },
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell className="min-w-[220px]">
                          <Input
                            value={draft.title}
                            onChange={(e) => setRowDrafts((p) => ({ ...p, [s.id]: { ...draft, title: e.target.value } }))}
                          />
                          <div className="mt-2">
                            <Textarea
                              value={draft.description}
                              onChange={(e) =>
                                setRowDrafts((p) => ({ ...p, [s.id]: { ...draft, description: e.target.value } }))
                              }
                              rows={3}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[180px]">
                          <Input
                            value={draft.category}
                            onChange={(e) => setRowDrafts((p) => ({ ...p, [s.id]: { ...draft, category: e.target.value } }))}
                          />
                        </TableCell>
                        <TableCell className="min-w-[160px]">
                          <Input
                            value={draft.priceReais}
                            onChange={(e) => setRowDrafts((p) => ({ ...p, [s.id]: { ...draft, priceReais: e.target.value } }))}
                          />
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatMoney(reaisToCents(draft.priceReais) ?? 0, "BRL")}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[260px]">
                          <Input
                            value={draft.imageUrl}
                            onChange={(e) => setRowDrafts((p) => ({ ...p, [s.id]: { ...draft, imageUrl: e.target.value } }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={draft.isActive}
                            onCheckedChange={(v) => setRowDrafts((p) => ({ ...p, [s.id]: { ...draft, isActive: v } }))}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const message = formatWhatsAppItemMessage({
                                  kind: "serviço",
                                  title: draft.title,
                                  description: draft.description,
                                  priceCents: reaisToCents(draft.priceReais) ?? 0,
                                  currency: "BRL",
                                  category: draft.category,
                                  imageUrl: draft.imageUrl.trim().length > 0 ? draft.imageUrl.trim() : null,
                                });
                                window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
                              }}
                            >
                              Enviar via WhatsApp
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate(draft)}
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={disableMutation.isPending}
                              onClick={() => {
                                const ok = window.confirm("Excluir (desativar) este serviço?");
                                if (!ok) return;
                                disableMutation.mutate(s.id);
                              }}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(data?.items?.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-muted-foreground">
                        Nenhum serviço cadastrado.
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
