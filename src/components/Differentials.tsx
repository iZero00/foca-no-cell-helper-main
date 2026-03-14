import { motion } from "framer-motion";
import { Zap, Shield, CheckCircle, User } from "lucide-react";

const items = [
  { icon: Zap, title: "Atendimento Rápido", description: "Diagnóstico e reparo no menor tempo possível" },
  { icon: Shield, title: "Peças de Qualidade", description: "Componentes testados e com procedência garantida" },
  { icon: CheckCircle, title: "Garantia no Serviço", description: "Todos os reparos com garantia de funcionamento" },
  { icon: User, title: "Direto com o Técnico", description: "Sem intermediários, atendimento personalizado" },
];

const Differentials = () => (
  <section id="diferenciais" className="py-24 px-6 bg-card/30 border-y border-border">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
          Por que escolher a <span className="text-gradient-gold">Foca no Cell</span>?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Compromisso com qualidade em cada detalhe do serviço.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/20 transition-all group text-center"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Differentials;
