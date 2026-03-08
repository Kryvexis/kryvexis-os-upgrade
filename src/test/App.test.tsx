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

describe('Kryvexis OS starter shell', () => {
  it('renders the dashboard route', async () => {
    renderApp('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Kryvexis OS')).toBeInTheDocument();
  });

  it('renders a domain landing page', async () => {
    renderApp('/inventory');

    expect(await screen.findByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
    expect(screen.getByText(/stock, movements, low stock/i)).toBeInTheDocument();
  });

  it('cycles theme mode from the topbar', async () => {
    renderApp('/dashboard');

    const themeButton = await screen.findByRole('button', { name: /change theme mode/i });
    fireEvent.click(themeButton);

    expect(document.documentElement.dataset.theme).toBe('light');
    fireEvent.click(themeButton);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
