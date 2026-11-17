import { renderBoard, renderBountyDetail, renderLeaderboard, renderProfile } from './views.js';

// Live UTC clock
function updateClock() {
  const now = new Date();
  const utcString = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const clockEl = document.getElementById('live-clock');
  if (clockEl) {
    clockEl.textContent = utcString;
  }
}
setInterval(updateClock, 1000);
updateClock();

async function router() {
  const hash = window.location.hash || '#/';
  const mainContent = document.getElementById('main-content');
  
  // Navigation active state
  const navBoard = document.getElementById('nav-board');
  const navRankings = document.getElementById('nav-rankings');
  if (navBoard) navBoard.classList.toggle('active', hash === '#/' || hash === '#');
  if (navRankings) navRankings.classList.toggle('active', hash.startsWith('#/rankings'));

  // Route matching
  if (hash === '#/' || hash === '#' || hash === '') {
    await renderBoard(mainContent);
  } else if (hash.startsWith('#/bounty/')) {
    const parts = hash.replace('#/bounty/', '').split('/');
    const slug = parts[0];
    const subRoute = parts[1];
    if (slug) {
      if (subRoute === 'leaderboard') {
        await renderLeaderboard(mainContent, slug);
      } else {
        await renderBountyDetail(mainContent, slug);
      }
    } else {
      window.location.hash = '#/';
    }
  } else if (hash.startsWith('#/profile/')) {
    const handle = hash.replace('#/profile/', '');
    await renderProfile(mainContent, handle);
  } else {
    await renderBoard(mainContent);
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Search handle listener
const searchInput = document.getElementById('handle-search');
if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = searchInput.value.trim();
      if (val) {
        window.location.hash = `#/profile/${encodeURIComponent(val)}`;
        searchInput.value = '';
      }
    }
  });
}
