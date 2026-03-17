import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function nowIso() {
  return new Date().toISOString();
}

function parseArgs(argv) {
  const out = {
    limit: 20,
    pageSize: 200,
    concurrency: 2,
    dryRun: false,
    provider: "sd-webui",
    bucket: "product-images",
    onlyActive: true,
    minCreatedAt: null,
    maxProductsScan: 5000,
  };

  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [k, vRaw] = raw.slice(2).split("=");
    const v = vRaw ?? "true";
    if (k === "limit") out.limit = Math.max(0, Number(v) || 0);
    else if (k === "pageSize") out.pageSize = Math.max(1, Number(v) || 200);
    else if (k === "concurrency") out.concurrency = Math.max(1, Number(v) || 2);
    else if (k === "dryRun") out.dryRun = v === "true" || v === "1";
    else if (k === "provider") out.provider = String(v);
    else if (k === "bucket") out.bucket = String(v);
    else if (k === "onlyActive") out.onlyActive = v === "true" || v === "1";
    else if (k === "minCreatedAt") out.minCreatedAt = String(v);
    else if (k === "maxProductsScan") out.maxProductsScan = Math.max(0, Number(v) || 0);
  }

  return out;
}

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function optionalEnv(name, fallback) {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : fallback;
}

function normalizeSlugish(input) {
  const s = String(input ?? "")
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return s.length > 0 ? s : "item";
}

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return '"[unserializable]"';
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJsonlLine(filePath, obj) {
  await fs.appendFile(filePath, `${safeJsonStringify(obj)}\n`, "utf8");
}

function buildPrompt(product) {
  const title = String(product.title ?? "").trim();
  const category = String(product.category ?? "").trim();
  const description = String(product.description ?? "").trim();
  const parts = [
    "Foto de produto em estúdio, realista, alta qualidade, composição quadrada, fundo branco clean, sombra suave.",
    "Sem texto, sem logos, sem marcas d'água, sem etiquetas de preço.",
    "Iluminação profissional, nitidez alta, foco no produto, estilo e-commerce.",
    `Produto: ${title}.`,
  ];
  if (category) parts.push(`Categoria: ${category}.`);
  if (description) parts.push(`Detalhes: ${description}.`);
  return parts.join(" ");
}

function parseSizeToWidthHeight(size) {
  const m = String(size ?? "").trim().match(/^(\d{2,5})x(\d{2,5})$/);
  if (!m) return null;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  if (w <= 0 || h <= 0) return null;
  return { width: w, height: h };
}

async function sdWebuiGeneratePngBuffer({
  baseUrl,
  prompt,
  negativePrompt,
  width,
  height,
  steps,
  cfgScale,
  samplerName,
  seed,
}) {
  const url = new URL("/sdapi/v1/txt2img", baseUrl).toString();
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      width,
      height,
      steps,
      cfg_scale: cfgScale,
      sampler_name: samplerName,
      seed,
      batch_size: 1,
      n_iter: 1,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`SD WebUI error ${resp.status}: ${text.slice(0, 400)}`);
  }

  const json = await resp.json();
  const img = json?.images?.[0];
  if (!img || typeof img !== "string") throw new Error("SD WebUI response missing images[0]");
  const b64 = img.includes(",") ? img.split(",").pop() : img;
  return Buffer.from(String(b64), "base64");
}

async function openAiGeneratePngBuffer({ apiKey, model, prompt, size }) {
  const resp = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size,
      n: 1,
      response_format: "b64_json",
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`OpenAI error ${resp.status}: ${text.slice(0, 400)}`);
  }

  const json = await resp.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64 || typeof b64 !== "string") throw new Error("OpenAI response missing b64_json");
  return Buffer.from(b64, "base64");
}

