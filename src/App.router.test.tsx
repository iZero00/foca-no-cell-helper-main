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
    expect(screen.getAllByText("Foca no Cell").length).toBeGreaterThan(0);
  });

  it("renders 404 for unknown routes", async () => {
    const { default: App } = await import("./App");
    window.history.pushState({}, "", "/rota-inexistente");
    render(<App />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Oops! Page not found")).toBeInTheDocument();
  });
});
