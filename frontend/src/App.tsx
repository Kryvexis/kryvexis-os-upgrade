import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
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
import { EmailComposerPage } from './pages/EmailComposerPage';
import { SalesWorkspacePage } from './pages/SalesWorkspacePage';
import { InventoryWorkspacePage } from './pages/InventoryWorkspacePage';
import { ProcurementWorkspacePage } from './pages/ProcurementWorkspacePage';
import { AccountingWorkspacePage } from './pages/AccountingWorkspacePage';
import { OperationsWorkspacePage } from './pages/OperationsWorkspacePage';
import { ReportsPage } from './pages/ReportsPage';
import { applyTheme, getStoredTheme, type ThemeMode } from './lib/theme';
import { api, getStoredSessionToken, setStoredSessionToken } from './lib/api';
import { AuthPage } from './pages/AuthPage';
import type { AuthUser, RoleKey } from './types';

export default function App() {
  const [role, setRole] = useState<RoleKey>('manager');
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  async function refreshSession() {
    const token = getStoredSessionToken();
    if (!token) {
      setUser(null);
      setPermissions([]);
      setLoading(false);
      return;
    }
    try {
      const session = await api.me();
      setUser(session.user);
      setPermissions(session.permissions);
      setRole(session.user.roleKey);
    } catch {
      setStoredSessionToken('');
      setUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSession();
  }, []);

  if (loading) return <main className="auth-screen"><section className="auth-card card"><strong>Loading workspace...</strong></section></main>;
  if (!user) return <AuthPage onAuthenticated={refreshSession} />;

  return (
    <Routes>
      <Route path="/quotes/:id/print" element={<QuotePrintPage />} />
      <Route path="/invoices/:id/print" element={<InvoicePrintPage />} />
      <Route element={<AppShell role={role} setRole={setRole} theme={theme} setTheme={setTheme} user={user} permissions={permissions} onLogout={async () => { await api.logout(); setUser(null); setPermissions([]); }} />}>
        <Route path="/" element={<DashboardPage role={role} />} />
        <Route path="/sales" element={<SalesWorkspacePage />} />
        <Route path="/inventory" element={<InventoryWorkspacePage />} />
        <Route path="/procurement" element={<ProcurementWorkspacePage />} />
        <Route path="/accounting" element={<AccountingWorkspacePage />} />
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
        <Route path="/roles" element={permissions.includes('roles.read') ? <RolesPage /> : <Navigate to="/" replace />} />
        <Route path="/settings" element={permissions.includes('settings.read') ? <SettingsPage /> : <Navigate to="/" replace />} />
        <Route path="/emails/:kind/:id" element={<EmailComposerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
