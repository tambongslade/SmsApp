import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SystemHealth {
  overallHealth: number;
  databaseStatus: 'OPERATIONAL' | 'WARNING' | 'ERROR';
  apiResponseTime: number;
  serverLoad: number;
  storageUsed: number;
  activeSessions: number;
  lastBackup: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
  loginIssues: number;
  staffCount: number;
  parentCount: number;
  studentCount: number;
}

interface TaskSummary {
  myTasks: {
    total: number;
    overdue: number;
    dueToday: number;
    upcoming: number;
  };
  teamTasks: {
    active: number;
    completedThisMonth: number;
  };
  overallProgress: number;
}

interface OperationalMetrics {
  totalStaff: number;
  totalClasses: number;
  totalStudents: number;
  systemHealth: number;
  pendingTasks: number;
  issuesRequiring: number;
  operationalEfficiency: number;
}

interface ManagerContextType {
  // System and operational data
  systemHealth: SystemHealth;
  userStats: UserStats;
  taskSummary: TaskSummary;
  operationalMetrics: OperationalMetrics;
  
  // Badge counts for notifications
  badgeCounts: {
    users: number;
    system: number;
    tasks: number;
    communications: number;
  };
  
  // Actions
  refreshSystemData: () => void;
  createUser: (userData: any) => void;
  assignTask: (taskData: any) => void;
  sendAnnouncement: (message: string, recipients: string[]) => void;
}

const ManagerContext = createContext<ManagerContextType | undefined>(undefined);

interface ManagerProviderProps {
  children: ReactNode;
}

export const ManagerProvider: React.FC<ManagerProviderProps> = ({ children }) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overallHealth: 98,
    databaseStatus: 'OPERATIONAL',
    apiResponseTime: 245,
    serverLoad: 23,
    storageUsed: 67,
    activeSessions: 45,
    lastBackup: '2024-01-22T03:00:00Z'
  });

  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 298,
    activeUsers: 285,
    newThisMonth: 12,
    loginIssues: 3,
    staffCount: 52,
    parentCount: 201,
    studentCount: 45
  });

  const [taskSummary, setTaskSummary] = useState<TaskSummary>({
    myTasks: {
      total: 8,
      overdue: 1,
      dueToday: 3,
      upcoming: 4
    },
    teamTasks: {
      active: 15,
      completedThisMonth: 42
    },
    overallProgress: 87
  });

  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics>({
    totalStaff: 52,
    totalClasses: 24,
    totalStudents: 1245,
    systemHealth: 98,
    pendingTasks: 8,
    issuesRequiring: 3,
    operationalEfficiency: 94
  });

  const [badgeCounts, setBadgeCounts] = useState({
    users: 3,     // Login issues + new accounts pending
    system: 2,    // Storage warning + maintenance due
    tasks: 4,     // Overdue + due today
    communications: 5  // Pending announcements + responses needed
  });

  const refreshSystemData = () => {
    // Simulate API call to refresh all system data
    console.log('Refreshing system data...');
    // In real implementation, make API calls here
  };

  const createUser = (userData: any) => {
    console.log('Creating new user:', userData);
    setUserStats(prev => ({
      ...prev,
      totalUsers: prev.totalUsers + 1,
      newThisMonth: prev.newThisMonth + 1
    }));
  };

  const assignTask = (taskData: any) => {
    console.log('Assigning task:', taskData);
    setTaskSummary(prev => ({
      ...prev,
      teamTasks: {
        ...prev.teamTasks,
        active: prev.teamTasks.active + 1
      }
    }));
  };

  const sendAnnouncement = (message: string, recipients: string[]) => {
    console.log('Sending announcement:', message, 'to:', recipients);
    setBadgeCounts(prev => ({
      ...prev,
      communications: Math.max(0, prev.communications - 1)
    }));
  };

  // Simulate periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setBadgeCounts(prev => ({
        users: Math.max(0, prev.users + Math.floor(Math.random() * 3) - 1),
        system: Math.max(0, prev.system + Math.floor(Math.random() * 2) - 1),
        tasks: Math.max(0, prev.tasks + Math.floor(Math.random() * 4) - 2),
        communications: Math.max(0, prev.communications + Math.floor(Math.random() * 3) - 1),
      }));

      // Update system metrics occasionally
      if (Math.random() > 0.8) {
        setSystemHealth(prev => ({
          ...prev,
          activeSessions: Math.max(20, Math.min(80, prev.activeSessions + Math.floor(Math.random() * 10) - 5)),
          apiResponseTime: Math.max(150, Math.min(500, prev.apiResponseTime + Math.floor(Math.random() * 50) - 25))
        }));
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: ManagerContextType = {
    systemHealth,
    userStats,
    taskSummary,
    operationalMetrics,
    badgeCounts,
    refreshSystemData,
    createUser,
    assignTask,
    sendAnnouncement
  };

  return (
    <ManagerContext.Provider value={value}>
      {children}
    </ManagerContext.Provider>
  );
};

export const useManager = (): ManagerContextType => {
  const context = useContext(ManagerContext);
  if (!context) {
    throw new Error('useManager must be used within a ManagerProvider');
  }
  return context;
};

export const useManagerBadges = () => {
  const { badgeCounts } = useManager();
  return badgeCounts;
}; 