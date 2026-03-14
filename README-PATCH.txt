Kryvexis OS - Inventory Brain + Auth Entry Patch

What changed
- Added Inventory Brain endpoints:
  - GET /api/inventory/brain
  - GET /api/inventory/stock-risks
  - GET /api/inventory/transfers
  - GET /api/inventory/movement-intelligence
  - GET /api/inventory/exceptions
- Added a real /api/action-center endpoint and fed it Finance + Procurement + Inventory recommendations.
- Upgraded /api/products and /api/products/:id to return reservation-aware inventory rows.
- Added signup endpoint:
  - POST /api/auth/signup
- Upgraded the login screen into a proper login/signup entry page.
- Moved auth ahead of the splash/ignition flow so users authenticate before the cinematic startup experience.
- Upgraded the Products page into an Inventory Brain workspace with:
  - stock risk watchlist
  - transfer optimizer
  - movement intelligence
  - reservation-aware SKU table

Tested
- Backend syntax check passed.
- Frontend production build passed.
- Backend smoke tests passed on a clean port:
  - signup
  - login
  - inventory brain endpoint
  - action center endpoint

Files changed
- backend/server.js
- backend/src/auth/auth-service.js
- frontend/src/App.tsx
- frontend/src/lib/api.ts
- frontend/src/pages/AuthPage.tsx
- frontend/src/pages/ProductsPage.tsx
- frontend/src/types.ts
- README-PATCH.txt
