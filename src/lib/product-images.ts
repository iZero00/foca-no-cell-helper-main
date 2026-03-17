import imgAcessorios from "@/assets/service-acessorios.jpg";
import imgTela from "@/assets/service-tela.jpg";
import imgBateria from "@/assets/service-bateria.jpg";
import imgPlaca from "@/assets/service-placa.jpg";
import imgConector from "@/assets/service-conector.jpg";
import imgSoftware from "@/assets/service-software.jpg";

const pool = [imgAcessorios, imgTela, imgBateria, imgPlaca, imgConector, imgSoftware];

function pickByIndex(index: number) {
  const i = Number.isFinite(index) ? Math.abs(Math.floor(index)) : 0;
  return pool[i % pool.length];
}

function getProductFallbackImage(category: string | null | undefined, index: number) {
  const c = String(category ?? "").toLowerCase();
  if (c.includes("acess")) return imgAcessorios;
  if (c.includes("prote")) return imgTela;
  if (c.includes("energia") || c.includes("carreg") || c.includes("bateria")) return imgBateria;
  if (c.includes("áudio") || c.includes("audio") || c.includes("fone")) return imgSoftware;
  if (c.includes("autom")) return imgConector;
  if (c.includes("mem")) return imgPlaca;
  return pickByIndex(index);
}

function getProductPrimaryImageUrl(images: string[] | null | undefined, category: string | null | undefined, index: number) {
  const url = Array.isArray(images) ? images[0] : undefined;
  return url && url.length > 0 ? url : getProductFallbackImage(category, index);
}

export { getProductFallbackImage, getProductPrimaryImageUrl };

