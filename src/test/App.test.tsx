import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { ThemeProvider } from '../theme/ThemeProvider';

function renderApp(route: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('Kryvexis OS structure pass', () => {
  it('renders the dashboard route', async () => {
    renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Kryvexis OS')).toBeInTheDocument();
  });

  it('renders the customers page', async () => {
    renderApp('/customers');

    expect(await screen.findByRole('heading', { name: 'Customers' })).toBeInTheDocument();
    expect(screen.getByText(/customer profiles/i)).toBeInTheDocument();
  });

  it('opens the settings page', async () => {
    renderApp('/settings');

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText(/role selection/i)).toBeInTheDocument();
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
