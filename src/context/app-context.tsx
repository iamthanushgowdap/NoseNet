'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DemoRole, DemoSession } from '@/types/auth';
import { Experiment } from '@/types/experiment';
import { Sample } from '@/types/sample';
import { services } from '@/services';

interface AppContextType {
  session: DemoSession | null;
  isLoadingSession: boolean;
  login: (displayName: string, role: DemoRole) => Promise<DemoSession>;
  logout: () => Promise<void>;
  switchRole: (role: DemoRole) => Promise<void>;

  experiments: Experiment[];
  samples: Sample[];
  sensorReadingsCount: number;
  assessmentsCount: number;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [sensorReadingsCount, setSensorReadingsCount] = useState(0);
  const [assessmentsCount, setAssessmentsCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const [exps, smps, readings, asms] = await Promise.all([
        services.experiments.getExperiments(),
        services.samples.getSamples(),
        services.sensor.getReadings(),
        services.assessments.getAssessments(),
      ]);

      setExperiments(exps);
      setSamples(smps);
      setSensorReadingsCount(readings.length);
      setAssessmentsCount(asms.length);
    } catch (e) {
      console.error('[AppContext] Failed to refresh data:', e);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    async function initSession() {
      try {
        const stored = await services.auth.getSession();
        if (stored) {
          setSession(stored);
        } else {
          // Default session for quick development onboarding if none exists:
          // A researcher session so the dashboard works right away without forced roadblocks
          const defaultSession = await services.auth.login('Lead Researcher', 'researcher');
          setSession(defaultSession);
        }
      } catch (e) {
        console.error('[AppContext] Failed to load session:', e);
      } finally {
        setIsLoadingSession(false);
      }
    }

    initSession();
    refreshData();
  }, [refreshData]);

  const login = async (displayName: string, role: DemoRole) => {
    const newSession = await services.auth.login(displayName, role);
    setSession(newSession);
    await refreshData();
    return newSession;
  };

  const logout = async () => {
    await services.auth.logout();
    setSession(null);
  };

  const switchRole = async (role: DemoRole) => {
    const updated = await services.auth.switchRole(role);
    if (updated) {
      setSession(updated);
    } else if (session) {
      const fallback = await services.auth.login(session.displayName, role);
      setSession(fallback);
    }
  };

  return (
    <AppContext.Provider
      value={{
        session,
        isLoadingSession,
        login,
        logout,
        switchRole,
        experiments,
        samples,
        sensorReadingsCount,
        assessmentsCount,
        isLoadingData,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
