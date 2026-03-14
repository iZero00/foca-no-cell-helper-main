import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Celulares reparados" },
  { value: "98%", label: "Clientes satisfeitos" },
  { value: "3+", label: "Anos de experiência" },
  { value: "24h", label: "Prazo médio de reparo" },
];

const Stats = () => (
  <section className="py-16 px-6 border-y border-border bg-card/30">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
            <div className="text-xs md:text-sm text-muted-foreground font-medium">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
