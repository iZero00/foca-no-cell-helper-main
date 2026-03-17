import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getLockInfo, isAuthed, login, sanitizeAdminDestination } from "@/lib/admin-auth";

type LocationState = { from?: string } | null;

const FormSchema = z.object({
  email: z.string().trim().min(1, "Informe o email.").email("Email inválido."),
  password: z.string().min(1, "Informe a senha.").max(200, "Senha inválida."),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? null;

  const [form, setForm] = React.useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof z.infer<typeof FormSchema>, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const destination = sanitizeAdminDestination(state?.from ?? "/admin");
  const lockInfo = typeof window !== "undefined" ? getLockInfo(window.localStorage) : { locked: false, remaining: 0 };

  React.useEffect(() => {
    if (isAuthed()) navigate(destination, { replace: true });
  }, [destination, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-6 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Painel Administrativo</CardTitle>
            <CardDescription>Entre para gerenciar conteúdo e configurações do site.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setFieldErrors({});
                setSubmitting(true);
                try {
                  const parsed = FormSchema.safeParse(form);
                  if (!parsed.success) {
                    const next: Partial<Record<keyof z.infer<typeof FormSchema>, string>> = {};
                    for (const issue of parsed.error.issues) {
                      const key = issue.path[0] as keyof z.infer<typeof FormSchema> | undefined;
                      if (key && !next[key]) next[key] = issue.message;
                    }
                    setFieldErrors(next);
                    throw new Error("Corrija os campos destacados.");
                  }

                  const resp = await login(parsed.data.email, parsed.data.password);
                  if (!resp.ok) throw new Error(resp.error);
                  navigate(destination, { replace: true, state: null });
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Erro ao autenticar.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="voce@empresa.com"
                />
                {fieldErrors.email ? <div className="text-xs text-destructive">{fieldErrors.email}</div> : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Digite sua senha"
                />
                {fieldErrors.password ? <div className="text-xs text-destructive">{fieldErrors.password}</div> : null}
              </div>
              {error ? <div className="text-sm text-destructive">{error}</div> : null}
              {!lockInfo.locked ? (
                <div className="text-xs text-muted-foreground">Tentativas restantes: {lockInfo.remaining}</div>
              ) : null}
              <Button type="submit" disabled={submitting || lockInfo.locked}>
                {submitting ? "Entrando…" : "Entrar"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/", { replace: true })}
                disabled={submitting}
              >
                Voltar ao site
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
