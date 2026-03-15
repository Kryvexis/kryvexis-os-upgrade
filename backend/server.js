import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { createSessionForEmail, revokeSession, switchSessionBranch, listRolePermissions } from './src/auth/auth-service.js';
import { attachSession, requireAuth, requirePermission } from './src/middleware/auth.js';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(attachSession);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const stateFile = path.join(dataDir, 'automation-state.json');

const DATABASE_URL = process.env.DATABASE_URL || '';
const ENABLE_SQL = process.env.USE_SQL_AUTOMATION === 'true' && Boolean(DATABASE_URL);
const pool = ENABLE_SQL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }
    })
  : null;

const roles = [
  { key: 'admin', label: 'Admin', description: 'Full platform visibility, settings, templates, automation rules, user management, audit access.', dashboards: ['system activity', 'approvals', 'branch health', 'audit highlights'] },
  { key: 'sales', label: 'Sales', description: 'Customers, quotes, invoices, statements, selected reports.', dashboards: ['quotes awaiting action', 'invoices due', 'customer balances', 'personal targets'] },
  { key: 'finance', label: 'Finance', description: 'Payments, debtors, creditors, statements, expenses, cash up.', dashboards: ['debtor aging', 'receipts today', 'overdue accounts', 'cash-up alerts'] },
  { key: 'warehouse', label: 'Warehouse', description: 'Stock, movements, transfers, low stock, goods received.', dashboards: ['low stock', 'pending transfers', 'awaiting receipt', 'delivery queue'] },
  { key: 'procurement', label: 'Procurement', description: 'Suppliers, purchase orders, reorders, supplier bills.', dashboards: ['reorder candidates', 'pending POs', 'late suppliers', 'unmatched supplier bills'] },
  { key: 'operations', label: 'Operations', description: 'Deliveries, returns, tasks, approvals, operational dashboards.', dashboards: ['open deliveries', 'returns pending', 'tasks due', 'dispatch exceptions'] },
  { key: 'manager', label: 'Manager', description: 'Branch leadership with reports, day close, staffing oversight, and branch performance.', dashboards: ['branch sales', 'cash-up status', 'daily target', 'exceptions'] },
  { key: 'executive', label: 'Executive', description: 'Cross-module dashboards, approvals, reports, branch-specific controls.', dashboards: ['branch performance', 'exceptions', 'approvals', 'growth indicators'] }
];

const customers = [
  { id: 'CUS-001', name: 'Acme Retail Group', owner: 'Rina Patel', branch: 'Johannesburg', status: 'Needs follow-up', balance: 'R27,400', risk: 'Medium', creditTerms: '30 days', priceList: 'Wholesale A', contact: 'accounts@acmeretail.co.za', phone: '+27 11 555 0144', notes: 'Payment discipline improved after the February reminder cycle.', nextAction: 'Call finance contact tomorrow', activity: ['Statement sent 2h ago', 'Invoice INV-2201 marked overdue', 'Sales follow-up scheduled for tomorrow'] },
  { id: 'CUS-002', name: 'Northline Foods', owner: 'Alex Morgan', branch: 'Cape Town', status: 'Healthy', balance: 'R8,920', risk: 'Low', creditTerms: '14 days', priceList: 'Hospitality', contact: 'payables@northlinefoods.co.za', phone: '+27 21 555 0198', notes: 'High repeat order volume and fast payment turnaround.', nextAction: 'Review March target expansion', activity: ['Invoice paid today', 'New quote requested for refrigerated stock labels'] },
  { id: 'CUS-003', name: 'Urban Build Supply', owner: 'Tariq Naidoo', branch: 'Durban', status: 'Approval watch', balance: 'R61,800', risk: 'Medium', creditTerms: '45 days', priceList: 'Construction', contact: 'ops@urbanbuild.co.za', phone: '+27 31 555 0112', notes: 'High-value quote pending approval threshold.', nextAction: 'Escalate quote approval', activity: ['Quote Q-1045 pending approval', 'Commercial terms updated yesterday'] }
];

const products = [
  { id: 'PRD-1001', sku: 'SKU-1001', name: 'Kryvexis Label Printer', branch: 'Johannesburg', status: 'Healthy', stock: 14, reorderAt: 10, price: 'R2,499', cost: 'R1,620', supplier: 'Prime Devices', barcode: '6001001001001', variants: 'Standard / Black', movementSummary: '2 units sold today', nextAction: 'Review reorder coverage next week' },
  { id: 'PRD-1021', sku: 'SKU-1021', name: 'Thermal Roll Box', branch: 'Cape Town', status: 'Low stock', stock: 8, reorderAt: 12, price: 'R380', cost: 'R210', supplier: 'Cape Paper Supply', barcode: '6001001001021', variants: '80mm / 24 pack', movementSummary: 'Threshold breached this morning', nextAction: 'Create reorder candidate in Phase 2' },
  { id: 'PRD-1033', sku: 'SKU-1033', name: 'Warehouse Scanner Dock', branch: 'Johannesburg', status: 'Healthy', stock: 21, reorderAt: 6, price: 'R1,290', cost: 'R790', supplier: 'Prime Devices', barcode: '6001001001033', variants: 'USB-C', movementSummary: 'No movement today', nextAction: 'Monitor top mover trend' }
];

const suppliers = [
  { id: 'SUP-001', name: 'Prime Devices', category: 'Hardware', leadTime: '5 days', status: 'On track', contact: 'orders@primedevices.co.za', nextAction: 'Release next scanner dock PO' },
  { id: 'SUP-002', name: 'Cape Paper Supply', category: 'Consumables', leadTime: '3 days', status: 'Attention', contact: 'dispatch@capepaper.co.za', nextAction: 'Confirm thermal roll replenishment' },
  { id: 'SUP-003', name: 'Metro Warehouse Goods', category: 'Warehouse', leadTime: '7 days', status: 'On track', contact: 'supply@metrowarehouse.co.za', nextAction: 'Review dock accessory pricing' }
];

const purchaseOrders = [
  { id: 'PO-3101', supplier: 'Cape Paper Supply', branch: 'Cape Town', status: 'Pending approval', value: 'R18,240', eta: '2026-03-15', buyer: 'Nadine Smit', nextAction: 'Approve reorder release' },
  { id: 'PO-3098', supplier: 'Prime Devices', branch: 'Johannesburg', status: 'Issued', value: 'R42,600', eta: '2026-03-17', buyer: 'Alex Morgan', nextAction: 'Track inbound scanner docks' },
  { id: 'PO-3094', supplier: 'Metro Warehouse Goods', branch: 'Durban', status: 'Goods received', value: 'R9,880', eta: '2026-03-10', buyer: 'Tariq Naidoo', nextAction: 'Match supplier bill to GRN' }
];

const networkInventory = [
  { sku: 'SKU-1001', name: 'Kryvexis Label Printer', branch: 'Johannesburg', stock: 14, reorderAt: 10, movementSummary: '2 units sold today', supplier: 'Prime Devices' },
  { sku: 'SKU-1001', name: 'Kryvexis Label Printer', branch: 'Cape Town', stock: 7, reorderAt: 8, movementSummary: 'Tender activity spiked this week', supplier: 'Prime Devices' },
  { sku: 'SKU-1021', name: 'Thermal Roll Box', branch: 'Cape Town', stock: 8, reorderAt: 12, movementSummary: 'Threshold breached this morning', supplier: 'Cape Paper Supply' },
  { sku: 'SKU-1021', name: 'Thermal Roll Box', branch: 'Johannesburg', stock: 26, reorderAt: 12, movementSummary: 'Steady movement with deep cover', supplier: 'Cape Paper Supply' },
  { sku: 'SKU-1021', name: 'Thermal Roll Box', branch: 'Durban', stock: 17, reorderAt: 10, movementSummary: 'Stable warehouse pull-through', supplier: 'Cape Paper Supply' },
  { sku: 'SKU-1033', name: 'Warehouse Scanner Dock', branch: 'Johannesburg', stock: 21, reorderAt: 6, movementSummary: 'No movement today', supplier: 'Prime Devices' },
  { sku: 'SKU-1033', name: 'Warehouse Scanner Dock', branch: 'Durban', stock: 4, reorderAt: 6, movementSummary: 'Receipt delay affecting dispatch prep', supplier: 'Prime Devices' }
];



function normalizeBranchName(branchIdOrName) {
  if (!branchIdOrName) return null;
  const branch = branchDirectory.find((item) => item.id === branchIdOrName || `BR-${item.id}` === branchIdOrName || item.name === branchIdOrName);
  return branch?.name || String(branchIdOrName).replace(/^BR-/, '');
}
function branchTransferCandidates(product) {
  return networkInventory
    .filter((entry) => entry.sku === product.sku && entry.branch !== product.branch)
    .map((entry) => ({
      branch: entry.branch,
      stock: entry.stock,
      reorderAt: entry.reorderAt,
      surplus: Math.max(entry.stock - entry.reorderAt, 0),
      movementSummary: entry.movementSummary
    }))
    .filter((entry) => entry.surplus > 0)
    .sort((a, b) => b.surplus - a.surplus);
}
function buildReservationPressure() {
  const reservedBySku = new Map();
  const activeQuoteStatuses = new Set(['Pending approval', 'Approved', 'Sent to customer']);
  for (const quote of quotes) {
    if (!activeQuoteStatuses.has(quote.status)) continue;
    for (const line of quote.lines || []) {
      const current = reservedBySku.get(line.sku) || { quoteQty: 0, invoiceQty: 0, customerPressure: 0 };
      current.quoteQty += Number(line.qty || 0);
      current.customerPressure += 1;
      reservedBySku.set(line.sku, current);
    }
  }
  for (const invoice of invoices) {
    if (invoice.paymentStatus === 'Paid') continue;
    const sourceQuote = quotes.find((item) => item.id === invoice.source);
    for (const line of sourceQuote?.lines || []) {
      const current = reservedBySku.get(line.sku) || { quoteQty: 0, invoiceQty: 0, customerPressure: 0 };
      current.invoiceQty += Number(line.qty || 0);
      current.customerPressure += 1;
      reservedBySku.set(line.sku, current);
    }
  }
  return reservedBySku;
}
function classifyMovement(summary = '') {
  const text = String(summary).toLowerCase();
  if (/(spike|breached|fast|sold today|high movement)/.test(text)) return { band: 'Fast mover', riskBoost: 10, note: 'Demand is running hotter than normal.' };
  if (/(delay|receipt|abnormal|exception)/.test(text)) return { band: 'Abnormal', riskBoost: 14, note: 'Movement pattern suggests an operational exception.' };
  if (/(no movement|slow|idle)/.test(text)) return { band: 'Slow mover', riskBoost: -4, note: 'Movement is quiet and cover is likely stable.' };
  return { band: 'Steady', riskBoost: 0, note: 'Movement is within expected operating rhythm.' };
}
function buildInventoryRows() {
  const reservations = buildReservationPressure();
  return products.map((product) => {
    const reserve = reservations.get(product.sku) || { quoteQty: 0, invoiceQty: 0, customerPressure: 0 };
    const reserved = reserve.quoteQty + reserve.invoiceQty;
    const freeToSell = Math.max(product.stock - reserved, 0);
    const coverGap = product.reorderAt - freeToSell;
    const movement = classifyMovement(product.movementSummary);
    const transfers = branchTransferCandidates(product);
    const stockRiskScore = Math.max(18, Math.min(98, 55 + Math.max(coverGap, 0) * 6 + reserve.customerPressure * 5 + movement.riskBoost + (product.status === 'Low stock' ? 8 : 0)));
    const riskBand = coverGap > 6 ? 'Critical' : coverGap > 0 ? 'High' : freeToSell <= product.reorderAt + 2 ? 'Watch' : 'Healthy';
    const buyShortfallOnly = Math.max(coverGap - (transfers[0]?.surplus || 0), 0);
    const suggestedTransferUnits = coverGap > 0 ? Math.min(Math.max(coverGap, 0), transfers[0]?.surplus || 0) : 0;
    const recommendation = coverGap > 0
      ? suggestedTransferUnits > 0
        ? `Move ${suggestedTransferUnits} units from ${transfers[0].branch} first, then buy only ${buyShortfallOnly || 0} more if demand holds.`
        : `No internal cover is available. Raise a buy recommendation for ${coverGap + Math.max(3, Math.floor(product.reorderAt / 2))} units.`
      : movement.band === 'Slow mover'
        ? 'Hold buying and keep this SKU under slow-mover watch.'
        : 'No urgent action. Keep monitoring branch demand.'
    return {
      id: product.id,
      sku: product.sku,
      product: product.name,
      name: product.name,
      branch: product.branch,
      supplier: product.supplier,
      stock: product.stock,
      onHand: product.stock,
      reserved,
      freeToSell,
      reorderAt: product.reorderAt,
      coverGap,
      riskBand,
      stockRiskScore,
      movementBand: movement.band,
      movementSummary: product.movementSummary,
      movementInsight: movement.note,
      transferOptions: transfers,
      suggestedTransferUnits,
      buyShortfallOnly,
      recommendation,
      nextAction: recommendation,
      status: riskBand === 'Healthy' ? product.status : `${riskBand} cover`,
      barcode: product.barcode,
      variants: product.variants,
      price: product.price,
      cost: product.cost
    };
  }).sort((a, b) => b.stockRiskScore - a.stockRiskScore);
}
function buildInventoryKpis(rows) {
  return [
    { label: 'Critical stock risks', value: String(rows.filter((item) => item.riskBand === 'Critical').length), detail: 'SKUs where free stock is materially below safe cover.' },
    { label: 'Units reserved', value: String(rows.reduce((sum, item) => sum + item.reserved, 0)), detail: 'Quote and invoice demand already consuming stock.' },
    { label: 'Transfer-first saves', value: String(rows.filter((item) => item.suggestedTransferUnits > 0).length), detail: 'Cases where internal stock can reduce buying.' },
    { label: 'Movement anomalies', value: String(rows.filter((item) => item.movementBand === 'Abnormal').length), detail: 'Products showing unusual movement or receipt pressure.' }
  ];
}
function buildStockRisks(rows = buildInventoryRows()) {
  return rows.map((item) => ({
    id: `ISR-${item.id}`,
    sku: item.sku,
    product: item.product,
    branch: item.branch,
    onHand: item.onHand,
    reserved: item.reserved,
    freeToSell: item.freeToSell,
    reorderAt: item.reorderAt,
    coverGap: item.coverGap,
    riskBand: item.riskBand,
    score: item.stockRiskScore,
    recommendation: item.recommendation
  }));
}
function buildTransferSuggestions(rows = buildInventoryRows()) {
  return rows
    .filter((item) => item.suggestedTransferUnits > 0 || item.coverGap > 0)
    .map((item) => ({
      id: `TR-${item.id}`,
      sku: item.sku,
      product: item.product,
      toBranch: item.branch,
      fromBranch: item.transferOptions[0]?.branch || 'Buy externally',
      suggestedUnits: item.suggestedTransferUnits,
      coverGap: item.coverGap,
      buyShortfallOnly: item.buyShortfallOnly,
      urgency: item.riskBand,
      score: item.stockRiskScore,
      recommendation: item.recommendation
    }))
    .sort((a, b) => b.score - a.score);
}
function buildMovementIntelligence(rows = buildInventoryRows()) {
  return rows.map((item) => ({
    id: `MOV-${item.id}`,
    sku: item.sku,
    product: item.product,
    branch: item.branch,
    movementBand: item.movementBand,
    summary: item.movementSummary,
    insight: item.movementInsight,
    score: item.stockRiskScore,
    recommendation: item.movementBand === 'Fast mover' && item.coverGap > 0 ? 'Protect cover immediately; this demand trend is now risky.' : item.movementBand === 'Abnormal' ? 'Investigate receipts, counting, or dispatch flow before the next cycle.' : item.movementBand === 'Slow mover' ? 'Pause any aggressive buying until movement improves.' : 'Movement is healthy for now.'
  })).sort((a, b) => b.score - a.score);
}
function buildInventoryExceptions(rows = buildInventoryRows()) {
  return rows
    .filter((item) => item.riskBand !== 'Healthy' || item.movementBand === 'Abnormal')
    .map((item) => ({
      id: `IEX-${item.id}`,
      title: item.riskBand === 'Critical' ? `${item.product} is at immediate stockout risk` : item.movementBand === 'Abnormal' ? `${item.product} has an abnormal movement signal` : `${item.product} is below safe free-to-sell cover`,
      severity: item.riskBand === 'Critical' ? 'High' : item.movementBand === 'Abnormal' ? 'Medium' : 'Watch',
      branch: item.branch,
      detail: `${item.product} has ${item.onHand} on hand, ${item.reserved} reserved, and ${item.freeToSell} free to sell against a reorder point of ${item.reorderAt}.`,
      action: item.suggestedTransferUnits > 0 ? `Transfer ${item.suggestedTransferUnits} units from ${item.transferOptions[0].branch}` : item.coverGap > 0 ? 'Raise replenishment or approve buy-shortfall plan' : 'Review movement history',
      recordPath: `/products/${item.id}`
    }))
    .sort((a, b) => (a.severity === 'High' ? -1 : 1));
}
function buildInventoryFocus(rows = buildInventoryRows()) {
  return rows.slice(0, 5).map((item) => ({
    id: `IF-${item.id}`,
    title: item.product,
    detail: item.recommendation,
    impact: item.riskBand === 'Critical' ? 'Protect branch readiness and avoid missed sales.' : 'Reduce noise by acting only where cover is actually stressed.',
    actionLabel: item.suggestedTransferUnits > 0 ? 'Open transfer plan' : 'Open stock record',
    recordPath: `/products/${item.id}`,
    priority: item.riskBand === 'Critical' ? 'high' : item.riskBand === 'High' ? 'medium' : 'low',
    domain: item.suggestedTransferUnits > 0 ? 'transfer' : 'stock-risk'
  }));
}
function buildInventoryOverview() {
  const rows = buildInventoryRows();
  return {
    generatedAt: new Date().toISOString(),
    kpis: buildInventoryKpis(rows),
    focus: buildInventoryFocus(rows),
    stockRisks: buildStockRisks(rows),
    transferSuggestions: buildTransferSuggestions(rows),
    movementIntelligence: buildMovementIntelligence(rows),
    exceptions: buildInventoryExceptions(rows),
    rows
  };
}

