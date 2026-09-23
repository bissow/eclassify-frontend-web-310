// ETag-aware fetch for server-side, always-revalidate (no-store) endpoints.
// Sends the last-seen ETag as If-None-Match; on 304 reuses the cached body,
// skipping payload transfer + JSON parse. Origin's ETag changing (admin edit)
// self-invalidates — no manual revalidateTag needed.
//
// Store is per-process in-memory: great on a persistent VPS, degrades safely on
// serverless (cold instance → empty store → full 200, same as plain no-store).
// Never returns stale-vs-origin data — 304 only comes back when origin confirms
// the body is unchanged. Swap `store` for Redis/KV to share across instances.
import { SEED_HEADER } from "@/lib/constants";

const store = new Map(); // key -> { etag, data }

export async function etagFetch(url, { key = url, headers = {}, ...opts } = {}) {
  // Authed responses are personalized (is_liked) and must never enter the
  // shared cache — the Map is global across all users, so caching one user's
  // data would serve it to everyone. Token present → plain no-store, skip Map.
  // A seed key personalizes the same way (per-session reels shuffle): cached, it
  // would hand one visitor's order to everyone and make the seed a no-op.
  if (headers.Authorization || headers[SEED_HEADER]) {
    const res = await fetch(url, { ...opts, cache: "no-store", headers });
    return res.json();
  }

  const cached = store.get(key);
  const res = await fetch(url, {
    ...opts,
    cache: "no-store",
    headers: {
      ...headers,
      ...(cached?.etag && { "If-None-Match": cached.etag }),
    },
  });

  // 304: origin confirms unchanged — reuse cached body (304 has no payload).
  if (res.status === 304 && cached) return cached.data;

  const data = await res.json();
  const etag = res.headers.get("etag");
  if (etag) store.set(key, { etag, data });
  return data;
}
