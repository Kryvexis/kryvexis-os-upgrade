Kryvexis OS Repair Package

What this repair fixes:
1. Frontend auth build alignment
   - restores auth-compatible frontend API methods
   - restores auth types and AuthPage compatibility so Vercel no longer fails on api.login typing

2. Backend migration safety for existing Supabase state
   - hardens backend/db/migrations/002_auth_sessions.sql
   - repairs legacy/drifted roles and permissions tables before foreign keys are created
   - backfills role_permissions from older permissions layouts when possible

Deployment notes:
- Commit and push this package.
- Redeploy backend first, then frontend.
- If Supabase still has a partially broken roles/permissions table from older experiments, this package attempts in-place repair during migration.
