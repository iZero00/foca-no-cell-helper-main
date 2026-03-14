import { buildCookie, createSessionToken } from "./_session";

type ResponseLike = {
  statusCode: number;
  setHeader: (name: string, value: string | string[]) => void;
  end: (body?: string) => void;
};

type RequestLike = {
  method?: string;
  body?: unknown;
};

function json(res: ResponseLike, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    return json(res, 500, { error: "ADMIN_PASSWORD não configurado." });
  }

  const body: unknown = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const password =
    typeof body === "object" && body !== null && "password" in body ? (body as { password?: unknown }).password : undefined;
  if (typeof password !== "string" || password.length === 0) {
    return json(res, 400, { error: "Senha inválida." });
  }

  if (password !== adminPassword) {
    return json(res, 401, { error: "Credenciais inválidas." });
  }

  const ttlSeconds = 60 * 60 * 12;
  const token = createSessionToken(ttlSeconds);
  res.setHeader("set-cookie", buildCookie(token, ttlSeconds));
  return json(res, 200, { ok: true });
}
