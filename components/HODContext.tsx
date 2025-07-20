import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DepartmentStats {
  departmentName: string;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  departmentAverage: number;
  attendanceRate: number;
  schoolRanking: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  trendValue: number;
}

interface TeacherPerformance {
  id: number;
  name: string;
  classCount: number;
  studentCount: number;
  averageScore: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'NEEDS_REVIEW';
  departmentRank: number;
}

interface ResourceStatus {
  allocated: number;
  spent: number;
  remaining: number;
  pendingRequests: number;
}

interface HODContextType {
  // Department overview
  departmentStats: DepartmentStats;
  teachers: TeacherPerformance[];
  resourceStatus: ResourceStatus;
  
  // Badge counts for notifications
  badgeCounts: {
    department: number;
    resources: number;
    reports: number;
  };
  
  // Actions
  refreshDepartmentData: () => void;
  sendTeacherMessage: (teacherId: number, message: string) => void;
  submitResourceRequest: (request: any) => void;
}

const HODContext = createContext<HODContextType | undefined>(undefined);

interface HODProviderProps {
  children: ReactNode;
}

export const HODProvider: React.FC<HODProviderProps> = ({ children }) => {
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats>({
    departmentName: 'Mathematics',
    totalTeachers: 5,
    totalStudents: 340,
    totalClasses: 12,
    departmentAverage: 14.8,
    attendanceRate: 94,
    schoolRanking: 2,
    trend: 'IMPROVING',
    trendValue: 2.3
  });

  const [teachers, setTeachers] = useState<TeacherPerformance[]>([
    {
      id: 1,
      name: 'Mrs. Johnson',
      classCount: 3,
      studentCount: 75,
      averageScore: 15.2,
      status: 'ACTIVE',
      departmentRank: 2
    },
    {
      id: 2,
      name: 'Mr. Smith',
      classCount: 2,
      studentCount: 50,
      averageScore: 14.8,
      status: 'ACTIVE',
      departmentRank: 3
    },
    {
      id: 3,
      name: 'Ms. Davis',
      classCount: 3,
      studentCount: 80,
      averageScore: 16.1,
      status: 'ACTIVE',
      departmentRank: 1
    },
    {
      id: 4,
      name: 'Mr. Wilson',
      classCount: 2,
      studentCount: 60,
      averageScore: 13.9,
      status: 'NEEDS_REVIEW',
      departmentRank: 5
    },
    {
      id: 5,
      name: 'Dr. Brown',
      classCount: 2,
      studentCount: 75,
      averageScore: 15.8,
      status: 'ACTIVE',
      departmentRank: 4
    }
  ]);

  const [resourceStatus, setResourceStatus] = useState<ResourceStatus>({
    allocated: 1500000,
    spent: 1200000,
    remaining: 300000,
    pendingRequests: 3
  });

  const [badgeCounts, setBadgeCounts] = useState({
    department: 2, // Teachers needing review
    resources: 3,  // Pending resource requests
    reports: 1     // Reports due
  });

  const refreshDepartmentData = () => {
    // Simulate API call to refresh department data
    console.log('Refreshing department data...');
    // In real implementation, make API calls here
  };

  const sendTeacherMessage = (teacherId: number, message: string) => {
    console.log(`Sending message to teacher ${teacherId}: ${message}`);
    // In real implementation, make API call to send message
  };

  const submitResourceRequest = (request: any) => {
    console.log('Submitting resource request:', request);
    setBadgeCounts(prev => ({
      ...prev,
      resources: prev.resources + 1
    }));
  };

  // Simulate periodic badge updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate getting updates from server
      setBadgeCounts(prev => ({
        department: Math.max(0, prev.department + Math.floor(Math.random() * 3) - 1),
        resources: Math.max(0, prev.resources + Math.floor(Math.random() * 3) - 1),
        reports: Math.max(0, prev.reports + Math.floor(Math.random() * 2) - 1),
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: HODContextType = {
    departmentStats,
    teachers,
    resourceStatus,
    badgeCounts,
    refreshDepartmentData,
    sendTeacherMessage,
    submitResourceRequest
  };

  return (
    <HODContext.Provider value={value}>
      {children}
    </HODContext.Provider>
  );
};

export const useHOD = (): HODContextType => {
  const context = useContext(HODContext);
  if (!context) {
    throw new Error('useHOD must be used within a HODProvider');
  }
  return context;
};

export const useHODBadges = () => {
  const { badgeCounts } = useHOD();
  return badgeCounts;
}; 