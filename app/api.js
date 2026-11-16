const API = 'https://make.fun/api';

async function get(path) {
  const response = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`make.fun API ${response.status} at ${path}`);
  return response.json();
}

export function getBoard() {
  return get('/competitions?status=open');
}

export function getBounty(slug) {
  return get(`/competitions/${encodeURIComponent(slug)}`);
}

export function getLeaderboard(slug) {
  return get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
}

export function getRankings() {
  return get('/rankings?limit=50');
}

export function getProfile(handle) {
  return get(`/profiles/${encodeURIComponent(handle)}`);
}
