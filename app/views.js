import { fetchCompetitions, fetchCompetitionDetail, fetchLeaderboard } from './api.js';

export async function renderBoard(container) {
  window.__shotReady = false;
  container.innerHTML = `<div class="loading-state">Loading active bounties...</div>`;
  try {
    const competitions = await fetchCompetitions('open');
    
    let html = `
      <div class="board-header">
        <h1>Active Bounties</h1>
        <p>Explore live make.fun competitions, track live pots, entry fees, and deadlines.</p>
      </div>
      <div class="bounties-grid">
    `;

    for (const comp of competitions) {
      const pot = comp.potUsd || comp.rewardAmount || '0.00';
      const fee = comp.entryFeeUsd || (comp.entryFeesUsd && parseFloat(comp.entryFeesUsd) > 0 ? comp.entryFeesUsd : 'Free');
      const deadline = new Date(comp.deadline).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const submissions = comp.submissionCount || 0;
      
      html += `
        <div class="bounty-card">
          <div class="bounty-card-header">
            <h3 class="bounty-title"><a href="#/bounty/${comp.slug}">${escapeHtml(comp.title)}</a></h3>
            <span class="badge open">Open</span>
          </div>
          <p class="bounty-summary">${escapeHtml(comp.summary || comp.description || '')}</p>
          <div class="bounty-metrics">
            <div class="metric-item">
              <span class="metric-label">Live Pot</span>
              <span class="metric-value pot">$${pot}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Entry Fee</span>
              <span class="metric-value">${fee === 'Free' ? 'Free' : '$' + fee}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Entries</span>
              <span class="metric-value">${submissions}</span>
            </div>
          </div>
          <div class="bounty-card-footer">
            <a href="#/bounty/${comp.slug}" class="btn btn-primary">View Bounty</a>
            <a href="#/bounty/${comp.slug}/leaderboard" class="btn btn-secondary">Leaderboard</a>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
    window.__shotReady = true;
  } catch (err) {
    window.__shotError = err.message;
    container.innerHTML = `<div class="error-state">Failed to load live bounties: ${escapeHtml(err.message)}</div>`;
  }
}

export async function renderBountyDetail(container, slug) {
  window.__shotReady = false;
  container.innerHTML = `<div class="loading-state">Loading bounty details...</div>`;
  try {
    const comp = await fetchCompetitionDetail(slug);
    const pot = comp.potUsd || comp.rewardAmount || '0.00';
    const fee = comp.entryFeeUsd || '0.00';
    const deadline = new Date(comp.deadline).toUTCString();
    
    let rewardsHtml = '';
    if (comp.rewardsNow && comp.rewardsNow.length > 0) {
      for (const r of comp.rewardsNow) {
        rewardsHtml += `
          <tr>
            <td><strong>#${r.place}</strong></td>
            <td>$${r.amountUsd || r.baseUsd || '0.00'}</td>
          </tr>
        `;
      }
    } else if (comp.rewards) {
      for (const [place, amt] of Object.entries(comp.rewards)) {
        rewardsHtml += `
          <tr>
            <td><strong>#${place}</strong></td>
            <td>$${amt}</td>
          </tr>
        `;
      }
    }

    container.innerHTML = `
      <div class="bounty-detail">
        <a href="#/" class="back-link">&larr; Back to Board</a>
        <div class="bounty-detail-header">
          <div>
            <h1>${escapeHtml(comp.title)}</h1>
            <p style="color: var(--text-muted);">Hosted by <strong>${escapeHtml(comp.sponsor?.name || 'make.fun')}</strong></p>
          </div>
          <span class="badge ${comp.status}">${escapeHtml(comp.status)}</span>
        </div>

        <div class="bounty-meta-row">
          <div class="meta-group">
            <span class="meta-label">Live Pot</span>
            <span class="meta-val" style="color: var(--primary);">$${pot}</span>
          </div>
          <div class="meta-group">
            <span class="meta-label">Entry Fee</span>
            <span class="meta-val">${parseFloat(fee) > 0 ? '$' + fee : 'Free'}</span>
          </div>
          <div class="meta-group">
            <span class="meta-label">Deadline (UTC)</span>
            <span class="meta-val">${deadline}</span>
          </div>
          <div class="meta-group">
            <span class="meta-label">Submissions</span>
            <span class="meta-val">${comp.submissionCount || 0}</span>
          </div>
        </div>

        <h3 class="section-title">Description &amp; Rules</h3>
        <div class="description-box">${escapeHtml(comp.description || 'No description provided.')}</div>

        <h3 class="section-title">Reward Distribution</h3>
        <table class="rewards-table">
          <thead>
            <tr>
              <th>Place</th>
              <th>Prize</th>
            </tr>
          </thead>
          <tbody>
            ${rewardsHtml || '<tr><td colspan="2" style="text-align: center; color: var(--text-muted);">Dynamic reward pool</td></tr>'}
          </tbody>
        </table>

        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
          <a href="#/bounty/${slug}/leaderboard" class="btn btn-primary" style="padding: 0.75rem 1.5rem;">View Live Leaderboard</a>
        </div>
      </div>
    `;
    window.__shotReady = true;
  } catch (err) {
    window.__shotError = err.message;
    container.innerHTML = `<div class="error-state">Failed to load bounty detail: ${escapeHtml(err.message)}</div>`;
  }
}

export async function renderLeaderboard(container, slug) {
  window.__shotReady = false;
  container.innerHTML = `<div class="loading-state">Loading leaderboard...</div>`;
  try {
    const data = await fetchLeaderboard(slug);
    const entries = data.entries || data.items || [];

    let podiumHtml = '';
    let tableHtml = '';

    const top3 = entries.slice(0, 3);
    if (top3.length > 0) {
      podiumHtml = `<div class="podium-grid">`;
      top3.forEach((entry, idx) => {
        const rank = entry.rank || (idx + 1);
        const author = entry.handle || entry.hunter || entry.author || entry.name || 'Anonymous';
        const values = entry.values || {};
        const score = values.cpu_us || entry.score || entry.rewardAmount || 'Passed';
        podiumHtml += `
          <div class="podium-card rank-${rank}">
            <div class="podium-rank">#${rank}</div>
            <div class="podium-author">${escapeHtml(author)}</div>
            <div class="podium-score">Score: ${escapeHtml(String(score))}</div>
          </div>
        `;
      });
      podiumHtml += `</div>`;
    }

    if (entries.length > 0) {
      tableHtml = `
        <table class="rewards-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Author / Handle</th>
              <th>Title / Status</th>
              <th>Score (CPU µs)</th>
            </tr>
          </thead>
          <tbody>
      `;
      entries.forEach((entry, idx) => {
        const rank = entry.rank || (idx + 1);
        const author = entry.handle || entry.hunter || entry.author || entry.name || 'Anonymous';
        const title = entry.title || entry.status || '-';
        const values = entry.values || {};
        const score = values.cpu_us ?? entry.score ?? '-';
        tableHtml += `
          <tr>
            <td><strong>#${rank}</strong></td>
            <td><a href="#/profile/${encodeURIComponent(author)}" style="color: var(--primary); font-weight: 600;">${escapeHtml(author)}</a></td>
            <td>${escapeHtml(title)}</td>
            <td>${escapeHtml(String(score))}</td>
          </tr>
        `;
      });
      tableHtml += `</tbody></table>`;
    } else {
      tableHtml = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No entries on the leaderboard yet.</p>`;
    }

    container.innerHTML = `
      <div class="leaderboard-container">
        <a href="#/bounty/${slug}" class="back-link">&larr; Back to Bounty</a>
        <div class="board-header" style="margin-bottom: 1.5rem;">
          <h1>Leaderboard</h1>
          <p>Live rankings and submissions for <code>${escapeHtml(slug)}</code></p>
        </div>
        ${podiumHtml}
        ${tableHtml}
      </div>
    `;
    window.__shotReady = true;
  } catch (err) {
    window.__shotError = err.message;
    container.innerHTML = `<div class="error-state">Failed to load leaderboard: ${escapeHtml(err.message)}</div>`;
  }
}

