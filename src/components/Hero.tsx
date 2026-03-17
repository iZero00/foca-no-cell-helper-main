import { motion } from "framer-motion";
import { MessageCircle, ArrowDown, Wrench, Shield, Clock, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getWhatsAppUrl, useSiteConfig } from "@/context/site-config";
import { formatMoney } from "@/lib/money";
import { getSupabase } from "@/lib/supabase";
import { formatWhatsAppItemMessage } from "@/lib/whatsapp";

const badges = [
  { icon: Clock, label: "Reparo Rápido" },
  { icon: Shield, label: "Garantia" },
  { icon: Wrench, label: "Peças Originais" },
];

type HeroProduct = {
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

const fallbackHeroProducts: HeroProduct[] = [
  {
    id: "fallback-hero-cabo",
    title: "Cabo USB-C Reforçado",
    slug: "CABOUSB",
    description: "Cabo reforçado para carga e dados.",
    priceCents: 1990,
    currency: "BRL",
    category: "Acessórios",
    images: [],
  },
  {
    id: "fallback-hero-carregador",
    title: "Carregador Turbo 20W",
    slug: "CARREGADOR20W",
    description: "Carregador rápido compatível com diversos modelos.",
    priceCents: 4990,
    currency: "BRL",
    category: "Acessórios",
    images: [],
  },
  {
    id: "fallback-hero-pelicula",
    title: "Película 3D",
    slug: "PELICULA3D",
    description: "Proteção de tela com excelente cobertura.",
    priceCents: 2990,
    currency: "BRL",
    category: "Proteção",
    images: [],
  },
];

const Hero = () => {
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

  const heroProducts: HeroProduct[] =
    !isError && (data?.length ?? 0) > 0
      ? data!.slice(0, 3).map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          priceCents: p.price_cents,
          currency: p.currency,
          category: p.category,
          images: Array.isArray(p.images) ? (p.images as string[]) : [],
        }))
      : fallbackHeroProducts;

  return (
    <section className="relative overflow-hidden bg-brand-splash">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-14 sm:pt-28 sm:pb-16">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm shadow-black/20"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Direto ao ponto: orçamento pelo WhatsApp
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6 }}
            className="mt-6 text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[0.98]"
          >
            Conserto de celular com
            <span className="text-gradient-gold"> agilidade</span>
            <br />
            e um toque de
            <span className="text-gradient-gold"> confiança</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.55 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl"
          >
            Diagnóstico rápido, serviço caprichado e atendimento direto com o técnico.
            Sem enrolação, sem mistério.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.55 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center"
          >
            <Button asChild size="lg" className="sm:w-auto">
              <a href={getWhatsAppUrl(config, "Olá! Vim pelo site da Foca no Cell (Araçatuba/SP).")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Chamar no WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="sm:w-auto">
              <Link to="/produtos">Ver loja</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="sm:w-auto justify-start px-0 sm:px-4">
              <a href="#catalogo">
                Ver serviços
                <ArrowDown className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.46, duration: 0.55 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"
          >
            {badges.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-muted-foreground">
                <b.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold tracking-wide">{b.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.7 }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gold-gradient-subtle blur-2xl" />
          <section id="loja" className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-gold-lg scroll-mt-24">
            <CardHeader className="space-y-2 border-b border-border bg-card/60">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Loja em destaque
              </div>
              <CardTitle className="text-xl sm:text-2xl font-extrabold tracking-tight">Produtos prontos para você</CardTitle>
              <div className="text-sm text-muted-foreground">Itens populares e fáceis de confirmar via WhatsApp.</div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Carregando produtos...</div>
              ) : (
                <div className="grid gap-3">
                  {heroProducts.map((p) => {
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
                      <div key={p.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background/35 px-4 py-3">
                        <div className="min-w-0">
                          <div className="font-extrabold tracking-tight leading-tight truncate">{p.title}</div>
                          <div className="text-xs font-semibold text-muted-foreground mt-1">
                            {formatMoney(p.priceCents, p.currency)} • {p.category}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button asChild size="sm" variant="outline">
                            <a href={getWhatsAppUrl(config, message)} target="_blank" rel="noopener noreferrer">
                              WhatsApp
                            </a>
                          </Button>
                          <Button asChild size="sm">
                            <Link to={`/produto/${encodeURIComponent(p.slug || p.id)}`}>Ver</Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="sm:flex-1">
                  <Link to="/produtos">Ver todos os produtos</Link>
                </Button>
                <Button asChild variant="outline" className="sm:flex-1">
                  <a href="#catalogo">Ir para serviços</a>
                </Button>
              </div>
            </CardContent>
          </section>
        </motion.div>
      </div>
    </div>
  </section>
  );
};

export default Hero;
