import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isAuthed, sanitizeAdminDestination, __private } from "@/lib/admin-auth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = React.useState<"loading" | "authed" | "anon">("loading");

  React.useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      setStatus(isAuthed() ? "authed" : "anon");
    };

    run();
    window.addEventListener(__private.AUTH_EVENT, run);
    window.addEventListener("storage", run);

    return () => {
      cancelled = true;
      window.removeEventListener(__private.AUTH_EVENT, run);
      window.removeEventListener("storage", run);
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
    const from = sanitizeAdminDestination(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to="/admin/login" replace state={{ from }} />;
  }

  return <>{children}</>;
}
