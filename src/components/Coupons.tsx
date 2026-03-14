import { motion } from "framer-motion";
import { Copy, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
    <section id="cupons" className="py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm shadow-black/20">
            <Ticket className="h-4 w-4 text-primary" />
            Cupons do mês
          </div>
          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Desconto na conversa, sem complicação
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
            Copie o cupom e envie no WhatsApp na hora do atendimento.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 max-w-3xl">
          {coupons.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="rounded-[1.75rem] border border-border bg-card shadow-sm shadow-black/25 ring-1 ring-white/5 p-6 transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-gold"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mt-1">
                  {c.validity}
                </span>
              </div>

              <Button
                onClick={() => copyCode(c.code)}
                variant="outline"
                className="w-full justify-center font-mono text-lg tracking-tight h-12 mb-3"
                aria-label={`Copiar cupom ${c.code}`}
              >
                {c.code}
                <Copy className="w-4 h-4 text-muted-foreground" />
              </Button>

              <p className="text-sm text-muted-foreground text-center">{c.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Coupons;
