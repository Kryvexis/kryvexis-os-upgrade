import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ActionCenterPage } from './pages/ActionCenterPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { QuotesPage } from './pages/QuotesPage';
import { QuoteDetailPage } from './pages/QuoteDetailPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { QuotePrintPage } from './pages/QuotePrintPage';
import { InvoicePrintPage } from './pages/InvoicePrintPage';
import { ProductsPage } from './pages/ProductDetailPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { PaymentDetailPage } from './pages/PaymentDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { RolesPage } from './pages/RolesPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkspaceAdminPage } from './pages/WorkspaceAdminPage';
import { EmailComposerPage } from './pages/EmailComposerPage';
import { SalesWorkspacePage } from './pages/SalesWorkspacePage';
import { InventoryWorkspacePage } from './pages/InventoryWorkspacePage';
import { ProcurementWorkspacePage } from './pages/ProcurementWorkspacePage';
import { ProcurementExceptionsPage } from './pages/ProcurementExceptionsPage';
import { PurchaseOrderRecommendationsPage } from './pages/PurchaseOrderRecommendationsPage';
import { SupplierScorecardsPage } from './pages/SupplierScorecardsPage';
import { ReordersPage } from './pages/ReordersPage';
import { ProcurementBrainPage } from './pages/ProcurementBrainPage';
import { AccountingWorkspacePage } from './pages/AccountingWorkspacePage';
import { DebtorsPage } from './pages/DebtorsPage';
import { StatementsPage } from './pages/StatementsPage';
import { CashUpPage } from './pages/CashUpPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { CreditorsPage } from './pages/CreditorsPage';
import { FinanceExceptionsPage } from './pages/FinanceExceptionsPage';
import { PeriodClosePage } from './pages/PeriodClosePage';
import { VatControlPage } from './pages/VatControlPage';
import { ReconciliationPage } from './pages/ReconciliationPage';
import { SupplierBillsPage } from './pages/SupplierBillsPage';
import { LedgerPage } from './pages/LedgerPage';
import { OperationsWorkspacePage } from './pages/OperationsWorkspacePage';
import { ReportsPage } from './pages/ReportsPage';
import { PosPage } from './pages/PosPage';
import { AuthPage } from './pages/AuthPage';
import { SystemIgnitionPage } from './pages/SystemIgnitionPage';
import { applyTheme, getStoredTheme, type ThemeMode } from './lib/theme';
import { api } from './lib/api';
import { canAccessModule } from './lib/permissions';
import type { AuthSession, RoleKey } from './types';
import logo from './assets/kryvexis-logo-entry.png';

const INTRO_STORAGE_KEY = 'kryvexis.entry.intro-seen';

function IntroPage({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="entry-screen intro-screen">
      <div className="entry-ambient entry-ambient-a" />
      <div className="entry-ambient entry-ambient-b" />
      <section className="entry-stage intro-stage">
        <div className="intro-panel card">
          <img src={logo} alt="Kryvexis" className="entry-logo entry-logo-large" />
          <p className="eyebrow">Welcome to Kryvexis OS</p>
          <h1>One intelligent command center for finance, procurement, stock control, and sales.</h1>
          <p className="entry-copy">Built to feel cinematic on mobile, sharp on desktop, and governed enough to keep roles, workspaces, and automation clean.</p>
          <div className="intro-feature-grid">
            <div className="intro-feature-card"><strong>Accounting intelligence</strong><p>Collection scoring, cash-up alerts, and statement actions in one finance cockpit.</p></div>
            <div className="intro-feature-card"><strong>Procurement autopilot</strong><p>Reorder pressure, supplier insight, and purchase decisions guided by live demand.</p></div>
            <div className="intro-feature-card"><strong>Inventory + POS</strong><p>Reservation-aware stock, action ranking, and a sales desk that posts into the same OS.</p></div>
          </div>
          <button type="button" className="entry-primary-button intro-cta" onClick={onContinue}>Enter Kryvexis</button>
        </div>
      </section>
    </main>
  );
}

