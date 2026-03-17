type SdWebUiTxt2ImgOptions = {
  baseUrl: string;
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  samplerName: string;
  seed: number;
};

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function base64ToBlob(b64: string, mime: string) {
  const clean = b64.includes(",") ? b64.split(",").pop() ?? "" : b64;
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function fileToDataUrl(file: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

async function loadImageFromBlob(blob: Blob) {
  const dataUrl = await fileToDataUrl(blob);
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Falha ao carregar imagem."));
    el.src = dataUrl;
  });
}

async function compressToJpeg(input: Blob, maxSide: number, quality: number) {
  const img = await loadImageFromBlob(input);
  const max = clampInt(maxSide, 256, 2400);
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Falha ao comprimir imagem.");
  ctx.drawImage(img, 0, 0, w, h);

  const q = Math.max(0.5, Math.min(0.92, quality));
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao comprimir imagem."))), "image/jpeg", q),
  );
  return blob;
}

async function sdWebUiTxt2ImgPng(opts: SdWebUiTxt2ImgOptions) {
  const url = new URL("/sdapi/v1/txt2img", opts.baseUrl).toString();
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: opts.prompt,
      negative_prompt: opts.negativePrompt,
      width: clampInt(opts.width, 256, 2048),
      height: clampInt(opts.height, 256, 2048),
      steps: clampInt(opts.steps, 5, 60),
      cfg_scale: Math.max(1, Math.min(30, Number(opts.cfgScale))),
      sampler_name: String(opts.samplerName || "DPM++ 2M Karras"),
      seed: Number.isFinite(opts.seed) ? opts.seed : -1,
      batch_size: 1,
      n_iter: 1,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Falha ao gerar imagem (SD WebUI): ${resp.status} ${text.slice(0, 180)}`);
  }
  const json = (await resp.json()) as { images?: unknown[] };
  const img = json?.images?.[0];
  if (typeof img !== "string") throw new Error("Resposta inválida do SD WebUI (images[0]).");
  return base64ToBlob(img, "image/png");
}

export { compressToJpeg, sdWebUiTxt2ImgPng, type SdWebUiTxt2ImgOptions };

