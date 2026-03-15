Kryvexis OS Entry Logo Hotfix

Purpose:
Fix only the splash / ignition / intro / auth entry logo so it no longer shows the ugly white rectangle.

What is included:
- frontend/src/assets/kryvexis-logo-entry.png
  A cleaned entry-only logo asset with the white matte removed.
- frontend/src/App.tsx
  Splash and intro now use the entry-only asset.
- frontend/src/pages/AuthPage.tsx
  Auth screen now uses the entry-only asset.
- frontend/src/pages/SystemIgnitionPage.tsx
  Ignition screen now uses the entry-only asset.
- frontend/src/styles/entry-logo-hotfix.css
- fixed App.tsx import typo for ProductsPage
  Small sizing and shadow adjustments for the entry screens only.
- frontend/src/main.tsx
  Imports entry-logo-hotfix.css
- fixed App.tsx import typo for ProductsPage

Apply:
1. Extract into repo root.
2. Overwrite files.
3. Run:
   git add frontend/src/main.tsx frontend/src/App.tsx frontend/src/pages/AuthPage.tsx frontend/src/pages/SystemIgnitionPage.tsx frontend/src/styles/entry-logo-hotfix.css
- fixed App.tsx import typo for ProductsPage frontend/src/assets/kryvexis-logo-entry.png
   git commit -m "Fix entry screen logo asset and intro styling"
   git push origin main
