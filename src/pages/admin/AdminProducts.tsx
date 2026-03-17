import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { formatMoney } from "@/lib/money";
import { compressToJpeg, sdWebUiTxt2ImgPng } from "@/lib/sd-webui";
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

function normalizeProductCode(input: string) {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 120);
  return base.length > 0 ? base : "ITEM";
}

function normalizeFileName(input: string) {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return base.length > 0 ? base : "item";
}

function safeUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

function buildProductImagePrompt(input: { title: string; category: string; description: string }) {
  const title = String(input.title ?? "").trim();
  const category = String(input.category ?? "").trim();
  const description = String(input.description ?? "").trim();
  const parts = [
    "Foto de produto em estúdio, realista, alta qualidade, composição quadrada, fundo branco clean, sombra suave.",
    "Sem texto, sem logos, sem marcas d'água, sem etiquetas.",
    "Iluminação profissional, nitidez alta, foco no produto, estilo e-commerce.",
    `Produto: ${title}.`,
  ];
  if (category.length > 0) parts.push(`Categoria: ${category}.`);
  if (description.length > 0) parts.push(`Detalhes: ${description}.`);
  return parts.join(" ");
}

export default function AdminProducts() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") ?? "";
  const includeInactive = sp.get("inactive") === "1";
  const [seeding, setSeeding] = React.useState(false);
  const [seedError, setSeedError] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);

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

  const seedDemoProducts = React.useCallback(async () => {
    const ok = window.confirm(
      "Adicionar itens de exemplo no catálogo? Você pode editar ou desativar depois.",
    );
    if (!ok) return;

    setSeedError(null);
    setSeeding(true);
    try {
      const supabase = getSupabase();
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const demo = [
        {
          title: "Cabo USB-C Reforçado",
          slug: normalizeProductCode(`CABOUSB${suffix}`),
          description: "Cabo reforçado para carga e dados.",
          price_cents: 1990,
          currency: "BRL",
          category: "Acessórios",
          stock: 20,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Cabo Lightning Reforçado",
          slug: normalizeProductCode(`CABOLIGHTNING${suffix}`),
          description: "Cabo reforçado compatível com iPhone (carga e dados).",
          price_cents: 2490,
          currency: "BRL",
          category: "Acessórios",
          stock: 12,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Carregador Turbo 20W",
          slug: normalizeProductCode(`CARREGADOR20W${suffix}`),
          description: "Carregador rápido compatível com diversos modelos.",
          price_cents: 4990,
          currency: "BRL",
          category: "Acessórios",
          stock: 15,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Carregador Veicular 2 USB",
          slug: normalizeProductCode(`CARREGADORAUTO${suffix}`),
          description: "Carregador para carro com 2 portas USB.",
          price_cents: 2990,
          currency: "BRL",
          category: "Automotivo",
          stock: 18,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Power Bank 10.000mAh",
          slug: normalizeProductCode(`POWERBANK10K${suffix}`),
          description: "Bateria portátil para emergências (10.000mAh).",
          price_cents: 11990,
          currency: "BRL",
          category: "Energia",
          stock: 8,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Película 3D",
          slug: normalizeProductCode(`PELICULA3D${suffix}`),
          description: "Proteção de tela com excelente cobertura.",
          price_cents: 2990,
          currency: "BRL",
          category: "Proteção",
          stock: 30,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Película Hidrogel",
          slug: normalizeProductCode(`PELICULAHIDRO${suffix}`),
          description: "Película de hidrogel com boa absorção de impacto.",
          price_cents: 3490,
          currency: "BRL",
          category: "Proteção",
          stock: 20,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Capa Anti-impacto",
          slug: normalizeProductCode(`CAPAANTISHOCK${suffix}`),
          description: "Capa resistente para proteger quedas e arranhões.",
          price_cents: 3990,
          currency: "BRL",
          category: "Proteção",
          stock: 25,
          is_active: true,
          variations: [{ name: "Cor", options: ["Preto", "Transparente"] }],
          images: [],
        },
        {
          title: "Capa Silicone",
          slug: normalizeProductCode(`CAPASILICONE${suffix}`),
          description: "Capa leve e macia para uso diário.",
          price_cents: 2990,
          currency: "BRL",
          category: "Proteção",
          stock: 20,
          is_active: true,
          variations: [{ name: "Cor", options: ["Preto", "Azul", "Rosa"] }],
          images: [],
        },
        {
          title: "Fone Bluetooth",
          slug: normalizeProductCode(`FONEBT${suffix}`),
          description: "Fone sem fio com boa autonomia e som limpo.",
          price_cents: 8990,
          currency: "BRL",
          category: "Áudio",
          stock: 10,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Fone P2",
          slug: normalizeProductCode(`FONEP2${suffix}`),
          description: "Fone com fio P2 com microfone.",
          price_cents: 2490,
          currency: "BRL",
          category: "Áudio",
          stock: 22,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Suporte Veicular",
          slug: normalizeProductCode(`SUPORTEAUTO${suffix}`),
          description: "Suporte para celular com fixação segura.",
          price_cents: 2590,
          currency: "BRL",
          category: "Automotivo",
          stock: 18,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Adaptador OTG",
          slug: normalizeProductCode(`ADAPTADOROTG${suffix}`),
          description: "Adaptador OTG para conectar pendrive e periféricos.",
          price_cents: 1990,
          currency: "BRL",
          category: "Acessórios",
          stock: 25,
          is_active: true,
          variations: [],
          images: [],
        },
        {
          title: "Cartão MicroSD 64GB",
          slug: normalizeProductCode(`MICROSD64${suffix}`),
          description: "Cartão de memória 64GB (classe 10).",
          price_cents: 4990,
          currency: "BRL",
          category: "Memória",
          stock: 10,
          is_active: true,
          variations: [],
          images: [],
        },
      ];

      const existing = await supabase
        .from("products")
        .select("slug")
        .in(
          "slug",
          demo.map((d) => d.slug),
        );
      if (existing.error) throw existing.error;
      const existingSlugs = new Set(existing.data?.map((r) => r.slug) ?? []);
      const toInsert = demo.filter((d) => !existingSlugs.has(d.slug));
      if (toInsert.length === 0) {
        await refetch();
        return;
      }

      const ins = await supabase.from("products").insert(toInsert);
      if (ins.error) throw ins.error;
      await refetch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao adicionar itens de exemplo.";
      setSeedError(msg);
    } finally {
      setSeeding(false);
    }
  }, [refetch]);

  const generateMissingImages = React.useCallback(async () => {
    const items = data?.items ?? [];
    const targets = items.filter((p) => (p.images?.length ?? 0) === 0);
    if (targets.length === 0) return;
    const ok = window.confirm(`Gerar imagens via IA para ${targets.length} produto(s) sem imagem nesta lista?`);
    if (!ok) return;

    setGenerateError(null);
    setGenerating(true);
    try {
      const baseUrl = (import.meta.env.VITE_SD_WEBUI_URL as string | undefined) ?? "http://127.0.0.1:7860";
      const negativePrompt =
        (import.meta.env.VITE_SD_WEBUI_NEGATIVE_PROMPT as string | undefined) ??
        "texto, logotipo, marca d'água, watermark, label, price tag, blurry, low quality, lowres";
      const width = Number(import.meta.env.VITE_SD_WEBUI_WIDTH ?? 768);
      const height = Number(import.meta.env.VITE_SD_WEBUI_HEIGHT ?? 768);
      const steps = Number(import.meta.env.VITE_SD_WEBUI_STEPS ?? 24);
      const cfgScale = Number(import.meta.env.VITE_SD_WEBUI_CFG_SCALE ?? 6);
      const samplerName = String(import.meta.env.VITE_SD_WEBUI_SAMPLER ?? "DPM++ 2M Karras");
      const seed = Number(import.meta.env.VITE_SD_WEBUI_SEED ?? -1);

      const supabase = getSupabase();
      for (const p of targets) {
        const prompt = buildProductImagePrompt({ title: p.title, category: p.category, description: p.description });
        const png = await sdWebUiTxt2ImgPng({
          baseUrl,
          prompt,
          negativePrompt,
          width,
          height,
          steps,
          cfgScale,
          samplerName,
          seed,
        });
        const jpg = await compressToJpeg(png, 1400, 0.86);
        if (jpg.size > 2_000_000) throw new Error(`Imagem grande demais para "${p.title}".`);

        const storagePath = `public/${safeUuid()}.jpg`;
        const uploadFile = new File([jpg], `${normalizeFileName(p.title)}.jpg`, { type: "image/jpeg" });
        const upload = await supabase.storage.from("product-images").upload(storagePath, uploadFile, { upsert: false });
        if (upload.error) throw upload.error;
        const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(storagePath);
        if (!publicData.publicUrl) throw new Error("Falha ao gerar URL pública da imagem.");

        const upd = await supabase.from("products").update({ images: [publicData.publicUrl] }).eq("id", p.id);
        if (upd.error) throw upd.error;
      }
      await refetch();
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Falha ao gerar imagens.");
    } finally {
      setGenerating(false);
    }
  }, [data?.items, refetch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">Gerencie catálogo, preço, estoque e imagens.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={seeding} onClick={seedDemoProducts}>
            {seeding ? "Adicionando..." : "Adicionar itens de exemplo"}
          </Button>
          <Button variant="secondary" disabled={generating || isLoading} onClick={generateMissingImages}>
            {generating ? "Gerando imagens..." : "Gerar imagens IA"}
          </Button>
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
          {seedError ? <div className="text-sm text-destructive">{seedError}</div> : null}
          {generateError ? <div className="text-sm text-destructive">{generateError}</div> : null}
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
          ) : (data?.items?.length ?? 0) === 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Seu catálogo está vazio. Você pode criar um produto manualmente ou inserir itens de exemplo.
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" disabled={seeding} onClick={seedDemoProducts}>
                  {seeding ? "Adicionando..." : "Adicionar itens de exemplo"}
                </Button>
                <Button asChild>
                  <Link to="/admin/products/new">Criar produto</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/produtos">Ver loja</Link>
                </Button>
              </div>
            </div>
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
