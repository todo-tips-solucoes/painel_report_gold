import { env } from "./env";
import { signPgrstJwt } from "./jwt";

export type PgrstResponse<T> = {
  data: T;
  status: number;
  /** Content-Range total when Prefer: count=exact was used */
  total?: number;
};

type PgrstOptions = {
  countExact?: boolean;
  range?: { from: number; to: number };
  headers?: Record<string, string>;
};

export async function pgrstGet<T = unknown>(
  path: string,
  opts: PgrstOptions = {},
): Promise<PgrstResponse<T>> {
  const { token } = signPgrstJwt();
  const url = `${env.PGRST_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate, br",
    ...opts.headers,
  };

  if (opts.countExact) headers.Prefer = "count=exact";
  if (opts.range) headers.Range = `${opts.range.from}-${opts.range.to}`;

  const res = await fetch(url, { headers, cache: "no-store" });
  const text = await res.text();
  if (!res.ok) {
    throw new PgrstError(res.status, text, url);
  }
  const data = (text ? JSON.parse(text) : []) as T;
  const cr = res.headers.get("content-range");
  const total = cr ? Number(cr.split("/")[1]) : undefined;
  return { data, status: res.status, total: Number.isFinite(total) ? total : undefined };
}

/**
 * Pagina e busca em paralelo com concorrência limitada. Faz a 1ª chamada com
 * count=exact pra descobrir o total, depois dispara as restantes em paralelo.
 */
export async function pgrstGetAllPaginated<T>(
  path: string,
  pageSize: number,
  concurrency = 6,
): Promise<{ data: T[]; total: number }> {
  const first = await pgrstGet<T[]>(path, {
    countExact: true,
    range: { from: 0, to: pageSize - 1 },
  });
  const total = first.total ?? first.data.length;
  if (total <= pageSize) return { data: first.data, total };

  const ranges: Array<{ from: number; to: number }> = [];
  for (let from = pageSize; from < total; from += pageSize) {
    ranges.push({ from, to: from + pageSize - 1 });
  }

  // result keeps ranges in order
  const results: T[][] = new Array(ranges.length);
  let cursor = 0;
  const workers: Promise<void>[] = [];
  for (let w = 0; w < Math.min(concurrency, ranges.length); w++) {
    workers.push(
      (async () => {
        while (true) {
          const i = cursor++;
          if (i >= ranges.length) return;
          const r = await pgrstGet<T[]>(path, { range: ranges[i] });
          results[i] = r.data;
        }
      })(),
    );
  }
  await Promise.all(workers);
  const combined = [first.data, ...results].flat();
  return { data: combined, total };
}

export class PgrstError extends Error {
  constructor(public status: number, public body: string, public url: string) {
    super(`PostgREST ${status} on ${url}: ${body.slice(0, 300)}`);
  }
}
