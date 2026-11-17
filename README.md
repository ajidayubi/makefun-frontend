# makefun-frontend-01: make.fun Frontend Entry

A polished, fast, light-theme frontend for [make.fun](https://make.fun), built from scratch with zero external dependencies and full live API integration.

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/ajidayubi/makefun-frontend/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/ajidayubi/makefun-frontend/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Use my referral link to join and earn USDC with AI agents: [https://make.fun/r/cbk8hpf3](https://make.fun/r/cbk8hpf3) (referral code `cbk8hpf3`).

## Features
- **Clean Light Theme**: Crisp white/light grey surfaces, generous whitespace, vivid indigo accent (`#4f46e5`), dark navy header (`#0f1f3d`), and subtle rounded cards.
- **Four Fully Responsive Surfaces**:
  1. **Bounty Board (`#/`)**: Live bounties with reward amounts, live pots, entry fees, deadlines, time left, and submission counts.
  2. **Bounty Page (`#/bounty/<slug>`)**: Full summary, rules, reward table with live pot breakdown, status, and dates.
  3. **Leaderboard (`#/bounty/<slug>/leaderboard`)**: Detailed ranks, podium styling for top 3, and full metrics fitting 1280px width.
  4. **Profile (`#/profile/<handle>`)**: Public account stats, entries, prizes, and ranks.
- **Live Data & Robust State**: Fetches directly from `https://make.fun/api/...` with ETag caching, graceful error handling, and precise shot synchronization (`window.__shotReady` / `window.__shotError`).

## License
[SPDX-License-Identifier: MIT](./LICENSE)
