import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { DEFAULT_CONFIG, type SiteConfig, useSiteConfig } from "@/context/site-config";

function safeParseJson(raw: string) {
  try {
    return JSON.parse(raw) as Partial<SiteConfig>;
  } catch {
    return null;
  }
}

export default function AdminSettings() {
  const { config, setConfig, reset } = useSiteConfig();
  const [draft, setDraft] = React.useState<SiteConfig>(config);
  const [importRaw, setImportRaw] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(config);
  }, [config]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Parâmetros que o site usa em links e contato.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>Atualiza links do WhatsApp (Navbar, Hero, Catálogo, Contato e botão flutuante).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="whatsappNumber">Número (com DDI/DDD)</Label>
              <Input
                id="whatsappNumber"
                value={draft.whatsappNumber}
                onChange={(e) => setDraft((p) => ({ ...p, whatsappNumber: e.target.value }))}
                placeholder="5567999999999"
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="defaultWhatsAppMessage">Mensagem padrão</Label>
              <Textarea
                id="defaultWhatsAppMessage"
                value={draft.defaultWhatsAppMessage}
                onChange={(e) => setDraft((p) => ({ ...p, defaultWhatsAppMessage: e.target.value }))}
                placeholder="Olá! Vim pelo site…"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                onClick={() => {
                  setStatus(null);
                  setConfig(() => draft);
                  setStatus("Salvo.");
                }}
              >
                Salvar
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  reset();
                  setImportRaw("");
                  setStatus("Restaurado para o padrão.");
                }}
              >
                Restaurar padrão
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setStatus(null);
                  const payload = JSON.stringify(draft, null, 2);
                  try {
                    await navigator.clipboard.writeText(payload);
                    setStatus("Config copiada para a área de transferência.");
                  } catch {
                    setStatus("Não foi possível copiar. Use o Export abaixo.");
                  }
                }}
              >
                Copiar JSON
              </Button>
            </div>

            {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importar / Exportar</CardTitle>
            <CardDescription>Útil para versionar as configurações no repositório ou migrar entre ambientes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Textarea
              value={importRaw}
              onChange={(e) => setImportRaw(e.target.value)}
              placeholder='Cole aqui um JSON, ex: {"whatsappNumber":"5567...","defaultWhatsAppMessage":"..."}'
              className="min-h-[180px]"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus(null);
                  const parsed = safeParseJson(importRaw);
                  if (!parsed) {
                    setStatus("JSON inválido.");
                    return;
                  }
                  const next: SiteConfig = {
                    whatsappNumber: typeof parsed.whatsappNumber === "string" ? parsed.whatsappNumber : DEFAULT_CONFIG.whatsappNumber,
                    defaultWhatsAppMessage:
                      typeof parsed.defaultWhatsAppMessage === "string"
                        ? parsed.defaultWhatsAppMessage
                        : DEFAULT_CONFIG.defaultWhatsAppMessage,
                  };
                  setDraft(next);
                  setConfig(() => next);
                  setStatus("Importado e salvo.");
                }}
              >
                Importar e salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setImportRaw(JSON.stringify(config, null, 2));
                  setStatus("Export gerado no campo.");
                }}
              >
                Gerar export
              </Button>
            </div>
            {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

