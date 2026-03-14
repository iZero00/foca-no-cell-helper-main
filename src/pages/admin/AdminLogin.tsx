import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { LOCAL_AUTH_KEY } from "./AdminGuard";

type LocationState = { from?: string } | null;

async function loginServer(password: string) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(message || "Falha ao autenticar.");
  }
}

function loginLocal(password: string) {
  const configured = (import.meta.env as unknown as { VITE_ADMIN_PIN?: string }).VITE_ADMIN_PIN;
  if (typeof configured !== "string" || configured.length === 0) return false;
  if (password !== configured) return false;
  localStorage.setItem(LOCAL_AUTH_KEY, "1");
  return true;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? null;

  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const destination = state?.from && typeof state.from === "string" ? state.from : "/admin";

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
                setSubmitting(true);
                try {
                  try {
                    await loginServer(password);
                  } catch {
                    const ok = loginLocal(password);
                    if (!ok) {
                      throw new Error("Credenciais inválidas.");
                    }
                  }
                  navigate(destination, { replace: true });
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Erro ao autenticar.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                />
              </div>
              {error ? <div className="text-sm text-destructive">{error}</div> : null}
              <Button type="submit" disabled={submitting || password.length === 0}>
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
