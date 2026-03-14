import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";

const LOCAL_AUTH_KEY = "admin:local-auth";

async function checkServerSession() {
  const res = await fetch("/api/admin/me", { method: "GET", credentials: "include" });
  if (res.ok) return true;
  if (res.status === 401 || res.status === 403) return false;
  return false;
}

function hasLocalSession() {
  return localStorage.getItem(LOCAL_AUTH_KEY) === "1";
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = React.useState<"loading" | "authed" | "anon">("loading");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (hasLocalSession()) {
        if (!cancelled) setStatus("authed");
        return;
      }

      try {
        const ok = await checkServerSession();
        if (!cancelled) setStatus(ok ? "authed" : "anon");
      } catch {
        if (!cancelled) setStatus("anon");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="text-center text-sm text-muted-foreground">Carregando painel…</div>
        </div>
      </div>
    );
  }

  if (status === "anon") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export { LOCAL_AUTH_KEY };

