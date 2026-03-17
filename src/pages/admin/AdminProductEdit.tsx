import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { formatMoney } from "@/lib/money";
import { compressToJpeg, sdWebUiTxt2ImgPng } from "@/lib/sd-webui";
import { getSupabase } from "@/lib/supabase";

type ProductVariation = { name: string; options: string[] };

type ProductResponse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  stock: number;
  isActive: boolean;
  variations: ProductVariation[];
  images: string[];
};

const FormSchema = z.object({
  title: z.string().trim().min(1, "Nome do item é obrigatório.").max(120, "Nome do item é muito longo."),
  slug: z
    .string()
    .trim()
    .min(1, "Código do item é obrigatório.")
    .max(120, "Código do item é muito longo.")
    .regex(/^[A-Za-z0-9]+$/, "Código deve ser alfanumérico e sem espaços."),
  category: z.string().trim().min(1, "Categoria é obrigatória.").max(50, "Categoria é muito longa."),
  stock: z.number().int().min(0, "Quantidade em estoque não pode ser negativa.").max(1_000_000),
  isActive: z.boolean(),
  description: z.string().trim().min(1, "Descrição detalhada é obrigatória.").max(5000),
  priceReais: z
    .string()
    .trim()
    .min(1, "Preço unitário é obrigatório.")
    .max(30)
    .regex(/^\d+(?:[.,]\d{2})$/, "Preço deve ter duas casas decimais (ex.: 10,00)."),
  currency: z.string().min(3).max(5),
  variationsJson: z.string().max(20_000),
});

function parsePriceToCents(input: string) {
  const s = input.trim();
  if (!/^\d+(?:[.,]\d{2})$/.test(s)) return null;
  const normalized = s.replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function centsToReais(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

async function fileToDataUrl(file: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File) {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowed.has(file.type)) throw new Error("Formato inválido. Envie JPG, PNG ou WebP.");
  if (file.size > 5_000_000) throw new Error("Arquivo muito grande (máx. 5MB).");

  const dataUrl = await fileToDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Falha ao carregar imagem."));
    el.src = dataUrl;
  });

  const max = 1600;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Falha ao comprimir imagem.");
  ctx.drawImage(img, 0, 0, w, h);

  const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao comprimir imagem."))), outType, 0.85),
  );
  if (blob.size > 2_000_000) throw new Error("Imagem muito grande após compressão.");
  return { blob, contentType: outType };
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

function normalizeProductCode(input: string) {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 120);
  return base.length > 0 ? base : "ITEM";
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

