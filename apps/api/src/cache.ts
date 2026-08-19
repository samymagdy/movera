import { createClient } from "redis";
import type { SiteData } from "@company/contracts";

const publicSiteCacheKey = "company:public-site:v1";
const redisRetryDelayMs = 10_000;

type RedisClient = {
  isOpen: boolean;
  on(event: "error", listener: (error: unknown) => void): unknown;
  connect(): Promise<unknown>;
  quit(): Promise<unknown>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
  del(key: string): Promise<number>;
};

let client: RedisClient | null = null;
let connecting: Promise<RedisClient | null> | null = null;
let disabledUntil = 0;

function cacheTtlSeconds() {
  const configured = Number(process.env.PUBLIC_SITE_CACHE_TTL_SECONDS || 60);
  return Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : 60;
}

async function getClient() {
  const url = process.env.REDIS_URL;
  if (!url || Date.now() < disabledUntil) return null;
  if (client?.isOpen) return client;
  if (connecting) return connecting;

  const nextClient = createClient({ url }) as unknown as RedisClient;
  nextClient.on("error", error => console.warn(`[redis] ${error instanceof Error ? error.message : String(error)}`));
  connecting = (async () => {
    try {
      await nextClient.connect();
      client = nextClient;
      return nextClient;
    } catch (error) {
      disabledUntil = Date.now() + redisRetryDelayMs;
      await nextClient.quit().catch(() => undefined);
      console.warn(`[redis] cache unavailable: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}

async function run<T>(operation: (redis: RedisClient) => Promise<T>, fallback: T) {
  const redis = await getClient();
  if (!redis) return fallback;
  try {
    return await operation(redis);
  } catch (error) {
    disabledUntil = Date.now() + redisRetryDelayMs;
    if (client === redis) client = null;
    await redis.quit().catch(() => undefined);
    console.warn(`[redis] cache operation failed: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

export async function getCachedPublicSite() {
  return run(async redis => {
    const payload = await redis.get(publicSiteCacheKey);
    if (!payload) return null;
    try {
      const parsed = JSON.parse(payload) as SiteData;
      const socialLinks = parsed.footer?.socialLinks;
      const legacySocialRoots = new Set(["/contact", "https://www.facebook.com/", "https://www.instagram.com/", "https://www.youtube.com/"]);
      if (!socialLinks || !("linkedin" in socialLinks) || Object.values(socialLinks).some(value => legacySocialRoots.has(value))) {
        await redis.del(publicSiteCacheKey);
        return null;
      }
      return parsed;
    } catch {
      await redis.del(publicSiteCacheKey);
      return null;
    }
  }, null as SiteData | null);
}

export async function setCachedPublicSite(site: SiteData) {
  await run(redis => redis.set(publicSiteCacheKey, JSON.stringify(site), { EX: cacheTtlSeconds() }), null);
}

export async function invalidatePublicSiteCache() {
  return run(redis => redis.del(publicSiteCacheKey), 0);
}

/** Close the optional Redis client for one-shot maintenance commands. */
export async function closePublicSiteCache() {
  if (!client?.isOpen) return;
  const current = client;
  client = null;
  await current.quit().catch(() => undefined);
}
