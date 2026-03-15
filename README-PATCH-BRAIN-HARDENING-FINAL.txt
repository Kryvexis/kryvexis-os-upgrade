Kryvexis OS Brain Hardening Final

Included in this package:
- Permission-aware navigation filtering in AppShell
- Route guards in App.tsx so direct URL access is blocked when a role should not access a module
- Safer auth API behavior in frontend/src/lib/api.ts:
  - no demo fallback on login
  - no local fallback on session restore
  - branch switching must succeed through the backend
- Settings page expanded with email automation governance summary
- New frontend/src/lib/permissions.ts as the single source of truth for role/module visibility

Notes:
- This package focuses on frontend trust hardening and navigation/route enforcement.
- It is designed to land on top of the current repo shape with POS + multi-tenant foundation already present.
- Backend email transport, retry queues, and audit persistence should be the next backend hardening follow-up if you want deeper automation guarantees.