function buildDebtorRows() {
  return customers.map((customer) => {
    const linkedInvoices = invoices.filter((item) => item.customerId === customer.id);
    const overdueTotal = linkedInvoices.filter((item) => /overdue|collections/i.test(item.status)).reduce((sum, item) => sum + numericAmount(item.amount), 0);
    const currentTotal = linkedInvoices.filter((item) => !/overdue|collections/i.test(item.status) && item.paymentStatus !== 'Settled').reduce((sum, item) => sum + numericAmount(item.amount), 0);
    const riskScore = Math.min(99, Math.round((overdueTotal / 1000) + (customer.risk === 'High' ? 28 : customer.risk === 'Medium' ? 16 : 8) + linkedInvoices.length * 3));
    return {
      id: `DEBT-${customer.id}`,
      customerId: customer.id,
      customer: customer.name,
      branch: customer.branch,
      overdueAmount: formatCurrency(overdueTotal),
      currentAmount: formatCurrency(currentTotal),
      totalOpen: formatCurrency(overdueTotal + currentTotal),
      oldestBucket: overdueTotal > 0 ? '31+ days' : 'Current',
      risk: riskScore >= 80 ? 'Critical' : riskScore >= 60 ? 'High' : 'Watch',
      recommendation: overdueTotal > 0 ? 'Call debtor and issue statement now.' : currentTotal > 0 ? 'Keep on polite reminder cadence.' : 'No collections pressure right now.',
      score: riskScore
    };
  }).sort((a, b) => b.score - a.score);
}

function buildStatementRows() {
  return buildDebtorRows().map((item) => ({
    id: `STM-${item.customerId}`,
    customerId: item.customerId,
    customer: item.customer,
    branch: item.branch,
    balance: item.totalOpen,
    overdueInvoices: invoices.filter((entry) => entry.customerId === item.customerId && /overdue|collections/i.test(entry.status)).length,
    lastIssued: item.score >= 70 ? 'Today 09:12' : 'Yesterday 16:30',
    nextAction: item.score >= 70 ? 'Send refreshed statement now' : 'Keep standard statement cadence',
    status: item.score >= 70 ? 'Priority' : 'Healthy'
  }));
}

function buildFinanceBrain() {
  const debtorActions = buildDebtorRows().slice(0, 5).map((item) => ({
    id: `FB-DEBT-${item.customerId}`,
    domain: 'Finance',
    title: `${item.customer} collections pressure is building`,
    detail: `${item.overdueAmount} overdue and ${item.totalOpen} still open across the account.`,
    reason: item.recommendation,
    owner: 'Finance',
    branch: item.branch,
    priority: item.score >= 82 ? 'critical' : item.score >= 65 ? 'high' : 'medium',
    score: item.score,
    impact: 'Protect cash conversion and customer payment discipline.',
    actionLabel: item.score >= 82 ? 'Call debtor now' : 'Open debtor card',
    recordPath: `/customers/${item.customerId}`,
    status: item.risk,
    autoReady: false
  }));

  const paymentActions = payments.filter((item) => item.status === 'Pending proof' || item.status === 'Unallocated').map((item) => ({
    id: `FB-PAY-${item.id}`,
    domain: 'Finance',
    title: item.status === 'Pending proof' ? `${item.party} payment still needs proof` : `${item.party} payment is ready for allocation`,
    detail: `${item.ref} for ${item.amount} is ${item.status.toLowerCase()} and still interrupting a clean close loop.`,
    reason: item.status === 'Pending proof' ? 'Proof missing keeps the receipt from becoming audit-safe.' : 'Allocation is the fastest way to clean debtor visibility.',
    owner: 'Finance',
    branch: findCustomer(item.customerId)?.branch || 'Finance',
    priority: item.status === 'Unallocated' ? 'high' : 'medium',
    score: item.status === 'Unallocated' ? 86 : 74,
    impact: 'Reduce exception noise and clean receipting before close.',
    actionLabel: item.status === 'Pending proof' ? 'Resolve proof' : 'Allocate payment',
    recordPath: `/payments/${item.id}`,
    status: item.status,
    autoReady: item.status === 'Unallocated'
  }));

  const statementActions = buildStatementRows().filter((item) => item.status === 'Priority').slice(0, 3).map((item) => ({
    id: `FB-STM-${item.customerId}`,
    domain: 'Finance',
    title: `${item.customer} should receive a fresh statement`,
    detail: `${item.balance} remains open and the account has ${item.overdueInvoices} overdue invoices.`,
    reason: 'Fresh statements accelerate calls, reminders, and dispute clearing.',
    owner: 'Finance',
    branch: item.branch,
    priority: 'medium',
    score: 68,
    impact: 'Move collections faster with cleaner customer visibility.',
    actionLabel: 'Send statement',
    recordPath: '/accounting/statements',
    status: item.status,
    autoReady: true
  }));

  return [...debtorActions, ...paymentActions, ...statementActions].sort((a, b) => b.score - a.score);
}

function buildFinanceExceptions() {
  return buildFinanceBrain().map((item) => ({
    id: `FEX-${item.id}`,
    kind: item.title.toLowerCase().includes('statement') ? 'statements' : item.title.toLowerCase().includes('payment') ? 'payments' : 'collections',
    title: item.title,
    branch: item.branch,
    severity: item.priority === 'critical' ? 'High' : item.priority === 'high' ? 'Medium' : 'Watch',
    detail: item.detail,
    action: item.actionLabel,
    recordPath: item.recordPath
  }));
}

function buildActionCenter(role = 'admin', scope = 'all', lane = 'all') {
  const financeActions = buildFinanceBrain();
  const procurementActions = buildProcurementExceptions().map((item, index) => ({
    id: `PRO-${index}-${item.id}`,
    domain: 'Procurement',
    title: item.title,
    detail: item.detail,
    reason: item.action,
    owner: 'Procurement',
    branch: item.branch,
    priority: item.severity === 'High' ? 'high' : 'medium',
    score: item.severity === 'High' ? 88 : 72,
    impact: 'Protect stock cover and supplier flow.',
    actionLabel: item.action,
    recordPath: item.recordPath,
    status: item.severity,
    autoReady: true
  }));
  const inventoryActions = buildInventoryExceptions().map((item, index) => ({
    id: `INV-${index}-${item.id}`,
    domain: 'Inventory',
    title: item.title,
    detail: item.detail,
    reason: item.action,
    owner: 'Warehouse',
    branch: item.branch,
    priority: item.severity === 'High' ? 'critical' : item.severity === 'Medium' ? 'high' : 'medium',
    score: item.severity === 'High' ? 95 : item.severity === 'Medium' ? 84 : 70,
    impact: 'Reduce stockouts before they hit sales and dispatch.',
    actionLabel: item.action,
    recordPath: item.recordPath,
    status: item.severity,
    autoReady: item.action.toLowerCase().includes('transfer')
  }));
  const notificationActions = activeNotifications().map((item) => ({
    ...operationalActionForNotification(item),
    domain: 'Operational',
    reason: item.meta,
    impact: 'Keep the inbox from becoming operational drag.',
    score: item.state === 'Urgent' ? 91 : item.state === 'Action' ? 76 : 62,
    autoReady: false
  }));
  const roleActions = [...financeActions, ...procurementActions, ...inventoryActions, ...notificationActions]
    .filter((item) => isVisibleForBranch(item.branch, scope) || item.branch === 'System')
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      lane: index < 5 ? 'top-focus' : item.autoReady ? 'quick-win' : item.priority === 'critical' || item.priority === 'high' ? 'blocked' : 'watch'
    }));
  const filtered = lane === 'all' ? roleActions : roleActions.filter((item) => item.lane === lane);
  const branches = Array.from(new Set(roleActions.map((item) => item.branch).filter(Boolean)));
  return {
    generatedAt: new Date().toISOString(),
    topFocus: roleActions.slice(0, 5),
    quickWins: roleActions.filter((item) => item.lane === 'quick-win').slice(0, 6),
    recommendationFeed: filtered,
    domainSummaries: ['Finance', 'Procurement', 'Inventory', 'Operational'].map((domain) => {
      const items = roleActions.filter((item) => item.domain === domain);
      return {
        domain,
        count: items.length,
        urgent: items.filter((item) => item.priority === 'critical' || item.priority === 'high').length,
        headline: items[0]?.title || `${domain} is stable`,
        impact: domain === 'Inventory' ? 'Stock cover, transfer flow, and movement pressure.' : domain === 'Procurement' ? 'Reorders, suppliers, and PO pressure.' : domain === 'Operational' ? 'Alerts, blockers, and follow-through.' : 'Collections, statements, and payment allocation.'
      };
    }),
    branchSnapshots: buildBranchSnapshots().map((item) => ({ ...item, heat: item.approvals + item.collections + item.exceptions })).filter((item) => scope === 'all' || item.branch === normalizeBranchScope(scope)),
    auditHighlights: auditLog.slice(0, 6),
    availableBranches: ['all', ...branches],
    laneSummary: {
      all: roleActions.length,
      'top-focus': roleActions.filter((item) => item.lane === 'top-focus').length,
      'quick-win': roleActions.filter((item) => item.lane === 'quick-win').length,
      blocked: roleActions.filter((item) => item.lane === 'blocked').length,
      watch: roleActions.filter((item) => item.lane === 'watch').length
    }
  };
}

function buildProcurementReorders() {
  return products.map((item) => {
    const deficit = Math.max(item.reorderAt - item.stock, 0);
    const score = deficit > 0 ? 70 + Math.min(deficit * 4, 20) : Math.max(32, 58 - Math.max(item.stock - item.reorderAt, 0));
    const urgency = deficit > 4 ? 'Critical' : deficit > 0 ? 'High' : item.stock <= item.reorderAt + 2 ? 'Watch' : 'Stable';
    const recommendation = deficit > 0
      ? `Raise replenishment for ${deficit + Math.max(4, item.reorderAt)} units via ${item.supplier}.`
      : `Hold buying and keep ${item.branch} under watch.`;
    return { id: `REO-${item.id}`, sku: item.sku, product: item.name, branch: item.branch, stock: item.stock, reorderAt: item.reorderAt, deficit, supplier: item.supplier, urgency, recommendation, score };
  }).sort((a, b) => b.score - a.score);
}

