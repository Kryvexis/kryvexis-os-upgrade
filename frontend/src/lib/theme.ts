export type ThemeMode = 'dark' | 'light' | 'system';
export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effective = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
  root.dataset.theme = effective;
  localStorage.setItem('kryvexis-theme', mode);
}
export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem('kryvexis-theme');
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  return 'dark';
}
