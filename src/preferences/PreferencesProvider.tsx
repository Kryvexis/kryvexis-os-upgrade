import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { RoleKey } from '../layout/navigation';

type PreferencesContextValue = {
  activeRole: RoleKey;
  setActiveRole: (role: RoleKey) => void;
  branchName: string;
  setBranchName: (branch: string) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<RoleKey>('admin');
  const [branchName, setBranchName] = useState('Main Branch');

  const value = useMemo(
    () => ({ activeRole, setActiveRole, branchName, setBranchName }),
    [activeRole, branchName]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }

  return context;
}
