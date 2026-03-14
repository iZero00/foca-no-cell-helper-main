import { motion } from "framer-motion";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import imgTela from "@/assets/service-tela.jpg";
import imgBateria from "@/assets/service-bateria.jpg";
import imgPlaca from "@/assets/service-placa.jpg";
import imgConector from "@/assets/service-conector.jpg";
import imgSoftware from "@/assets/service-software.jpg";
import imgAcessorios from "@/assets/service-acessorios.jpg";

const WHATSAPP_NUMBER = "5567993073133";

const makeWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const services = [
  { name: "Troca de Tela", description: "iPhone, Samsung, Motorola e outras marcas", price: "Sob consulta", message: "Olá! Tenho interesse na Troca de Tela. Pode me passar mais informações?", image: imgTela },
  { name: "Troca de Bateria", description: "Baterias novas com garantia", price: "Sob consulta", message: "Olá! Tenho interesse na Troca de Bateria.", image: imgBateria },
  { name: "Conserto de Placa", description: "Reparos avançados em placa", price: "Sob consulta", message: "Olá! Preciso de conserto de placa no meu celular.", image: imgPlaca },
  { name: "Conector de Carga", description: "Correção de problemas ao carregar", price: "Sob consulta", message: "Olá! Meu celular está com problema no conector de carga.", image: imgConector },
  { name: "Atualização de Software", description: "Correções, formatação e desempenho", price: "Sob consulta", message: "Olá! Gostaria de atualizar o software do meu celular.", image: imgSoftware },
  { name: "Acessórios", description: "Capas, cabos, películas e fones", price: "Consultar", message: "Olá! Gostaria de ver os acessórios disponíveis.", image: imgAcessorios },
];

const Catalog = () => (
  <section id="catalogo" className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <div className="line-gold mb-4" />
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
          Nossos <span className="text-gradient-gold">Serviços</span>
        </h2>
        <p className="text-muted-foreground max-w-md">
          Soluções completas para o seu celular. Escolha um serviço e fale direto conosco.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <motion.a
            key={s.name}
            href={makeWhatsAppUrl(s.message)}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-gold"
          >
            {/* Image */}
            <div className="h-44 overflow-hidden relative">
              <img
                src={s.image}
                alt={s.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              
              {/* Price badge */}
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-background/80 glass text-xs font-medium text-primary border border-border">
                {s.price}
              </span>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {s.name}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.description}</p>
              <div className="flex items-center gap-2 text-xs font-medium text-whatsapp">
                <MessageCircle className="w-3.5 h-3.5" />
                Consultar via WhatsApp
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export default Catalog;
