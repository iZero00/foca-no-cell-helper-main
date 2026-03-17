import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, formatWhatsAppItemMessage } from "@/lib/whatsapp";

describe("whatsapp", () => {
  it("buildWhatsAppUrl encodes message safely", () => {
    const url = buildWhatsAppUrl("Olá & teste");
    expect(url).toBe("https://wa.me/?text=Ol%C3%A1%20%26%20teste");
  });

  it("formats message with required fields", () => {
    const msg = formatWhatsAppItemMessage({
      kind: "produto",
      title: "Cabo USB",
      description: "1m\r\nReforçado",
      priceCents: 1999,
      currency: "BRL",
      category: "Acessórios",
      imageUrl: null,
    });

    expect(msg).toContain("Olá! Tenho interesse no produto *Cabo USB*");
    expect(msg).toContain("*Produto*");
    expect(msg).toContain("- *Nome:* Cabo USB");
    expect(msg).toContain("- *Preço:* R$");
    expect(msg).toContain("- *Categoria:* Acessórios");
    expect(msg).toContain("*Descrição*");
    expect(msg).toContain("1m\nReforçado");
    expect(msg).not.toContain("*Imagem:*");
  });

  it("adds image line when imageUrl is present", () => {
    const msg = formatWhatsAppItemMessage({
      kind: "serviço",
      title: "Troca de Tela",
      description: "Sob consulta",
      priceCents: 0,
      currency: "BRL",
      category: "Manutenção",
      imageUrl: "https://example.com/img.jpg",
    });

    expect(msg).toContain("Olá! Tenho interesse no serviço *Troca de Tela*");
    expect(msg).toContain("- *Nome:* Troca de Tela");
    expect(msg).toContain("*Imagem:* https://example.com/img.jpg");
  });

  it("normalizes empty fields to a placeholder", () => {
    const msg = formatWhatsAppItemMessage({
      kind: "produto",
      title: "   ",
      description: "",
      priceCents: 0,
      currency: "BRL",
      category: "\n",
      imageUrl: null,
    });

    expect(msg).toContain("- *Nome:* -");
    expect(msg).toContain("- *Categoria:* -");
    expect(msg).toContain("*Descrição*");
  });
});
