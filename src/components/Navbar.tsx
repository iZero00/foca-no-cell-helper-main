import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl, useSiteConfig } from "@/context/site-config";

const links = [
  { label: "Serviços", href: "#catalogo" },
  { label: "Cupons", href: "#cupons" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { config } = useSiteConfig();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={scrolled ? "fixed top-0 left-0 right-0 z-50 glass bg-background/75 border-b border-border shadow-lg shadow-black/35" : "fixed top-0 left-0 right-0 z-50"}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[4.5rem] flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/20 ring-1 ring-white/5">
              <img
                src="/icone.jpg"
                alt="Foca no Cell"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-extrabold tracking-tight text-foreground">Foca no Cell</span>
              <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                Assistência técnica
              </span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Button key={l.href} asChild variant="ghost" className="h-10 px-3 text-sm">
                <a href={l.href}>{l.label}</a>
              </Button>
            ))}
            <Button asChild className="ml-2">
              <a
                href={getWhatsAppUrl(config)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Smartphone className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>

          <Button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            variant="ghost"
            size="icon"
            className="md:hidden"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[4.5rem] z-40 glass bg-background/92 border-b border-border p-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <Button
                  key={l.href}
                  asChild
                  variant="ghost"
                  className="h-11 justify-start"
                  onClick={() => setMobileOpen(false)}
                >
                  <a href={l.href}>{l.label}</a>
                </Button>
              ))}
              <Button
                asChild
                className="mt-2"
                onClick={() => setMobileOpen(false)}
              >
                <a
                  href={getWhatsAppUrl(config)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Smartphone className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
