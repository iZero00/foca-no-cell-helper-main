import { motion } from "framer-motion";
import { MessageCircle, ArrowDown, Wrench, Shield, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "5567993073133";

const makeWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const badges = [
  { icon: Clock, label: "Reparo Rápido" },
  { icon: Shield, label: "Garantia" },
  { icon: Wrench, label: "Peças Originais" },
];

const Hero = () => (
  <section className="relative overflow-hidden bg-brand-splash">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
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
              <a href={makeWhatsAppUrl("Olá! Vim pelo site da Foca no Cell.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Chamar no WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="sm:w-auto">
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
          <div className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-gold-lg">
            <div className="aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="/icone.jpg"
                alt="Mascote e identidade Foca no Cell"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 p-4 sm:p-5 border-t border-border bg-card/60">
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-primary" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">Reparo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">Garantia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">Rápido</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default Hero;
