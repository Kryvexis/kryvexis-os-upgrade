Kryvexis OS Auth Permissions Hotfix

What changed:
- backend/src/auth/auth-service.js now reads role permissions from role_permissions instead of the legacy permissions table shape.

Why:
- Production Supabase now uses the split auth schema:
  - permissions(key, label)
  - role_permissions(role_key, permission_key)
- Login/session creation was still querying the old layout, causing: column "permission_key" does not exist.

Deploy:
- Commit the changed auth-service.js and this note, then push to main.
- Redeploy the backend.
