import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CounselingOverview {
  totalStudents: number;
  activeCases: number;
  studentsNeedingSupport: number;
  appointmentsToday: number;
  highPriorityCases: number;
  successRate: number;
  monthlyInterventions: number;
  followUpsRequired: number;
}

interface Student {
  id: number;
  name: string;
  matricule: string;
  class: string;
  age?: number;
  gender?: string;
  parentContact?: {
    name: string;
    phone: string;
    email: string;
  };
  academicInfo?: {
    currentAverage: number;
    attendanceRate: number;
    recentDecline?: number;
    teacherConcerns?: number;
  };
  disciplineHistory?: {
    totalIssues: number;
    recentIssues: Array<{
      date: string;
      type: string;
      description: string;
    }>;
    pattern: string;
  };
}

interface MessagingSummary {
  totalSent: number;
  totalReceived: number;
  unreadMessages: number;
}

interface GuidanceCounselorContextType {
  // API-based data
  overview: CounselingOverview | null;
  students: Student[];
  messagingSummary: MessagingSummary | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Badge counts (simplified)
  badgeCounts: {
    students: number;
    communications: number;
  };
  
  // Actions
  fetchDashboard: (token: string, academicYearId: number) => Promise<void>;
  fetchStudents: (token: string, academicYearId: number) => Promise<void>;
  fetchStudentDetails: (token: string, studentId: number) => Promise<Student | null>;
  fetchMessaging: (token: string) => Promise<void>;
  sendMessage: (token: string, recipients: any, message: any) => Promise<void>;
}

const GuidanceCounselorContext = createContext<GuidanceCounselorContextType | undefined>(undefined);

interface GuidanceCounselorProviderProps {
  children: ReactNode;
}

export const GuidanceCounselorProvider: React.FC<GuidanceCounselorProviderProps> = ({ children }) => {
  const [overview, setOverview] = useState<CounselingOverview | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [messagingSummary, setMessagingSummary] = useState<MessagingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [badgeCounts, setBadgeCounts] = useState({
    students: 0,    // Students with concerns from API data
    communications: 0,  // Unread messages from messaging API
  });

  const fetchDashboard = async (token: string, academicYearId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Note: Limited API endpoint available for counselor dashboard
      const response = await fetch(`/api/v1/counselor/dashboard?academicYearId=${academicYearId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.overview) {
          setOverview(data.data.overview);
          setBadgeCounts(prev => ({
            ...prev,
            students: data.data.overview.highPriorityCases || 0,
          }));
        }
      } else {
        console.warn('Counselor dashboard endpoint not available, using fallback');
        // Fallback: Limited functionality notice
        setOverview({
          totalStudents: 0,
          activeCases: 0,
          studentsNeedingSupport: 0,
          appointmentsToday: 0,
          highPriorityCases: 0,
          successRate: 0,
          monthlyInterventions: 0,
          followUpsRequired: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching counselor dashboard:', err);
      setError('Unable to load counselor dashboard. Limited API support available.');
      // Set minimal fallback data
      setOverview({
        totalStudents: 0,
        activeCases: 0,
        studentsNeedingSupport: 0,
        appointmentsToday: 0,
        highPriorityCases: 0,
        successRate: 0,
        monthlyInterventions: 0,
        followUpsRequired: 0,
      });
    }
    
    setIsLoading(false);
  };

  const fetchStudents = async (token: string, academicYearId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Using general student endpoint - main available API for counselors
      const response = await fetch(
        `/api/v1/students?academicYearId=${academicYearId}&includeAcademicInfo=true&includeDiscipline=true&page=1&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.students) {
          setStudents(data.data.students);
          // Update badge count based on students with concerns
          const studentsWithConcerns = data.data.students.filter((student: any) => 
            student.academicInfo?.teacherConcerns > 0 || 
            student.disciplineHistory?.totalIssues > 0
          ).length;
          setBadgeCounts(prev => ({
            ...prev,
            students: studentsWithConcerns,
          }));
        }
      } else {
        setError('Unable to fetch student data');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Network error while fetching students');
    }
    
    setIsLoading(false);
  };

  const fetchStudentDetails = async (token: string, studentId: number): Promise<Student | null> => {
    try {
      // Get detailed student information
      const response = await fetch(
        `/api/v1/students/${studentId}?includeAcademicDetails=true&includeDisciplineHistory=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.student) {
          return data.data.student;
        }
      }
      
      // Try discipline master endpoint for additional info
      const disciplineResponse = await fetch(
        `/api/v1/discipline-master/student-profile/${studentId}?includeHistory=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (disciplineResponse.ok) {
        const disciplineData = await disciplineResponse.json();
        // Merge discipline data if available
        console.log('Additional discipline data available:', disciplineData);
      }
      
    } catch (err) {
      console.error('Error fetching student details:', err);
    }
    
    return null;
  };

  const fetchMessaging = async (token: string) => {
    try {
      const response = await fetch(
        `/api/v1/messaging/dashboard?role=GUIDANCE_COUNSELOR`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.messagingSummary) {
          setMessagingSummary(data.data.messagingSummary);
          setBadgeCounts(prev => ({
            ...prev,
            communications: data.data.messagingSummary.unreadMessages || 0,
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching messaging data:', err);
    }
  };

  const sendMessage = async (token: string, recipients: any, message: any) => {
    try {
      const response = await fetch('/api/v1/messaging/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients,
          message,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh messaging data after sending
          await fetchMessaging(token);
          return data;
        }
      }
      throw new Error('Failed to send message');
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const value: GuidanceCounselorContextType = {
    overview,
    students,
    messagingSummary,
    isLoading,
    error,
    badgeCounts,
    fetchDashboard,
    fetchStudents,
    fetchStudentDetails,
    fetchMessaging,
    sendMessage,
  };

  return (
    <GuidanceCounselorContext.Provider value={value}>
      {children}
    </GuidanceCounselorContext.Provider>
  );
};

export const useGuidanceCounselor = (): GuidanceCounselorContextType => {
  const context = useContext(GuidanceCounselorContext);
  if (!context) {
    throw new Error('useGuidanceCounselor must be used within a GuidanceCounselorProvider');
  }
  return context;
};

export const useGuidanceCounselorBadges = () => {
  const { badgeCounts } = useGuidanceCounselor();
  return badgeCounts;
}; 