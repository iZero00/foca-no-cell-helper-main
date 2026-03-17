import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CONFIG, SiteConfigProvider, __private, getWhatsAppUrl, useSiteConfig } from "@/context/site-config";

function Probe() {
  const { config, setConfig, reset } = useSiteConfig();
  return (
    <div>
      <div data-testid="number">{config.whatsappNumber}</div>
      <div data-testid="msg">{config.defaultWhatsAppMessage}</div>
      <button
        type="button"
        onClick={() =>
          setConfig(() => ({
            whatsappNumber: "+55 (11) 99999-0000",
            defaultWhatsAppMessage: "  oi  ",
          }))
        }
      >
        set
      </button>
      <button type="button" onClick={reset}>
        reset
      </button>
    </div>
  );
}

describe("site-config", () => {
  it("builds WhatsApp URL from config and message", () => {
    const url = getWhatsAppUrl(DEFAULT_CONFIG, "Olá!");
    expect(url).toContain(`https://wa.me/${DEFAULT_CONFIG.whatsappNumber}?text=`);
  });

  it("handles non-string inputs in normalizeConfig", () => {
    const normalized = __private.normalizeConfig({ whatsappNumber: 123 as unknown as string, defaultWhatsAppMessage: "" });
    expect(normalized.whatsappNumber).toBe(DEFAULT_CONFIG.whatsappNumber);
    expect(normalized.defaultWhatsAppMessage).toBe(DEFAULT_CONFIG.defaultWhatsAppMessage);
  });

  it("returns default config when window is undefined", () => {
    const originalWindow = (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(__private.safeReadConfig()).toEqual(DEFAULT_CONFIG);
    (globalThis as unknown as { window?: unknown }).window = originalWindow;
  });

  it("does nothing when writing config without window", () => {
    const originalWindow = (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(() => __private.safeWriteConfig(DEFAULT_CONFIG)).not.toThrow();
    (globalThis as unknown as { window?: unknown }).window = originalWindow;
  });

  it("loads and normalizes config from localStorage", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() =>
        JSON.stringify({
          whatsappNumber: "+55 (11) 99999-0000",
          defaultWhatsAppMessage: "  oi  ",
        }),
      ),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    render(
      <SiteConfigProvider>
        <Probe />
      </SiteConfigProvider>,
    );

    expect(screen.getByTestId("number").textContent).toBe("5511999990000");
    expect(screen.getByTestId("msg").textContent).toBe("oi");
  });

  it("falls back to default config on invalid stored JSON", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "{not-json"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    render(
      <SiteConfigProvider>
        <Probe />
      </SiteConfigProvider>,
    );

    expect(screen.getByTestId("number").textContent).toBe(DEFAULT_CONFIG.whatsappNumber);
  });

  it("does not throw if localStorage write fails", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error("quota");
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    render(
      <SiteConfigProvider>
        <Probe />
      </SiteConfigProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set" }));
    await waitFor(() => expect(screen.getByTestId("number").textContent).toBe("5511999990000"));
  });

  it("throws if used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    function BadProbe() {
      useSiteConfig();
      return null;
    }

    expect(() => render(<BadProbe />)).toThrowError("useSiteConfig must be used within SiteConfigProvider");
    consoleError.mockRestore();
  });

  it("sanitizes and persists config updates", async () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => null), setItem, removeItem: vi.fn(), clear: vi.fn() });

    render(
      <SiteConfigProvider>
        <Probe />
      </SiteConfigProvider>,
    );

    expect(screen.getByTestId("number").textContent).toBe(DEFAULT_CONFIG.whatsappNumber);
    fireEvent.click(screen.getByRole("button", { name: "set" }));
    await waitFor(() => expect(screen.getByTestId("number").textContent).toBe("5511999990000"));
    await waitFor(() => expect(screen.getByTestId("msg").textContent).toBe("oi"));
    await waitFor(() => expect(setItem).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "reset" }));
    await waitFor(() => expect(screen.getByTestId("number").textContent).toBe(DEFAULT_CONFIG.whatsappNumber));
  });
});
