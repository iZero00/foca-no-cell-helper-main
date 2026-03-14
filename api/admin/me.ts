import { getSessionFromRequest } from "./_session";

type ResponseLike = {
  statusCode: number;
  setHeader: (name: string, value: string | string[]) => void;
  end: (body?: string) => void;
};

type RequestLike = {
  method?: string;
  headers?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
};

function json(res: ResponseLike, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") {
    res.setHeader("allow", "GET");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const session = getSessionFromRequest(req);
    if (!session) return json(res, 401, { ok: false });
    return json(res, 200, { ok: true });
  } catch {
    return json(res, 401, { ok: false });
  }
}
