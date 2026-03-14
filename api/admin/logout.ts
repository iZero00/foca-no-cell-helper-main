import { buildCookie } from "./_session";

type ResponseLike = {
  statusCode: number;
  setHeader: (name: string, value: string | string[]) => void;
  end: (body?: string) => void;
};

type RequestLike = {
  method?: string;
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

  res.setHeader("set-cookie", buildCookie("", 0));
  return json(res, 200, { ok: true });
}
