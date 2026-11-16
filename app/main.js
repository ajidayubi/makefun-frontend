import { getBoard, getBounty, getLeaderboard, getProfile, getRankings } from './api.js';
import { activeBounties, boardView, bountyView, enrichFees, leaderboardView, profileView, rankingsView, setTicker } from './views.js';

const app = document.querySelector('#app');
const themeButton = document.querySelector('#theme-toggle');
const handleInput = document.querySelector('#maker-handle');
window.__shotReady = false;

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('makefun-theme', theme);
  themeButton.textContent = theme === 'light' ? 'DARK' : 'LIGHT';
  themeButton.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
}

setTheme(localStorage.getItem('makefun-theme') === 'light' ? 'light' : 'dark');
themeButton.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
document.querySelector('#maker-search').addEventListener('submit', event => {
  event.preventDefault();
  const handle = handleInput.value.trim().replace(/^@/, '');
  if (handle) location.hash = `#/profile/${encodeURIComponent(handle)}`;
});

function tick() {
  document.querySelector('#utc-clock').textContent = `${new Date().toISOString().slice(11, 19)} UTC`;
}
tick();
setInterval(tick, 1000);

function route() {
  const parts = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/').filter(Boolean);
  if (parts[0] === 'bounty' && parts[1]) return { kind: 'bounty', slug: parts[1] };
  if (parts[0] === 'leaderboard' && parts[1]) return { kind: 'leaderboard', slug: parts[1] };
  if (parts[0] === 'profile' && parts[1]) return { kind: 'profile', handle: parts[1] };
  if (parts[0] === 'rankings') return { kind: 'rankings' };
  return { kind: 'board' };
}

function setNavigation(kind) {
  document.querySelectorAll('[data-nav]').forEach(link => link.classList.toggle('active', link.dataset.nav === (kind === 'rankings' ? 'rankings' : kind === 'board' ? 'board' : '')));
}

function wireFilters(items) {
  const buttons = document.querySelectorAll('.filter');
  const rows = document.querySelectorAll('.bounty-row');
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.classList.toggle('active', item === button));
    rows.forEach(row => { row.hidden = button.dataset.filter !== 'any' && row.dataset.fee !== button.dataset.filter; });
  }));
}

async function render() {
  window.__shotReady = false;
  window.__shotError = '';
  app.innerHTML = '<div class="loading">FETCHING LIVE DATA…</div>';
  const current = route();
  setNavigation(current.kind);
  try {
    if (current.kind === 'board') {
      const result = await getBoard();
      const sourceItems = activeBounties(result);
      const items = await Promise.all(sourceItems.map(async item => {
        try {
          const detail = await getBounty(item.slug);
          return { ...item, entryFeeUsd: detail.entryFeeUsd, potUsd: detail.potUsd ?? item.potUsd, submissionCount: detail.submissionCount ?? item.submissionCount };
        } catch {
          return item;
        }
      }));
      setTicker(items);
      app.innerHTML = boardView(items);
      wireFilters(items);
    } else if (current.kind === 'bounty') {
      const [board, bounty] = await Promise.all([getBoard(), getBounty(current.slug)]);
      setTicker(activeBounties(board));
      app.innerHTML = bountyView(bounty);
    } else if (current.kind === 'leaderboard') {
      const [board, bounty, leaderboard] = await Promise.all([getBoard(), getBounty(current.slug), getLeaderboard(current.slug)]);
      setTicker(activeBounties(board));
      app.innerHTML = leaderboardView(bounty, leaderboard);
    } else if (current.kind === 'rankings') {
      const [board, rankings] = await Promise.all([getBoard(), getRankings()]);
      setTicker(activeBounties(board));
      app.innerHTML = rankingsView(rankings);
    } else {
      const [board, profile] = await Promise.all([getBoard(), getProfile(current.handle)]);
      setTicker(activeBounties(board));
      app.innerHTML = profileView(profile);
    }
    window.__shotReady = true;
  } catch (error) {
    window.__shotError = error instanceof Error ? error.message : String(error);
    app.innerHTML = `<section class="error-state"><span class="eyebrow">MAKE.FUN API / ERROR</span><h1>Live data unavailable.</h1><p>${window.__shotError.replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]))}</p><button id="retry" type="button">RETRY</button></section>`;
    document.querySelector('#retry').addEventListener('click', render);
  }
}

window.addEventListener('hashchange', render);
if (!location.hash) location.hash = '#/';
render();
