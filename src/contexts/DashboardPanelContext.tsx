import React, { createContext, useContext, useState } from 'react';

interface TraineePanelData {
  courseId: string | null;
  setCourseId: (id: string | null) => void;
}

type TrainerPanelData = Record<string, never>;

type AdminPanelData = Record<string, never>;

type TeammatePanelData = Record<string, never>;

interface DashboardPanelContextType {
  trainee: TraineePanelData;
  trainer: TrainerPanelData;
  admin: AdminPanelData;
  teammate: TeammatePanelData;
}

const DashboardPanelContext = createContext<DashboardPanelContextType | undefined>(undefined);

export const DashboardPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Trainee state
  const [courseId, setCourseId] = useState<string | null>(null);

  // Trainer, Admin, Teammate state can be added here as needed
  const trainer: TrainerPanelData = {};
  const admin: AdminPanelData = {};
  const teammate: TeammatePanelData = {};

  return (
    <DashboardPanelContext.Provider value={{
      trainee: { courseId, setCourseId },
      trainer,
      admin,
      teammate,
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