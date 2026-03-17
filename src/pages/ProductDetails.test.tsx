import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { SiteConfigProvider } from "@/context/site-config";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => {
      return {
        data: {
          id: "p1",
          title: "Cabo USB",
          slug: "CABOUSB",
          description: "Cabo reforçado",
          priceCents: 1999,
          currency: "BRL",
          category: "Acessórios",
          stock: 10,
          variations: [{ name: "Cor", options: ["Preto", "Branco"] }],
          images: ["https://example.com/img.jpg"],
        },
        isLoading: false,
        error: null,
      };
    }),
  };
});

describe("ProductDetails page", () => {
  it("renders product details and WhatsApp CTA", async () => {
    const { default: ProductDetails } = await import("./ProductDetails");
    render(
      <MemoryRouter initialEntries={["/produto/CABOUSB"]}>
        <SiteConfigProvider>
          <Routes>
            <Route path="/produto/:id" element={<ProductDetails />} />
          </Routes>
        </SiteConfigProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Cabo USB" })).toBeInTheDocument();
    expect(screen.getByText("Acessórios")).toBeInTheDocument();
    const wa = screen.getByRole("link", { name: "Comprar via WhatsApp" });
    expect(wa).toHaveAttribute("href");
    expect(wa.getAttribute("href")).toContain("https://wa.me/");
  });
});
