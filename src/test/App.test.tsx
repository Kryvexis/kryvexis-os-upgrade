import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { ThemeProvider } from '../theme/ThemeProvider';
import { PreferencesProvider } from '../preferences/PreferencesProvider';

function renderApp(route: string) {
  return render(
    <ThemeProvider>
      <PreferencesProvider>
        <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </MemoryRouter>
      </PreferencesProvider>
    </ThemeProvider>
  );
}

describe('Kryvexis OS detail pages pass', () => {
  it('renders the dashboard route', async () => {
    renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Kryvexis OS')).toBeInTheDocument();
  });

  it('renders the notifications page', async () => {
    renderApp('/notifications');

    expect(await screen.findByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByText(/priority alerts/i)).toBeInTheDocument();
  });

  it('renders the sample customer detail page', async () => {
    renderApp('/customers/1');

    expect(await screen.findByRole('heading', { name: 'Aether Group' })).toBeInTheDocument();
    expect(screen.getByText(/customer overview/i)).toBeInTheDocument();
  });

  it('updates the active role from settings', async () => {
    renderApp('/settings');

    const financeRoleButton = await screen.findByRole('button', { name: /finance/i });
    fireEvent.click(financeRoleButton);

    expect(screen.getByText(/main branch · finance/i)).toBeInTheDocument();
  });

  it('cycles theme mode from the topbar', async () => {
    renderApp('/dashboard');

    const themeButton = await screen.findByRole('button', { name: /change theme mode/i });
    fireEvent.click(themeButton);

    expect(document.documentElement.dataset.themeMode).toBe('light');
    fireEvent.click(themeButton);
    expect(document.documentElement.dataset.themeMode).toBe('dark');
  });

  it('opens the top-right user menu', async () => {
    renderApp('/dashboard');

    const menuButton = await screen.findByRole('button', { name: /open user menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByText(/signed in as antonie meyer/i)).toBeInTheDocument();
  });
});
