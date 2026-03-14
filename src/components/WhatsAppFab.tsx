import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5567993073133";

const WhatsAppFab = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Vim pelo site da Foca no Cell.")}`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-whatsapp text-whatsapp-foreground flex items-center justify-center shadow-lg animate-pulse-glow hover:scale-110 transition-transform"
    aria-label="Falar no WhatsApp"
  >
    <MessageCircle className="w-7 h-7" />
  </a>
);

export default WhatsAppFab;
