import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getSupabase } from "@/lib/supabase";

type LocationState = { from?: string } | null;

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? null;

  const [email, setEmail] = React.useState("");
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
                  const resp = await getSupabase().auth.signInWithPassword({ email, password });
                  if (resp.error) throw resp.error;
                  navigate(destination, { replace: true });
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                />
              </div>
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
              <Button type="submit" disabled={submitting || email.length === 0 || password.length === 0}>
                {submitting ? "Entrando…" : "Entrar"}
              </Button>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={async () => {
                    setError(null);
                    setSubmitting(true);
                    try {
                      const resp = await getSupabase().auth.signInWithOAuth({
                        provider: "google",
                        options: { redirectTo: `${window.location.origin}/admin` },
                      });
                      if (resp.error) throw resp.error;
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Erro ao autenticar.");
                      setSubmitting(false);
                    }
                  }}
                >
                  Entrar com Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={async () => {
                    setError(null);
                    setSubmitting(true);
                    try {
                      const resp = await getSupabase().auth.signInWithOAuth({
                        provider: "github",
                        options: { redirectTo: `${window.location.origin}/admin` },
                      });
                      if (resp.error) throw resp.error;
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Erro ao autenticar.");
                      setSubmitting(false);
                    }
                  }}
                >
                  Entrar com GitHub
                </Button>
              </div>
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
