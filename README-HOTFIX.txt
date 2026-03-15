Kryvexis OS login hotfix

Changes:
- backend/src/auth/auth-service.js
  - login/signup/session queries no longer hard-fail when app_users.is_active is missing in production DB
  - SQL path now detects whether the is_active column exists and falls back to true when it does not
- frontend/src/pages/AuthPage.tsx
  - removed the small top-left "Kryvexis OS" eyebrow text from the auth page hero

Recommended follow-up:
- add the missing database column in production when ready:
  ALTER TABLE app_users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

Not included in this hotfix:
- email verification / signup code flow
