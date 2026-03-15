Kryvexis OS POS backend routes hotfix

What this fixes
- Adds POST /api/invoices for POS invoice creation
- Adds POST /api/payments for POS payment capture
- Adds a direct POS button in the top bar next to Quick actions

How to apply
1. Extract this ZIP into your repo root.
2. Run:
   git apply --ignore-space-change --ignore-whitespace pos-backend-hotfix.patch
3. Commit and push:
   git add backend/server.js frontend/src/layout/AppShell.tsx
   git commit -m "Add POS create routes and top-bar POS shortcut"
   git push origin main

If git apply fails
- Open pos-backend-hotfix.patch
- Manually paste the two backend POST routes into backend/server.js
- Add the POS Link block into frontend/src/layout/AppShell.tsx before Quick actions
