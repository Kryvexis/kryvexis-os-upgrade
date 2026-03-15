Kryvexis OS POS backend full hotfix

Files included
- backend/server.js
- frontend/src/layout/AppShell.tsx

What this includes
- POST /api/invoices for POS invoice creation
- POST /api/payments for POS payment capture
- POS shortcut added in the top bar next to Quick actions

Apply
1. Extract this ZIP into your repo root.
2. Overwrite the included files.
3. Run:

git add backend/server.js frontend/src/layout/AppShell.tsx
git commit -m "Add POS create routes and top-bar POS shortcut"
git push origin main
