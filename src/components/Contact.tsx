import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "5567993073133";

const Contact = () => (
  <section id="contato" className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-card border border-border rounded-xl p-10 md:p-16 text-center overflow-hidden"
      >
        {/* Background effect */}
        <div className="absolute inset-0 bg-gold-gradient-subtle pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Precisa de um <span className="text-gradient-gold">orçamento</span>?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-10">
            Fale diretamente com nosso técnico pelo WhatsApp. Atendimento rápido e sem complicação.
          </p>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Quero um orçamento.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-whatsapp text-whatsapp-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-whatsapp/20 group"
          >
            <MessageCircle className="w-5 h-5" />
            Falar no WhatsApp
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default Contact;