function buildSupplierInsights() {
  return suppliers.map((item) => {
    const score = item.status === 'Attention' ? 62 : 84;
    const reliability = item.status === 'Attention' ? 'Needs watch' : 'Reliable';
    const recommendation = item.status === 'Attention'
      ? `Call ${item.name} now and confirm the next dispatch slot.`
      : `Keep ${item.name} as preferred supplier for the next release.`;
    return { id: item.id, supplier: item.name, category: item.category, leadTime: item.leadTime, status: item.status, reliability, score, recommendation };
  }).sort((a, b) => b.score - a.score);
}

function buildProcurementPurchaseOrders() {
  return purchaseOrders.map((item) => {
    let score = 58;
    let recommendation = item.nextAction;
    if (item.status === 'Pending approval') { score = 92; recommendation = 'Approve now to avoid stock pressure.'; }
    else if (item.status === 'Issued') { score = 74; recommendation = 'Track ETA and prepare receipt cover.'; }
    else if (item.status === 'Goods received') { score = 81; recommendation = 'Complete GRN and supplier-bill match before release.'; }
    return { ...item, recommendation, score };
  }).sort((a, b) => b.score - a.score);
}

function buildProcurementExceptions() {
  return [
    { id: 'PEX-1', title: 'Thermal roll replenishment below safe cover', severity: 'High', branch: 'Cape Town', detail: 'Consumables cover has fallen below reorder threshold and is now affecting checkout readiness.', action: 'Approve reorder now', recordPath: '/procurement/reorders' },
    { id: 'PEX-2', title: 'Supplier bill still unmatched to GRN', severity: 'Medium', branch: 'Durban', detail: 'PO-3094 has goods received status but finance cannot release payment until the bill is matched.', action: 'Match bill to GRN', recordPath: '/procurement/purchase-orders' },
    { id: 'PEX-3', title: 'Supplier reliability needs confirmation', severity: 'Medium', branch: 'Cape Town', detail: 'Cape Paper Supply is flagged Attention and should be called before the next replenishment window.', action: 'Confirm dispatch slot', recordPath: '/procurement/suppliers' }
  ];
}

function buildProcurementOverview() {
  const reorders = buildProcurementReorders();
  const suppliers = buildSupplierInsights();
  const purchaseOrders = buildProcurementPurchaseOrders();
  const exceptions = buildProcurementExceptions();
  return {
    kpis: [
      { label: 'Priority buys', value: String(reorders.filter((item) => item.deficit > 0).length), detail: 'SKUs below safe reorder cover today.' },
      { label: 'Suppliers watched', value: String(suppliers.filter((item) => item.status !== 'On track').length), detail: 'Suppliers requiring active follow-up.' },
      { label: 'PO actions', value: String(purchaseOrders.filter((item) => item.score >= 74).length), detail: 'Purchase orders needing approval, chase, or match.' },
      { label: 'Exceptions', value: String(exceptions.length), detail: 'Abnormal procurement conditions surfaced now.' }
    ],
    focus: [
      { id: 'PFO-1', title: 'Approve Cape Town replenishment now', detail: 'Thermal roll stock is below threshold and will pressure front-line trading if delayed.', impact: 'Prevents a near-term stockout in consumables.', actionLabel: 'Approve reorder', recordPath: '/procurement/reorders', priority: 'high', domain: 'reorder' },
      { id: 'PFO-2', title: 'Clear the unmatched Durban supplier bill', detail: 'Goods have landed, but payment release is blocked until GRN matching is complete.', impact: 'Unblocks supplier settlement and keeps procurement clean.', actionLabel: 'Match supplier bill', recordPath: '/procurement/purchase-orders', priority: 'medium', domain: 'exception' },
      { id: 'PFO-3', title: 'Confirm Cape Paper Supply dispatch slot', detail: 'Supplier is under watch and should be confirmed before the next buy wave.', impact: 'Reduces ETA uncertainty on the most urgent replenishment.', actionLabel: 'Call supplier', recordPath: '/procurement/suppliers', priority: 'medium', domain: 'supplier' }
    ],
    reorders,
    suppliers,
    purchaseOrders,
    exceptions
  };
}

const quotes = [
  {
    id: 'Q-1045', customerId: 'CUS-003', customer: 'Urban Build Supply', owner: 'Alex Morgan', value: 'R62,500', status: 'Pending approval', validity: '2026-03-17', branch: 'Durban', trigger: 'High-value threshold', updated: '22 min ago', notes: 'Requires sales manager approval before sending.', nextAction: 'Finance review at 09:00 tomorrow', subtotal: 'R54,347.83', tax: 'R8,152.17', total: 'R62,500', marginBand: 'Protected margin', approvalOwner: 'Sales Manager',
    lines: [
      { id: 'QL-1', sku: 'SKU-1001', description: 'Kryvexis Label Printer', qty: 12, unitPrice: 'R2,499', total: 'R29,988' },
      { id: 'QL-2', sku: 'SKU-1021', description: 'Thermal Roll Box', qty: 45, unitPrice: 'R380', total: 'R17,100' },
      { id: 'QL-3', sku: 'SKU-1033', description: 'Warehouse Scanner Dock', qty: 12, unitPrice: 'R1,290', total: 'R15,480' }
    ],
    workflow: [
      { label: 'Drafted', detail: 'Quote created by Alex Morgan at 08:12 today' },
      { label: 'Margin review', detail: 'Protected margin confirmed on scanner dock bundle' },
      { label: 'Approval hold', detail: 'High-value threshold requires manager approval before sending' },
      { label: 'Next step', detail: 'Convert to invoice draft after approval and customer acceptance' }
    ]
  },
  {
    id: 'Q-1042', customerId: 'CUS-001', customer: 'Acme Retail Group', owner: 'Rina Patel', value: 'R18,960', status: 'Sent to customer', validity: '2026-03-15', branch: 'Johannesburg', trigger: 'None', updated: '1 hour ago', notes: 'Bundle pricing applied.', nextAction: 'Await customer response', subtotal: 'R16,486.96', tax: 'R2,473.04', total: 'R18,960', marginBand: 'Standard margin', approvalOwner: 'Not required',
    lines: [
      { id: 'QL-4', sku: 'SKU-1001', description: 'Kryvexis Label Printer', qty: 4, unitPrice: 'R2,499', total: 'R9,996' },
      { id: 'QL-5', sku: 'SKU-1021', description: 'Thermal Roll Box', qty: 12, unitPrice: 'R380', total: 'R4,560' },
      { id: 'QL-6', sku: 'SKU-1033', description: 'Warehouse Scanner Dock', qty: 3, unitPrice: 'R1,290', total: 'R3,870' }
    ],
    workflow: [
      { label: 'Drafted', detail: 'Sales owner prepared the quote this morning' },
      { label: 'Sent', detail: 'Customer received the quote and email audit logged delivery' },
      { label: 'Next step', detail: 'Watch for acceptance and convert to invoice if approved' }
    ]
  },
  {
    id: 'Q-1039', customerId: 'CUS-002', customer: 'Northline Foods', owner: 'Alex Morgan', value: 'R9,880', status: 'Draft', validity: '2026-03-20', branch: 'Cape Town', trigger: 'Margin review', updated: 'Today 08:42', notes: 'Need final confirmation on line quantities.', nextAction: 'Finish internal note check', subtotal: 'R8,591.30', tax: 'R1,288.70', total: 'R9,880', marginBand: 'Review required', approvalOwner: 'Sales Lead',
    lines: [
      { id: 'QL-7', sku: 'SKU-1021', description: 'Thermal Roll Box', qty: 20, unitPrice: 'R380', total: 'R7,600' },
      { id: 'QL-8', sku: 'SKU-1033', description: 'Warehouse Scanner Dock', qty: 2, unitPrice: 'R1,140', total: 'R2,280' }
    ],
    workflow: [
      { label: 'Drafted', detail: 'Line quantities captured for Northline Foods expansion' },
      { label: 'Review', detail: 'Waiting for internal check before customer send' }
    ]
  }
];

const invoices = [
  { id: 'INV-2201', customerId: 'CUS-001', customer: 'Acme Retail Group', amount: 'R12,440', branch: 'Johannesburg', status: 'Overdue', due: 'Due today', source: 'Q-1042', paymentStatus: 'Partially paid', tax: 'VAT standard', reminders: 'First reminder sent', nextAction: 'Finance follow-up call' },
  { id: 'INV-2196', customerId: 'CUS-002', customer: 'Northline Foods', amount: 'R4,980', branch: 'Cape Town', status: 'Issued', due: 'Due in 2 days', source: 'Manual', paymentStatus: 'Unpaid', tax: 'VAT standard', reminders: 'Scheduled at due date', nextAction: 'Wait for due date' },
  { id: 'INV-2192', customerId: 'CUS-003', customer: 'Urban Build Supply', amount: 'R28,600', branch: 'Durban', status: 'Awaiting allocation', due: 'Due in 7 days', source: 'Q-1033', paymentStatus: 'Proof received', tax: 'VAT standard', reminders: 'Not started', nextAction: 'Allocate receipt against invoice' },
  { id: 'INV-2186', customerId: 'CUS-001', customer: 'Acme Retail Group', amount: 'R15,640', branch: 'Johannesburg', status: 'Paid', due: 'Paid 5 days ago', source: 'Q-1038', paymentStatus: 'Settled', tax: 'VAT standard', reminders: 'Closed', nextAction: 'Monitor repeat order window' }
];

const payments = [
  { id: 'PAY-7701', ref: 'PAY-7701', customerId: 'CUS-001', party: 'Acme Retail Group', amount: 'R7,400', method: 'EFT', status: 'Allocated', date: 'Today 10:42', appliedTo: 'INV-2201', proof: 'Attached', nextAction: 'Check remaining overdue balance' },
  { id: 'PAY-7693', ref: 'PAY-7693', customerId: 'CUS-002', party: 'Northline Foods', amount: 'R4,980', method: 'Cash', status: 'Pending proof', date: 'Today 09:17', appliedTo: 'INV-2196', proof: 'Missing', nextAction: 'Request proof attachment' },
  { id: 'PAY-7688', ref: 'PAY-7688', customerId: 'CUS-003', party: 'Urban Build Supply', amount: 'R12,000', method: 'EFT', status: 'Unallocated', date: 'Yesterday 16:10', appliedTo: 'To be assigned', proof: 'Attached', nextAction: 'Allocate to INV-2192' },
  { id: 'PAY-7679', ref: 'PAY-7679', customerId: 'CUS-001', party: 'Acme Retail Group', amount: 'R15,640', method: 'EFT', status: 'Allocated', date: '2026-03-04', appliedTo: 'INV-2186', proof: 'Attached', nextAction: 'No action' }
];

let notifications = [
  { id: 'NT-1', title: 'Quote approval required', meta: 'Q-1045 - Sales', state: 'Pending', read: false, type: 'approval', dismissed: false, snoozedUntil: null },
  { id: 'NT-2', title: 'Invoice INV-2201 overdue', meta: 'Acme Retail Group - Finance', state: 'Urgent', read: false, type: 'collection', dismissed: false, snoozedUntil: null },
  { id: 'NT-3', title: 'Low stock threshold reached', meta: 'Thermal Roll Box - Procurement', state: 'Alert', read: true, type: 'stock', dismissed: false, snoozedUntil: null },
  { id: 'NT-4', title: 'Payment proof missing', meta: 'PAY-7693 - Finance', state: 'Action', read: false, type: 'payment', dismissed: false, snoozedUntil: null },
  { id: 'NT-5', title: 'Payment awaiting allocation', meta: 'PAY-7688 - Finance', state: 'Action', read: false, type: 'payment', dismissed: false, snoozedUntil: null }
];

const settings = {
  themes: ['dark', 'light', 'system'],
  paymentModes: ['EFT', 'Cash'],
  density: ['comfortable', 'compact'],
  supportEmail: 'kryvexissolutions@gmail.com',
  whatsapp: '+27686282874',
  business: { currency: 'ZAR', taxDefault: 'VAT Standard', paymentTerms: '30 days', defaultBranch: 'Johannesburg' }
};

const branchDirectory = [
  { id: 'JHB', name: 'Johannesburg', managerName: 'Nadine Smit', managerEmail: 'jhb.manager@kryvexis.local' },
  { id: 'CPT', name: 'Cape Town', managerName: 'Rina Patel', managerEmail: 'cpt.manager@kryvexis.local' },
  { id: 'DBN', name: 'Durban', managerName: 'Tariq Naidoo', managerEmail: 'dbn.manager@kryvexis.local' }
];

function normalizeBranchKey(value) {
  return String(value || '').trim().toLowerCase().replace(/^br-/, '').replace(/[^a-z]/g, '');
}

function findBranchByIdOrName(value) {
  const key = normalizeBranchKey(value);
  if (!key) return null;
  return branchDirectory.find((branch) => {
    const idKey = normalizeBranchKey(branch.id);
    const nameKey = normalizeBranchKey(branch.name);
    return key === idKey || key === nameKey || key === `br${idKey}`;
  }) || null;
}

function sessionPayload(session) {
  if (!session?.user) return null;
  return {
    email: session.user.email,
    name: session.user.fullName,
    role: session.user.roleKey,
    branch: session.user.branchName || session.user.branchId || 'Unassigned',
    branchId: session.user.branchId || null,
    token: session.token,
    lastLoginAt: new Date().toISOString(),
    permissions: session.permissions || []
  };
}

const baseAutomationSettings = {
  triggerMode: 'manual-close',
  closeTime: '18:00',
  sendToManagers: true,
  sendToExecutives: true,
  managerRecipients: ['manager@kryvexis.local'],
  executiveRecipients: ['boss@kryvexis.local'],
  defaultManagerBranch: 'Johannesburg',
  branchManagers: branchDirectory.map((branch) => ({ branch: branch.name, manager: branch.managerName, email: branch.managerEmail }))
};

