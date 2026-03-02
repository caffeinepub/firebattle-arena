# FireBattle Arena

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack Free Fire tournament platform with admin panel
- JWT-equivalent authentication using ICP principals + role-based access (user/admin)
- User registration: username, email, Free Fire UID, phone, role
- Wallet system: balance, add funds (mock), deduct entry fees, credit prizes, transaction history
- Tournament CRUD (admin): match type, entry fee, prize pool, map type, date/time, total slots, status
- Room system: admin sets room ID + password, visible only to joined users within 10 min of match start
- Leaderboard: admin uploads results (position, kills), auto point calculation (1st=10, 2nd=8, 3rd=6, 4th=4, 5th=2, kills=1 each), sorted by total points
- Winner distribution: auto prize payout to top positions, platform commission deduction (10%), update total wins
- In-app notification system: match reminders, result announcements, wallet updates
- Admin panel: dashboard stats, tournament management, user management, revenue section
- Profile page: username, Free Fire UID, wallet balance, total wins, tournament history

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan
1. Backend (Motoko):
   - User actor: register, login, profile, ban/unban, wallet ops, transaction history
   - Tournament actor: CRUD tournaments, join/leave, room reveal logic (10 min window), status management
   - Leaderboard actor: upload results, calculate points, sort, trigger prize distribution
   - Transaction actor: credit/debit wallet, track commission
   - Notification actor: create/read notifications per user
   - Admin actor: dashboard stats, user management, revenue report

2. Frontend (React + TypeScript):
   - Dark gaming theme (mobile-first)
   - Auth pages: login, register
   - User pages: home (tournament list), tournament detail, join flow, profile, leaderboard, notifications
   - Admin panel: sidebar layout, dashboard, tournament management (CRUD + room + results), user management, revenue
   - Wallet UI: balance display, add funds modal, transaction history
