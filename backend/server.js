import cors from "cors";
import express from "express";

const app = express();
const port = process.env.PORT || 4010;
app.use(cors());
app.use(express.json());

const roles = [
  { key: "admin", label: "Admin", description: "Full platform visibility, settings, automation rules, users, and audit access.", dashboards: ["system activity", "approvals", "branch health", "audit highlights"] },
  { key: "sales", label: "Sales", description: "Customers, quotes, invoices, statements, selected reports.", dashboards: ["quotes awaiting action", "invoices due", "customer balances", "recent communications"] },
  { key: "finance", label: "Finance", description: "Payments, debtors, statements, expenses, cash-up, selected approvals.", dashboards: ["debtor aging", "receipts today", "overdue accounts", "cash-up alerts"] },
  { key: "warehouse", label: "Warehouse", description: "Stock, movements, transfers, low stock, goods received.", dashboards: ["low stock", "pending transfers", "goods awaiting receipt", "delivery queue"] },
  { key: "procurement", label: "Procurement", description: "Suppliers, purchase orders, reorders, supplier bills.", dashboards: ["reorder candidates", "pending POs", "late suppliers", "unmatched supplier bills"] },
  { key: "operations", label: "Operations", description: "Deliveries, returns, tasks, approvals, operational dashboards.", dashboards: ["open deliveries", "returns pending", "tasks due", "dispatch exceptions"] },
  { key: "executive", label: "Executive", description: "Cross-module dashboards, approvals, reports, branch-specific controls.", dashboards: ["branch performance", "exceptions", "approvals", "growth indicators"] }
];

const customers = [
  { id: "CUS-001", name: "Acme Retail Group", owner: "Rina Patel", branch: "Johannesburg", status: "Needs follow-up", balance: "R27,400", risk: "Medium", creditTerms: "30 days", priceList: "Wholesale A", contact: "accounts@acmeretail.co.za", phone: "+27 11 555 0144", notes: "Payment discipline improved after Feb reminder cycle.", nextAction: "Call finance contact tomorrow", activity: ["Statement sent 2h ago", "Invoice INV-2201 marked overdue", "Sales follow-up scheduled for tomorrow"] },
  { id: "CUS-002", name: "Northline Foods", owner: "Alex Morgan", branch: "Cape Town", status: "Healthy", balance: "R8,920", risk: "Low", creditTerms: "14 days", priceList: "Hospitality", contact: "payables@northlinefoods.co.za", phone: "+27 21 555 0198", notes: "High repeat order volume.", nextAction: "Review March target expansion", activity: ["Invoice paid today", "New quote requested for refrigerated stock labels"] },
  { id: "CUS-003", name: "Urban Build Supply", owner: "Tariq Naidoo", branch: "Durban", status: "Approval watch", balance: "R61,800", risk: "Medium", creditTerms: "45 days", priceList: "Construction", contact: "ops@urbanbuild.co.za", phone: "+27 31 555 0112", notes: "High-value quote pending approval threshold.", nextAction: "Escalate quote approval", activity: ["Quote Q-1045 pending approval", "Commercial terms updated yesterday"] }
];

const products = [
  { id: "PRD-1001", sku: "SKU-1001", name: "Kryvexis Label Printer", branch: "Johannesburg", status: "Healthy", stock: 14, reorderAt: 10, price: "R2,499", cost: "R1,620", supplier: "Prime Devices", barcode: "6001001001001", variants: "Standard / Black", movementSummary: "2 units sold today", nextAction: "Review reorder coverage next week" },
  { id: "PRD-1021", sku: "SKU-1021", name: "Thermal Roll Box", branch: "Cape Town", status: "Low stock", stock: 8, reorderAt: 12, price: "R380", cost: "R210", supplier: "Cape Paper Supply", barcode: "6001001001021", variants: "80mm / 24 pack", movementSummary: "Threshold breached this morning", nextAction: "Create reorder candidate in Phase 2" },
  { id: "PRD-1033", sku: "SKU-1033", name: "Warehouse Scanner Dock", branch: "Johannesburg", status: "Healthy", stock: 21, reorderAt: 6, price: "R1,290", cost: "R790", supplier: "Prime Devices", barcode: "6001001001033", variants: "USB-C", movementSummary: "No movement today", nextAction: "Monitor top mover trend" }
];