async function mockGeneratePngBuffer({ prompt }) {
  const seed = Array.from(prompt).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const color = {
    r: seed % 255,
    g: (seed * 7) % 255,
    b: (seed * 13) % 255,
  };
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
      <rect width="1024" height="1024" fill="rgb(${color.r},${color.g},${color.b})"/>
      <rect x="96" y="96" width="832" height="832" fill="white" opacity="0.22"/>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function validateImageBuffer(buffer) {
  if (!buffer || buffer.length < 20_000) return { ok: false, reason: "buffer_too_small" };
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) return { ok: false, reason: "missing_dimensions" };
  if (meta.width < 900 || meta.height < 900) return { ok: false, reason: "low_resolution" };
  const stats = await sharp(buffer).stats();
  const stdevs = stats.channels.map((c) => c.stdev);
  const hasContrast = stdevs.some((s) => Number.isFinite(s) && s > 2);
  if (!hasContrast) return { ok: false, reason: "low_contrast" };
  return { ok: true, reason: "ok" };
}

function buildObjectKey({ productId, slug, sizeName, width, height, format }) {
  const safeSlug = normalizeSlugish(slug || productId);
  return `public/products/${productId}/${safeSlug}/${sizeName}-${width}x${height}.${format}`;
}

async function uploadToSupabase({ storage, bucket, key, buffer, contentType, upsert }) {
  const blob = new Blob([buffer], { type: contentType });
  const upload = await storage.from(bucket).upload(key, blob, {
    upsert: Boolean(upsert),
    contentType,
    cacheControl: "31536000",
  });
  if (upload.error) throw upload.error;
  const { data } = storage.from(bucket).getPublicUrl(key);
  if (!data?.publicUrl) throw new Error("Failed to build public URL");
  return data.publicUrl;
}

async function ensureDefaultFallback({ storage, bucket }) {
  const iconPath = path.join(__dirname, "..", "public", "icone.jpg");
  const src = await fs.readFile(iconPath);
  const sizes = [
    { name: "thumb", w: 150, h: 150 },
    { name: "medium", w: 500, h: 500 },
    { name: "large", w: 1000, h: 1000 },
  ];
  const formats = [
    { ext: "webp", type: "image/webp" },
    { ext: "jpeg", type: "image/jpeg" },
    { ext: "png", type: "image/png" },
  ];
  const urls = {};

  for (const s of sizes) {
    for (const f of formats) {
      const key = `public/defaults/product/${s.name}-${s.w}x${s.h}.${f.ext}`;
      try {
        const existing = await storage.from(bucket).download(key);
        if (!existing.error) {
          const { data } = storage.from(bucket).getPublicUrl(key);
          urls[`${s.name}.${f.ext}`] = data.publicUrl;
          continue;
        }
      } catch {
      }

      const pipeline = sharp(src).resize(s.w, s.h, { fit: "contain", background: "#ffffff" });
      let out;
      if (f.ext === "jpeg") out = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      else if (f.ext === "png") out = await pipeline.png({ compressionLevel: 9 }).toBuffer();
      else out = await pipeline.webp({ quality: 80 }).toBuffer();

      const url = await uploadToSupabase({
        storage,
        bucket,
        key,
        buffer: out,
        contentType: f.type,
        upsert: true,
      });
      urls[`${s.name}.${f.ext}`] = url;
    }
  }

  const fallbackUrl = urls["large.webp"] ?? Object.values(urls)[0];
  if (!fallbackUrl) throw new Error("Failed to ensure default fallback image");
  return { urls, fallbackUrl };
}

