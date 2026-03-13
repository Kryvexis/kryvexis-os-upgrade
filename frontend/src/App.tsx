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
import type { RoleKey } from './types';

function ReportsGate({ role }: { role: RoleKey }) {
  if (!['admin', 'manager', 'executive'].includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <ReportsPage role={role} />;
}

export default function App() {
  const [role, setRole] = useState<RoleKey>('manager');
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/quotes/:id/print" element={<QuotePrintPage />} />
      <Route path="/invoices/:id/print" element={<InvoicePrintPage />} />
      <Route element={<AppShell role={role} setRole={setRole} theme={theme} setTheme={setTheme} />}>
        <Route path="/" element={<DashboardPage role={role} />} />
        <Route path="/reports" element={<ReportsGate role={role} />} />
        <Route path="/sales" element={<SalesWorkspacePage />} />
        <Route path="/inventory" element={<InventoryWorkspacePage />} />
        <Route path="/procurement" element={<ProcurementWorkspacePage />} />
        <Route path="/accounting" element={<AccountingWorkspacePage />} />
        <Route path="/operations" element={<OperationsWorkspacePage />} />
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
        <Route path="/emails/:kind/:id" element={<EmailComposerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
