import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Celulares reparados" },
  { value: "98%", label: "Clientes satisfeitos" },
  { value: "3+", label: "Anos de experiência" },
  { value: "24h", label: "Prazo médio de reparo" },
];

const Stats = () => (
  <section className="px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <div className="rounded-[2rem] border border-border bg-card/30 shadow-sm shadow-black/25 ring-1 ring-white/5 px-5 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-5 text-left">
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Como funciona</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Orçamento rápido, <span className="text-gradient-gold">sem enrolação</span>.
            </h2>
            <div className="max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Você lê em segundos e já sabe o próximo passo.
            </div>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                <span>
                  <span className="font-semibold text-foreground">Chame no WhatsApp</span> e diga o modelo + problema.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                <span>
                  <span className="font-semibold text-foreground">Receba diagnóstico</span> e opções com transparência.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                <span>
                  <span className="font-semibold text-foreground">Finalize</span> e retire com garantia.
                </span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="text-left"
              >
                <div className="text-3xl md:text-4xl font-extrabold text-gradient-gold mb-1">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground font-semibold tracking-wide">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Stats;
