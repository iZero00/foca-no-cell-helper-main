import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5567993073133";

const WhatsAppFab = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Vim pelo site da Foca no Cell.")}`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 h-14 w-14 rounded-[1.25rem] bg-primary text-primary-foreground flex items-center justify-center shadow-gold-lg hover:-translate-y-0.5 hover:shadow-gold-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    aria-label="Falar no WhatsApp"
  >
    <MessageCircle className="w-7 h-7" />
  </a>
);

export default WhatsAppFab;
