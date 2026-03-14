import * as React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { LOCAL_AUTH_KEY } from "./AdminGuard";

async function logoutServer() {
  await fetch("/api/admin/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
}

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-0 md:grid-cols-[260px_1fr]">
        <aside className="border-b border-border/70 bg-card md:min-h-screen md:border-b-0 md:border-r">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="grid leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-foreground">Foca no Cell</div>
              <div className="text-xs font-semibold text-muted-foreground">Admin</div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                localStorage.removeItem(LOCAL_AUTH_KEY);
                await logoutServer();
                navigate("/admin/login", { replace: true });
              }}
            >
              Sair
            </Button>
          </div>
          <Separator />
          <nav className="grid gap-1 p-3">
            <NavLink
              end
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground",
                )
              }
            >
              Visão geral
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground",
                )
              }
            >
              Configurações
            </NavLink>
          </nav>
        </aside>

        <main className="min-h-screen bg-background">
          <div className="px-5 py-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
