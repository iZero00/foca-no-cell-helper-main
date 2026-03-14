import { motion } from "framer-motion";
import { Star } from "lucide-react";

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
  <section className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
          O que dizem nossos <span className="text-gradient-gold">clientes</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          A satisfação dos nossos clientes é a nossa maior garantia.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-lg p-6 relative"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.stars }).map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
              ))}
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed mb-5">
              "{t.text}"
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {t.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
