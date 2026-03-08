import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ModuleLandingPage } from './pages/ModuleLandingPage';
import { ApprovalsPage, CustomersPage, InvoicesPage, PaymentsPage, ProductsPage, PurchaseOrdersPage, QuotesPage } from './pages/records';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PurchaseOrderDetailPage } from './pages/PurchaseOrderDetailPage';

const moduleRoutes = {
  sales: {
    title: 'Sales',
    description: 'Quotes, invoices, orders, customers, pricing, and returns.'
  },
  accounting: {
    title: 'Accounting',
    description: 'Debtors, creditors, payments, statements, expenses, and cash up.'
  },
  inventory: {
    title: 'Inventory',
    description: 'Stock, movements, low stock, transfers, and goods received.'
  },
  procurement: {
    title: 'Procurement',
    description: 'Reorders, supplier quotes, purchase orders, suppliers, and bills.'
  },
  operations: {
    title: 'Operations',
    description: 'Job cards, deliveries, returns, tasks, and approvals.'
  },
  reports: {
    title: 'Reports',
    description: 'Operational reporting across sales, stock, accounting, and forecasting.'
  },
  admin: {
    title: 'Admin',
    description: 'Users, roles, branches, templates, settings, audit log, and imports.'
  }
} as const;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="purchase-orders/:purchaseOrderId" element={<PurchaseOrderDetailPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {Object.entries(moduleRoutes).map(([path, data]) => (
          <Route key={path} path={path} element={<ModuleLandingPage title={data.title} description={data.description} />} />
        ))}
      </Route>
    </Routes>
  );
}
