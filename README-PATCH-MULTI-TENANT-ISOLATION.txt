Kryvexis OS Multi-Tenant Isolation

Included in this package:
- backend workspace registry and active workspace switching
- isolated company profile / branding / branches / workspace users / import jobs per workspace
- workspace creation endpoint
- workspace switcher in the app shell for admin
- workspace visibility inside Workspace Admin

Files changed:
- backend/server.js
- frontend/src/layout/AppShell.tsx
- frontend/src/lib/api.ts
- frontend/src/pages/WorkspaceAdminPage.tsx
- frontend/src/types.ts

Smoke test completed:
- frontend build passed
- backend syntax check passed
- GET /api/workspaces passed
- POST /api/workspaces passed
- POST /api/workspaces/select passed
