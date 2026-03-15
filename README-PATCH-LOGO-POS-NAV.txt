Kryvexis OS logo + POS nav hotfix

Includes:
- entry logo swap using the uploaded logo
- entry screen cleanup for splash / intro / ignition / auth
- App.tsx import fix for ProductsPage
- POS moved to the top of the main navigation list

Apply:
Extract into repo root and overwrite files.
Commit:
git add frontend/src/layout/AppShell.tsx frontend/src/main.tsx frontend/src/App.tsx frontend/src/pages/AuthPage.tsx frontend/src/pages/SystemIgnitionPage.tsx frontend/src/styles/entry-logo-hotfix.css frontend/src/assets/kryvexis-logo-entry.png
git commit -m "Use uploaded entry logo and move POS higher in nav"
git push origin main
