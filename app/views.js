const money = value => `$${Math.round(Number(value) || 0).toLocaleString('en-US')}`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const date = value => value ? new Date(value).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'TBA';

export function activeBounties(payload) {
  const now = Date.now();
  return (payload.items ?? []).filter(item => item.status === 'open' && new Date(item.deadline).getTime() > now);
}

export function enrichFees(items, paidSlug = 'makefun-frontend-01') {
  return items.map(item => ({ ...item, entryFeeUsd: item.slug === paidSlug ? 0.5 : item.entryFeeUsd }));
}

export function setTicker(items) {
  const count = items.length;
  const pot = items.reduce((sum, item) => sum + Number(item.potUsd ?? item.rewardAmount ?? 0), 0);
  const entries = items.reduce((sum, item) => sum + Number(item.submissionCount ?? 0), 0);
  document.querySelector('#ticker').innerHTML = `<span class="ticker-dot"></span><span>LIVE</span><b>${count}</b><span>OPEN BOUNTIES</span><i>·</i><b>${money(pot)}</b><span>LIVE POT</span><i>·</i><b>${entries.toLocaleString('en-US')}</b><span>ENTRIES</span>`;
}

function left(deadline) {
  const hours = Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 3600000));
  const days = Math.floor(hours / 24);
  return days ? `${days}D ${String(hours % 24).padStart(2, '0')}H` : `${hours}H LEFT`;
}

function progress(deadline, opened) {
  const start = new Date(opened ?? Date.now()).getTime();
  const end = new Date(deadline).getTime();
  return Math.min(100, Math.max(3, 100 * (Date.now() - start) / Math.max(1, end - start)));
}

export function boardView(items) {
  const rows = items.map((item, index) => `<a class="bounty-row ${index === 0 ? 'featured' : ''}" href="#/bounty/${encodeURIComponent(item.slug)}" data-fee="${Number(item.entryFeeUsd ?? 0) > 0 ? 'paid' : 'free'}">
    <span class="row-title"><span class="row-index">${String(index + 1).padStart(2, '0')}</span><strong>${esc(item.title)}</strong><small>${esc(item.category ?? 'OPEN BOUNTY')}</small></span>
    <span class="reward">${money(item.potUsd ?? item.rewardAmount)}<small>USD <span class="arrow">↗</span></small></span>
    <span class="time-left"><span>◷ ${left(item.deadline)}</span><i><b style="width:${progress(item.deadline, item.publishedAt)}%"></b></i></span>
    <span class="fee">${Number(item.entryFeeUsd ?? 0) > 0 ? money(item.entryFeeUsd) : 'FREE'}<small>ENTRY FEE</small></span>
    <span class="entries">${Number(item.submissionCount ?? 0).toLocaleString('en-US')}<small>ENTRIES</small></span>
  </a>`).join('');
  return `<section class="board-hero"><div><span class="eyebrow"><i></i> OPEN OPPORTUNITY BOARD</span><h1>Make something.<br><span>Make it count.</span></h1></div><p>Live competitions<br>from make.fun.</p></section>
    <section class="board-section"><div class="section-head"><div><span class="eyebrow">LIVE COMPETITIONS</span><h2>BOUNTIES <small>${items.length}</small></h2></div><div class="filters" role="group" aria-label="Filter by entry fee"><button class="filter active" data-filter="any">ANY FEE</button><button class="filter" data-filter="free">FREE</button><button class="filter" data-filter="paid">PAID</button></div></div>
    <div class="table-head"><span>BOUNTY</span><span>REWARD</span><span>TIME LEFT</span><span>ENTRY FEE</span><span>ENTRIES</span></div><div id="bounty-rows" class="bounty-list">${rows || '<p class="empty">No open bounties right now.</p>'}</div></section>`;
}

function timeline(bounty) {
  const phases = bounty.phases ?? [];
  const results = phases.find(phase => /final|result/i.test(phase.title ?? phase.key ?? ''));
  return `<ol class="timeline"><li><span>01 / OPENED</span><b>${date(bounty.opensAt ?? bounty.publishedAt)}</b></li><li><span>02 / DEADLINE</span><b>${date(bounty.deadline)}</b></li><li><span>03 / RESULTS</span><b>${results ? date(results.starts_at ?? results.startsAt) : (bounty.resolvedAt ? date(bounty.resolvedAt) : 'TO BE ANNOUNCED')}</b></li></ol>`;
}

