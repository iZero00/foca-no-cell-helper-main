import { motion } from "framer-motion";
import { Copy, Ticket } from "lucide-react";
import { toast } from "sonner";

const coupons = [
  { code: "FOCA10", description: "10% OFF em troca de tela", validity: "Tempo limitado" },
  { code: "BATERIA15", description: "R$15 OFF na troca de bateria", validity: "Tempo limitado" },
];

const Coupons = () => {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Cupom ${code} copiado!`);
  };

  return (
    <section id="cupons" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="line-gold mb-4" />
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Cupons de <span className="text-gradient-gold">Desconto</span>
          </h2>
          <p className="text-muted-foreground max-w-md">
            Informe o cupom no WhatsApp no momento do atendimento.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          {coupons.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mt-1">
                  {c.validity}
                </span>
              </div>

              <button
                onClick={() => copyCode(c.code)}
                className="inline-flex items-center gap-2 bg-secondary/60 border border-border rounded-md px-4 py-2.5 font-mono font-bold text-primary text-lg mb-3 hover:bg-secondary transition-colors w-full justify-center"
              >
                {c.code}
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>

              <p className="text-sm text-muted-foreground text-center">{c.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Coupons;
