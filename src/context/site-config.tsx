import * as React from "react";

type SiteConfig = {
  whatsappNumber: string;
  defaultWhatsAppMessage: string;
};

const STORAGE_KEY = "site:config:v1";

const DEFAULT_CONFIG: SiteConfig = {
  whatsappNumber: "5567993073133",
  defaultWhatsAppMessage: "Olá! Vim pelo site da Foca no Cell (Araçatuba/SP).",
};

function sanitizePhone(raw: string) {
  return raw.replace(/[^\d]/g, "").slice(0, 20);
}

function normalizeConfig(input: Partial<SiteConfig>) {
  const whatsappNumber =
    typeof input.whatsappNumber === "string" ? sanitizePhone(input.whatsappNumber) : DEFAULT_CONFIG.whatsappNumber;
  const defaultWhatsAppMessage =
    typeof input.defaultWhatsAppMessage === "string" && input.defaultWhatsAppMessage.trim().length > 0
      ? input.defaultWhatsAppMessage.trim().slice(0, 500)
      : DEFAULT_CONFIG.defaultWhatsAppMessage;

  return { whatsappNumber, defaultWhatsAppMessage };
}

function safeReadConfig(): SiteConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return normalizeConfig(parsed);
  } catch {
    return DEFAULT_CONFIG;
  }
}

function safeWriteConfig(config: SiteConfig) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    return;
  }
}

function getWhatsAppUrl(config: SiteConfig, message?: string) {
  const text = typeof message === "string" && message.length > 0 ? message : config.defaultWhatsAppMessage;
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

type SiteConfigContextValue = {
  config: SiteConfig;
  setConfig: (updater: (prev: SiteConfig) => SiteConfig) => void;
  reset: () => void;
};

const SiteConfigContext = React.createContext<SiteConfigContextValue | null>(null);

function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = React.useState<SiteConfig>(() => safeReadConfig());

  const setConfig = React.useCallback((updater: (prev: SiteConfig) => SiteConfig) => {
    setConfigState((prev) => {
      const next = normalizeConfig(updater(prev));
      safeWriteConfig(next);
      return next;
    });
  }, []);

  const reset = React.useCallback(() => {
    setConfigState(DEFAULT_CONFIG);
    safeWriteConfig(DEFAULT_CONFIG);
  }, []);

  return <SiteConfigContext.Provider value={{ config, setConfig, reset }}>{children}</SiteConfigContext.Provider>;
}

function useSiteConfig() {
  const ctx = React.useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  }
  return ctx;
}

export { SiteConfigProvider, useSiteConfig, getWhatsAppUrl, type SiteConfig, DEFAULT_CONFIG };
