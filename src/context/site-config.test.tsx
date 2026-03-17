import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CONFIG, SiteConfigProvider, getWhatsAppUrl, useSiteConfig } from "@/context/site-config";

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
