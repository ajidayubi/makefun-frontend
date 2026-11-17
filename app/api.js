const API_BASE = 'https://make.fun/api';

export async function fetchCompetitions(status = 'open') {
  try {
    const res = await fetch(`${API_BASE}/competitions?status=${status}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error('Failed to fetch competitions:', err);
    throw err;
  }
}

export async function fetchCompetitionDetail(slug) {
  try {
    const res = await fetch(`${API_BASE}/competitions/${slug}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch competition ${slug}:`, err);
    throw err;
  }
}

export async function fetchLeaderboard(slug) {
  try {
    const res = await fetch(`${API_BASE}/competitions/${slug}/leaderboard`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch leaderboard for ${slug}:`, err);
    throw err;
  }
}
