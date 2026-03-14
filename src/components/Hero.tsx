import { motion } from "framer-motion";
import { MessageCircle, ArrowDown, Wrench, Shield, Clock } from "lucide-react";

const WHATSAPP_NUMBER = "5567993073133";

const makeWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const badges = [
  { icon: Clock, label: "Reparo Rápido" },
  { icon: Shield, label: "Garantia" },
  { icon: Wrench, label: "Peças Originais" },
];

const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden">
    {/* Subtle grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(40 65% 55%) 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }}
    />

    {/* Ambient glow */}
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-primary/4 blur-[150px] pointer-events-none" />
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

    <div className="relative z-10 max-w-4xl mx-auto text-center">
      {/* Top badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary/50 text-xs font-medium text-muted-foreground mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Assistência Técnica Especializada
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9] mb-6"
      >
        <span className="text-foreground">Foca no</span>
        <br />
        <span className="text-gradient-gold">Cell</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-10 font-light leading-relaxed"
      >
        Conserto rápido, peças de qualidade e atendimento direto pelo WhatsApp.
        Seu celular em boas mãos.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
      >
        <a
          href={makeWhatsAppUrl("Olá! Vim pelo site da Foca no Cell.")}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-4 rounded-lg bg-whatsapp text-whatsapp-foreground font-semibold text-base hover:opacity-90 transition-all inline-flex items-center justify-center gap-2.5 shadow-lg shadow-whatsapp/20"
        >
          <MessageCircle className="w-5 h-5" />
          Falar no WhatsApp
        </a>
        <a
          href="#catalogo"
          className="w-full sm:w-auto px-8 py-4 rounded-lg border border-border bg-secondary/40 text-foreground font-semibold text-base hover:bg-secondary/70 transition-all inline-flex items-center justify-center gap-2"
        >
          Ver Serviços
          <ArrowDown className="w-4 h-4" />
        </a>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="flex items-center justify-center gap-6 md:gap-10"
      >
        {badges.map((b) => (
          <div key={b.label} className="flex items-center gap-2 text-muted-foreground">
            <b.icon className="w-4 h-4 text-primary/70" />
            <span className="text-xs font-medium">{b.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Hero;