const quotes = [
  { id: "Q-1045", customer: "Urban Build Supply", owner: "Alex Morgan", value: "R62,500", status: "Pending approval", validity: "2026-03-17", branch: "Durban", trigger: "High-value threshold", updated: "22 min ago", notes: "Requires sales manager approval before sending.", nextAction: "Finance review at 09:00 tomorrow" },
  { id: "Q-1042", customer: "Acme Retail Group", owner: "Rina Patel", value: "R18,960", status: "Sent to customer", validity: "2026-03-15", branch: "Johannesburg", trigger: "None", updated: "1 hour ago", notes: "Bundle pricing applied.", nextAction: "Await customer response" },
  { id: "Q-1039", customer: "Northline Foods", owner: "Alex Morgan", value: "R9,880", status: "Draft", validity: "2026-03-20", branch: "Cape Town", trigger: "Margin review", updated: "Today 08:42", notes: "Need final confirmation on line quantities.", nextAction: "Finish internal note check" }
];

const invoices = [
  { id: "INV-2201", customer: "Acme Retail Group", amount: "R12,440", branch: "Johannesburg", status: "Overdue", due: "Due today", source: "Q-1042", paymentStatus: "Partially paid", tax: "VAT standard", reminders: "First reminder sent", nextAction: "Finance follow-up call" },
  { id: "INV-2196", customer: "Northline Foods", amount: "R4,980", branch: "Cape Town", status: "Issued", due: "Due in 2 days", source: "Manual", paymentStatus: "Unpaid", tax: "VAT standard", reminders: "Scheduled at due date", nextAction: "Wait for due date" },
  { id: "INV-2192", customer: "Urban Build Supply", amount: "R28,600", branch: "Durban", status: "Awaiting allocation", due: "Due in 7 days", source: "Q-1033", paymentStatus: "Proof received", tax: "VAT standard", reminders: "Not started", nextAction: "Allocate receipt against invoice" }
];

const payments = [
  { id: "PAY-7701", ref: "PAY-7701", party: "Acme Retail Group", amount: "R7,400", method: "EFT", status: "Allocated", date: "Today 10:42", appliedTo: "INV-2201", proof: "Attached", nextAction: "Check remaining overdue balance" },
  { id: "PAY-7693", ref: "PAY-7693", party: "Northline Foods", amount: "R4,980", method: "Cash", status: "Pending proof", date: "Today 09:17", appliedTo: "INV-2196", proof: "Missing", nextAction: "Request proof attachment" },
  { id: "PAY-7688", ref: "PAY-7688", party: "Urban Build Supply", amount: "R12,000", method: "EFT", status: "Unallocated", date: "Yesterday 16:10", appliedTo: "To be assigned", proof: "Attached", nextAction: "Allocate to INV-2192" }
];

const notifications = [
  { id: "NT-1", title: "Quote approval required", meta: "Q-1045 - Sales", state: "Pending", read: false, type: "approval" },
  { id: "NT-2", title: "Invoice INV-2201 overdue", meta: "Acme Retail Group - Finance", state: "Urgent", read: false, type: "collection" },
  { id: "NT-3", title: "Low stock threshold reached", meta: "Thermal Roll Box - Procurement", state: "Alert", read: true, type: "stock" },
  { id: "NT-4", title: "Payment proof missing", meta: "PAY-7693 - Finance", state: "Action", read: false, type: "payment" }
];

