import { Smartphone } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-10 px-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Smartphone className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Foca no Cell</span>
      </div>

      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <a href="#catalogo" className="hover:text-foreground transition-colors">Serviços</a>
        <a href="#diferenciais" className="hover:text-foreground transition-colors">Diferenciais</a>
        <a href="#sobre" className="hover:text-foreground transition-colors">Sobre</a>
        <a href="#contato" className="hover:text-foreground transition-colors">Contato</a>
      </div>

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Foca no Cell. Todos os direitos reservados.
      </p>
    </div>
  </footer>
);

export default Footer;
