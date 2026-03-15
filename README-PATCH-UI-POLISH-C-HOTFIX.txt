Kryvexis_OS_UI_Polish_C_Hotfix

What this bundle does
- Applies the approved Direction C visual layer as an additive frontend hotfix.
- Keeps existing light / dark / system theme switching intact.
- Replaces the current logo asset with the transparent-background version you approved.
- Adds one new CSS overlay imported after the current global and ui-lock styles.

Files included
- frontend/src/main.tsx
- frontend/src/styles/ui-polish-c-hotfix.css
- frontend/src/assets/kryvexis-logo.png

How to apply
1. Extract this ZIP into your repo root.
2. Replace files when Windows asks.
3. Push with the one-line command below.
4. Redeploy Vercel.

One-line push
git add frontend/src/main.tsx frontend/src/styles/ui-polish-c-hotfix.css frontend/src/assets/kryvexis-logo.png README-PATCH-UI-POLISH-C-HOTFIX.txt && git commit -m "Apply Direction C UI hotfix and transparent logo" && git push origin main

Notes
- This is a visual hotfix bundle. It does not change backend auth behavior.
- The CSS layer is intentionally additive so it can sit on top of the current app without forcing a broad refactor.
