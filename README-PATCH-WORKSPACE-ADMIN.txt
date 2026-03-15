Kryvexis OS Workspace Admin + Import Center v1

Included in this patch:
- New Workspace Admin page
- Company profile editing
- Document logo management for quotes/invoices
- Branch management (add/edit/primary/active)
- Workspace user invite flow
- Import Center v1 with CSV preview + commit log
- Admin navigation link for Workspace Admin
- Backend endpoints for workspace admin state

Changed files:
- backend/server.js
- frontend/src/App.tsx
- frontend/src/layout/AppShell.tsx
- frontend/src/lib/api.ts
- frontend/src/pages/WorkspaceAdminPage.tsx
- frontend/src/styles/global.css
- frontend/src/types.ts
- README-PATCH-WORKSPACE-ADMIN.txt

Smoke-tested:
- frontend production build passed
- backend syntax check passed
- GET /api/workspace-admin
- POST /api/workspace-admin/import-center/preview
- POST /api/workspace-admin/users/invite
