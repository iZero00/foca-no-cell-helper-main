import { motion } from "framer-motion";
import { MapPin, Clock, Phone, BadgeCheck } from "lucide-react";

const details = [
  { icon: Phone, label: "(67) 99307-3133" },
  { icon: Clock, label: "Seg a Sáb • 8h às 18h" },
  { icon: MapPin, label: "Campo Grande – MS" },
];

const About = () => (
  <section id="sobre" className="py-20 sm:py-24 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm shadow-black/20">
            <BadgeCheck className="h-4 w-4 text-primary" />
            Transparência do início ao fim
          </div>
          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Sobre a{" "}
            <span className="text-gradient-gold">Foca no Cell</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Assistência técnica especializada em manutenção de celulares, com foco em diagnóstico claro,
            prazos honestos e acabamento impecável.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            A ideia é simples: você chama, a gente resolve e devolve seu aparelho funcionando — sem dor de cabeça.
          </p>

          <div className="flex flex-col gap-3">
            {details.map((d) => (
              <div key={d.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-9 w-9 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <d.icon className="w-4 h-4 text-primary" />
                </span>
                <span className="font-semibold">{d.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gold-gradient-subtle blur-2xl" />
          <div className="overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-gold-lg">
            <div className="aspect-[4/3]">
              <img
                src="/icone.jpg"
                alt="Identidade Foca no Cell"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-5 border-t border-border bg-card/60">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm font-extrabold tracking-tight">Foca no Cell</div>
                    <div className="text-xs font-semibold text-muted-foreground">Reparo e manutenção</div>
                  </div>
                </div>
                <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  Campo Grande – MS
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default About;
