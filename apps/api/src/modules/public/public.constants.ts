export const PUBLIC_SHOWCASE_STREAMERS_LIMIT = 20;
export const PUBLIC_SHOWCASE_ACTIVITY_DAYS = 30;
/** Redis TTL for the computed showcase. */
export const PUBLIC_SHOWCASE_CACHE_TTL = 60 * 10;
/** Shared caches (CDN / Next ISR) may keep it as long as Redis; browsers re-check sooner. */
export const PUBLIC_SHOWCASE_CACHE_CONTROL = 'public, max-age=60, s-maxage=600, stale-while-revalidate=300';
