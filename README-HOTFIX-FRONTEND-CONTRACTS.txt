Kryvexis OS Frontend Contract Alignment Hotfix

Why this hotfix exists
- ActionCenterPage on main expects availableBranches, laneSummary, and branchSnapshots[].heat.
- ReportsPage on main expects financeSummary, transactionCore, topClients, and documentQueue.
- QuotesPage, InvoicesPage, PaymentsPage, and ProductsPage expect Create* payload types and InventoryOverview/api methods.
- frontend/src/types.ts and frontend/src/lib/api.ts on main were behind those page contracts, causing Vercel TypeScript build failure.

What changed
- Expanded frontend/src/types.ts to include:
  - Action Center v3 fields
  - Reports transaction/finance summary fields
  - inventory overview types
  - create payload types for quote/invoice/payment
- Expanded frontend/src/lib/api.ts to include:
  - actionCenter(role, branch, lane)
  - inventoryOverview()
  - createQuote()
  - createInvoice()
  - createPayment()
  - safer backend-first auth helpers with local fallback retained

Push
 git add frontend/src/types.ts frontend/src/lib/api.ts README-HOTFIX-FRONTEND-CONTRACTS.txt && git commit -m "Fix frontend type and API contracts for current pages" && git push origin main
