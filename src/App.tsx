import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { SiteConfigProvider } from "./context/site-config";

const AdminGuard = React.lazy(() => import("./pages/admin/AdminGuard"));
const AdminLayout = React.lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = React.lazy(() => import("./pages/admin/AdminLogin"));
const Index = React.lazy(() => import("./pages/Index"));
const Products = React.lazy(() => import("./pages/Products"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const AdminProducts = React.lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductEdit = React.lazy(() => import("./pages/admin/AdminProductEdit"));
const AdminServices = React.lazy(() => import("./pages/admin/AdminServices"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SiteConfigProvider>
        <React.Suspense
          fallback={
            <div className="min-h-screen bg-background">
              <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
                <div className="text-center text-sm text-muted-foreground">Carregando…</div>
              </div>
            </div>
          }
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/produto/:id" element={<ProductDetails />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<Navigate to="products" replace />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/:id" element={<AdminProductEdit />} />
                <Route path="services" element={<AdminServices />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </React.Suspense>
      </SiteConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