export default function AdminProductEdit() {
  const { id } = useParams();
  const productId = (id ?? "").trim();
  const isNew = productId === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: async () => {
      const resp = await getSupabase()
        .from("products")
        .select("id, title, slug, description, price_cents, currency, category, stock, is_active, variations, images")
        .eq("id", productId)
        .maybeSingle();
      if (resp.error) throw resp.error;
      if (!resp.data) throw new Error("Produto não encontrado.");

      return {
        id: resp.data.id,
        title: resp.data.title,
        slug: resp.data.slug,
        description: resp.data.description,
        priceCents: resp.data.price_cents,
        currency: resp.data.currency,
        category: resp.data.category,
        stock: resp.data.stock,
        isActive: resp.data.is_active,
        variations: Array.isArray(resp.data.variations) ? (resp.data.variations as ProductVariation[]) : [],
        images: Array.isArray(resp.data.images) ? (resp.data.images as string[]) : [],
      } satisfies ProductResponse;
    },
    enabled: !isNew && productId.length > 0,
  });

  const [images, setImages] = React.useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof z.infer<typeof FormSchema>, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<z.infer<typeof FormSchema>>({
    title: "",
    slug: "",
    category: "geral",
    stock: 0,
    isActive: true,
    description: "",
    priceReais: "0,00",
    currency: "BRL",
    variationsJson: "[]",
  });

  React.useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title,
      slug: data.slug,
      category: data.category,
      stock: data.stock,
      isActive: data.isActive,
      description: data.description ?? "",
      priceReais: centsToReais(data.priceCents),
      currency: data.currency,
      variationsJson: JSON.stringify(data.variations ?? [], null, 2),
    });
    setImages(data.images ?? []);
  }, [data]);

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const supabase = getSupabase();
      const out: string[] = [];

      for (const f of Array.from(files)) {
        const { blob, contentType } = await compressImage(f);
        const ext = contentType === "image/png" ? "png" : "jpg";
        const path = `public/${safeUuid()}.${ext}`;
        const uploadFile = new File([blob], `${normalizeFileName(f.name)}.${ext}`, { type: contentType });

        const upload = await supabase.storage.from("product-images").upload(path, uploadFile, { upsert: false });
        if (upload.error) throw upload.error;

        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        if (!data.publicUrl) throw new Error("Falha ao gerar URL pública da imagem.");
        out.push(data.publicUrl);
      }

      return out;
    },
  });

  const generateAiMutation = useMutation({
    mutationFn: async () => {
      const title = form.title.trim();
      const category = form.category.trim();
      const description = form.description.trim();
      if (title.length === 0) throw new Error("Preencha o nome do item antes de gerar imagem.");
      if (description.length === 0) throw new Error("Preencha a descrição antes de gerar imagem.");

      const baseUrl = (import.meta.env.VITE_SD_WEBUI_URL as string | undefined) ?? "http://127.0.0.1:7860";
      const negativePrompt =
        (import.meta.env.VITE_SD_WEBUI_NEGATIVE_PROMPT as string | undefined) ??
        "texto, logotipo, marca d'água, watermark, label, price tag, blurry, low quality, lowres";
      const prompt = buildProductImagePrompt({ title, category, description });

      const png = await sdWebUiTxt2ImgPng({
        baseUrl,
        prompt,
        negativePrompt,
        width: Number(import.meta.env.VITE_SD_WEBUI_WIDTH ?? 768),
        height: Number(import.meta.env.VITE_SD_WEBUI_HEIGHT ?? 768),
        steps: Number(import.meta.env.VITE_SD_WEBUI_STEPS ?? 24),
        cfgScale: Number(import.meta.env.VITE_SD_WEBUI_CFG_SCALE ?? 6),
        samplerName: String(import.meta.env.VITE_SD_WEBUI_SAMPLER ?? "DPM++ 2M Karras"),
        seed: Number(import.meta.env.VITE_SD_WEBUI_SEED ?? -1),
      });

      const jpg = await compressToJpeg(png, 1400, 0.86);
      if (jpg.size > 2_000_000) throw new Error("Imagem muito grande após compressão.");

      const ext = "jpg";
      const storagePath = `public/${safeUuid()}.${ext}`;
      const uploadFile = new File([jpg], `${normalizeFileName(title)}.${ext}`, { type: "image/jpeg" });
      const supabase = getSupabase();
      const upload = await supabase.storage.from("product-images").upload(storagePath, uploadFile, { upsert: false });
      if (upload.error) throw upload.error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(storagePath);
      if (!data.publicUrl) throw new Error("Falha ao gerar URL pública da imagem.");
      return data.publicUrl;
    },
    onSuccess: (url) => {
      setImages((prev) => [url, ...prev].slice(0, 20));
      toast.success("Imagem gerada e adicionada. Clique em salvar para aplicar.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = FormSchema.safeParse(form);
      if (!parsed.success) {
        const nextFieldErrors: Partial<Record<keyof z.infer<typeof FormSchema>, string>> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof z.infer<typeof FormSchema> | undefined;
          if (key && !nextFieldErrors[key]) nextFieldErrors[key] = issue.message;
        }
        setFieldErrors(nextFieldErrors);
        throw new Error("Corrija os campos destacados.");
      }
      setFieldErrors({});

      const priceCents = parsePriceToCents(parsed.data.priceReais);
      if (priceCents === null) throw new Error("Preço unitário inválido.");

      let variations: unknown = [];
      try {
        const v = JSON.parse(parsed.data.variationsJson) as unknown;
        if (Array.isArray(v)) variations = v;
        else throw new Error("Variações inválidas.");
      } catch {
        throw new Error("Variações inválidas.");
      }

      const payload = {
        title: parsed.data.title,
        description: parsed.data.description,
        price_cents: priceCents,
        currency: parsed.data.currency,
        category: parsed.data.category,
        stock: parsed.data.stock,
        is_active: parsed.data.isActive,
        variations,
        images,
      };

      const baseCode = normalizeProductCode(parsed.data.slug);

      if (isNew) {
        let slug = baseCode;
        for (let attempt = 0; attempt < 5; attempt++) {
          const resp = await getSupabase()
            .from("products")
            .insert({ ...payload, slug })
            .select("id, slug")
            .single();
          if (!resp.error) return resp.data;
          if (resp.error.code === "23505") {
            const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
            slug = `${baseCode}${suffix}`.slice(0, 120);
            continue;
          }
          throw resp.error;
        }
        throw new Error("Código já existe.");
      }

      const updateResp = await getSupabase()
        .from("products")
        .update({ ...payload, slug: baseCode })
        .eq("id", productId);
      if (updateResp.error) {
        if (updateResp.error.code === "23505") throw new Error("Código já existe.");
        throw updateResp.error;
      }
      return { id: productId, slug: baseCode };
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin", "products"] }),
        qc.invalidateQueries({ queryKey: ["store", "products"] }),
        qc.invalidateQueries({ queryKey: ["store", "categories"] }),
      ]);
    },
  });

  const disableMutation = useMutation({
    mutationFn: async () => {
      const resp = await getSupabase().from("products").update({ is_active: false }).eq("id", productId);
      if (resp.error) throw resp.error;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{isNew ? "Novo produto" : "Editar produto"}</h1>
          <p className="text-sm text-muted-foreground">Cadastre título, preço, estoque, variações e imagens.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/products">Voltar</Link>
          </Button>
          {!isNew ? (
            <Button
              variant="secondary"
              disabled={disableMutation.isPending}
              onClick={async () => {
                setError(null);
                try {
                  await disableMutation.mutateAsync();
                  navigate("/admin/products");
                } catch {
                  setError("Falha ao desativar produto.");
                }
              }}
            >
              Desativar
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          {error ? <div className="text-sm text-destructive">{error}</div> : null}
          {!isNew && isLoading ? <div className="text-muted-foreground">Carregando...</div> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Nome do item</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    title: e.target.value,
                    slug: p.slug.length > 0 ? p.slug : normalizeProductCode(e.target.value),
                  }))
                }
              />
              {fieldErrors.title ? <div className="text-xs text-destructive">{fieldErrors.title}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Código (único)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="ABC123"
              />
              {fieldErrors.slug ? <div className="text-xs text-destructive">{fieldErrors.slug}</div> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              />
              {fieldErrors.category ? <div className="text-xs text-destructive">{fieldErrors.category}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Preço unitário</Label>
              <Input
                id="price"
                value={form.priceReais}
                onChange={(e) => setForm((p) => ({ ...p, priceReais: e.target.value }))}
                inputMode="decimal"
                placeholder="10,00"
              />
              {fieldErrors.priceReais ? <div className="text-xs text-destructive">{fieldErrors.priceReais}</div> : null}
              <div className="text-xs text-muted-foreground">
                Prévia:{" "}
                {(() => {
                  const c = parsePriceToCents(form.priceReais) ?? 0;
                  return formatMoney(c, form.currency);
                })()}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">Quantidade em estoque</Label>
              <Input
                id="stock"
                inputMode="numeric"
                value={String(form.stock)}
                onChange={(e) => setForm((p) => ({ ...p, stock: Number.parseInt(e.target.value || "0", 10) || 0 }))}
              />
              {fieldErrors.stock ? <div className="text-xs text-destructive">{fieldErrors.stock}</div> : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/40 px-4 py-3">
            <div className="grid">
              <div className="text-sm font-semibold">Ativo</div>
              <div className="text-xs text-muted-foreground">Produtos inativos não aparecem na loja.</div>
            </div>
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição detalhada</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={6}
            />
            {fieldErrors.description ? <div className="text-xs text-destructive">{fieldErrors.description}</div> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="variations">Variações (JSON)</Label>
            <Textarea
              id="variations"
              value={form.variationsJson}
              onChange={(e) => setForm((p) => ({ ...p, variationsJson: e.target.value }))}
              rows={8}
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div className="grid">
                <div className="text-sm font-semibold">Imagens</div>
                <div className="text-xs text-muted-foreground">Upload no Supabase Storage ou URLs públicas.</div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://..." />
              <Button
                type="button"
                variant="outline"
                disabled={uploadMutation.isPending}
                onClick={() => {
                  const candidate = newImageUrl.trim();
                  if (candidate.length === 0) return;
                  try {
                    const url = new URL(candidate);
                    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("URL inválida.");
                  } catch {
                    setError("URL de imagem inválida.");
                    return;
                  }
                  setError(null);
                  setImages((prev) => [...prev, candidate].slice(0, 20));
                  setNewImageUrl("");
                }}
              >
                Adicionar URL
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={uploadMutation.isPending || generateAiMutation.isPending}
                onClick={async () => {
                  setError(null);
                  try {
                    await generateAiMutation.mutateAsync();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Falha ao gerar imagem.");
                  }
                }}
              >
                {generateAiMutation.isPending ? "Gerando..." : "Gerar IA"}
              </Button>
              <label className="inline-flex">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    if (!e.target.files || e.target.files.length === 0) return;
                    setError(null);
                    try {
                      const urls = await uploadMutation.mutateAsync(e.target.files);
                      setImages((prev) => [...prev, ...urls].slice(0, 20));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Falha ao enviar imagem.");
                    } finally {
                      e.target.value = "";
                    }
                  }}
                />
                <Button type="button" variant="outline" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Enviando..." : "Upload"}
                </Button>
              </label>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {images.map((url) => (
                  <div key={url} className="relative overflow-hidden rounded-xl border border-border bg-card/40">
                    <img src={url} alt="" className="aspect-square h-full w-full object-cover" loading="lazy" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-lg bg-background/80 px-2 py-1 text-xs font-semibold text-foreground"
                      onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Nenhuma imagem adicionada.</div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="sm:flex-1"
              disabled={submitting || saveMutation.isPending}
              onClick={async () => {
                setSubmitting(true);
                setError(null);
                try {
                  const result = await saveMutation.mutateAsync();
                  toast.success(isNew ? "Produto cadastrado com sucesso." : "Produto atualizado com sucesso.");
                  navigate(`/admin/products/${result.id}`, { replace: true });
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Falha ao salvar produto.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
            <Button asChild variant="outline">
              <Link to="/produtos" target="_blank" rel="noreferrer">
                Ver loja
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