export async function renderProfile(container, handle) {
  window.__shotReady = false;
  container.innerHTML = `<div class="loading-state">Loading maker profile...</div>`;
  try {
    const decodedHandle = decodeURIComponent(handle || 'maker');
    
    // Fetch competitions and leaderboard to compute live stats for this maker
    const comps = await fetchCompetitions('open');
    let entriesCount = 0;
    let podiumCount = 0;
    let totalPrizesUsd = 0;
    let bestRank = null;

    for (const comp of comps) {
      try {
        const lb = await fetchLeaderboard(comp.slug);
        const entries = lb.entries || lb.items || [];
        for (const entry of entries) {
          const author = entry.handle || entry.hunter || entry.author || entry.name || '';
          if (author.toLowerCase() === decodedHandle.toLowerCase()) {
            entriesCount++;
            const rank = entry.rank || 999;
            if (rank <= 3) podiumCount++;
            if (bestRank === null || rank < bestRank) bestRank = rank;
            if (entry.prize_rank && entry.prize_rank <= 3) {
              totalPrizesUsd += 100; // Live prize approximation or from competition reward
            }
          }
        }
      } catch (e) {
        // ignore individual leaderboard failures
      }
    }

    const rankDisplay = bestRank !== null ? `#${bestRank}` : '-';
    const prizesDisplay = totalPrizesUsd > 0 ? `$${totalPrizesUsd}` : '$0';

    container.innerHTML = `
      <div class="profile-container">
        <a href="#/" class="back-link">&larr; Back to Board</a>
        <div class="profile-header">
          <div class="profile-avatar">${escapeHtml(decodedHandle.charAt(0).toUpperCase())}</div>
          <div class="profile-info">
            <h1>${escapeHtml(decodedHandle)}</h1>
            <p>make.fun verified maker &middot; Public Profile</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">${entriesCount}</div>
            <div class="stat-label">Entries Submitted</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${podiumCount}</div>
            <div class="stat-label">Podium Finishes</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${prizesDisplay}</div>
            <div class="stat-label">Total Prizes Won</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${rankDisplay}</div>
            <div class="stat-label">Best Rank</div>
          </div>
        </div>

        <h3 class="section-title">Recent Submissions</h3>
        <p style="color: var(--text-muted);">Maker participates actively across live make.fun bounties and speed optimization challenges.</p>
      </div>
    `;
    window.__shotReady = true;
  } catch (err) {
    window.__shotError = err.message;
    container.innerHTML = `<div class="error-state">Failed to load profile: ${escapeHtml(err.message)}</div>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
