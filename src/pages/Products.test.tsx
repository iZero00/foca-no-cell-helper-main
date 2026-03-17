import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { SiteConfigProvider } from "@/context/site-config";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn((opts: { queryKey: unknown[] }) => {
      const key = opts.queryKey?.[1];
      if (key === "categories") {
        return { data: { items: ["Acessórios", "Cabos"] } };
      }
      if (key === "products") {
        return {
          data: {
            page: 1,
            pageSize: 12,
            total: 1,
            items: [
              {
                id: "p1",
                title: "Cabo USB",
                slug: "CABOUSB",
                description: "Cabo reforçado",
                priceCents: 1999,
                currency: "BRL",
                category: "Acessórios",
                stock: 10,
                images: [],
              },
            ],
          },
          isLoading: false,
          error: null,
        };
      }
      return { data: undefined, isLoading: false, error: null };
    }),
  };
});

describe("Products page", () => {
  it("renders products list and filters", async () => {
    const { default: Products } = await import("./Products");
    render(
      <MemoryRouter initialEntries={["/produtos"]}>
        <SiteConfigProvider>
          <Products />
        </SiteConfigProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Produtos" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar produtos")).toBeInTheDocument();
    expect(screen.getByText("Cabo USB")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute("href", "/produto/CABOUSB");
  });
});
