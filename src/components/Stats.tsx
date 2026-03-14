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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-extrabold text-gradient-gold mb-1">
              {s.value}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground font-semibold tracking-wide">
              {s.label}
            </div>
          </motion.div>
        ))}
        </div>
      </div>
    </div>
  </section>
);

export default Stats;
