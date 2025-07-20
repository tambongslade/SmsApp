import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Data interfaces
interface AttendanceData {
  lateArrivals: number;
  absences: number;
  totalStudents: number;
  attendanceRate: number;
}

interface IncidentData {
  activeIncidents: number;
  pendingIncidents: number;
  resolvedToday: number;
  highPriorityIncidents: number;
  totalIncidents: number;
}

interface StudentData {
  highRiskStudents: number;
  mediumRiskStudents: number;
  lowRiskStudents: number;
  criticalCases: number;
  totalProfiles: number;
}

interface ReportData {
  pendingReports: number;
  scheduledReports: number;
  generatedToday: number;
}

interface DisciplineMasterState {
  attendance: AttendanceData;
  incidents: IncidentData;
  students: StudentData;
  reports: ReportData;
  lastUpdated: Date;
}

interface DisciplineMasterContextType {
  state: DisciplineMasterState;
  updateAttendance: (data: Partial<AttendanceData>) => void;
  updateIncidents: (data: Partial<IncidentData>) => void;
  updateStudents: (data: Partial<StudentData>) => void;
  updateReports: (data: Partial<ReportData>) => void;
  refreshData: () => void;
  // Computed badge values
  attendanceBadge: number;
  incidentsBadge: number;
  studentsBadge: number;
  reportsBadge: number;
}

const DisciplineMasterContext = createContext<DisciplineMasterContextType | undefined>(undefined);

// Initial state with realistic data
const initialState: DisciplineMasterState = {
  attendance: {
    lateArrivals: 8,
    absences: 15,
    totalStudents: 450,
    attendanceRate: 94.9,
  },
  incidents: {
    activeIncidents: 12,
    pendingIncidents: 6,
    resolvedToday: 4,
    highPriorityIncidents: 3,
    totalIncidents: 28,
  },
  students: {
    highRiskStudents: 5,
    mediumRiskStudents: 12,
    lowRiskStudents: 8,
    criticalCases: 2,
    totalProfiles: 25,
  },
  reports: {
    pendingReports: 3,
    scheduledReports: 2,
    generatedToday: 1,
  },
  lastUpdated: new Date(),
};

export const DisciplineMasterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DisciplineMasterState>(initialState);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random data changes
      const shouldUpdate = Math.random() > 0.7; // 30% chance of update
      
      if (shouldUpdate) {
        setState(prevState => ({
          ...prevState,
          incidents: {
            ...prevState.incidents,
            activeIncidents: prevState.incidents.activeIncidents + Math.floor(Math.random() * 3) - 1,
            pendingIncidents: Math.max(0, prevState.incidents.pendingIncidents + Math.floor(Math.random() * 2) - 1),
          },
          attendance: {
            ...prevState.attendance,
            lateArrivals: Math.max(0, prevState.attendance.lateArrivals + Math.floor(Math.random() * 2) - 1),
          },
          lastUpdated: new Date(),
        }));
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const updateAttendance = (data: Partial<AttendanceData>) => {
    setState(prevState => ({
      ...prevState,
      attendance: { ...prevState.attendance, ...data },
      lastUpdated: new Date(),
    }));
  };

  const updateIncidents = (data: Partial<IncidentData>) => {
    setState(prevState => ({
      ...prevState,
      incidents: { ...prevState.incidents, ...data },
      lastUpdated: new Date(),
    }));
  };

  const updateStudents = (data: Partial<StudentData>) => {
    setState(prevState => ({
      ...prevState,
      students: { ...prevState.students, ...data },
      lastUpdated: new Date(),
    }));
  };

  const updateReports = (data: Partial<ReportData>) => {
    setState(prevState => ({
      ...prevState,
      reports: { ...prevState.reports, ...data },
      lastUpdated: new Date(),
    }));
  };

  const refreshData = () => {
    // Simulate API refresh
    setState(prevState => ({
      ...prevState,
      lastUpdated: new Date(),
    }));
  };

  // Computed badge values
  const attendanceBadge = state.attendance.lateArrivals + state.attendance.absences;
  const incidentsBadge = state.incidents.activeIncidents + state.incidents.pendingIncidents;
  const studentsBadge = state.students.criticalCases;
  const reportsBadge = state.reports.pendingReports;

  const contextValue: DisciplineMasterContextType = {
    state,
    updateAttendance,
    updateIncidents,
    updateStudents,
    updateReports,
    refreshData,
    attendanceBadge,
    incidentsBadge,
    studentsBadge,
    reportsBadge,
  };

  return (
    <DisciplineMasterContext.Provider value={contextValue}>
      {children}
    </DisciplineMasterContext.Provider>
  );
};

export const useDisciplineMaster = (): DisciplineMasterContextType => {
  const context = useContext(DisciplineMasterContext);
  if (!context) {
    throw new Error('useDisciplineMaster must be used within a DisciplineMasterProvider');
  }
  return context;
};

// Hook for getting real-time badge counts
export const useNavigationBadges = () => {
  const { attendanceBadge, incidentsBadge, studentsBadge, reportsBadge } = useDisciplineMaster();
  
  return {
    attendance: attendanceBadge,
    incidents: incidentsBadge,
    students: studentsBadge,
    reports: reportsBadge,
  };
};

// Hook for specific screen data
export const useAttendanceData = () => {
  const { state, updateAttendance } = useDisciplineMaster();
  return {
    data: state.attendance,
    updateData: updateAttendance,
  };
};

export const useIncidentData = () => {
  const { state, updateIncidents } = useDisciplineMaster();
  return {
    data: state.incidents,
    updateData: updateIncidents,
  };
};

export const useStudentData = () => {
  const { state, updateStudents } = useDisciplineMaster();
  return {
    data: state.students,
    updateData: updateStudents,
  };
};

export const useReportData = () => {
  const { state, updateReports } = useDisciplineMaster();
  return {
    data: state.reports,
    updateData: updateReports,
  };
}; 