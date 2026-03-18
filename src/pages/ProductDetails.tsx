import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { formatMoney } from "@/lib/money";
import { getProductPrimaryImageUrl } from "@/lib/product-images";
import { getSupabase } from "@/lib/supabase";
import { buildWhatsAppUrl, formatWhatsAppItemMessage } from "@/lib/whatsapp";

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
  variations: ProductVariation[];
  images: string[];
};

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_cents: number;
  currency: string;
  category: string;
  stock: number;
  variations: unknown;
  images: unknown;
};

export default function ProductDetails() {
  const { id } = useParams();
  const safeId = (id ?? "").trim();

  const { data, isLoading, error } = useQuery({
    queryKey: ["store", "product", safeId],
    queryFn: async () => {
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const supabase = getSupabase();
      const baseQuery = supabase
        .from("products")
        .select("id, title, slug, description, price_cents, currency, category, stock, variations, images")
        .eq("is_active", true);

      const resp = (await (UUID_RE.test(safeId) ? baseQuery.eq("id", safeId) : baseQuery.eq("slug", safeId)).maybeSingle()) as unknown as {
        data: ProductRow | null;
        error: unknown | null;
      };
      if (resp.error) throw resp.error;
      if (!resp.data) throw new Error("Produto não encontrado.");
      const row = resp.data;

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        priceCents: row.price_cents,
        currency: row.currency,
        category: row.category,
        stock: row.stock,
        variations: Array.isArray(row.variations) ? (row.variations as ProductVariation[]) : [],
        images: Array.isArray(row.images) ? (row.images as string[]) : [],
      } satisfies ProductResponse;
    },
    enabled: safeId.length > 0,
  });

  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [variation, setVariation] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!data) return;
    setSelectedImage(getProductPrimaryImageUrl(data.images, data.category, 0));
    const initial: Record<string, string> = {};
    for (const v of data.variations ?? []) {
      const opt = v?.options?.[0];
      if (typeof v?.name === "string" && typeof opt === "string") initial[v.name] = opt;
    }
    setVariation(initial);
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-16 text-muted-foreground">Carregando...</main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-16">
          <Card>
            <CardHeader>
              <CardTitle>Produto não encontrado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-muted-foreground">Não foi possível carregar o produto.</div>
              <Button asChild>
                <Link to="/produtos">Voltar para produtos</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const canBuy = data.stock > 0;
  const whatsappHref = buildWhatsAppUrl(
    formatWhatsAppItemMessage({
      kind: "produto",
      title: data.title,
      description: data.description,
      priceCents: data.priceCents,
      currency: data.currency,
      category: data.category,
      imageUrl: data.images?.[0] ?? null,
    }),
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-6 text-sm text-muted-foreground">
          <Link to="/produtos" className="underline underline-offset-4">
            Produtos
          </Link>{" "}
          / {data.title}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card/40">
                <img src={selectedImage ?? getProductPrimaryImageUrl(data.images, data.category, 0)} alt={data.title} className="h-full w-full object-cover" />
              </div>
              {(data.images ?? []).length > 1 ? (
                <div className="grid grid-cols-5 gap-2">
                  {data.images.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setSelectedImage(url)}
                      className="aspect-square overflow-hidden rounded-xl border border-border bg-card/40"
                    >
                      <img src={url} alt={data.title} className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">{data.title}</CardTitle>
              <div className="text-sm text-muted-foreground">{data.category}</div>
              <div className="text-xl font-extrabold text-primary">{formatMoney(data.priceCents, data.currency)}</div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{data.description}</div>

              <div className="grid gap-3">
                {(data.variations ?? []).map((v) => (
                  <div key={v.name} className="grid gap-2">
                    <div className="text-sm font-semibold">{v.name}</div>
                    <Select
                      value={variation[v.name] ?? ""}
                      onValueChange={(val) => setVariation((prev) => ({ ...prev, [v.name]: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Selecione ${v.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(v.options ?? []).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">{canBuy ? `Estoque: ${data.stock}` : "Sem estoque"}</div>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link to="/produtos">Voltar</Link>
                  </Button>
                  <Button asChild disabled={!canBuy}>
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                      Comprar via WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
