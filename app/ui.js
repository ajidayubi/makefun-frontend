export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD', maximumFractionDigits: Number(value) % 1 ? 2 : 0}).format(Number(value) || 0);
export const number = value => new Intl.NumberFormat('en-US').format(Number(value) || 0);
export const pot = b => Number(b.potUsd ?? b.rewardAmount ?? 0);
export const open = b => (!b.status || b.status === 'open') && !!b.deadline && new Date(b.deadline).getTime() > Date.now();
export const date = value => value ? new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}) : 'To be announced';
export const time = value => { const hours = Math.ceil((new Date(value).getTime() - Date.now()) / 3600000); return !Number.isFinite(hours) ? 'Deadline TBD' : hours <= 0 ? 'Entries ended' : hours < 24 ? `${hours}h left` : `${Math.ceil(hours/24)} days left`; };
export const route = slug => '#/bounty/' + encodeURIComponent(slug);
export const pill = b => `<span class="status ${open(b) ? 'open' : 'ended'}"><span>●</span> ${open(b) ? 'Open for entries' : 'Entries ended'}</span>`;
export function prose(value) {
  if (!value) return '<p class="muted">No additional details published yet.</p>';
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return escape(text).split(/\n\s*\n/).map(p => /^#{1,4} /.test(p) ? `<h3>${p.replace(/^#{1,4} /,'')}</h3>` : `<p>${p.replace(/\n/g,'<br>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')}</p>`).join('');
}
export function hydrateAvatars(root) {
  root.querySelectorAll('[data-avatar]').forEach(image => {
    try { const url = new URL(image.dataset.avatar, 'https://make.fun'); if (!['https:','http:'].includes(url.protocol)) return; image.crossOrigin = 'anonymous'; image.src = url.href; image.onerror = () => image.remove(); } catch { image.remove(); }
  });
}
export const crumb = title => `<div class="breadcrumb"><a href="#/">Bounty board</a><span>/</span><span>${escape(title)}</span></div>`;
export const profileForm = () => `<form class="profile-search light" role="search"><label class="sr-only" for="page-handle">Find a maker by handle</label><span>⌕</span><input id="page-handle" name="handle" placeholder="Search by handle" required><button aria-label="Find maker">→</button></form>`;
