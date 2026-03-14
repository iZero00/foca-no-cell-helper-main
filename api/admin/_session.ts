import crypto from "node:crypto";

const COOKIE_NAME = "admin_session";

type RequestLike = {
  headers?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
};

function base64urlEncode(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64urlDecode(input: string) {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64");
}

function hmacSha256(secret: string, data: string) {
  return crypto.createHmac("sha256", secret).update(data).digest();
}

function timingSafeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function parseCookies(cookieHeader: string | undefined) {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    cookies.set(key, val);
  }
  return cookies;
}

function buildCookie(value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "Secure; " : "";
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; ${secure}SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET não configurado.");
  if (secret.length < 32) throw new Error("ADMIN_SESSION_SECRET deve ter pelo menos 32 caracteres.");
  return secret;
}

function createSessionToken(ttlSeconds: number) {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + ttlSeconds };
  const data = base64urlEncode(JSON.stringify(payload));
  const sig = base64urlEncode(hmacSha256(secret, data));
  return `${data}.${sig}`;
}

function verifySessionToken(token: string) {
  const secret = getSecret();
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = hmacSha256(secret, data);
  const received = base64urlDecode(sig);
  if (!timingSafeEqual(expected, received)) return null;

  const raw = base64urlDecode(data).toString("utf8");
  const parsed = JSON.parse(raw) as { exp?: number };
  if (!parsed?.exp || typeof parsed.exp !== "number") return null;
  const now = Math.floor(Date.now() / 1000);
  if (parsed.exp <= now) return null;

  return parsed;
}

function getSessionFromRequest(req: RequestLike | null | undefined) {
  const cookieValue = req?.headers?.cookie;
  const cookieHeader =
    typeof cookieValue === "string"
      ? cookieValue
      : Array.isArray(cookieValue) && cookieValue.every((c) => typeof c === "string")
        ? cookieValue.join("; ")
        : undefined;
  const cookies = parseCookies(cookieHeader);
  const cookieToken = req?.cookies?.[COOKIE_NAME];
  const token = cookies.get(COOKIE_NAME) ?? (typeof cookieToken === "string" ? cookieToken : undefined);
  if (!token) return null;
  return verifySessionToken(token);
}

export { buildCookie, createSessionToken, getSessionFromRequest };
