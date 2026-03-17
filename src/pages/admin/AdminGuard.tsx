import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getSupabase } from "@/lib/supabase";

async function checkAdminSession() {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return false;

  const admin = await supabase.from("admins").select("role").eq("user_id", user.id).maybeSingle();
  if (admin.error) return false;
  return Boolean(admin.data?.role);
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = React.useState<"loading" | "authed" | "anon">("loading");

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const ok = await checkAdminSession();
        if (!cancelled) setStatus(ok ? "authed" : "anon");
      } catch {
        if (!cancelled) setStatus("anon");
      }
    };

    run();
    const supabase = getSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      run();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
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
