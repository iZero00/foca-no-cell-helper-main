import { motion } from "framer-motion";
import { Zap, Shield, CheckCircle, User, Sparkles } from "lucide-react";

const items = [
  { icon: Zap, title: "Atendimento Rápido", description: "Diagnóstico e reparo no menor tempo possível" },
  { icon: Shield, title: "Peças de Qualidade", description: "Componentes testados e com procedência garantida" },
  { icon: CheckCircle, title: "Garantia no Serviço", description: "Todos os reparos com garantia de funcionamento" },
  { icon: User, title: "Direto com o Técnico", description: "Sem intermediários, atendimento personalizado" },
];

const Differentials = () => (
  <section id="diferenciais" className="py-20 sm:py-24 px-4 sm:px-6 bg-card/20 border-y border-border">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-left mb-10 sm:mb-14"
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-background/35 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm shadow-black/20">
          <Sparkles className="h-4 w-4 text-primary" />
          Identidade forte, entrega melhor ainda
        </div>
        <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          Por que escolher a{" "}
          <span className="text-gradient-gold">Foca no Cell</span>?
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
          Clareza no diagnóstico, cuidado no reparo e agilidade no prazo.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4 text-left">
          <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Em resumo</div>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <span>
                <span className="font-semibold text-foreground">Atendimento direto</span> com quem faz o serviço.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <span>
                <span className="font-semibold text-foreground">Prazos honestos</span> e atualização durante o processo.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <span>
                <span className="font-semibold text-foreground">Garantia</span> e acabamento caprichado.
              </span>
            </li>
          </ul>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-[1.75rem] border border-border bg-card shadow-sm shadow-black/25 ring-1 ring-white/5 p-6 transition-all group text-left hover:-translate-y-1 hover:border-primary/25 hover:shadow-gold"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-extrabold tracking-tight text-foreground mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Differentials;
