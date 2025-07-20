import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TeacherContextType {
  badges: {
    subjects: number;
    students: number;
    marks: number;
    attendance: number;
    messages: number;
    quizzes: number;
    analytics: number;
  };
  refreshBadges: () => void;
  updateBadge: (type: keyof TeacherContextType['badges'], count: number) => void;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

interface TeacherProviderProps {
  children: ReactNode;
  token?: string;
}

export const TeacherProvider: React.FC<TeacherProviderProps> = ({ children, token }) => {
  const [badges, setBadges] = useState({
    subjects: 0,
    students: 0,
    marks: 15, // Mock: Marks to enter
    attendance: 2, // Mock: Days without attendance recorded
    messages: 3, // Mock: Unread messages
    quizzes: 2, // Mock: Quizzes to grade
    analytics: 0,
  });

  const refreshBadges = async () => {
    try {
      // TODO: Replace with real API calls when available
      // const response = await fetch(`${API_BASE_URL}/api/v1/teachers/badges`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setBadges(data.badges);

      // Mock data for now
      setBadges({
        subjects: 0,
        students: 0,
        marks: Math.floor(Math.random() * 20), // Random pending marks
        attendance: Math.floor(Math.random() * 5), // Random attendance tasks
        messages: Math.floor(Math.random() * 10), // Random unread messages
        quizzes: Math.floor(Math.random() * 8), // Random quizzes to grade
        analytics: 0,
      });
    } catch (error) {
      console.error('Failed to refresh teacher badges:', error);
    }
  };

  const updateBadge = (type: keyof TeacherContextType['badges'], count: number) => {
    setBadges(prev => ({ ...prev, [type]: count }));
  };

  useEffect(() => {
    if (token) {
      refreshBadges();
      // Refresh badges every 5 minutes
      const interval = setInterval(refreshBadges, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <TeacherContext.Provider value={{ badges, refreshBadges, updateBadge }}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacherBadges = () => {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeacherBadges must be used within a TeacherProvider');
  }
  return context.badges;
};

export const useTeacherContext = () => {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeacherContext must be used within a TeacherProvider');
  }
  return context;
}; 