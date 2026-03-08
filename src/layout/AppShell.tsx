import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { useMediaQuery } from '../hooks/useMediaQuery';

const titleMap: Record<string, string> = {
  '/dashboard': 'Business overview',
  '/customers': 'Customer operating workspace',
  '/products': 'Product and stock control',
  '/quotes': 'Commercial pipeline workspace',
  '/invoices': 'Billing and collections workspace',
  '/purchase-orders': 'Procurement control workspace',
  '/approvals': 'Approvals control center',
  '/settings': 'User and workspace settings',
  '/admin': 'System administration workspace',
  '/sales': 'Customer revenue workspace',
  '/accounting': 'Financial control workspace',
  '/inventory': 'Stock and product control',
  '/procurement': 'Supplier purchasing workspace',
  '/operations': 'Execution and approvals workspace',
  '/reports': 'Reporting and forecasting workspace'
};

export function AppShell() {
  const location = useLocation();
  const subtitle = titleMap[location.pathname] ?? 'Kryvexis operating system';
  const isMobile = useMediaQuery('(max-width: 960px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="shell-main">
        <Topbar subtitle={subtitle} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>

      {isMobile ? <MobileBottomNav /> : null}
    </div>
  );
}
