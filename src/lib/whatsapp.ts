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
  const s = input.replaceAll("\r\n", "\n").replaceAll("\r", "\n").trim();
  return s.length > 0 ? s : "-";
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function formatWhatsAppItemMessage(item: WhatsAppItem) {
  const kindLabel = item.kind === "produto" ? "Produto" : "Serviço";
  const kindEmoji = item.kind === "produto" ? "📦" : "🛠️";
  const title = normalizeText(item.title);
  const description = normalizeText(item.description);
  const category = normalizeText(item.category);
  const price = formatMoney(item.priceCents, item.currency);
  const imageUrl = (item.imageUrl ?? "").trim();

  const lines = [
    `✨ *${kindLabel}*`,
    "",
    `${kindEmoji} *Nome:* ${title}`,
    `💰 *Preço:* ${price}`,
    `🏷️ *Categoria:* ${category}`,
    "",
    "📝 *Descrição*",
    description,
  ];

  if (imageUrl.length > 0) {
    lines.push("", `🖼️ *Imagem:* ${imageUrl}`);
  }

  lines.push("", "────────────", "📲 Me chama aqui no WhatsApp para confirmar disponibilidade.");

  return lines.join("\n");
}

export { buildWhatsAppUrl, formatWhatsAppItemMessage, type WhatsAppItem };
