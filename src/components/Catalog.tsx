import { motion } from "framer-motion";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import imgTela from "@/assets/service-tela.jpg";
import imgBateria from "@/assets/service-bateria.jpg";
import imgPlaca from "@/assets/service-placa.jpg";
import imgConector from "@/assets/service-conector.jpg";
import imgSoftware from "@/assets/service-software.jpg";
import imgAcessorios from "@/assets/service-acessorios.jpg";

import { getWhatsAppUrl, useSiteConfig } from "@/context/site-config";

const services = [
  { name: "Troca de Tela", description: "iPhone, Samsung, Motorola e outras marcas", price: "Sob consulta", message: "Olá! Tenho interesse na Troca de Tela. Pode me passar mais informações?", image: imgTela },
  { name: "Troca de Bateria", description: "Baterias novas com garantia", price: "Sob consulta", message: "Olá! Tenho interesse na Troca de Bateria.", image: imgBateria },
  { name: "Conserto de Placa", description: "Reparos avançados em placa", price: "Sob consulta", message: "Olá! Preciso de conserto de placa no meu celular.", image: imgPlaca },
  { name: "Conector de Carga", description: "Correção de problemas ao carregar", price: "Sob consulta", message: "Olá! Meu celular está com problema no conector de carga.", image: imgConector },
  { name: "Atualização de Software", description: "Correções, formatação e desempenho", price: "Sob consulta", message: "Olá! Gostaria de atualizar o software do meu celular.", image: imgSoftware },
  { name: "Acessórios", description: "Capas, cabos, películas e fones", price: "Consultar", message: "Olá! Gostaria de ver os acessórios disponíveis.", image: imgAcessorios },
];

const Catalog = () => {
  const { config } = useSiteConfig();
  return (
    <section id="catalogo" className="py-20 sm:py-24 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 sm:mb-16"
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm shadow-black/20">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Serviços em destaque
        </div>
        <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          Escolha o serviço e fale com a{" "}
          <span className="text-gradient-gold">Foca no Cell</span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
          Toque em um card para abrir uma conversa no WhatsApp com a mensagem pronta.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <motion.a
            key={s.name}
            href={getWhatsAppUrl(config, s.message)}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm shadow-black/25 ring-1 ring-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-gold-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src={s.image}
                alt={s.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gold-gradient-subtle" />
              
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/70 glass text-[11px] font-semibold text-foreground border border-border">
                {s.price}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {s.name}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.description}</p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                  Abrir conversa
                </div>
                <span className="text-[11px] font-semibold text-primary">wa.me</span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
  );
};

export default Catalog;
