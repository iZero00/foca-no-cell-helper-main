import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getWhatsAppUrl, useSiteConfig } from "@/context/site-config";

const Contact = () => {
  const { config } = useSiteConfig();
  return (
    <section id="contato" className="py-20 sm:py-24 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card p-8 sm:p-12 md:p-16 text-left shadow-gold-lg"
      >
        <div className="absolute inset-0 bg-gold-gradient-subtle pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[42rem] rounded-full bg-primary/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-start">
            <div className="space-y-5">
              <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Contato</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Precisa de um <span className="text-gradient-gold">orçamento</span>?
              </h2>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                Envie uma mensagem e já diga o modelo e o que aconteceu. Atendimento em Araçatuba e região.
              </p>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                  <span>
                    <span className="font-semibold text-foreground">Modelo</span> (ex.: iPhone 11, A32…)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                  <span>
                    <span className="font-semibold text-foreground">Sintoma</span> (não liga, tela, bateria, carga…)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                  <span>
                    <span className="font-semibold text-foreground">Prazo</span> e disponibilidade para avaliação
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <a
                  href={getWhatsAppUrl(config, "Olá! Quero um orçamento.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5" />
                  Pedir orçamento
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <a href="#catalogo">Ver serviços</a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

export default Contact;
