import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { API_BASE_URL } from '../../constants';

// Define the shape of the context data
interface PrincipalContextType {
  badges: {
    staff: number;
    students: number;
    messages: number;
    reports: number;
  };
  refreshBadges: () => void;
  updateBadge: (type: keyof PrincipalContextType['badges'], count: number) => void;
}

// Create the context
const PrincipalContext = createContext<PrincipalContextType | undefined>(undefined);

// Define the props for the provider component
interface PrincipalProviderProps {
  children: ReactNode;
  token?: string;
  academicYearId?: number | null;
}

// Create the provider component
export const PrincipalProvider: React.FC<PrincipalProviderProps> = ({ children, token, academicYearId }) => {
  const [badges, setBadges] = useState({
    staff: 0,
    students: 0,
    messages: 0,
    reports: 0,
  });

  const refreshBadges = useCallback(async () => {
    if (!token || !academicYearId) return;

    try {
      const dashboardPromise = fetch(`${API_BASE_URL}/principal/dashboard?academicYearId=${academicYearId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const messagesPromise = fetch(`${API_BASE_URL}/messaging/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const [dashboardRes, messagesRes] = await Promise.all([dashboardPromise, messagesPromise]);

      if (!dashboardRes.ok || !messagesRes.ok) {
        console.error('Failed to fetch badge data');
        return;
      }
      
      const dashboardData = await dashboardRes.json();
      const messagesData = await messagesRes.json();

      if (dashboardData.success && messagesData.success) {
        setBadges({
          staff: dashboardData.data.schoolAnalytics?.totalTeachers ?? 0,
          students: dashboardData.data.schoolAnalytics?.totalStudents ?? 0,
          messages: messagesData.data?.unreadMessages ?? 0,
          reports: dashboardData.data.performanceMetrics?.academicPerformance?.classPerformance?.length ?? 0,
        });
      }

    } catch (error) {
      console.error('Failed to refresh principal badges:', error);
    }
  }, [token, academicYearId]);

  const updateBadge = (type: keyof PrincipalContextType['badges'], count: number) => {
    setBadges(prev => ({ ...prev, [type]: count }));
  };

  // Effect to refresh badges periodically
  useEffect(() => {
    if (token && academicYearId) {
      refreshBadges();
      const interval = setInterval(refreshBadges, 5 * 60 * 1000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [token, academicYearId, refreshBadges]);

  return (
    <PrincipalContext.Provider value={{ badges, refreshBadges, updateBadge }}>
      {children}
    </PrincipalContext.Provider>
  );
};

// Custom hook to use the principal's badges
export const usePrincipalBadges = () => {
  const context = useContext(PrincipalContext);
  if (context === undefined) {
    throw new Error('usePrincipalBadges must be used within a PrincipalProvider');
  }
  return context.badges;
};

// Custom hook to use the full principal context
export const usePrincipalContext = () => {
  const context = useContext(PrincipalContext);
  if (context === undefined) {
    throw new Error('usePrincipalContext must be used within a PrincipalProvider');
  }
  return context;
}; 