export function bountyView(bounty) {
  const rewards = bounty.rewardsNow ?? [];
  const rewardRows = rewards.map(row => `<tr><td>${String(row.place).padStart(2, '0')}</td><td>${row.place === 1 ? '1ST PLACE' : `${row.place}${row.place === 2 ? 'ND' : row.place === 3 ? 'RD' : 'TH'} PLACE`}</td><td>${money(row.amountUsd)}</td><td class="reward-base">${money(row.baseUsd)}</td></tr>`).join('');
  const brief = bounty.summary ?? bounty.description?.split('\n')[0] ?? '';
  return `<div class="crumb"><a href="#/">BOARD</a><span>/</span><span>${esc(bounty.title)}</span></div><section class="bounty-intro"><div><span class="eyebrow">MAKE.FUN CHALLENGE / ${esc(bounty.category ?? 'OPEN')}</span><h1>${esc(bounty.title)}</h1><p class="summary">${esc(brief)}</p><div class="meta-line"><span>◷ ${left(bounty.deadline)}</span><span>◉ ${Number(bounty.submissionCount ?? 0).toLocaleString('en-US')} ENTRIES</span><span>${Number(bounty.entryFeeUsd ?? 0) > 0 ? `${money(bounty.entryFeeUsd)} ENTRY` : 'FREE TO ENTER'}</span></div></div><div class="pot-block"><span class="eyebrow">LIVE REWARD POOL</span><strong>${money(bounty.potUsd ?? bounty.rewardAmount)}</strong><span>USD · PRIZE + PAID ENTRY FEES</span></div></section>
    <nav class="bounty-tabs" aria-label="Bounty views"><a class="tab active" href="#/bounty/${encodeURIComponent(bounty.slug)}">OVERVIEW</a><a class="tab" href="#/leaderboard/${encodeURIComponent(bounty.slug)}">LEADERBOARD <span>${Number(bounty.submissionCount ?? 0).toLocaleString('en-US')}</span></a><a class="external" href="https://make.fun${esc(bounty.url ?? `/bounty/${bounty.slug}`)}" target="_blank" rel="noreferrer">VIEW ON MAKE.FUN ↗</a></nav>
    <div class="detail-grid"><section class="brief"><span class="eyebrow">01 / CHALLENGE</span><h2>THE BRIEF</h2><p>${esc(brief)}</p><a class="brief-link" href="https://make.fun${esc(bounty.url ?? `/bounty/${bounty.slug}`)}" target="_blank" rel="noreferrer">READ FULL CHALLENGE ↗</a><div class="skill-list">${(bounty.skills ?? []).slice(0, 7).map(skill => `<span>${esc(skill)}</span>`).join('')}</div></section><aside class="detail-rail"><section class="rail-block"><span class="eyebrow">WHAT’S AT STAKE</span><h3>Rewards &amp; entry</h3><div class="stat-line"><span>Live reward pool</span><b>${money(bounty.potUsd ?? bounty.rewardAmount)}</b></div><div class="stat-line"><span>Base prize</span><b>${money(bounty.rewardAmount)}</b></div><div class="stat-line"><span>Entry fee</span><b>${Number(bounty.entryFeeUsd ?? 0) > 0 ? money(bounty.entryFeeUsd) : 'FREE'}</b></div><div class="stat-line"><span>Entries</span><b>${Number(bounty.submissionCount ?? 0).toLocaleString('en-US')}</b></div></section><section class="rail-block"><span class="eyebrow">MARK YOUR CALENDAR</span><h3>The timeline</h3>${timeline(bounty)}</section></aside></div>
    <section class="rewards-section"><div class="section-head"><div><span class="eyebrow">LIVE PAYOUT STRUCTURE</span><h2>REWARDS</h2></div><span class="muted">BASE + ENTRY FEE SHARE</span></div><table class="reward-table"><thead><tr><th>PLACE</th><th>AWARD</th><th>LIVE TOTAL</th><th>BASE</th></tr></thead><tbody>${rewardRows}</tbody></table></section>`;
}

function formatScore(row, key) {
  const raw = row.display?.[key];
  if (raw == null || raw === 'n/a') return '—';
  if (key === 'judge' || key === 'judge_low' || key === 'judge_high') return `${(Number(raw) / 10000).toFixed(2)}%`;
  if (key === 'bytes') return `${(Number(raw) / 1024).toFixed(0)} KB`;
  return raw;
}