async function renderDerivatives({ originalPng, productId, slug, storage, bucket }) {
  const sizes = [
    { name: "thumb", w: 150, h: 150 },
    { name: "medium", w: 500, h: 500 },
    { name: "large", w: 1000, h: 1000 },
  ];
  const formats = [
    { ext: "jpeg", type: "image/jpeg" },
    { ext: "png", type: "image/png" },
    { ext: "webp", type: "image/webp" },
  ];

  const urls = [];

  for (const s of sizes) {
    for (const f of formats) {
      const key = buildObjectKey({
        productId,
        slug,
        sizeName: s.name,
        width: s.w,
        height: s.h,
        format: f.ext,
      });
      const base = sharp(originalPng).resize(s.w, s.h, { fit: "contain", background: "#ffffff" });
      let out;
      if (f.ext === "jpeg") out = await base.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      else if (f.ext === "png") out = await base.png({ compressionLevel: 9 }).toBuffer();
      else out = await base.webp({ quality: 80 }).toBuffer();

      const url = await uploadToSupabase({
        storage,
        bucket,
        key,
        buffer: out,
        contentType: f.type,
        upsert: true,
      });
      urls.push({ size: s.name, format: f.ext, width: s.w, height: s.h, url, key });
    }
  }

  const pick = (size, format) => urls.find((u) => u.size === size && u.format === format)?.url ?? null;
  const primary = pick("large", "webp") ?? pick("large", "jpeg") ?? pick("medium", "webp") ?? null;
  return { urls, primary };
}