const branchSalesSeed = [
  { branch: 'Johannesburg', target: 180000, totalSales: 200000, posSales: 84000, invoiceSales: 116000, cashSales: 38000, cardSales: 102000, eftSales: 60000, transactions: 48 },
  { branch: 'Cape Town', target: 160000, totalSales: 150000, posSales: 61000, invoiceSales: 89000, cashSales: 26000, cardSales: 79000, eftSales: 45000, transactions: 39 },
  { branch: 'Durban', target: 120000, totalSales: 98000, posSales: 42000, invoiceSales: 56000, cashSales: 19000, cardSales: 51000, eftSales: 28000, transactions: 31 }
];

function envelope(data, extra = {}) { return { ok: true, ...extra, data }; }
function findQuote(id) { return quotes.find((entry) => entry.id === id); }
function findInvoice(id) { return invoices.find((entry) => entry.id === id); }
function findPayment(id) { return payments.find((entry) => entry.id === id || entry.ref === id); }
function findNotification(id) { return notifications.find((entry) => entry.id === id); }
function findCustomer(id) { return customers.find((entry) => entry.id === id); }
function activeNotifications() { return notifications.filter((item) => !item.dismissed); }
function stampNow() { return 'Just now'; }
function numericAmount(value) { return Number(String(value || '').replace(/[^\d.-]/g, '')) || 0; }
function formatMoneyValue(amount) { return formatCurrency(Math.max(0, Math.round(amount))); }
function nextNumericId(prefix, collection, field = 'id', start = 1) {
  const max = collection.reduce((highest, item) => {
    const value = String(item[field] || '').match(/(\d+)/g);
    const current = value ? Number(value[value.length - 1]) : 0;
    return Math.max(highest, current);
  }, start);
  return `${prefix}${max + 1}`;
}
function normalizeBranchScope(branch) {
  if (!branch || branch === 'all') return 'all';
  return normalizeBranchName(branch) || String(branch);
}
function isVisibleForBranch(recordBranch, scope = 'all') {
  return scope === 'all' || !scope || recordBranch === normalizeBranchScope(scope) || normalizeBranchName(recordBranch) === normalizeBranchScope(scope);
}
function quoteLinesTotal(lines = []) {
  return lines.reduce((sum, line) => sum + numericAmount(line.total || (numericAmount(line.unitPrice) * Number(line.qty || 0))), 0);
}
function buildQuoteLinesFromPayload(lines = []) {
  return lines.filter((line) => line && (line.sku || line.description)).map((line, index) => {
    const product = products.find((item) => item.sku === line.sku) || null;
    const qty = Math.max(1, Number(line.qty || 1));
    const unit = numericAmount(line.unitPrice || product?.price || 0);
    const total = Math.round(unit * qty);
    return {
      id: `QL-${Date.now()}-${index + 1}`,
      sku: line.sku || product?.sku || `SKU-MANUAL-${index + 1}`,
      description: line.description || product?.name || `Manual line ${index + 1}`,
      qty,
      unitPrice: formatMoneyValue(unit),
      total: formatMoneyValue(total)
    };
  });
}
function allocatedTotalForInvoice(invoiceId) {
  return payments.filter((item) => item.appliedTo === invoiceId && item.status === 'Allocated').reduce((sum, item) => sum + numericAmount(item.amount), 0);
}
function refreshInvoicePaymentState(invoiceId) {
  const invoice = findInvoice(invoiceId);
  if (!invoice) return null;
  const invoiceTotal = numericAmount(invoice.amount);
  const allocated = allocatedTotalForInvoice(invoiceId);
  if (allocated <= 0) {
    invoice.paymentStatus = 'Unpaid';
    if (invoice.status === 'Awaiting allocation') invoice.status = 'Issued';
    return invoice;
  }
  if (allocated >= invoiceTotal) {
    invoice.paymentStatus = 'Paid';
    invoice.status = 'Paid';
    invoice.nextAction = 'No action';
  } else {
    invoice.paymentStatus = 'Partially paid';
    invoice.status = invoice.status === 'Overdue' ? 'Collections in progress' : 'Awaiting allocation';
    invoice.nextAction = `Collect remaining ${formatMoneyValue(invoiceTotal - allocated)}`;
  }
  return invoice;
}
function refreshCustomerFinancials(customerId) {
  const customer = findCustomer(customerId);
  if (!customer) return null;
  const invoiceExposure = invoices.filter((item) => item.customerId === customerId && item.status !== 'Paid').reduce((sum, item) => sum + Math.max(0, numericAmount(item.amount) - allocatedTotalForInvoice(item.id)), 0);
  customer.balance = formatMoneyValue(invoiceExposure);
  customer.risk = invoiceExposure > 50000 ? 'High' : invoiceExposure > 15000 ? 'Medium' : 'Low';
  customer.status = invoiceExposure > 25000 ? 'Needs follow-up' : invoiceExposure > 0 ? 'Approval watch' : 'Healthy';
  customer.nextAction = invoiceExposure > 0 ? `Collect ${customer.balance} and review open documents` : 'Expand account activity';
  return customer;
}
function buildPurchaseHistory(customerId) {
  const history = [];
  for (const quote of quotes.filter((item) => item.customerId === customerId)) {
    history.push({ id: `PH-${quote.id}`, date: quote.updated, type: 'quote', reference: quote.id, amount: quote.total, status: quote.status, note: quote.nextAction });
  }
  for (const invoice of invoices.filter((item) => item.customerId === customerId)) {
    history.push({ id: `PH-${invoice.id}`, date: invoice.due, type: 'invoice', reference: invoice.id, amount: invoice.amount, status: invoice.status, note: invoice.nextAction });
  }
  for (const payment of payments.filter((item) => item.customerId === customerId)) {
    history.push({ id: `PH-${payment.id}`, date: payment.date, type: 'payment', reference: payment.ref, amount: payment.amount, status: payment.status, note: payment.nextAction });
  }
  return history.slice(0, 20);
}
function buildTopProducts(customerId) {
  const totals = new Map();
  const relatedQuotes = quotes.filter((item) => item.customerId === customerId);
  for (const quote of relatedQuotes) {
    for (const line of quote.lines || []) {
      const current = totals.get(line.sku) || { sku: line.sku, name: line.description, quantity: 0, revenue: 0 };
      current.quantity += Number(line.qty || 0);
      current.revenue += numericAmount(line.total);
      totals.set(line.sku, current);
    }
  }
  return Array.from(totals.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((item) => ({ ...item, revenue: formatMoneyValue(item.revenue) }));
}
function buildTopClientsDynamic(scope = 'all') {
  return customers.filter((customer) => isVisibleForBranch(customer.branch, scope)).map((customer) => {
    const customerInvoices = invoices.filter((item) => item.customerId === customer.id);
    const revenue = customerInvoices.reduce((sum, item) => sum + numericAmount(item.amount), 0);
    const overdueBalance = customerInvoices.filter((item) => /overdue|collections/i.test(item.status)).reduce((sum, item) => sum + Math.max(0, numericAmount(item.amount) - allocatedTotalForInvoice(item.id)), 0);
    return {
      customerId: customer.id,
      name: customer.name,
      revenue: formatMoneyValue(revenue),
      invoices: customerInvoices.length,
      averageOrderValue: formatMoneyValue(customerInvoices.length ? revenue / customerInvoices.length : 0),
      overdueBalance: formatMoneyValue(overdueBalance),
      trend: overdueBalance > 0 ? 'Collections pressure building' : 'Healthy collections'
    };
  }).sort((a, b) => numericAmount(b.revenue) - numericAmount(a.revenue)).slice(0, 6);
}
function buildDocumentQueue(scope = 'all') {
  const quoteDocs = quotes.filter((item) => isVisibleForBranch(item.branch, scope) && ['Approved', 'Sent to customer'].includes(item.status)).map((item) => ({
    id: `DOC-${item.id}`,
    type: 'Quote',
    reference: item.id,
    customer: item.customer,
    branch: item.branch,
    status: item.status === 'Approved' ? 'Ready to send' : 'Ready to print',
    actionLabel: item.status === 'Approved' ? 'Send quote' : 'Print quote',
    recordPath: `/quotes/${item.id}/print`
  }));
  const invoiceDocs = invoices.filter((item) => isVisibleForBranch(item.branch, scope) && item.status !== 'Paid').map((item) => ({
    id: `DOC-${item.id}`,
    type: 'Invoice',
    reference: item.id,
    customer: item.customer,
    branch: item.branch,
    status: item.paymentStatus === 'Unpaid' ? 'Ready to send' : 'Needs statement',
    actionLabel: item.paymentStatus === 'Unpaid' ? 'Print invoice' : 'Send statement',
    recordPath: item.paymentStatus === 'Unpaid' ? `/invoices/${item.id}/print` : '/accounting/statements'
  }));
  return [...quoteDocs, ...invoiceDocs].slice(0, 12);
}
function buildTransactionCoreOverview(scope = 'all') {
  const visibleQuotes = quotes.filter((item) => isVisibleForBranch(item.branch, scope));
  const visibleInvoices = invoices.filter((item) => isVisibleForBranch(item.branch, scope));
  const visiblePayments = payments.filter((item) => isVisibleForBranch(findCustomer(item.customerId)?.branch, scope));
  return {
    counts: {
      draftQuotes: visibleQuotes.filter((item) => item.status === 'Draft').length,
      approvalQuotes: visibleQuotes.filter((item) => item.status === 'Pending approval').length,
      convertibleQuotes: visibleQuotes.filter((item) => ['Approved', 'Sent to customer'].includes(item.status)).length,
      openInvoices: visibleInvoices.filter((item) => item.status !== 'Paid').length,
      overdueInvoices: visibleInvoices.filter((item) => /overdue|collections/i.test(item.status)).length,
      unallocatedPayments: visiblePayments.filter((item) => item.status === 'Unallocated').length,
      proofPendingPayments: visiblePayments.filter((item) => item.status === 'Pending proof').length
    },
    quotePipeline: visibleQuotes.slice(0, 6),
    invoiceQueue: visibleInvoices.slice(0, 6),
    paymentQueue: visiblePayments.slice(0, 6),
    topClients: buildTopClientsDynamic(scope),
    documentQueue: buildDocumentQueue(scope)
  };
}
function buildFinanceSummary(scope = 'all') {
  const visibleInvoices = invoices.filter((item) => isVisibleForBranch(item.branch, scope));
  const visiblePayments = payments.filter((item) => isVisibleForBranch(findCustomer(item.customerId)?.branch, scope));
  const overdueExposure = visibleInvoices.filter((item) => /overdue|collections/i.test(item.status)).reduce((sum, item) => sum + Math.max(0, numericAmount(item.amount) - allocatedTotalForInvoice(item.id)), 0);
  return {
    overdueExposure: formatMoneyValue(overdueExposure),
    collectionCalls: visibleInvoices.filter((item) => /overdue|collections/i.test(item.status)).length,
    allocationQueue: visiblePayments.filter((item) => item.status === 'Unallocated').length,
    proofExceptions: visiblePayments.filter((item) => item.status === 'Pending proof').length
  };
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}
function defaultAutomationState() {
  return {
    automationSettings: baseAutomationSettings,
    lastClosedAt: null,
    lastClosedDate: null,
    lastSummary: null,
    lastDispatchAt: null,
    dayCloseHistory: [],
    emailDispatches: [],
    auditTrail: [],
    scheduler: { enabled: false, lastAutoRunDate: null }
  };
}
function loadAutomationState() {
  try {
    ensureDataDir();
    if (!fs.existsSync(stateFile)) {
      const initial = defaultAutomationState();
      fs.writeFileSync(stateFile, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    return {
      ...defaultAutomationState(),
      ...raw,
      automationSettings: { ...baseAutomationSettings, ...(raw.automationSettings || {}) },
      dayCloseHistory: Array.isArray(raw.dayCloseHistory) ? raw.dayCloseHistory : [],
      emailDispatches: Array.isArray(raw.emailDispatches) ? raw.emailDispatches : [],
      auditTrail: Array.isArray(raw.auditTrail) ? raw.auditTrail : []
    };
  } catch (error) {
    console.error('Failed to load automation state', error);
    return defaultAutomationState();
  }
}
let automationState = loadAutomationState();
function saveAutomationState() {
  ensureDataDir();
  fs.writeFileSync(stateFile, JSON.stringify(automationState, null, 2));
}
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 })
    .format(amount).replace('ZAR', 'R').replace(/\u00a0/g, ' ');
}
function formatPct(value) {
  return `${Math.round(value)}%`;
}
function isoDateOffset(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function buildDailySummary(date = isoDateOffset(-1)) {
  const branches = branchSalesSeed.map((item, index) => ({
    ...item,
    date,
    varianceToTarget: item.totalSales - item.target,
    targetAchievedPct: item.target ? Math.round((item.totalSales / item.target) * 100) : 0,
    averageBasket: item.transactions ? Math.round(item.totalSales / item.transactions) : 0,
    branchId: branchDirectory[index]?.id || `BR-${index + 1}`
  }));
  const totals = branches.reduce((acc, item) => ({
    totalSales: acc.totalSales + item.totalSales,
    posSales: acc.posSales + item.posSales,
    invoiceSales: acc.invoiceSales + item.invoiceSales,
    cashSales: acc.cashSales + item.cashSales,
    cardSales: acc.cardSales + item.cardSales,
    eftSales: acc.eftSales + item.eftSales,
    transactions: acc.transactions + item.transactions,
    target: acc.target + item.target
  }), { totalSales: 0, posSales: 0, invoiceSales: 0, cashSales: 0, cardSales: 0, eftSales: 0, transactions: 0, target: 0 });
  return {
    date,
    branches,
    totals: {
      ...totals,
      varianceToTarget: totals.totalSales - totals.target,
      targetAchievedPct: totals.target ? Math.round((totals.totalSales / totals.target) * 100) : 0
    }
  };
}
function buildEmailBody(summary) {
  const lines = summary.branches.map((branch) =>
    `${branch.branch} made ${formatCurrency(branch.totalSales)} yesterday against a target of ${formatCurrency(branch.target)} (${formatPct(branch.targetAchievedPct)}).`
  );
  lines.push(`Total company sales yesterday: ${formatCurrency(summary.totals.totalSales)}.`);
  return lines.join('\n');
}
function recordPathFor(type, id) {
  if (type === 'quote') return `/quotes/${id}`;
  if (type === 'invoice') return `/invoices/${id}`;
  if (type === 'payment') return `/payments/${id}`;
  if (type === 'customer') return `/customers/${id}`;
  return '/';
}
function pushNotification(notification) {
  notifications = [notification, ...notifications];
  return notification;
}
let auditLog = [
  { id: 'AUD-1', title: 'Quote drafted', detail: 'Q-1045 prepared for Urban Build Supply with protected margin review.', actor: 'Alex Morgan', timestamp: 'Today 08:12', recordType: 'quote', recordId: 'Q-1045', recordPath: '/quotes/Q-1045', customerId: 'CUS-003', status: 'Drafted' }
];
function pushAudit(entry) {
  const normalized = { id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, ...entry };
  auditLog = [normalized, ...auditLog];
  return normalized;
}
function operationalActionForNotification(item) {
  const source = `${item.title} ${item.meta}`.toLowerCase();
  const recordMatch = `${item.title} ${item.meta}`.match(/(Q-\d+|INV-\d+|PAY-\d+)/i);
  const recordId = recordMatch ? recordMatch[1].toUpperCase() : '';
  let recordType = 'system';
  if (recordId.startsWith('Q-')) recordType = 'quote';
  if (recordId.startsWith('INV-')) recordType = 'invoice';
  if (recordId.startsWith('PAY-')) recordType = 'payment';
  const recordPath = recordId ? recordPathFor(recordType, recordId) : '/notifications';
  const actionLabel = source.includes('approval') ? 'Review approval' : source.includes('overdue') ? 'Collect now' : source.includes('proof') ? 'Resolve proof' : source.includes('allocate') ? 'Allocate payment' : 'Open record';
  const priority = item.state === 'Urgent' ? 'high' : item.state === 'Pending' || item.state === 'Action' ? 'medium' : 'low';
  return {
    id: item.id,
    title: item.title,
    detail: item.meta,
    owner: recordType === 'quote' ? 'Sales' : recordType === 'invoice' || recordType === 'payment' ? 'Finance' : 'Operations',
    branch: recordId.startsWith('Q-') ? findQuote(recordId)?.branch || 'Unassigned' : recordId.startsWith('INV-') ? findInvoice(recordId)?.branch || 'Unassigned' : recordId.startsWith('PAY-') ? findCustomer(findPayment(recordId)?.customerId || '')?.branch || 'Unassigned' : 'System',
    priority,
    recordPath,
    actionLabel,
    status: item.state
  };
}
function buildBranchSnapshots() {
  const branches = [...new Set(customers.map((item) => item.branch))];
  return branches.map((branch) => ({
    branch,
    approvals: quotes.filter((item) => item.branch === branch && item.status === 'Pending approval').length,
    collections: invoices.filter((item) => item.branch === branch && /overdue|collections/i.test(item.status)).length,
    exceptions: payments.filter((item) => findCustomer(item.customerId)?.branch === branch && (item.status === 'Pending proof' || item.status === 'Unallocated')).length
  }));
}
const topClients = [
  { customerId: 'CUS-001', name: 'Acme Retail Group', revenue: 'R78,240', invoices: 6, averageOrderValue: 'R13,040', overdueBalance: 'R5,040', trend: 'Growing this month' },
  { customerId: 'CUS-003', name: 'Urban Build Supply', revenue: 'R63,580', invoices: 3, averageOrderValue: 'R21,193', overdueBalance: 'R12,000', trend: 'Large deal pending' },
  { customerId: 'CUS-002', name: 'Northline Foods', revenue: 'R41,920', invoices: 5, averageOrderValue: 'R8,384', overdueBalance: 'R0', trend: 'Healthy collections' }
];
const dashboardByRole = {
  admin: {
    kpis: [
      { label: 'System activity', value: '342', detail: 'Events in the last 24h' },
      { label: 'Pending approvals', value: '6', detail: 'Quotes and exceptions' },
      { label: 'Branch health', value: '92%', detail: 'Operational completion score' },
      { label: 'Unread notifications', value: '11', detail: 'Across all roles' }
    ],
    panels: [
      { title: 'Approvals queue', items: ['Q-1045 high-value quote', 'Payment exception PAY-7693', 'Role change request for Cape Town'] },
      { title: 'Audit highlights', items: ['Theme changed to system', 'Invoice template updated', 'Branch settings edited'] }
    ]
  },
  sales: {
    kpis: [
      { label: 'Quotes awaiting action', value: '9', detail: '3 need approval' },
      { label: 'Invoices due', value: 'R45,230', detail: '12 active invoices' },
      { label: 'Customer balances', value: 'R98,120', detail: 'Across key accounts' },
      { label: 'Personal target', value: '74%', detail: 'Month-to-date progress' }
    ],
    panels: [
      { title: 'Follow-up focus', items: ['Call Acme Retail Group', 'Send revised quote to Northline', 'Approve Urban Build pricing note'] },
      { title: 'Recent communications', items: ['Invoice reminder sent', 'Quote viewed by customer', 'Statement export completed'] }
    ]
  },
  finance: {
    kpis: [
      { label: 'Debtor aging', value: 'R184,900', detail: '31+ days: R42,300' },
      { label: 'Receipts today', value: 'R18,400', detail: '3 collections booked' },
      { label: 'Overdue accounts', value: '12', detail: '5 need escalation' },
      { label: 'Cash-up alerts', value: '1', detail: 'Cape Town variance pending' }
    ],
    panels: [
      { title: 'Collection actions', items: ['INV-2201 follow-up', 'Allocate PAY-7688', 'Send first reminder batch'] },
      { title: 'Approvals and exceptions', items: ['Unallocated EFT review', 'Missing proof on PAY-7693', 'Tax override awaiting confirmation'] }
    ]
  }
};

function buildDashboard(role) {
  const dashboard = dashboardByRole[role] || dashboardByRole.admin;
  const highlights = activeNotifications().slice(0, 5);
  return {
    role,
    ...dashboard,
    highlights,
    recentCustomers: customers.slice(0, 3),
    lowStockProducts: products.filter((item) => item.stock <= item.reorderAt),
    topClients,
    actionCenter: {
      branchSnapshots: buildBranchSnapshots(),
      actionQueue: activeNotifications().slice(0, 6).map(operationalActionForNotification),
      auditHighlights: auditLog.slice(0, 6)
    }
  };
}

// SQL adapter for automation/report state only.
async function ensureSqlSchema() {
  if (!pool) return;
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
}
async function sqlGetSettings() {
  if (!pool) return null;
  const row = await pool.query('select payload from automation_settings where id = $1', ['default']);
  return row.rows[0]?.payload || null;
}
async function sqlSaveSettings(payload) {
  if (!pool) return;
  await pool.query(
    `insert into automation_settings (id, payload, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
    ['default', JSON.stringify(payload)]
  );
}
async function sqlListCloseHistory() {
  if (!pool) return [];
  const result = await pool.query('select payload from day_close_records order by closed_at desc limit 30');
  return result.rows.map((row) => row.payload);
}
async function sqlSaveCloseRecord(record) {
  if (!pool) return;
  await pool.query(
    `insert into day_close_records (id, close_date, closed_at, payload)
     values ($1, $2, $3, $4::jsonb)
     on conflict (id) do update set close_date = excluded.close_date, closed_at = excluded.closed_at, payload = excluded.payload`,
    [record.id, record.date, record.closedAt, JSON.stringify(record)]
  );
}
async function sqlListDispatches() {
  if (!pool) return [];
  const result = await pool.query('select payload from email_dispatches order by sent_at desc limit 40');
  return result.rows.map((row) => row.payload);
}
async function sqlSaveDispatch(dispatch) {
  if (!pool) return;
  await pool.query(
    `insert into email_dispatches (id, dispatch_date, sent_at, payload)
     values ($1, $2, $3, $4::jsonb)
     on conflict (id) do update set dispatch_date = excluded.dispatch_date, sent_at = excluded.sent_at, payload = excluded.payload`,
    [dispatch.id, dispatch.date, dispatch.sentAt, JSON.stringify(dispatch)]
  );
}
async function sqlListAudit() {
  if (!pool) return [];
  const result = await pool.query('select payload from audit_events order by occurred_at desc limit 80');
  return result.rows.map((row) => row.payload);
}
async function sqlSaveAudit(entry) {
  if (!pool) return;
  await pool.query(
    `insert into audit_events (id, occurred_at, action, payload)
     values ($1, $2, $3, $4::jsonb)
     on conflict (id) do nothing`,
    [entry.id, entry.occurredAt, entry.action, JSON.stringify(entry)]
  );
}
async function hydrateAutomationState() {
  if (!pool) return;
  const [settingsPayload, closes, dispatches, audit] = await Promise.all([
    sqlGetSettings(),
    sqlListCloseHistory(),
    sqlListDispatches(),
    sqlListAudit()
  ]);
  if (settingsPayload) {
    automationState.automationSettings = { ...baseAutomationSettings, ...settingsPayload };
  }
  automationState.dayCloseHistory = closes;
  automationState.emailDispatches = dispatches;
  automationState.auditTrail = audit;
  const latestClose = closes[0] || null;
  const latestDispatch = dispatches[0] || null;
  automationState.lastClosedAt = latestClose?.closedAt || null;
  automationState.lastClosedDate = latestClose?.date || null;
  automationState.lastSummary = latestClose ? { date: latestClose.date, branches: latestClose.branchSummaries, totals: deriveVisibleTotals(latestClose.branchSummaries) } : null;
  automationState.lastDispatchAt = latestDispatch?.sentAt || null;
}
async function persistAutomationState() {
  if (!pool) {
    saveAutomationState();
    return;
  }
  await Promise.all([
    sqlSaveSettings(automationState.automationSettings),
    ...automationState.dayCloseHistory.slice(0, 30).map(sqlSaveCloseRecord),
    ...automationState.emailDispatches.slice(0, 40).map(sqlSaveDispatch),
    ...automationState.auditTrail.slice(0, 80).map(sqlSaveAudit)
  ]);
}

async function logAutomationEvent({ action, status = 'info', detail, actor = 'Antonie Meyer', branch = 'All branches', date = isoDateOffset(-1) }) {
  const entry = {
    id: `AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    occurredAt: new Date().toISOString(),
    actor,
    action,
    status,
    detail,
    branch,
    date
  };
  automationState.auditTrail = [entry, ...(automationState.auditTrail || [])].slice(0, 80);
  if (pool) await sqlSaveAudit(entry);
  return entry;
}

async function deliverSummaryEmail(summary, recipients) {
  const subject = `Daily Sales Summary - ${summary.date}`;
  const body = buildEmailBody(summary);
  const provider = process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : 'log');

  if (provider === 'resend' && process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Kryvexis OS <reports@kryvexis.local>',
        to: recipients,
        subject,
        text: body
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend send failed: ${errorText}`);
    }
    const payload = await response.json();
    return { provider: 'resend', messageId: payload.id || null, subject, body };
  }

  return { provider: 'log', messageId: `LOG-${Date.now()}`, subject, body };
}
function summarizeDispatchTargets() {
  const recipients = [];
  if (automationState.automationSettings.sendToManagers) recipients.push(...automationState.automationSettings.managerRecipients);
  if (automationState.automationSettings.sendToExecutives) recipients.push(...automationState.automationSettings.executiveRecipients);
  return [...new Set(recipients.filter(Boolean))];
}
function createDispatchRecord(result, recipients, summary, options = {}) {
  return {
    id: `MAIL-${Date.now()}`,
    sentAt: new Date().toISOString(),
    recipients,
    provider: result.provider,
    subject: result.subject,
    status: options.status || 'Delivered',
    date: summary.date,
    companyTotal: summary.totals.totalSales,
    branchCount: summary.branches.length,
    resend: Boolean(options.resend),
    closedRecordId: options.closedRecordId || null
  };
}
function latestCloseRecordFor(date) {
  return automationState.dayCloseHistory.find((item) => item.date === date) || null;
}
function latestDispatchFor(date) {
  return automationState.emailDispatches.find((item) => item.date === date) || null;
}
async function runDayClose({ trigger = 'manual', sendEmail = false, date = isoDateOffset(-1), force = false, actor = 'Antonie Meyer' } = {}) {
  const existing = latestCloseRecordFor(date);
  if (existing && !force) {
    await logAutomationEvent({ action: 'Day close blocked', status: 'blocked', detail: `Close already exists for ${date}. Use force to rerun.`, actor, date, branch: existing.branchSummaries?.map((item) => item.branch).join(', ') || 'All branches' });
    await persistAutomationState();
    throw new Error(`Day close for ${date} already exists. Use rerun confirmation to replace it.`);
  }

  const summary = buildDailySummary(date);
  const closeId = existing?.id || `CLOSE-${Date.now()}`;
  const closedAt = new Date().toISOString();
  const record = {
    id: closeId,
    closedAt,
    trigger,
    date,
    totalSales: summary.totals.totalSales,
    varianceToTarget: summary.totals.varianceToTarget,
    sentStatus: 'pending',
    sentAt: null,
    closedBy: actor,
    emailDispatchId: null,
    branchSummaries: summary.branches
  };

  automationState.lastClosedAt = closedAt;
  automationState.lastClosedDate = date;
  automationState.lastSummary = summary;
  automationState.dayCloseHistory = [record, ...automationState.dayCloseHistory.filter((item) => item.date !== date)].slice(0, 30);
  await logAutomationEvent({ action: existing ? 'Day close rerun' : 'Day close completed', status: 'success', detail: `${date} closed at ${formatCurrency(summary.totals.totalSales)}.`, actor, date, branch: summary.branches.map((item) => item.branch).join(', ') });

  let dispatch = null;
  if (sendEmail) {
    const recipients = summarizeDispatchTargets();
    const result = await deliverSummaryEmail(summary, recipients);
    dispatch = createDispatchRecord(result, recipients, summary, { closedRecordId: closeId });
    automationState.lastDispatchAt = dispatch.sentAt;
    automationState.emailDispatches = [dispatch, ...automationState.emailDispatches.filter((item) => item.id !== dispatch.id)].slice(0, 40);
    automationState.dayCloseHistory = automationState.dayCloseHistory.map((item) => item.id === closeId ? { ...item, sentStatus: 'sent', sentAt: dispatch.sentAt, emailDispatchId: dispatch.id } : item);
    await logAutomationEvent({ action: existing ? 'Summary resent from rerun' : 'Summary email sent', status: 'success', detail: `Daily summary sent to ${recipients.join(', ') || 'no recipients configured'}.`, actor, date, branch: summary.branches.map((item) => item.branch).join(', ') });
  }

  await persistAutomationState();
  return { summary, dispatch };
}
async function sendLatestSummary({ resend = false, actor = 'Antonie Meyer' } = {}) {
  const summary = automationState.lastSummary || buildDailySummary();
  const closeRecord = latestCloseRecordFor(summary.date);
  if (!closeRecord) {
    await logAutomationEvent({ action: 'Summary send blocked', status: 'blocked', detail: `No day close exists for ${summary.date}.`, actor, date: summary.date });
    await persistAutomationState();
    throw new Error('Run day close before sending a summary email.');
  }
  if (closeRecord.sentStatus === 'sent' && !resend) {
    await logAutomationEvent({ action: 'Duplicate summary blocked', status: 'blocked', detail: `Summary already sent for ${summary.date}. Use resend to send again.`, actor, date: summary.date, branch: closeRecord.branchSummaries.map((item) => item.branch).join(', ') });
    await persistAutomationState();
    throw new Error(`Summary already sent for ${summary.date}. Use resend summary if you need to send it again.`);
  }
  const recipients = summarizeDispatchTargets();
  const result = await deliverSummaryEmail(summary, recipients);
  const dispatch = createDispatchRecord(result, recipients, summary, { resend, closedRecordId: closeRecord.id });
  automationState.lastDispatchAt = dispatch.sentAt;
  automationState.emailDispatches = [dispatch, ...automationState.emailDispatches].slice(0, 40);
  automationState.dayCloseHistory = automationState.dayCloseHistory.map((item) => item.id === closeRecord.id ? { ...item, sentStatus: 'sent', sentAt: dispatch.sentAt, emailDispatchId: dispatch.id } : item);
  await logAutomationEvent({ action: resend ? 'Summary resent' : 'Summary email sent', status: 'success', detail: `Summary email ${resend ? 'resent' : 'sent'} to ${recipients.join(', ') || 'no recipients configured'}.`, actor, date: summary.date, branch: closeRecord.branchSummaries.map((item) => item.branch).join(', ') });
  await persistAutomationState();
  return dispatch;
}
function deriveVisibleTotals(branches) {
  const totals = branches.reduce((acc, item) => ({
    totalSales: acc.totalSales + item.totalSales,
    posSales: acc.posSales + item.posSales,
    invoiceSales: acc.invoiceSales + item.invoiceSales,
    cashSales: acc.cashSales + item.cashSales,
    cardSales: acc.cardSales + item.cardSales,
    eftSales: acc.eftSales + item.eftSales,
    transactions: acc.transactions + item.transactions,
    target: acc.target + item.target
  }), { totalSales: 0, posSales: 0, invoiceSales: 0, cashSales: 0, cardSales: 0, eftSales: 0, transactions: 0, target: 0 });
  return {
    ...totals,
    varianceToTarget: totals.totalSales - totals.target,
    targetAchievedPct: totals.target ? Math.round((totals.totalSales / totals.target) * 100) : 0
  };
}
function buildReportPayload(role = 'admin', branch = 'all') {
  const summary = automationState.lastSummary || buildDailySummary();
  const allowedBranch = role === 'manager' ? automationState.automationSettings.defaultManagerBranch || 'Johannesburg' : branch;
  const visibleBranches = allowedBranch && allowedBranch !== 'all' ? summary.branches.filter((item) => item.branch === allowedBranch) : summary.branches;
  const totals = deriveVisibleTotals(visibleBranches);
  const sellerBoard = [
    { name: 'Alex Morgan', branch: 'Johannesburg', sales: 84000, target: 90000 },
    { name: 'Rina Patel', branch: 'Cape Town', sales: 72500, target: 80000 },
    { name: 'Tariq Naidoo', branch: 'Durban', sales: 48800, target: 65000 }
  ].filter((item) => allowedBranch === 'all' || !allowedBranch || item.branch === allowedBranch);
  const closeRecord = latestCloseRecordFor(summary.date);
  const lastDispatch = latestDispatchFor(summary.date);
  const branchCloseHistory = automationState.dayCloseHistory
    .flatMap((record) => (record.branchSummaries || []).map((item) => ({
      recordId: record.id,
      branch: item.branch,
      date: record.date,
      closedAt: record.closedAt,
      totalSales: item.totalSales,
      varianceToTarget: item.varianceToTarget,
      sentStatus: record.sentStatus
    })))
    .filter((item) => allowedBranch === 'all' || !allowedBranch || item.branch === allowedBranch)
    .slice(0, 30);
  const scope = role === 'manager' ? allowedBranch : branch;
  return {
    scope,
    date: summary.date,
    canViewAllBranches: role === 'admin' || role === 'executive',
    visibleBranches,
    totals,
    sellerBoard,
    emailPreview: {
      subject: `Daily Sales Summary - ${summary.date}`,
      body: buildEmailBody({ ...summary, branches: visibleBranches.length ? visibleBranches : summary.branches, totals })
    },
    emailDispatches: automationState.emailDispatches.filter((item) => allowedBranch === 'all' || !allowedBranch || closeRecord?.branchSummaries?.some((branchItem) => branchItem.branch === allowedBranch && item.closedRecordId === closeRecord.id)).slice(0, 20),
    dayCloseHistory: automationState.dayCloseHistory.filter((item) => allowedBranch === 'all' || !allowedBranch || item.branchSummaries.some((branchItem) => branchItem.branch === allowedBranch)).slice(0, 20),
    branchCloseHistory,
    automation: automationState.automationSettings,
    closeStatus: {
      date: summary.date,
      state: closeRecord ? 'closed' : 'open',
      label: closeRecord ? 'Closed' : 'Open',
      lastClosedAt: closeRecord?.closedAt || null,
      lastClosedBy: closeRecord?.closedBy || null,
      recordId: closeRecord?.id || null
    },
    sendStatus: {
      state: closeRecord ? (closeRecord.sentStatus === 'sent' ? 'sent' : 'pending') : 'not-ready',
      label: closeRecord ? (closeRecord.sentStatus === 'sent' ? 'Sent' : 'Pending send') : 'Close required',
      lastSentAt: lastDispatch?.sentAt || closeRecord?.sentAt || null,
      duplicateBlocked: Boolean(closeRecord && closeRecord.sentStatus === 'sent'),
      lastDispatchId: lastDispatch?.id || closeRecord?.emailDispatchId || null
    },
    auditTrail: (automationState.auditTrail || []).filter((item) => allowedBranch === 'all' || !allowedBranch || item.branch.includes(allowedBranch)).slice(0, 20),
    financeSummary: buildFinanceSummary(scope),
    transactionCore: buildTransactionCoreOverview(scope),
    topClients: buildTopClientsDynamic(scope),
    documentQueue: buildDocumentQueue(scope)
  };
}

function collectActivity({ recordType, recordId, customerId }) {
  return auditLog
    .filter((entry) => (recordType ? entry.recordType === recordType && entry.recordId === recordId : false) || (customerId ? entry.customerId === customerId : false))
    .filter((entry, index, list) => list.findIndex((check) => check.id === entry.id) === index)
    .slice(0, 8);
}
function buildQuoteDetail(quote) {
  return {
    ...quote,
    sourceCustomerId: quote.customerId,
    activityLog: collectActivity({ recordType: 'quote', recordId: quote.id, customerId: quote.customerId })
  };
}
function buildInvoiceDetail(invoice) {
  const sourceQuote = quotes.find((item) => item.id === invoice.source);
  const lines = sourceQuote?.lines ?? [];
  const workflow = [
    { label: 'Created', detail: invoice.status === 'Draft' ? `Invoice draft created from ${invoice.source}` : `Invoice recorded from ${invoice.source}` },
    { label: 'Payment state', detail: invoice.paymentStatus },
    { label: 'Reminders', detail: invoice.reminders },
    { label: 'Next action', detail: invoice.nextAction }
  ];
  if (sourceQuote) {
    workflow.unshift({ label: 'Source quote', detail: `${sourceQuote.id} was converted for ${sourceQuote.customer}` });
  }
  return {
    ...invoice,
    sourceCustomerId: invoice.customerId,
    sourceQuoteId: sourceQuote?.id ?? null,
    subtotal: sourceQuote?.subtotal ?? invoice.amount,
    total: sourceQuote?.total ?? invoice.amount,
    issuedOn: 'Today',
    lines,
    workflow,
    activityLog: collectActivity({ recordType: 'invoice', recordId: invoice.id, customerId: invoice.customerId })
  };
}
function buildPaymentDetail(payment) {
  const linkedInvoiceId = payment.appliedTo.startsWith('INV-') ? payment.appliedTo : null;
  return {
    ...payment,
    linkedInvoiceId,
    sourceCustomerId: payment.customerId,
    activityLog: collectActivity({ recordType: 'payment', recordId: payment.id, customerId: payment.customerId })
  };
}
function buildCustomerSummary(id) {
  const customer = findCustomer(id);
  if (!customer) return null;
  refreshCustomerFinancials(id);
  const allInvoices = invoices.filter((item) => item.customerId === id);
  const recentInvoices = allInvoices.slice(0, 5);
  const recentPayments = payments.filter((item) => item.customerId === id).slice(0, 5);
  const openQuotes = quotes.filter((item) => item.customerId === id && item.status !== 'Converted');
  const overdueInvoices = allInvoices.filter((item) => /overdue|collections/i.test(item.status)).length;
  const topProducts = buildTopProducts(id);
  const purchaseHistory = buildPurchaseHistory(id);
  const totalSpendValue = allInvoices.reduce((sum, item) => sum + numericAmount(item.amount), 0);
  const overdueBalanceValue = allInvoices.filter((item) => /overdue|collections/i.test(item.status)).reduce((sum, item) => sum + Math.max(0, numericAmount(item.amount) - allocatedTotalForInvoice(item.id)), 0);
  const linkedActivity = collectActivity({ customerId: id }).slice(0, 10);
  return {
    customerId: id,
    totalSpend: formatMoneyValue(totalSpendValue),
    invoiceCount: allInvoices.length,
    averageOrderValue: formatMoneyValue(totalSpendValue / Math.max(1, allInvoices.length)),
    overdueBalance: formatMoneyValue(overdueBalanceValue),
    lastPurchaseDate: recentInvoices[0]?.due || 'No invoice yet',
    lastPaymentDate: recentPayments[0]?.date || 'No payment yet',
    collectionStatus: overdueInvoices ? `${overdueInvoices} overdue invoices need follow-up` : 'Collections are under control',
    topProducts,
    openQuotes,
    recentInvoices,
    recentPayments,
    purchaseHistory,
    overdueInvoices,
    openBalance: customer.balance,
    accountHealth: overdueBalanceValue > 10000 ? 'At risk' : customer.risk === 'Low' ? 'Healthy' : 'Needs attention',
    linkedActivity
  };
}

function listRoute(routePath, collection) {
  app.get(`/api/${routePath}`, (_req, res) => res.json(envelope(collection)));
  app.get(`/api/${routePath}/:id`, (req, res) => {
    const item = collection.find((entry) => entry.id === req.params.id || entry.ref === req.params.id || entry.sku === req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: `${routePath} item not found` });
    return res.json(envelope(item));
  });
}

app.get('/', (_req, res) => res.json({ ok: true, service: 'kryvexis-os-api', status: 'running', phase: 'SQL-A1' }));
app.post('/api/auth/signup', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const fullName = String(req.body?.fullName || '').trim();
    const roleKey = String(req.body?.roleKey || 'manager').trim();
    const branchId = String(req.body?.branchId || '').trim() || null;
    if (!email || !fullName) return res.status(400).json({ ok: false, error: 'fullName and email are required' });
    const { registerUser, createSessionForEmail } = await import('./src/auth/auth-service.js');
    await registerUser({ email, fullName, roleKey, branchId });
    const session = await createSessionForEmail(email, { userAgent: req.headers['user-agent'] || null, createdBy: email });
    return res.json(envelope(sessionPayload(session)));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'signup failed' });
  }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ ok: false, error: 'email is required' });
    const session = await createSessionForEmail(email, { userAgent: req.headers['user-agent'] || null, createdBy: email });
    if (!session) return res.status(401).json({ ok: false, error: 'No active Kryvexis user found for that email.' });
    return res.json(envelope(sessionPayload(session)));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'login failed' });
  }
});
app.get('/api/auth/me', requireAuth, (req, res) => res.json(envelope(sessionPayload(req.session))));
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  await revokeSession(req.session?.token || req.headers.authorization || req.headers['x-session-token']);
  return res.json(envelope({ success: true }));
});
app.post('/api/auth/switch-branch', requireAuth, async (req, res) => {
  try {
    const branch = findBranchByIdOrName(req.body?.branch || req.body?.branchId);
    if (!branch) return res.status(400).json({ ok: false, error: 'valid branch is required' });
    await switchSessionBranch(req.session?.token || req.headers.authorization || req.headers['x-session-token'], `BR-${branch.id}`);
    if (req.session?.user) {
      req.session.user.branchId = `BR-${branch.id}`;
      req.session.user.branchName = branch.name;
    }
    return res.json(envelope(sessionPayload(req.session)));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'branch switch failed' });
  }
});
app.get('/api/auth/permissions', requireAuth, async (_req, res) => {
  const catalog = await listRolePermissions();
  return res.json(envelope(catalog));
});

app.use('/api', (req, res, next) => {
  if (req.path === '/bootstrap') return next();
  if (req.path.startsWith('/auth/')) return next();
  return requireAuth(req, res, next);
});
app.get('/health', (_req, res) => res.json({ status: 'ok', phase: 'SQL-A1', service: 'kryvexis-os-api', sqlAutomation: ENABLE_SQL }));
app.get('/api/bootstrap', (_req, res) => res.json(envelope({ roles, themeOptions: settings.themes, support: { email: settings.supportEmail, whatsapp: settings.whatsapp } })));
app.get('/api/dashboard', (req, res) => {
  const role = req.query.role || 'admin';
  res.json(envelope(buildDashboard(role)));
});
app.get('/api/action-center', (req, res) => {
  const role = String(req.query.role || 'admin');
  const branch = String(req.query.branch || 'all');
  const lane = String(req.query.lane || 'all');
  return res.json(envelope(buildActionCenter(role, branch, lane)));
});
app.get('/api/customers/:id/summary', (req, res) => {
  const summary = buildCustomerSummary(req.params.id);
  if (!summary) return res.status(404).json({ ok: false, error: 'customer summary not found' });
  return res.json(envelope(summary));
});
app.get('/api/quotes', (_req, res) => res.json(envelope(quotes)));
app.get('/api/quotes/:id', (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });
  return res.json(envelope(buildQuoteDetail(quote)));
});
app.get('/api/invoices', (_req, res) => res.json(envelope(invoices)));
app.get('/api/invoices/:id', (req, res) => {
  const invoice = findInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ ok: false, error: 'invoice item not found' });
  return res.json(envelope(buildInvoiceDetail(invoice)));
});
app.get('/api/payments', (_req, res) => res.json(envelope(payments)));
app.get('/api/payments/:id', (req, res) => {
  const payment = findPayment(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, error: 'payment item not found' });
  return res.json(envelope(buildPaymentDetail(payment)));
});
app.get('/api/transaction-core/overview', (req, res) => {
  const branch = String(req.query.branch || 'all');
  return res.json(envelope(buildTransactionCoreOverview(branch)));
});
app.get('/api/documents/queue', (req, res) => {
  const branch = String(req.query.branch || 'all');
  return res.json(envelope(buildDocumentQueue(branch)));
});
app.post('/api/quotes', requirePermission('quotes.write'), (req, res) => {
  const customer = findCustomer(req.body?.customerId);
  if (!customer) return res.status(400).json({ ok: false, error: 'valid customerId is required' });
  const lines = buildQuoteLinesFromPayload(req.body?.lines || []);
  if (!lines.length) return res.status(400).json({ ok: false, error: 'at least one line is required' });
  const subtotalAmount = quoteLinesTotal(lines);
  const taxAmount = Math.round(subtotalAmount * 0.15);
  const totalAmount = subtotalAmount + taxAmount;
  const quote = {
    id: nextNumericId('Q-', quotes),
    customerId: customer.id,
    customer: customer.name,
    owner: String(req.body?.owner || customer.owner || 'Sales Desk'),
    value: formatMoneyValue(totalAmount),
    status: req.body?.status || 'Draft',
    validity: req.body?.validity || isoDateOffset(7),
    branch: req.body?.branch || customer.branch,
    trigger: totalAmount > 50000 ? 'High-value threshold' : 'None',
    updated: stampNow(),
    notes: String(req.body?.notes || 'Created from transactional core workflow.'),
    nextAction: req.body?.status === 'Pending approval' ? 'Manager review required before send' : 'Review and send to customer',
    subtotal: formatMoneyValue(subtotalAmount),
    tax: formatMoneyValue(taxAmount),
    total: formatMoneyValue(totalAmount),
    marginBand: totalAmount > 50000 ? 'Protected margin' : 'Standard margin',
    approvalOwner: totalAmount > 50000 ? 'Sales Manager' : 'Not required',
    lines,
    workflow: [
      { label: 'Drafted', detail: `Quote created for ${customer.name} from the transaction core.` },
      { label: 'Next step', detail: totalAmount > 50000 ? 'Route for approval before send.' : 'Send to customer or convert later.' }
    ]
  };
  quotes.unshift(quote);
  pushAudit({ title: 'Quote created', detail: `${quote.id} created for ${quote.customer}.`, actor: quote.owner, timestamp: stampNow(), recordType: 'quote', recordId: quote.id, recordPath: recordPathFor('quote', quote.id), customerId: quote.customerId, status: quote.status });
  if (quote.status === 'Pending approval') {
    pushNotification({ id: `NT-${Date.now()}`, title: `Quote approval required`, meta: `${quote.id} - Sales`, state: 'Pending', read: false, type: 'approval', dismissed: false, snoozedUntil: null });
  }
  return res.json(envelope({ quote: buildQuoteDetail(quote) }));
});
app.post('/api/invoices', requirePermission('invoices.write'), (req, res) => {
  const customer = findCustomer(req.body?.customerId);
  if (!customer) return res.status(400).json({ ok: false, error: 'valid customerId is required' });
  const sourceQuote = req.body?.sourceQuoteId ? findQuote(req.body.sourceQuoteId) : null;
  const amount = sourceQuote ? numericAmount(sourceQuote.total) : numericAmount(req.body?.amount);
  if (!amount) return res.status(400).json({ ok: false, error: 'amount or sourceQuoteId is required' });
  const invoice = {
    id: nextNumericId('INV-', invoices),
    customerId: customer.id,
    customer: customer.name,
    amount: formatMoneyValue(amount),
    branch: req.body?.branch || customer.branch,
    status: 'Issued',
    due: req.body?.due || `Due in ${Number(req.body?.dueDays || 30)} days`,
    source: sourceQuote?.id || 'Manual',
    paymentStatus: 'Unpaid',
    tax: 'VAT standard',
    reminders: 'Not started',
    nextAction: 'Send invoice and monitor payment'
  };
  invoices.unshift(invoice);
  if (sourceQuote) {
    sourceQuote.status = 'Converted';
    sourceQuote.updated = stampNow();
    sourceQuote.nextAction = `Invoice ${invoice.id} ready for collection workflow`;
    sourceQuote.workflow.push({ label: 'Converted', detail: `Invoice ${invoice.id} created from this quote` });
  }
  refreshCustomerFinancials(customer.id);
  pushAudit({ title: 'Invoice created', detail: `${invoice.id} created for ${invoice.customer}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'invoice', recordId: invoice.id, recordPath: recordPathFor('invoice', invoice.id), customerId: invoice.customerId, status: invoice.status });
  pushNotification({ id: `NT-${Date.now()}`, title: `Invoice ${invoice.id} issued`, meta: `${invoice.customer} - Finance`, state: 'New', read: false, type: 'collection', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ invoice: buildInvoiceDetail(invoice) }));
});
app.post('/api/payments', requirePermission('payments.allocate'), (req, res) => {
  const customer = findCustomer(req.body?.customerId);
  if (!customer) return res.status(400).json({ ok: false, error: 'valid customerId is required' });
  const amount = numericAmount(req.body?.amount);
  if (!amount) return res.status(400).json({ ok: false, error: 'amount is required' });
  const targetInvoiceId = String(req.body?.invoiceId || '').trim() || null;
  const proofAttached = Boolean(req.body?.proofAttached);
  const payment = {
    id: nextNumericId('PAY-', payments),
    ref: nextNumericId('PAY-', payments, 'ref'),
    customerId: customer.id,
    party: customer.name,
    amount: formatMoneyValue(amount),
    method: req.body?.method || 'EFT',
    status: proofAttached ? (targetInvoiceId ? 'Ready to allocate' : 'Unallocated') : 'Pending proof',
    date: stampNow(),
    appliedTo: targetInvoiceId || 'To be assigned',
    proof: proofAttached ? 'Attached' : 'Missing',
    nextAction: proofAttached ? (targetInvoiceId ? `Allocate against ${targetInvoiceId}` : 'Allocate to open invoice') : 'Request proof attachment'
  };
  payments.unshift(payment);
  if (proofAttached && targetInvoiceId && req.body?.autoAllocate !== false) {
    payment.status = 'Allocated';
    payment.nextAction = 'Allocation complete';
    const invoice = refreshInvoicePaymentState(targetInvoiceId);
    if (invoice) invoice.nextAction = `Payment ${payment.ref} allocated`;
  }
  refreshCustomerFinancials(customer.id);
  pushAudit({ title: 'Payment captured', detail: `${payment.ref} captured for ${customer.name}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'payment', recordId: payment.id, recordPath: recordPathFor('payment', payment.id), customerId: payment.customerId, status: payment.status });
  pushNotification({ id: `NT-${Date.now()}`, title: `Payment ${payment.ref} captured`, meta: `${customer.name} - Finance`, state: payment.status === 'Pending proof' ? 'Action' : 'New', read: false, type: 'payment', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ payment: buildPaymentDetail(payment) }));
});
app.get('/api/notifications', (_req, res) => res.json(envelope(activeNotifications())));
app.patch('/api/notifications/:id/read', (req, res) => {
  const notification = findNotification(req.params.id);
  if (!notification) return res.status(404).json({ ok: false, error: 'notification not found' });
  notification.read = Boolean(req.body?.read);
  if (notification.read && notification.state === 'Pending') notification.state = 'Seen';
  return res.json(envelope(notification));
});
app.patch('/api/notifications/:id/snooze', (req, res) => {
  const notification = findNotification(req.params.id);
  if (!notification) return res.status(404).json({ ok: false, error: 'notification not found' });
  notification.read = true;
  notification.state = 'Snoozed';
  notification.snoozedUntil = req.body?.until || 'later';
  notification.meta = `${notification.meta} • snoozed until ${notification.snoozedUntil}`;
  pushAudit({ title: 'Notification snoozed', detail: `${notification.title} snoozed until ${notification.snoozedUntil}.`, actor: 'Ops Desk', timestamp: stampNow(), recordType: 'system', recordId: notification.id, recordPath: '/notifications', customerId: null, status: 'Snoozed' });
  return res.json(envelope(notification));
});
app.patch('/api/notifications/:id/dismiss', (req, res) => {
  const notification = findNotification(req.params.id);
  if (!notification) return res.status(404).json({ ok: false, error: 'notification not found' });
  notification.dismissed = true;
  pushAudit({ title: 'Notification dismissed', detail: `${notification.title} removed from active inbox.`, actor: 'Ops Desk', timestamp: stampNow(), recordType: 'system', recordId: notification.id, recordPath: '/notifications', customerId: null, status: 'Dismissed' });
  return res.json(envelope(notification));
});
app.post('/api/quotes/:id/status', requirePermission('quotes.write'), (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });
  const nextStatus = req.body?.status;
  const allowed = ['Draft', 'Pending approval', 'Approved', 'Sent to customer', 'Converted'];
  if (!allowed.includes(nextStatus)) return res.status(400).json({ ok: false, error: 'unsupported quote status' });
  if (quote.status === 'Converted') return res.status(400).json({ ok: false, error: 'converted quotes are locked' });
  quote.status = nextStatus;
  quote.updated = stampNow();
  quote.nextAction = nextStatus === 'Approved' ? 'Mark as sent or convert to invoice' : nextStatus === 'Sent to customer' ? 'Convert to invoice after customer confirmation' : nextStatus === 'Pending approval' ? 'Manager review required before send' : 'Continue internal review';
  quote.workflow.push({ label: 'Status update', detail: `Quote moved to ${nextStatus}` });
  pushAudit({ title: 'Quote status changed', detail: `${quote.id} moved to ${nextStatus}.`, actor: quote.owner, timestamp: stampNow(), recordType: 'quote', recordId: quote.id, recordPath: recordPathFor('quote', quote.id), customerId: quote.customerId, status: nextStatus });
  return res.json(envelope({ quote: buildQuoteDetail(quote) }));
});
app.post('/api/quotes/:id/approve', requirePermission('quotes.approve'), (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });
  quote.status = 'Approved';
  quote.updated = stampNow();
  quote.nextAction = 'Mark as sent or convert to invoice';
  quote.workflow.push({ label: 'Approved', detail: 'Approved from inbox or record action controls' });
  pushAudit({ title: 'Quote approved', detail: `${quote.id} approved for ${quote.customer}.`, actor: 'Sales Manager', timestamp: stampNow(), recordType: 'quote', recordId: quote.id, recordPath: recordPathFor('quote', quote.id), customerId: quote.customerId, status: 'Approved' });
  pushNotification({ id: `NT-${Date.now()}`, title: `Quote ${quote.id} approved`, meta: `${quote.customer} - Sales`, state: 'New', read: false, type: 'approval', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ quote: buildQuoteDetail(quote) }));
});
app.post('/api/quotes/:id/convert', requirePermission('quotes.convert'), (req, res) => {
  const quote = findQuote(req.params.id);
  if (!quote) return res.status(404).json({ ok: false, error: 'quote item not found' });
  const existingInvoice = invoices.find((entry) => entry.source === quote.id);
  if (existingInvoice) return res.json(envelope({ quote: buildQuoteDetail(quote), invoice: buildInvoiceDetail(existingInvoice), reused: true }));
  if (!['Approved', 'Sent to customer'].includes(quote.status)) {
    return res.status(400).json({ ok: false, error: 'quote must be approved or sent before conversion' });
  }
  const nextId = 2200 + invoices.length + 1;
  const invoice = { id: `INV-${nextId}`, customerId: quote.customerId, customer: quote.customer, amount: quote.total, branch: quote.branch, status: 'Draft', due: 'Due in 30 days', source: quote.id, paymentStatus: 'Unpaid', tax: 'VAT standard', reminders: 'Not started', nextAction: 'Review invoice draft and issue to customer' };
  invoices.unshift(invoice);
  quote.status = 'Converted';
  quote.updated = stampNow();
  quote.nextAction = `Invoice ${invoice.id} ready for review`;
  quote.workflow.push({ label: 'Converted', detail: `Invoice ${invoice.id} created from this quote` });
  pushAudit({ title: 'Quote converted', detail: `${quote.id} converted to invoice ${invoice.id}.`, actor: quote.owner, timestamp: stampNow(), recordType: 'quote', recordId: quote.id, recordPath: recordPathFor('quote', quote.id), customerId: quote.customerId, status: 'Converted' });
  pushAudit({ title: 'Invoice created', detail: `${invoice.id} created from quote ${quote.id}.`, actor: quote.owner, timestamp: stampNow(), recordType: 'invoice', recordId: invoice.id, recordPath: recordPathFor('invoice', invoice.id), customerId: quote.customerId, status: 'Draft' });
  return res.json(envelope({ quote: buildQuoteDetail(quote), invoice: buildInvoiceDetail(invoice), reused: false }));
});
app.post('/api/invoices/:id/reminder', requirePermission('invoices.write'), (req, res) => {
  const invoice = findInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ ok: false, error: 'invoice item not found' });
  invoice.reminders = 'Reminder sent today';
  invoice.nextAction = 'Await customer payment response';
  pushAudit({ title: 'Reminder sent', detail: `Reminder sent for ${invoice.id}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'invoice', recordId: invoice.id, recordPath: recordPathFor('invoice', invoice.id), customerId: invoice.customerId, status: invoice.status });
  pushNotification({ id: `NT-${Date.now()}`, title: `Reminder sent for ${invoice.id}`, meta: `${invoice.customer} - Finance`, state: 'Done', read: true, type: 'collection', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ invoice: buildInvoiceDetail(invoice) }));
});
app.post('/api/payments/:id/resolve-proof', requirePermission('payments.resolve'), (req, res) => {
  const payment = findPayment(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, error: 'payment item not found' });
  payment.proof = 'Attached and verified';
  payment.status = payment.appliedTo && payment.appliedTo !== 'To be assigned' ? 'Ready to allocate' : 'Unallocated';
  payment.nextAction = payment.status === 'Ready to allocate' ? `Allocate against ${payment.appliedTo}` : 'Allocate to open invoice';
  pushAudit({ title: 'Payment proof resolved', detail: `${payment.ref} proof verified and ready for next finance step.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'payment', recordId: payment.id, recordPath: recordPathFor('payment', payment.id), customerId: payment.customerId, status: payment.status });
  pushNotification({ id: `NT-${Date.now()}`, title: `Payment proof resolved`, meta: `${payment.ref} - Finance`, state: 'Done', read: true, type: 'payment', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ payment: buildPaymentDetail(payment) }));
});
app.post('/api/payments/:id/allocate', requirePermission('payments.allocate'), (req, res) => {
  const payment = findPayment(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, error: 'payment item not found' });
  const invoiceId = req.body?.invoiceId || invoices.find((entry) => entry.customerId === payment.customerId && entry.status !== 'Paid')?.id;
  if (!invoiceId) return res.status(400).json({ ok: false, error: 'no invoice available for allocation' });
  payment.appliedTo = invoiceId;
  payment.status = 'Allocated';
  payment.nextAction = 'Allocation complete';
  const invoice = refreshInvoicePaymentState(invoiceId);
  if (invoice) {
    invoice.nextAction = `Payment ${payment.ref} allocated`;
    pushAudit({ title: 'Invoice updated from payment', detail: `${invoice.id} now reflects allocation from ${payment.ref}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'invoice', recordId: invoice.id, recordPath: recordPathFor('invoice', invoice.id), customerId: invoice.customerId, status: invoice.status });
  }
  refreshCustomerFinancials(payment.customerId);
  pushAudit({ title: 'Payment allocated', detail: `${payment.ref} allocated to ${invoiceId}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'payment', recordId: payment.id, recordPath: recordPathFor('payment', payment.id), customerId: payment.customerId, status: 'Allocated' });
  pushNotification({ id: `NT-${Date.now()}`, title: `Payment ${payment.ref} allocated`, meta: `${invoiceId} - Finance`, state: 'Done', read: true, type: 'payment', dismissed: false, snoozedUntil: null });
  return res.json(envelope({ payment: buildPaymentDetail(payment) }));
});
function buildEmailDraft(kind, id) {
  if (kind === 'quote-send') {
    const quote = findQuote(id);
    if (!quote) return null;
    const customer = findCustomer(quote.customerId);
    return {
      kind,
      subject: `Quote ${quote.id} from Kryvexis OS`,
      to: customer?.contact || 'client@example.com',
      recordId: quote.id,
      customerName: quote.customer,
      intro: `Hi ${quote.customer},`,
      body: [
        `Please find quote ${quote.id} prepared for your review with a total value of ${quote.total}.`,
        `The quote is valid until ${quote.validity} and covers the requested items for the ${quote.branch} branch workflow.`,
        `Reply to this email if you would like us to proceed or adjust any line items before confirmation.`
      ],
      closing: `Regards,\n${quote.owner}\nKryvexis Solutions`
    };
  }
  if (kind === 'invoice-reminder') {
    const invoice = findInvoice(id);
    if (!invoice) return null;
    const customer = findCustomer(invoice.customerId);
    return {
      kind,
      subject: `Reminder: invoice ${invoice.id} is due`,
      to: customer?.contact || 'accounts@example.com',
      recordId: invoice.id,
      customerName: invoice.customer,
      intro: `Hi ${invoice.customer},`,
      body: [
        `This is a friendly reminder regarding invoice ${invoice.id} for ${invoice.amount}.`,
        `The invoice is currently marked as ${invoice.status.toLowerCase()} and the due status is ${invoice.due}.`,
        `If payment has already been made, please send proof of payment so our finance team can update the record immediately.`
      ],
      closing: `Regards,\nFinance Team\nKryvexis Solutions`
    };
  }
  if (kind === 'payment-proof') {
    const payment = findPayment(id);
    if (!payment) return null;
    const customer = findCustomer(payment.customerId);
    return {
      kind,
      subject: `Follow-up: payment ${payment.ref} proof required`,
      to: customer?.contact || 'finance@example.com',
      recordId: payment.id,
      customerName: payment.party,
      intro: `Hi ${payment.party},`,
      body: [
        `We have recorded payment ${payment.ref} for ${payment.amount} via ${payment.method}.`,
        `Our team still needs the supporting proof so we can complete allocation against ${payment.appliedTo}.`,
        `Please reply with the payment confirmation at your earliest convenience so we can close the finance action.`
      ],
      closing: `Regards,\nFinance Team\nKryvexis Solutions`
    };
  }
  return null;
}

listRoute('customers', customers);
app.get('/api/products', (_req, res) => res.json(envelope(buildInventoryRows())));
app.get('/api/products/:id', (req, res) => {
  const item = buildInventoryRows().find((entry) => entry.id === req.params.id || entry.sku === req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: 'products item not found' });
  return res.json(envelope(item));
});
listRoute('suppliers', suppliers);
listRoute('purchase-orders', purchaseOrders);
app.get('/api/emails/:kind/:id', (req, res) => {
  const draft = buildEmailDraft(req.params.kind, req.params.id);
  if (!draft) return res.status(404).json({ ok: false, error: 'email draft not found' });
  return res.json(envelope(draft));
});
app.get('/api/accounting/overview', (_req, res) => res.json(envelope(buildAccountingOverview())));
app.get('/api/accounting/debtors', (_req, res) => res.json(envelope(buildDebtorRows())));
app.get('/api/accounting/statements', (_req, res) => res.json(envelope(buildStatementRows())));
app.post('/api/accounting/statements/:customerId/send', requirePermission('invoices.write'), (req, res) => {
  const customer = findCustomer(req.params.customerId);
  if (!customer) return res.status(404).json({ ok: false, error: 'customer not found' });
  pushAudit({ title: 'Statement sent', detail: `Statement queued for ${customer.name}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'system', recordId: `STM-${customer.id}`, recordPath: `/accounting/statements`, customerId: customer.id, status: 'Sent' });
  pushNotification({ id: `NT-${Date.now()}`, title: `Statement sent for ${customer.name}`, meta: `${customer.branch} - Finance`, state: 'Done', read: true, type: 'collection', dismissed: false, snoozedUntil: null });
  return res.json(envelope(buildStatementRows().find((item) => item.customerId === customer.id)));
});
app.get('/api/accounting/cash-ups', (_req, res) => res.json(envelope(cashUps)));
app.post('/api/accounting/cash-ups/:id/approve', requirePermission('invoices.write'), (req, res) => {
  const item = cashUps.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: 'cash-up not found' });
  item.status = 'Approved';
  item.recommendation = 'Released to close history';
  pushAudit({ title: 'Cash-up approved', detail: `${item.branch} cash-up approved for ${item.date}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'system', recordId: item.id, recordPath: '/accounting/cash-up', status: 'Approved' });
  return res.json(envelope(item));
});
app.get('/api/accounting/expenses', (_req, res) => res.json(envelope(expenses)));
app.post('/api/accounting/expenses/:id/approve', requirePermission('invoices.write'), (req, res) => {
  const item = expenses.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: 'expense not found' });
  item.status = 'Approved';
  item.recommendation = 'Posted and cleared for reporting';
  pushAudit({ title: 'Expense approved', detail: `${item.id} approved for ${item.branch}.`, actor: 'Finance Team', timestamp: stampNow(), recordType: 'system', recordId: item.id, recordPath: '/accounting/expenses', status: 'Approved' });
  return res.json(envelope(item));
});
app.get('/api/accounting/creditors', (_req, res) => res.json(envelope(buildCreditorRows())));
app.get('/api/accounting/exceptions', (_req, res) => res.json(envelope(buildFinanceExceptions())));
app.get('/api/procurement/brain', (_req, res) => res.json(envelope(buildProcurementOverview())));
app.get('/api/procurement/reorders', (_req, res) => res.json(envelope(buildProcurementReorders())));
app.get('/api/procurement/suppliers', (_req, res) => res.json(envelope(buildSupplierInsights())));
app.get('/api/procurement/purchase-orders', (_req, res) => res.json(envelope(buildProcurementPurchaseOrders())));
app.get('/api/procurement/exceptions', (_req, res) => res.json(envelope(buildProcurementExceptions())));
app.get('/api/inventory/brain', (_req, res) => res.json(envelope(buildInventoryOverview())));
app.get('/api/inventory/stock-risks', (_req, res) => res.json(envelope(buildStockRisks())));
app.get('/api/inventory/transfers', (_req, res) => res.json(envelope(buildTransferSuggestions())));
app.get('/api/inventory/movement-intelligence', (_req, res) => res.json(envelope(buildMovementIntelligence())));
app.get('/api/inventory/exceptions', (_req, res) => res.json(envelope(buildInventoryExceptions())));

app.get('/api/reports', async (req, res) => {
  if (pool) await hydrateAutomationState();
  const role = String(req.query.role || 'admin');
  const branch = String(req.query.branch || 'all');
  return res.json(envelope(buildReportPayload(role, branch)));
});
app.get('/api/automation-settings', async (_req, res) => {
  if (pool) await hydrateAutomationState();
  return res.json(envelope(automationState.automationSettings));
});
app.post('/api/automation-settings', requirePermission('automation.manage'), async (req, res) => {
  automationState.automationSettings = {
    ...automationState.automationSettings,
    ...req.body,
    managerRecipients: Array.isArray(req.body.managerRecipients) ? req.body.managerRecipients : automationState.automationSettings.managerRecipients,
    executiveRecipients: Array.isArray(req.body.executiveRecipients) ? req.body.executiveRecipients : automationState.automationSettings.executiveRecipients
  };
  await logAutomationEvent({ action: 'Automation settings updated', status: 'info', detail: 'Recipient rules or close cadence were updated.', actor: 'Antonie Meyer', date: isoDateOffset(0) });
  await persistAutomationState();
  return res.json(envelope(automationState.automationSettings));
});
app.post('/api/day-close/run', requirePermission('automation.manage'), async (req, res) => {
  try {
    if (pool) await hydrateAutomationState();
    const result = await runDayClose({ trigger: req.body?.trigger || 'manual', sendEmail: Boolean(req.body?.sendEmail), date: req.body?.date || isoDateOffset(-1), force: Boolean(req.body?.force), actor: req.body?.actor || 'Antonie Meyer' });
    return res.json(envelope(result));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'day close failed' });
  }
});
app.post('/api/day-close/send-summary', requirePermission('automation.manage'), async (req, res) => {
  try {
    if (pool) await hydrateAutomationState();
    const dispatch = await sendLatestSummary({ resend: Boolean(req.body?.resend), actor: req.body?.actor || 'Antonie Meyer' });
    return res.json(envelope(dispatch));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || 'email send failed' });
  }
});
app.get('/api/settings', async (_req, res) => {
  if (pool) await hydrateAutomationState();
  return res.json(envelope({ ...settings, automation: automationState.automationSettings }));
});
app.get('/api/roles', (_req, res) => res.json(envelope(roles)));

function startScheduler() {
  if (process.env.ENABLE_DAY_CLOSE_SCHEDULER !== 'true') return;
  automationState.scheduler.enabled = true;
  persistAutomationState().catch((error) => console.error('Failed to persist scheduler flag', error));
  setInterval(async () => {
    const now = new Date();
    const hhmm = now.toTimeString().slice(0, 5);
    if (automationState.automationSettings.triggerMode !== 'scheduled-close') return;
    if (hhmm !== automationState.automationSettings.closeTime) return;
    const today = now.toISOString().slice(0, 10);
    if (automationState.scheduler.lastAutoRunDate === today) return;
    try {
      if (pool) await hydrateAutomationState();
      await runDayClose({ trigger: 'scheduled', sendEmail: true, date: today });
      automationState.scheduler.lastAutoRunDate = today;
      await persistAutomationState();
    } catch (error) {
      console.error('Scheduled day close failed', error);
    }
  }, 60000);
}

async function boot() {
  if (pool) {
    await ensureSqlSchema();
    await hydrateAutomationState();
    console.log('Kryvexis OS SQL automation enabled');
  } else {
    console.log('Kryvexis OS using JSON automation state');
  }
  startScheduler();
  app.listen(port, () => console.log(`Kryvexis OS backend running on ${port}`));
}

boot().catch((error) => {
  console.error('Backend boot failed', error);
  process.exit(1);
});
