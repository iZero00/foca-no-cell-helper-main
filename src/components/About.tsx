import { motion } from "framer-motion";
import { MapPin, Clock, Phone, BadgeCheck } from "lucide-react";
import { useSiteConfig } from "@/context/site-config";

function formatPhone(digits: string) {
  const raw = digits.replace(/[^\d]/g, "");
  const d = raw.startsWith("55") ? raw.slice(2) : raw;
  if (d.length === 11) {
    const ddd = d.slice(0, 2);
    const part1 = d.slice(2, 7);
    const part2 = d.slice(7);
    return `(${ddd}) ${part1}-${part2}`;
  }
  if (d.length === 10) {
    const ddd = d.slice(0, 2);
    const part1 = d.slice(2, 6);
    const part2 = d.slice(6);
    return `(${ddd}) ${part1}-${part2}`;
  }
  return `+${raw}`;
}

const About = () => {
  const { config } = useSiteConfig();
  const details = [
    { icon: Phone, label: formatPhone(config.whatsappNumber) },
    { icon: Clock, label: "Seg a Sáb • 8h às 18h" },
    { icon: MapPin, label: "Araçatuba – SP" },
  ];

  return (
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
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl">
            Assistência técnica especializada em manutenção de celulares, com foco em diagnóstico claro e atendimento direto.
          </p>
          <ul className="mt-5 grid gap-2 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <span>
                <span className="font-semibold text-foreground">Diagnóstico</span> explicado de forma simples.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <span>
                <span className="font-semibold text-foreground">Prazo</span> combinado e atualizado.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <span>
                <span className="font-semibold text-foreground">Entrega</span> com garantia e acabamento.
              </span>
            </li>
          </ul>

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
                  Araçatuba – SP
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
  );
};

export default About;
