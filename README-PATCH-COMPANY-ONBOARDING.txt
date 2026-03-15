Kryvexis OS Company Onboarding

Included in this patch:
- company signup flow with branch-count onboarding
- optional document logo upload during signup
- local + API-backed company profile persistence
- quote and invoice print branding now uses uploaded document logo and company name
- settings payload now includes companyProfile and documentBranding when available

Files changed:
- backend/server.js
- frontend/src/components/DocumentPrintLayout.tsx
- frontend/src/lib/api.ts
- frontend/src/pages/AuthPage.tsx
- frontend/src/pages/InvoicePrintPage.tsx
- frontend/src/pages/QuotePrintPage.tsx
- frontend/src/styles/global.css
- frontend/src/types.ts
