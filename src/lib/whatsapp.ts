import { formatMoney } from "@/lib/money";

type WhatsAppItem = {
  kind: "produto" | "serviço";
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  imageUrl?: string | null;
};

function normalizeText(input: string) {
  const s = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  return s.length > 0 ? s : "-";
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function formatWhatsAppItemMessage(item: WhatsAppItem) {
  const kindLabel = item.kind === "produto" ? "Produto" : "Serviço";
  const title = normalizeText(item.title);
  const description = normalizeText(item.description);
  const category = normalizeText(item.category);
  const price = item.priceCents > 0 ? formatMoney(item.priceCents, item.currency) : "Sob consulta";
  const imageUrl = (item.imageUrl ?? "").trim();

  const lines = [
    `Olá! Tenho interesse no ${kindLabel.toLowerCase()} *${title}*`,
    "",
    `*${kindLabel}*`,
    `- *Nome:* ${title}`,
    `- *Preço:* ${price}`,
    `- *Categoria:* ${category}`,
    "",
    "*Descrição*",
    description,
  ];

  if (imageUrl.length > 0) {
    lines.push("", `*Imagem:* ${imageUrl}`);
  }

  lines.push("", "---", "Pode me passar mais informações e confirmar disponibilidade?");

  return lines.join("\n");
}

export { buildWhatsAppUrl, formatWhatsAppItemMessage, type WhatsAppItem };