async function listProductsMissingImages({ supabase, onlyActive, minCreatedAt, maxProductsScan, pageSize }) {
  const out = [];
  let offset = 0;
  let scanned = 0;
  while (out.length < maxProductsScan) {
    let q = supabase
      .from("products")
      .select("id, title, slug, description, category, images, is_active, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (onlyActive) q = q.eq("is_active", true);
    if (minCreatedAt) q = q.gte("created_at", minCreatedAt);
    const resp = await q;
    if (resp.error) throw resp.error;
    const rows = resp.data ?? [];
    scanned += rows.length;
    if (rows.length === 0) break;
    for (const r of rows) {
      const images = Array.isArray(r.images) ? r.images : [];
      const hasImage = images.some((u) => typeof u === "string" && u.trim().length > 0);
      if (!hasImage) out.push(r);
      if (out.length >= maxProductsScan) break;
    }
    offset += pageSize;
    if (scanned >= maxProductsScan && out.length === 0) break;
    if (rows.length < pageSize) break;
  }
  return out;
}

async function promisePool(items, concurrency, fn) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= concurrency) await Promise.race(executing);
  }
  return Promise.all(results);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const logDir = path.join(__dirname, "..", "logs");
  await ensureDir(logDir);
  const logFile = path.join(logDir, `ai-images-${new Date().toISOString().replace(/[:.]/g, "-")}.jsonl`);

  const supabaseUrl = optionalEnv("SUPABASE_URL", process.env.VITE_SUPABASE_URL);
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL (or VITE_SUPABASE_URL)");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const openaiKey = args.provider === "openai" ? requiredEnv("OPENAI_API_KEY") : null;
  const openaiModel = args.provider === "openai" ? optionalEnv("OPENAI_IMAGE_MODEL", "gpt-image-1") : null;
  const openaiSize = args.provider === "openai" ? optionalEnv("OPENAI_IMAGE_SIZE", "1024x1024") : null;

  const sdBaseUrl = args.provider === "sd-webui" ? optionalEnv("SD_WEBUI_URL", "http://127.0.0.1:7860") : null;
  const sdNegative = args.provider === "sd-webui" ? optionalEnv("SD_WEBUI_NEGATIVE_PROMPT", "texto, logotipo, marca d'água, watermark, label, price tag, blurry, low quality, lowres") : null;
  const sdSteps = args.provider === "sd-webui" ? Number(optionalEnv("SD_WEBUI_STEPS", "24")) : null;
  const sdCfg = args.provider === "sd-webui" ? Number(optionalEnv("SD_WEBUI_CFG_SCALE", "6")) : null;
  const sdSampler = args.provider === "sd-webui" ? optionalEnv("SD_WEBUI_SAMPLER", "DPM++ 2M Karras") : null;
  const sdSeedRaw = args.provider === "sd-webui" ? optionalEnv("SD_WEBUI_SEED", "-1") : null;
  const sdSeed = args.provider === "sd-webui" ? Number(sdSeedRaw) : null;
  const sdSize = args.provider === "sd-webui" ? optionalEnv("SD_WEBUI_SIZE", "1024x1024") : null;
  const sdWH = args.provider === "sd-webui" ? parseSizeToWidthHeight(sdSize) : null;

  const { storage } = supabase;
  const fallback = await ensureDefaultFallback({ storage, bucket: args.bucket });

  const candidates = await listProductsMissingImages({
    supabase,
    onlyActive: args.onlyActive,
    minCreatedAt: args.minCreatedAt,
    maxProductsScan: args.maxProductsScan,
    pageSize: args.pageSize,
  });

  const targets = candidates.slice(0, args.limit);
  await writeJsonlLine(logFile, {
    at: nowIso(),
    kind: "batch_start",
    args,
    candidates: candidates.length,
    targets: targets.length,
  });

  let okCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  await promisePool(targets, args.concurrency, async (p) => {
    const productId = p.id;
    const slug = p.slug;
    const title = p.title;
    const prompt = buildPrompt(p);
    const baseLog = { at: nowIso(), productId, slug, title };

    if (args.dryRun) {
      skippedCount += 1;
      await writeJsonlLine(logFile, { ...baseLog, status: "dry_run", prompt });
      return;
    }

    try {
      const originalPng =
        args.provider === "mock"
          ? await mockGeneratePngBuffer({ prompt })
          : args.provider === "sd-webui"
            ? await sdWebuiGeneratePngBuffer({
                baseUrl: sdBaseUrl,
                prompt,
                negativePrompt: sdNegative,
                width: sdWH?.width ?? 1024,
                height: sdWH?.height ?? 1024,
                steps: Number.isFinite(sdSteps) && sdSteps > 0 ? sdSteps : 24,
                cfgScale: Number.isFinite(sdCfg) && sdCfg > 0 ? sdCfg : 6,
                samplerName: sdSampler,
                seed: Number.isFinite(sdSeed) ? sdSeed : -1,
              })
            : await openAiGeneratePngBuffer({ apiKey: openaiKey, model: openaiModel, prompt, size: openaiSize });

      const quality = await validateImageBuffer(originalPng);
      if (!quality.ok) throw new Error(`quality_failed:${quality.reason}`);

      const derivatives = await renderDerivatives({
        originalPng,
        productId,
        slug,
        storage,
        bucket: args.bucket,
      });

      const urlsForDb = [
        derivatives.primary,
        derivatives.urls.find((u) => u.size === "medium" && u.format === "webp")?.url ?? null,
        derivatives.urls.find((u) => u.size === "thumb" && u.format === "webp")?.url ?? null,
        derivatives.urls.find((u) => u.size === "large" && u.format === "jpeg")?.url ?? null,
      ].filter((u) => typeof u === "string" && u.length > 0);

      const update = await supabase.from("products").update({ images: urlsForDb }).eq("id", productId);
      if (update.error) throw update.error;

      okCount += 1;
      await writeJsonlLine(logFile, {
        ...baseLog,
        status: "ok",
        prompt,
        primary: derivatives.primary,
        uploaded: derivatives.urls.map((u) => ({ key: u.key, url: u.url })),
        imagesSet: urlsForDb,
      });
    } catch (e) {
      failCount += 1;
      const msg = e instanceof Error ? e.message : "unknown_error";
      const update = await supabase.from("products").update({ images: [fallback.fallbackUrl] }).eq("id", productId);
      await writeJsonlLine(logFile, { ...baseLog, status: "failed", prompt, error: msg, fallback: fallback.fallbackUrl, fallbackUpdateError: update.error?.message ?? null });
    }
  });

  await writeJsonlLine(logFile, {
    at: nowIso(),
    kind: "batch_end",
    ok: okCount,
    failed: failCount,
    skipped: skippedCount,
  });

  process.stdout.write(
    `Done. ok=${okCount} failed=${failCount} skipped=${skippedCount} log=${logFile}\n`,
  );
}

main().catch((e) => {
  process.stderr.write(`${e instanceof Error ? e.stack : String(e)}\n`);
  process.exitCode = 1;
});
