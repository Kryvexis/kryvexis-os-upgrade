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
import { ProductsPage } from './pages/ProductsPage';
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
import { AuthPage } from './pages/AuthPage';
import { SystemIgnitionPage } from './pages/SystemIgnitionPage';
import { PosPage } from './pages/PosPage';
import { applyTheme, getStoredTheme, type ThemeMode } from './lib/theme';
import { api } from './lib/api';
import type { AuthSession, RoleKey } from './types';
import logo from './assets/kryvexis-logo.png';

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
          <h1>One intelligent command center for finance, procurement, and stock control.</h1>
          <p className="entry-copy">Built to feel cinematic on mobile, sharp on desktop, and powerful enough to run the business from one place.</p>
          <div className="intro-feature-grid">
            <div className="intro-feature-card"><strong>Accounting intelligence</strong><p>Collection scoring, cash-up alerts, and statement actions in one finance cockpit.</p></div>
            <div className="intro-feature-card"><strong>Procurement autopilot</strong><p>Reorder pressure, supplier insight, and purchase decisions guided by live demand.</p></div>
            <div className="intro-feature-card"><strong>Inventory brain</strong><p>Low-stock prediction, movement intelligence, and branch-aware stock control.</p></div>
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
        <img src={logo} alt="Kryvexis" className="entry-logo splash-logo" />
        <p className="eyebrow">Initializing command center</p>
      </div>
    </main>
  );
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

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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

  useEffect(() => {
    if (session?.role) setRole(session.role);
  }, [session]);

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
        <Route path="/sales" element={<SalesWorkspacePage />} />
        <Route path="/sales/pos" element={<PosPage />} />
        <Route path="/inventory" element={<InventoryWorkspacePage />} />
        <Route path="/procurement" element={<ProcurementWorkspacePage />} />
        <Route path="/procurement/brain" element={<ProcurementBrainPage />} />
        <Route path="/procurement/reorders" element={<ReordersPage />} />
        <Route path="/procurement/suppliers" element={<SupplierScorecardsPage />} />
        <Route path="/procurement/purchase-orders" element={<PurchaseOrderRecommendationsPage />} />
        <Route path="/procurement/exceptions" element={<ProcurementExceptionsPage />} />
        <Route path="/accounting" element={<AccountingWorkspacePage />} />
        <Route path="/action-center" element={<ActionCenterPage role={role} />} />
        <Route path="/accounting/debtors" element={<DebtorsPage />} />
        <Route path="/accounting/statements" element={<StatementsPage />} />
        <Route path="/accounting/cash-up" element={<CashUpPage />} />
        <Route path="/accounting/expenses" element={<ExpensesPage />} />
        <Route path="/accounting/creditors" element={<CreditorsPage />} />
        <Route path="/accounting/exceptions" element={<FinanceExceptionsPage />} />
        <Route path="/accounting/ledger" element={<LedgerPage />} />
        <Route path="/accounting/bills" element={<SupplierBillsPage />} />
        <Route path="/accounting/reconciliation" element={<ReconciliationPage />} />
        <Route path="/accounting/vat" element={<VatControlPage />} />
        <Route path="/accounting/period-close" element={<PeriodClosePage />} />
        <Route path="/operations" element={<OperationsWorkspacePage />} />
        <Route path="/reports" element={<ReportsPage role={role} />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/quotes/:id" element={<QuoteDetailPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payments/:id" element={<PaymentDetailPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/workspace-admin" element={<WorkspaceAdminPage />} />
        <Route path="/emails/:kind/:id" element={<EmailComposerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
