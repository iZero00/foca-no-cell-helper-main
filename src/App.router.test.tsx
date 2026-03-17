import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

  disconnect() {}
  observe(_target: Element) {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(_target: Element) {}
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  value: IntersectionObserverMock,
  writable: true,
});

describe("React Router routes", () => {
  it("renders home route", async () => {
    const { default: App } = await import("./App");
    window.history.pushState({}, "", "/");
    render(<App />);
    expect(await screen.findByRole("link", { name: "Loja" }, { timeout: 10_000 })).toBeInTheDocument();
  });

  it("renders 404 for unknown routes", async () => {
    const { default: App } = await import("./App");
    window.history.pushState({}, "", "/rota-inexistente");
    render(<App />);
    expect(await screen.findByText("404", {}, { timeout: 10_000 })).toBeInTheDocument();
    expect(await screen.findByText("Página não encontrada.", {}, { timeout: 10_000 })).toBeInTheDocument();
  });
});