function SplashScreen() {
  return (
    <main className="entry-screen splash-screen">
      <div className="entry-ambient entry-ambient-a" />
      <div className="entry-ambient entry-ambient-b" />
      <div className="splash-logo-wrap">
        <img src={logo} alt="Kryvexis" className="entry-logo splash-logo entry-logo-clean" />
        <p className="eyebrow">Initializing command center</p>
      </div>
    </main>
  );
}

function GuardedRoute({ role, moduleKey, children }: { role: RoleKey; moduleKey: Parameters<typeof canAccessModule>[1]; children: JSX.Element }) {
  if (!canAccessModule(role, moduleKey)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [booting, setBooting] = useState(true);
  const [showIgnition, setShowIgnition] = useState(true);
  const [introSeen, setIntroSeen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(INTRO_STORAGE_KEY) === 'true';
  });
  const [role, setRole] = useState<RoleKey>('manager');
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme());

  useEffect(() => { applyTheme(theme); }, [theme]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(async () => {
      const current = await api.me();
      if (!active) return;
      if (current) {
        setSession(current);
        setRole(current.role);
      }
      setBooting(false);
    }, 1200);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => { if (session?.role) setRole(session.role); }, [session]);

  useEffect(() => {
    if (booting || !showIgnition) return;
    const timer = window.setTimeout(() => setShowIgnition(false), 6200);
    return () => window.clearTimeout(timer);
  }, [booting, showIgnition]);

  if (booting) return <SplashScreen />;
  if (showIgnition) return <SystemIgnitionPage onFinish={() => setShowIgnition(false)} />;
  if (!introSeen) {
    return <IntroPage onContinue={() => {
      window.localStorage.setItem(INTRO_STORAGE_KEY, 'true');
      setIntroSeen(true);
    }} />;
  }
  if (!session) {
    return <AuthPage onAuthenticated={(next) => {
      setSession(next);
      setRole(next.role);
    }} />;
  }

  return (
    <Routes>
      <Route path="/quotes/:id/print" element={<QuotePrintPage />} />
      <Route path="/invoices/:id/print" element={<InvoicePrintPage />} />
      <Route element={<AppShell role={role} setRole={setRole} theme={theme} setTheme={setTheme} />}>
        <Route path="/" element={<DashboardPage role={role} />} />
        <Route path="/sales" element={<GuardedRoute role={role} moduleKey="sales"><SalesWorkspacePage /></GuardedRoute>} />
        <Route path="/sales/pos" element={<GuardedRoute role={role} moduleKey="sales-pos"><PosPage /></GuardedRoute>} />
        <Route path="/inventory" element={<GuardedRoute role={role} moduleKey="inventory"><InventoryWorkspacePage /></GuardedRoute>} />
        <Route path="/procurement" element={<GuardedRoute role={role} moduleKey="procurement"><ProcurementWorkspacePage /></GuardedRoute>} />
        <Route path="/procurement/brain" element={<GuardedRoute role={role} moduleKey="procurement"><ProcurementBrainPage /></GuardedRoute>} />
        <Route path="/procurement/reorders" element={<GuardedRoute role={role} moduleKey="procurement"><ReordersPage /></GuardedRoute>} />
        <Route path="/procurement/suppliers" element={<GuardedRoute role={role} moduleKey="procurement"><SupplierScorecardsPage /></GuardedRoute>} />
        <Route path="/procurement/purchase-orders" element={<GuardedRoute role={role} moduleKey="procurement"><PurchaseOrderRecommendationsPage /></GuardedRoute>} />
        <Route path="/procurement/exceptions" element={<GuardedRoute role={role} moduleKey="procurement"><ProcurementExceptionsPage /></GuardedRoute>} />
        <Route path="/accounting" element={<GuardedRoute role={role} moduleKey="accounting"><AccountingWorkspacePage /></GuardedRoute>} />
        <Route path="/action-center" element={<GuardedRoute role={role} moduleKey="action-center"><ActionCenterPage role={role} /></GuardedRoute>} />
        <Route path="/accounting/debtors" element={<GuardedRoute role={role} moduleKey="accounting"><DebtorsPage /></GuardedRoute>} />
        <Route path="/accounting/statements" element={<GuardedRoute role={role} moduleKey="accounting"><StatementsPage /></GuardedRoute>} />
        <Route path="/accounting/cash-up" element={<GuardedRoute role={role} moduleKey="accounting"><CashUpPage /></GuardedRoute>} />
        <Route path="/accounting/expenses" element={<GuardedRoute role={role} moduleKey="accounting"><ExpensesPage /></GuardedRoute>} />
        <Route path="/accounting/creditors" element={<GuardedRoute role={role} moduleKey="accounting"><CreditorsPage /></GuardedRoute>} />
        <Route path="/accounting/exceptions" element={<GuardedRoute role={role} moduleKey="accounting"><FinanceExceptionsPage /></GuardedRoute>} />
        <Route path="/accounting/ledger" element={<GuardedRoute role={role} moduleKey="accounting"><LedgerPage /></GuardedRoute>} />
        <Route path="/accounting/bills" element={<GuardedRoute role={role} moduleKey="accounting"><SupplierBillsPage /></GuardedRoute>} />
        <Route path="/accounting/reconciliation" element={<GuardedRoute role={role} moduleKey="accounting"><ReconciliationPage /></GuardedRoute>} />
        <Route path="/accounting/vat" element={<GuardedRoute role={role} moduleKey="accounting"><VatControlPage /></GuardedRoute>} />
        <Route path="/accounting/period-close" element={<GuardedRoute role={role} moduleKey="accounting"><PeriodClosePage /></GuardedRoute>} />
        <Route path="/operations" element={<GuardedRoute role={role} moduleKey="operations"><OperationsWorkspacePage /></GuardedRoute>} />
        <Route path="/reports" element={<GuardedRoute role={role} moduleKey="reports"><ReportsPage role={role} /></GuardedRoute>} />
        <Route path="/customers" element={<GuardedRoute role={role} moduleKey="customers"><CustomersPage /></GuardedRoute>} />
        <Route path="/customers/:id" element={<GuardedRoute role={role} moduleKey="customers"><CustomerDetailPage /></GuardedRoute>} />
        <Route path="/quotes" element={<GuardedRoute role={role} moduleKey="quotes"><QuotesPage /></GuardedRoute>} />
        <Route path="/quotes/:id" element={<GuardedRoute role={role} moduleKey="quotes"><QuoteDetailPage /></GuardedRoute>} />
        <Route path="/invoices" element={<GuardedRoute role={role} moduleKey="invoices"><InvoicesPage /></GuardedRoute>} />
        <Route path="/invoices/:id" element={<GuardedRoute role={role} moduleKey="invoices"><InvoiceDetailPage /></GuardedRoute>} />
        <Route path="/products" element={<GuardedRoute role={role} moduleKey="inventory"><ProductsPage /></GuardedRoute>} />
        <Route path="/products/:id" element={<GuardedRoute role={role} moduleKey="inventory"><ProductDetailPage /></GuardedRoute>} />
        <Route path="/payments" element={<GuardedRoute role={role} moduleKey="payments"><PaymentsPage /></GuardedRoute>} />
        <Route path="/payments/:id" element={<GuardedRoute role={role} moduleKey="payments"><PaymentDetailPage /></GuardedRoute>} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/roles" element={<GuardedRoute role={role} moduleKey="roles"><RolesPage /></GuardedRoute>} />
        <Route path="/settings" element={<GuardedRoute role={role} moduleKey="settings"><SettingsPage /></GuardedRoute>} />
        <Route path="/workspace-admin" element={<GuardedRoute role={role} moduleKey="workspace-admin"><WorkspaceAdminPage /></GuardedRoute>} />
        <Route path="/emails/:kind/:id" element={<GuardedRoute role={role} moduleKey="settings"><EmailComposerPage /></GuardedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