const settings = {
  themes: ["dark", "light", "system"],
  paymentModes: ["EFT", "Cash"],
  density: ["comfortable", "compact"],
  supportEmail: "kryvexissolutions@gmail.com",
  whatsapp: "+27686282874",
  business: { currency: "ZAR", taxDefault: "VAT Standard", paymentTerms: "30 days", defaultBranch: "Johannesburg" }
};

const dashboardByRole = {
  admin: { kpis: [
      { label: "System activity", value: "342", detail: "Events in the last 24h" },
      { label: "Pending approvals", value: "6", detail: "Quotes and exceptions" },
      { label: "Branch health", value: "92%", detail: "Operational completion score" },
      { label: "Unread notifications", value: "11", detail: "Across all roles" }
    ], panels: [
      { title: "Approvals queue", items: ["Q-1045 high-value quote", "Payment exception PAY-7693", "Role change request for Cape Town"] },
      { title: "Audit highlights", items: ["Theme changed to system", "Invoice template updated", "Branch settings edited"] }
    ] },
  sales: { kpis: [
      { label: "Quotes awaiting action", value: "9", detail: "3 need approval" },
      { label: "Invoices due", value: "R45,230", detail: "12 active invoices" },
      { label: "Customer balances", value: "R98,120", detail: "Across key accounts" },
      { label: "Personal target", value: "74%", detail: "Month-to-date progress" }
    ], panels: [
      { title: "Follow-up focus", items: ["Call Acme Retail Group", "Send revised quote to Northline", "Approve Urban Build pricing note"] },
      { title: "Recent communications", items: ["Invoice reminder sent", "Quote viewed by customer", "Statement export completed"] }
    ] },
  finance: { kpis: [
      { label: "Debtor aging", value: "R184,900", detail: "31+ days: R42,300" },
      { label: "Receipts today", value: "R18,400", detail: "3 collections booked" },
      { label: "Overdue accounts", value: "12", detail: "5 need escalation" },
      { label: "Cash-up alerts", value: "1", detail: "Cape Town variance pending" }
    ], panels: [
      { title: "Collection actions", items: ["INV-2201 follow-up", "Allocate PAY-7688", "Send first reminder batch"] },
      { title: "Approvals and exceptions", items: ["Unallocated EFT review", "Missing proof on PAY-7693", "Tax override awaiting confirmation"] }
    ] }
};

function envelope(data, extra = {}) { return { ok: true, ...extra, data }; }
app.get('/health', (_req, res) => res.json({ status: 'ok', phase: 1, service: 'kryvexis-os-api' }));
app.get('/api/bootstrap', (_req, res) => res.json(envelope({ roles, themeOptions: settings.themes, support: { email: settings.supportEmail, whatsapp: settings.whatsapp } })));
app.get('/api/dashboard', (req, res) => {
  const role = req.query.role || 'admin';
  const dashboard = dashboardByRole[role] || dashboardByRole.admin;
  res.json(envelope({ role, ...dashboard, highlights: notifications.slice(0, 3), recentCustomers: customers.slice(0, 2), lowStockProducts: products.filter((item) => item.stock <= item.reorderAt) }));
});
function listRoute(path, collection) {
  app.get(`/api/${path}`, (_req, res) => res.json(envelope(collection)));
  app.get(`/api/${path}/:id`, (req, res) => {
    const item = collection.find((entry) => entry.id === req.params.id || entry.ref === req.params.id || entry.sku === req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: `${path} item not found` });
    res.json(envelope(item));
  });
}
listRoute('customers', customers);
listRoute('products', products);
listRoute('quotes', quotes);
listRoute('invoices', invoices);
listRoute('payments', payments);
listRoute('notifications', notifications);
app.get('/api/settings', (_req, res) => res.json(envelope(settings)));
app.get('/api/roles', (_req, res) => res.json(envelope(roles)));
app.listen(port, () => console.log(`Kryvexis OS Phase 1 backend running on ${port}`));
