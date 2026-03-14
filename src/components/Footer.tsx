import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => (
  <footer className="border-t border-border bg-card/15">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        <div className="flex items-center gap-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/20 ring-1 ring-white/5">
            <img src="/icone.jpg" alt="Foca no Cell" className="h-full w-full object-cover" loading="lazy" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight text-foreground">Foca no Cell</div>
            <div className="text-xs font-semibold text-muted-foreground">Assistência técnica</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" className="h-10">
            <a href="#catalogo">Serviços</a>
          </Button>
          <Button asChild variant="ghost" className="h-10">
            <a href="#diferenciais">Diferenciais</a>
          </Button>
          <Button asChild variant="ghost" className="h-10">
            <a href="#sobre">Sobre</a>
          </Button>
          <Button asChild variant="ghost" className="h-10">
            <a href="#contato">Contato</a>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="icon" aria-label="WhatsApp">
            <a
              href={`https://wa.me/5567993073133?text=${encodeURIComponent("Olá! Vim pelo site da Foca no Cell.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Smartphone className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border pt-8">
        <p className="text-xs text-muted-foreground font-semibold">
          © {new Date().getFullYear()} Foca no Cell. Todos os direitos reservados.
        </p>
        <p className="text-xs text-muted-foreground">
          Feito com foco, velocidade e cuidado.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
