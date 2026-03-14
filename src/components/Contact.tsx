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
        className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card p-8 sm:p-12 md:p-16 text-center shadow-gold-lg"
      >
        <div className="absolute inset-0 bg-gold-gradient-subtle pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[42rem] rounded-full bg-primary/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Precisa de um <span className="text-gradient-gold">orçamento</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Envie uma mensagem e já diga qual serviço você precisa. Resposta rápida e objetiva.
          </p>

          <Button asChild size="lg" className="mx-auto">
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
        </div>
      </motion.div>
    </div>
  </section>
  );
};

export default Contact;
