import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Visão geral</h1>
        <p className="text-sm text-muted-foreground">Status do projeto e atalhos para manutenção.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Checks automatizados no pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <div>Secret scan (Secretlint)</div>
            <div>CSP/headers (CSP Evaluator)</div>
            <div>Audit de dependências (npm audit)</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rotas</CardTitle>
            <CardDescription>SPA + fallback do Vercel para React Router.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <div>Home: /</div>
            <div>Painel: /admin</div>
            <div>404: *</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

