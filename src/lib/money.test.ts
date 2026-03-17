import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/money";

describe("formatMoney", () => {
  it("formats BRL using pt-BR locale", () => {
    const out = formatMoney(1234, "BRL");
    expect(out).toContain("12,34");
    expect(out).toMatch(/R\$/);
  });

  it("falls back when currency is invalid", () => {
    const out = formatMoney(1234, "INVALID_CCY");
    expect(out).toBe("R$ 12.34");
  });
});