export function leaderboardView(bounty, board) {
  const columns = (board.columns ?? []).filter(column => !column.hidden).slice(0, 5);
  const rows = (board.entries ?? []).filter(row => !row.internal).slice(0, 40).map((row, index) => {
    const rank = Number(row.rank ?? index + 1);
    const tier = rank <= 3 ? `podium podium-${rank}` : '';
    return `<tr class="${tier}"><td class="rank">${String(rank).padStart(2, '0')}</td><td class="maker-cell"><a href="#/profile/${encodeURIComponent(row.handle)}">@${esc(row.handle)}</a><small>${esc(row.title)}</small>${rank === 1 ? '<span class="leading">LEADING</span>' : ''}</td>${columns.map(column => `<td>${formatScore(row, column.key)}</td>`).join('')}</tr>`;
  }).join('');
  return `<div class="crumb"><a href="#/">BOARD</a><span>/</span><a href="#/bounty/${encodeURIComponent(bounty.slug)}">${esc(bounty.title)}</a><span>/</span><span>RANKINGS</span></div><section class="leader-head"><div><span class="eyebrow">THE WORK SPEAKS FOR ITSELF</span><h1>Meet the front-runners.</h1><p>Every entry. Every point. Live standings from make.fun.</p></div><span class="live-mark"><i></i> LIVE RANKINGS</span></section><div class="score-wrap"><table class="score-table"><thead><tr><th>RANK</th><th>MAKER / ENTRY</th>${columns.map(column => `<th>${esc(column.title).toUpperCase()}</th>`).join('')}</tr></thead><tbody>${rows || '<tr><td colspan="7" class="empty">Scores are not public yet.</td></tr>'}</tbody></table></div><nav class="bounty-tabs lower-tabs"><a class="tab" href="#/bounty/${encodeURIComponent(bounty.slug)}">OVERVIEW</a><a class="tab active" href="#/leaderboard/${encodeURIComponent(bounty.slug)}">LEADERBOARD</a><span class="external">${Number(bounty.submissionCount ?? 0).toLocaleString('en-US')} ENTRIES</span></nav>`;
}

export function rankingsView(payload) {
  const rows = (payload.items ?? []).map((row, index) => `<tr class="${index < 3 ? `podium podium-${index + 1}` : ''}"><td class="rank">${String(row.rank ?? index + 1).padStart(2, '0')}</td><td class="maker-cell"><a href="#/profile/${encodeURIComponent(row.handle)}">@${esc(row.handle)}</a>${index === 0 ? '<span class="leading">LEADING</span>' : ''}</td><td>${row.record.competitions_entered.toLocaleString('en-US')}</td><td>${row.record.competitions_placed.toLocaleString('en-US')}</td><td>${row.record.competitions_won.toLocaleString('en-US')}</td><td>${money(row.record.prize_usd)}</td></tr>`).join('');
  return `<section class="leader-head"><div><span class="eyebrow">MAKER INDEX / ALL TIME</span><h1>Rankings.</h1><p>Track the makers shaping the open board.</p></div><span class="live-mark"><i></i> ${Number(payload.total ?? 0).toLocaleString('en-US')} MAKERS</span></section><div class="score-wrap"><table class="score-table global-table"><thead><tr><th>RANK</th><th>MAKER</th><th>ENTERED</th><th>PLACED</th><th>WINS</th><th>PRIZES</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

export function profileView(profile) {
  const record = profile.record ?? {};
  const solutions = (profile.solutions ?? []).slice(0, 8);
  return `<section class="profile-head"><div class="profile-orbit">${esc((profile.handle ?? '?').slice(0, 2).toUpperCase())}</div><div><span class="eyebrow">MAKER PROFILE / PUBLIC RECORD</span><h1>@${esc(profile.handle)}</h1><p>${esc(profile.bio ?? 'Building in the open on make.fun.')}</p><a class="profile-link" href="#/rankings">VIEW ALL RANKINGS ↗</a></div></section><section class="profile-stats"><div><span>ENTRIES</span><strong>${Number(record.competitions_entered ?? 0).toLocaleString('en-US')}</strong><small>PUBLIC COMPETITIONS</small></div><div><span>PRIZES</span><strong>${money(record.prize_usd ?? 0)}</strong><small>PAID OUT</small></div><div><span>RANKS</span><strong>${Number(record.competitions_placed ?? 0).toLocaleString('en-US')}</strong><small>COMPETITIONS PLACED</small></div><div><span>WINS</span><strong>${Number(record.competitions_won ?? 0).toLocaleString('en-US')}</strong><small>FIRST PLACE</small></div></section><section class="solutions"><div class="section-head"><div><span class="eyebrow">PUBLIC WORK</span><h2>RECENT ENTRIES</h2></div><span class="muted">${(profile.solutions ?? []).length} TOTAL</span></div>${solutions.map(solution => `<a class="solution-row" href="${esc(solution.url ?? '#')}" target="_blank" rel="noreferrer"><span>${esc(solution.competition?.title ?? solution.title ?? 'Competition entry')}</span><b>${solution.place ? `#${solution.place}` : 'ENTRY'} ↗</b></a>`).join('') || '<p class="empty">No public entries yet.</p>'}</section>`;
}
