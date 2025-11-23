'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface DemoOnboardingContextValue {
  isDemoOnboardingMode: boolean;
  toggleDemoOnboardingMode: () => void;
}

const DemoOnboardingContext = createContext<DemoOnboardingContextValue | undefined>(undefined);

const STORAGE_KEY = 'aimmDemoOnboardingMode';

export function DemoOnboardingProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isDemoOnboardingMode, setIsDemoOnboardingMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsDemoOnboardingMode(true);
    }
  }, []);

  const toggleDemoOnboardingMode = useCallback(() => {
    setIsDemoOnboardingMode(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isDemoOnboardingMode,
      toggleDemoOnboardingMode,
    }),
    [isDemoOnboardingMode, toggleDemoOnboardingMode]
  );

  return <DemoOnboardingContext.Provider value={value}>{children as any}</DemoOnboardingContext.Provider>;
}

export function useDemoOnboarding(): DemoOnboardingContextValue {
  const context = useContext(DemoOnboardingContext);
  if (!context) {
    throw new Error('useDemoOnboarding must be used within a DemoOnboardingProvider');
  }
  return context;
}
