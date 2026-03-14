import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Lucas M.",
    text: "Troquei a tela do meu iPhone e ficou perfeito. Atendimento rápido e honesto!",
    stars: 5,
  },
  {
    name: "Ana C.",
    text: "Bateria nova no mesmo dia. Super recomendo a Foca no Cell!",
    stars: 5,
  },
  {
    name: "Rafael S.",
    text: "Consertaram minha placa que outros disseram que não tinha jeito. Profissionais demais.",
    stars: 5,
  },
];

const Testimonials = () => (
  <section className="py-20 sm:py-24 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 sm:mb-16"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Avaliações que falam por si
          <span className="text-gradient-gold">.</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          O objetivo é simples: devolver seu celular funcionando e você tranquilo.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-[1.75rem] border border-border bg-card shadow-sm shadow-black/25 ring-1 ring-white/5 p-6"
          >
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.stars }).map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
              ))}
              <span className="ml-auto inline-flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                <Quote className="h-3.5 w-3.5 text-primary" />
                Cliente
              </span>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed mb-5">
              "{t.text}"
            </p>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-extrabold text-primary">
                {t.name.charAt(0)}
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{t.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
