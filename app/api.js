const base = 'https://make.fun/api';
const cache = new Map();
export async function get(path, signal) {
  const cached = cache.get(path);
  const headers = { Accept: 'application/json' };
  if (cached?.etag) headers['If-None-Match'] = cached.etag;
  const response = await fetch(base + path, { method: 'GET', signal: AbortSignal.any([signal ?? new AbortController().signal, AbortSignal.timeout(15000)]), headers });
  if (response.status === 304 && cached) return cached.data;
  if (!response.ok) throw new Error(response.status === 404 ? 'We couldn’t find that page. Check the name and try again.' : 'make.fun is taking a moment. Please try again shortly.');
  const data = await response.json();
  cache.set(path, {data, etag:response.headers.get('ETag')});
  return data;
}
export const list = (signal) => get('/competitions?status=open&activity=times', signal);
export const bounty = (slug, signal) => get(`/competitions/${encodeURIComponent(slug)}`, signal);
export const rankings = (slug, signal) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`, signal);
export const submissions = (slug, signal) => get(`/competitions/${encodeURIComponent(slug)}/submissions`, signal);
export const profile = (handle, signal) => get(`/profiles/${encodeURIComponent(handle)}`, signal);
export const items = value => Array.isArray(value) ? value : value?.items ?? value?.entries ?? value?.submissions ?? [];
