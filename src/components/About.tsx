import { motion } from "framer-motion";
import { MapPin, Clock, Phone } from "lucide-react";

const details = [
  { icon: Phone, label: "(67) 99307-3133" },
  { icon: Clock, label: "Seg a Sáb • 8h às 18h" },
  { icon: MapPin, label: "Campo Grande – MS" },
];

const About = () => (
  <section id="sobre" className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="line-gold mb-4" />
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Sobre a <span className="text-gradient-gold">Foca no Cell</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A Foca no Cell é especializada em manutenção de celulares, oferecendo soluções rápidas,
            atendimento honesto e serviços de qualidade.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Nosso foco é resolver o seu problema com transparência e eficiência. Trabalhamos com as
            melhores peças do mercado e garantimos cada reparo realizado.
          </p>

          <div className="flex flex-col gap-3">
            {details.map((d) => (
              <div key={d.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                <d.icon className="w-4 h-4 text-primary/70" />
                {d.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Visual side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-square rounded-lg bg-card border border-border overflow-hidden relative">
            <div className="absolute inset-0 bg-gold-gradient-subtle" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl md:text-8xl font-extrabold text-gradient-gold mb-2">FC</div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">
                  Foca no Cell
                </div>
              </div>
            </div>
          </div>
          {/* Decorative border */}
          <div className="absolute -inset-3 border border-primary/10 rounded-xl -z-10" />
        </motion.div>
      </div>
    </div>
  </section>
);

export default About;
