import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Catalog from "@/components/Catalog";
import Coupons from "@/components/Coupons";
import Differentials from "@/components/Differentials";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWhatsAppUrl, useSiteConfig } from "@/context/site-config";
import { formatMoney } from "@/lib/money";
import { getProductPrimaryImageUrl } from "@/lib/product-images";
import { getSupabase } from "@/lib/supabase";
import { formatWhatsAppItemMessage } from "@/lib/whatsapp";

type HomeProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  images: string[];
};

type ProductSelectRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_cents: number;
  currency: string;
  category: string;
  images: unknown;
};

const fallbackProducts: HomeProduct[] = [
  {
    id: "fallback-cabo",
    title: "Cabo USB-C Reforçado",
    slug: "CABOUSB",
    description: "Cabo reforçado para carga e dados.",
    priceCents: 1990,
    currency: "BRL",
    category: "Acessórios",
    images: [],
  },
  {
    id: "fallback-carregador",
    title: "Carregador Turbo 20W",
    slug: "CARREGADOR20W",
    description: "Carregador rápido compatível com diversos modelos.",
    priceCents: 4990,
    currency: "BRL",
    category: "Acessórios",
    images: [],
  },
  {
    id: "fallback-pelicula",
    title: "Película 3D",
    slug: "PELICULA3D",
    description: "Proteção de tela com excelente cobertura.",
    priceCents: 2990,
    currency: "BRL",
    category: "Proteção",
    images: [],
  },
  {
    id: "fallback-capa",
    title: "Capa Anti-impacto",
    slug: "CAPAANTISHOCK",
    description: "Capa resistente para proteger quedas e arranhões.",
    priceCents: 3990,
    currency: "BRL",
    category: "Proteção",
    images: [],
  },
  {
    id: "fallback-fone",
    title: "Fone Bluetooth",
    slug: "FONEBT",
    description: "Fone sem fio com boa autonomia e som limpo.",
    priceCents: 8990,
    currency: "BRL",
    category: "Áudio",
    images: [],
  },
  {
    id: "fallback-suporte",
    title: "Suporte Veicular",
    slug: "SUPORTEAUTO",
    description: "Suporte para celular com fixação segura.",
    priceCents: 2590,
    currency: "BRL",
    category: "Automotivo",
    images: [],
  },
];

function HomeProducts() {
  const { config } = useSiteConfig();
  const { data, isLoading, isError } = useQuery<ProductSelectRow[]>({
    queryKey: ["store", "home-products", { limit: 6 }],
    queryFn: async () => {
      const resp = await getSupabase()
        .from("products")
        .select("id, title, slug, description, price_cents, currency, category, images")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(0, 5);
      if (resp.error) throw resp.error;
      return (resp.data ?? []) as unknown as ProductSelectRow[];
    },
  });

  const items: HomeProduct[] =
    !isError && (data?.length ?? 0) > 0
      ? data!.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          priceCents: p.price_cents,
          currency: p.currency,
          category: p.category,
          images: Array.isArray(p.images) ? (p.images as string[]) : [],
        }))
      : fallbackProducts;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14" id="produtos">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Produtos</h2>
          <p className="text-sm text-muted-foreground">Veja itens em destaque e fale no WhatsApp para confirmar.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/produtos">Ver todos</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-6 text-sm text-muted-foreground">Carregando produtos...</div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((p, i) => {
            const message = formatWhatsAppItemMessage({
              kind: "produto",
              title: p.title,
              description: p.description,
              priceCents: p.priceCents,
              currency: p.currency,
              category: p.category,
              imageUrl: p.images?.[0] ?? null,
            });
            return (
              <Card key={p.id} className="overflow-hidden group">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-44 overflow-hidden relative rounded-xl border border-border bg-card/40">
                    <img
                      src={getProductPrimaryImageUrl(p.images, p.category, i)}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gold-gradient-subtle" />
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/70 glass text-[11px] font-semibold text-foreground border border-border">
                      {formatMoney(p.priceCents, p.currency)}
                    </span>
                  </div>
                  <div className="line-clamp-2 text-sm text-muted-foreground">{p.description}</div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-muted-foreground">{p.category}</div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={getWhatsAppUrl(config, message)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </Button>
                      <Button asChild size="sm">
                        <Link to={`/produto/${encodeURIComponent(p.slug || p.id)}`}>Ver detalhes</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Catalog />
      <HomeProducts />
      <Stats />
      <Coupons />
      <Differentials />
      <Testimonials />
      <About />
      <Contact />
      <Footer />
      <WhatsAppFab />
    </main>
  );
};

export default Index;
