"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

interface TraineePanelData {
  courseId: string | null;
  setCourseId: (id: string | null) => void;
}

type TrainerPanelData = Record<string, never>;

type AdminPanelData = Record<string, never>;

interface DashboardPanelContextType {
  trainee: TraineePanelData;
  trainer: TrainerPanelData;
  admin: AdminPanelData;
}

const DashboardPanelContext = createContext<DashboardPanelContextType | undefined>(undefined);

export const DashboardPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Trainee state
  const [courseId, setCourseId] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, isInitialized } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(false);

  const storageKey = useMemo(() => user ? `selectedCourse:${user.id}` : null, [user]);

  // Sync from URL path when inside trainee course routes
  useEffect(() => {
    if (!pathname) return;
    const match = pathname.match(/^\/portal\/trainee\/([^\/]+)\//);
    const idFromPath = match?.[1] ?? null;
    if (idFromPath && idFromPath !== courseId) {
      setCourseId(idFromPath);
    }
    if (idFromPath) {
      setHasHydrated(true);
    }
  }, [pathname]);

  // Hydrate from localStorage on init when not in a specific course path
  useEffect(() => {
    if (!isInitialized || !storageKey) return;
    if (typeof window === 'undefined') return;
    const match = pathname?.match(/^\/portal\/trainee\/([^\/]+)\//);
    const idFromPath = match?.[1] ?? null;
    if (idFromPath) return; // path already provides the source of truth
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved && saved !== courseId) {
        setCourseId(saved);
      }
    } catch (_e) {
      // ignore storage errors
    } finally {
      setHasHydrated(true);
    }
  }, [isInitialized, storageKey]);

  // Reset hydration flag when user changes (storageKey swap)
  useEffect(() => {
    setHasHydrated(false);
  }, [storageKey]);

  // Persist to localStorage whenever courseId changes
  useEffect(() => {
    if (!storageKey || !hasHydrated) return;
    if (typeof window === 'undefined') return;
    if (!courseId) return; // don't remove automatically; only write when set
    try {
      window.localStorage.setItem(storageKey, courseId);
    } catch (_e) {
      // ignore storage errors
    }
  }, [courseId, storageKey, hasHydrated]);

  // Trainer, Admin state can be added here as needed
  const trainer: TrainerPanelData = {};
  const admin: AdminPanelData = {};

  return (
    <DashboardPanelContext.Provider value={{
      trainee: { courseId, setCourseId },
      trainer,
      admin,
    }}>
      {children}
    </DashboardPanelContext.Provider>
  );
};

export const useDashboardPanelContext = () => {
  const context = useContext(DashboardPanelContext);
  if (!context) {
    throw new Error('useDashboardPanelContext must be used within a DashboardPanelProvider');
  }
  return context;
}; 