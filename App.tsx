import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import LoginScreen, { User, UserRole } from './components/LoginScreen';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import AcademicYearSelectionScreen from './components/AcademicYearSelectionScreen';
import ParentBottomNavigation from './components/ParentBottomNavigation';
import ParentDashboard from './components/ParentDashboard';
import ChildDetailsScreen from './components/ChildDetailsScreen';
import ParentAnnouncementsScreen from './components/ParentAnnouncementsScreen';
import ParentSettingsScreen from './components/ParentSettingsScreen';
import ParentMessagesScreen from './components/ParentMessagesScreen';

// Import Super Manager components
import { 
  UserManagementScreen, 
  FinancialOverviewScreen, 
  AcademicYearsScreen 
} from './components/superManager';

// Import dashboard components
import SuperManagerDashboard from './components/dashboards/SuperManagerDashboard';
import PrincipalDashboard from './components/principal/PrincipalDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import HODDashboard from './components/dashboards/HODDashboard';
import BursarDashboard from './components/dashboards/BursarDashboard';
import DisciplineMasterTabNavigator from './components/DisciplineMasterTabNavigator';
import GuidanceCounselorDashboard from './components/dashboards/GuidanceCounselorDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';

// Import VP components
import VicePrincipalDashboard from './components/VicePrincipalDashboard';
import StudentInterviewsScreen from './components/StudentInterviewsScreen';

import StudentAssignmentsScreen from './components/StudentAssignmentsScreen';
import ClassManagementScreen from './components/ClassManagementScreen';

// Import DM components
import AttendanceManagementScreen from './components/dm/AttendanceManagementScreen';
import IncidentManagementScreen from './components/dm/IncidentManagementScreen';
import StudentProfilesScreen from './components/dm/StudentProfilesScreen';
import DisciplineReportsScreen from './components/dm/DisciplineReportsScreen';
import RecordLatenessScreen from './components/dm/RecordLatenessScreen';
import { DisciplineMasterProvider } from './components/DisciplineMasterContext';

// Import Principal components
import PrincipalBottomNavigation from './components/principal/PrincipalBottomNavigation';
import { PrincipalProvider } from './components/principal/PrincipalContext';
import {
  AcademicManagementScreen,
  StaffManagementScreen,
  StudentAffairsScreen,
  FinancialOverviewScreen as PrincipalFinancialOverviewScreen,
  ReportsAnalyticsScreen,
  CommunicationCenterScreen,
  SettingsAdministrationScreen,
} from './components/principal';

// Import Teacher components
import TeacherTabNavigator from './components/teacher/TeacherTabNavigator';
import { TeacherProvider } from './components/TeacherContext';
import TeacherClassesScreen from './components/teacher/TeacherClassesScreen';
import TeacherStudentsScreen from './components/teacher/TeacherStudentsScreen';
import TeacherMarksScreen from './components/teacher/TeacherMarksScreen';
import TeacherQuizzesScreen from './components/teacher/TeacherQuizzesScreen';
import TeacherAttendanceScreen from './components/teacher/TeacherAttendanceScreen';
import TeacherAnalyticsScreen from './components/teacher/TeacherAnalyticsScreen';
import TeacherSettingsScreen from './components/teacher/TeacherSettingsScreen';


// Import Guidance Counselor components
import {
  GuidanceCounselorStudentsScreen,
  GuidanceCounselorCommunicationsScreen,
} from './components/guidanceCounselor';
import { GuidanceCounselorProvider } from './components/GuidanceCounselorContext';

// Define the navigation stack and its screens
export type RootStackParamList = {
  Login: undefined;
  RoleSelection: {
    user: User;
    token: string;
  };
  AcademicYearSelection: {
    user: User;
    selectedRole: {
      role: UserRole;
      academicYearId: number | null;
      academicYearName: string | null;
    };
    token: string;
  };
  Dashboard: {
    user: User;
    selectedRole: {
      role: UserRole;
      academicYearId: number | null;
      academicYearName: string | null;
    };
    token: string;
  };
  // Other screens
  ChildDetails: { studentId: number; token: string };
  ParentChildren: { user: User; selectedRole: any; token: string };
  ParentMessages: { user: User; token: string };
  ParentAnnouncements: { token: string };
  ParentSettings: { token: string };
  
  // Super Manager screens
  UserManagement: { token: string };
  FinancialOverview: { token: string };
  AcademicYears: { token: string };
  
  // Principal screens
  AcademicManagement: { user: User; token: string };
  StaffManagement: { user: User; token: string };
  StudentAffairs: { user: User; token: string };
  PrincipalFinancialOverview: { user: User; token: string };
  ReportsAnalytics: { user: User; token: string };
  CommunicationCenter: { user: User; token: string; onNavigate: (screen: string, params?: any) => void; };
  SettingsAdministration: { user: User; token: string };

  // VP screens
  StudentInterviews: { user: any; token: string };
  StudentAssignments: { user: any; token: string };
  ClassManagement: { user: any; token: string };

  // DM screens
  AttendanceManagement: { user: any; token: string };
  IncidentManagement: { user: any; token: string };
  StudentProfiles: { user: any; token: string };
  DisciplineReports: { user: any; token: string };
  RecordLatenessScreen: { user: any; token: string };

  // Teacher screens
  TeacherClasses: { user: User; token: string; selectedRole: any };
  TeacherStudents: { subclass: any; subject: any, token: string };
  TeacherMarks: { subclassId: number, subjectId: number, token: string };
  TeacherQuizzes: { token: string };
  TeacherAttendance: { token: string };
  TeacherAnalytics: { token: string };
  TeacherSettings: { token: string };


  // Guidance Counselor screens
  GuidanceCounselorStudents: { user: any; token: string };
  GuidanceCounselorCommunications: { user: any; token: string };
};

const PrincipalNavigator: React.FC<any> = ({ route }) => {
  const [activeTab, setActiveTab] = React.useState('PrincipalDashboard');
  const { user, token, selectedRole, navigation, onLogout, onNavigate } = route.params;

  const handleNavigate = (screen: string, params?: any) => {
    if (navigation) {
      navigation.navigate(screen, params);
    }
  };

  const renderContent = () => {
    const props = {
      user,
      token,
      selectedRole,
      academicYearId: selectedRole.academicYearId, // Pass academicYearId down
      navigation,
      onLogout,
      onNavigate: handleNavigate,
      onBack: () => setActiveTab('PrincipalDashboard'), // Function to return to dashboard
    };
    switch (activeTab) {
      case 'PrincipalDashboard':
        // onLogout and onNavigate are already in props
        return <PrincipalDashboard {...props} />;
      case 'StaffManagement':
        return <StaffManagementScreen {...props} onNavigate={handleNavigate} />;
      case 'StudentAffairs':
        return <StudentAffairsScreen {...props} onNavigate={handleNavigate} />;
      case 'CommunicationCenter':
        return <CommunicationCenterScreen {...props} onNavigate={handleNavigate} />;
      case 'ReportsAnalytics':
        return <ReportsAnalyticsScreen {...props} />;
      default:
        return <PrincipalDashboard {...props} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      <PrincipalBottomNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  );
};

// Universal Dashboard Component that routes to specific dashboards
const DashboardScreen: React.FC<any> = ({ route, navigation }) => {
  const { user, selectedRole, token } = route.params;

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const handleNavigate = (screen: string, params?: any) => {
    navigation.navigate(screen, params);
  };

  // Route to appropriate dashboard based on role
  const renderDashboard = () => {
    const dashboardProps = {
      route,
      navigation,
      user,
      token,
      onLogout: handleLogout,
      onNavigate: handleNavigate,
    };

    const superManagerProps = {
      user,
      selectedRole,
      token,
      onLogout: handleLogout,
      onNavigate: handleNavigate,
    };

    switch (selectedRole.role) {
      case 'SUPER_MANAGER':
        return <SuperManagerDashboard {...superManagerProps} />;
      case 'PRINCIPAL':
        return (
          <PrincipalProvider token={token} academicYearId={selectedRole.academicYearId}>
            <PrincipalNavigator
              route={{
                params: {
                  ...route.params,
                  navigation,
                  onLogout: handleLogout,
                  onNavigate: handleNavigate,
                },
              }}
            />
          </PrincipalProvider>
        );
      case 'VICE_PRINCIPAL':
        return <VicePrincipalDashboard {...superManagerProps} />;
      case 'TEACHER':
        return (
          <TeacherProvider token={token}>
            <TeacherTabNavigator {...dashboardProps} />
          </TeacherProvider>
        );
      case 'HOD':
        return <HODDashboard {...dashboardProps} />;
      case 'BURSAR':
        return <BursarDashboard {...dashboardProps} />;
      case 'DISCIPLINE_MASTER':
        return <DisciplineMasterTabNavigator {...superManagerProps} />;
      case 'GUIDANCE_COUNSELOR':
        return (
          <GuidanceCounselorDashboard 
            user={user} 
            onLogout={handleLogout} 
            onNavigate={handleNavigate} 
          />
        );
      case 'MANAGER':
        return <ManagerDashboard {...dashboardProps} />;
      case 'PARENT':
        return <ParentBottomNavigation {...dashboardProps} />;
      default:
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Dashboard Not Available
            </Text>
            <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 20 }}>
              Dashboard for role {selectedRole.role} is not yet implemented.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#e74c3c',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
              onPress={handleLogout}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return renderDashboard();
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="AcademicYearSelection" component={AcademicYearSelectionScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="ChildDetails" component={ChildDetailsScreen} />
          <Stack.Screen 
            name="ParentChildren"
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <ParentBottomNavigation 
                route={route}
                navigation={navigation}
                onLogout={() => navigation.navigate('Login')}
                onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="ParentAnnouncements" component={ParentAnnouncementsScreen} />
          <Stack.Screen 
            name="ParentSettings"
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <ParentSettingsScreen 
                route={route}
                navigation={navigation}
                onLogout={() => navigation.navigate('Login')}
              />
            )}
          </Stack.Screen>

          {/* Super Manager Screens */}
          <Stack.Screen 
            name="UserManagement" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <UserManagementScreen 
                token={(route.params as any).token}
                onNavigateBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="FinancialOverview" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <FinancialOverviewScreen 
                token={(route.params as any).token}
                onNavigateBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="AcademicYears" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <AcademicYearsScreen 
                token={(route.params as any).token}
                onNavigateBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          
          {/* Principal Screens */}
          <Stack.Screen 
            name="AcademicManagement" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <AcademicManagementScreen 
                user={(route.params as any).user}
                token={(route.params as any).token}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="StaffManagement" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <StaffManagementScreen 
                user={(route.params as any).user}
                token={(route.params as any).token}
                onBack={() => navigation.goBack()}
                onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="StudentAffairs" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <StudentAffairsScreen 
                user={(route.params as any).user}
                token={(route.params as any).token}
                onBack={() => navigation.goBack()}
                onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="PrincipalFinancialOverview" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <PrincipalFinancialOverviewScreen 
                user={(route.params as any).user}
                token={(route.params as any).token}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="ReportsAnalytics" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <ReportsAnalyticsScreen 
                user={(route.params as any).user}
                token={(route.params as any).token}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="CommunicationCenter" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <CommunicationCenterScreen 
                user={(route.params as any).user}
                token={(route.params as any).token}
                onBack={() => navigation.goBack()}
                onNavigate={(screen, params) => navigation.navigate(screen, params)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="SettingsAdministration" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <SettingsAdministrationScreen 
                user={(route.params as any).user}
                token={(route.params as any).token}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>

          {/* VP Screens */}
          <Stack.Screen 
            name="StudentInterviews" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => {
              const params = route.params || {};
              const { user, token } = params as { user?: any; token?: string };
              
              if (!user || !token) {
                navigation.goBack();
                return null;
              }
              
              return (
                <StudentInterviewsScreen 
                  user={user}
                  token={token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              );
            }}
          </Stack.Screen>
          <Stack.Screen 
            name="StudentAssignments" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => {
              const params = route.params || {};
              const { user, token } = params as { user?: any; token?: string };
              
              if (!user || !token) {
                navigation.goBack();
                return null;
              }
              
              return (
                <StudentAssignmentsScreen 
                  user={user}
                  token={token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              );
            }}
          </Stack.Screen>
          <Stack.Screen 
            name="ClassManagement" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => {
              const params = route.params || {};
              const { user, token } = params as { user?: any; token?: string };
              
              if (!user || !token) {
                navigation.goBack();
                return null;
              }
              
              return (
                <ClassManagementScreen 
                  user={user}
                  token={token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              );
            }}
          </Stack.Screen>

          {/* DM Screens */}
          <Stack.Screen 
            name="AttendanceManagement" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <DisciplineMasterProvider>
                <AttendanceManagementScreen 
                  user={(route.params as any).user}
                  token={(route.params as any).token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              </DisciplineMasterProvider>
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="IncidentManagement" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <DisciplineMasterProvider>
                <IncidentManagementScreen 
                  user={(route.params as any).user}
                  token={(route.params as any).token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              </DisciplineMasterProvider>
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="StudentProfiles" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <DisciplineMasterProvider>
                <StudentProfilesScreen 
                  user={(route.params as any).user}
                  token={(route.params as any).token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              </DisciplineMasterProvider>
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="DisciplineReports" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <DisciplineMasterProvider>
                <DisciplineReportsScreen 
                  user={(route.params as any).user}
                  token={(route.params as any).token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              </DisciplineMasterProvider>
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="RecordLatenessScreen" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <DisciplineMasterProvider>
                <RecordLatenessScreen 
                  user={(route.params as any).user}
                  token={(route.params as any).token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              </DisciplineMasterProvider>
            )}
          </Stack.Screen>


          {/* Teacher Screens */}
          <Stack.Screen 
            name="TeacherClasses" 
            options={{ headerShown: false }}
          >
            {props => (
              <TeacherClassesScreen
                {...props}
                user={(props.route.params as any).user}
                token={(props.route.params as any).token}
                selectedRole={(props.route.params as any).selectedRole}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="TeacherStudents" 
            component={TeacherStudentsScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="TeacherMarks"
            component={TeacherMarksScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TeacherQuizzes"
            component={TeacherQuizzesScreen}
            options={{headerShown: false}}
          />
           <Stack.Screen
            name="TeacherAttendance"
            component={TeacherAttendanceScreen}
            options={{headerShown: false}}
          />
           <Stack.Screen
            name="TeacherAnalytics"
            component={TeacherAnalyticsScreen}
            options={{headerShown: false}}
          />
           <Stack.Screen
            name="TeacherSettings"
            options={{headerShown: false}}
          >
            {({ route, navigation }) => (
              <TeacherSettingsScreen
                route={route}
                navigation={navigation}
                onLogout={() => navigation.navigate('Login')}
              />
            )}
          </Stack.Screen>

          {/* Guidance Counselor Screens */}
          <Stack.Screen 
            name="GuidanceCounselorStudents" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <GuidanceCounselorProvider>
                <GuidanceCounselorStudentsScreen 
                  user={(route.params as any).user}
                  token={(route.params as any).token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              </GuidanceCounselorProvider>
            )}
          </Stack.Screen>

          <Stack.Screen 
            name="GuidanceCounselorCommunications" 
            options={{ headerShown: false }}
          >
            {({ route, navigation }) => (
              <GuidanceCounselorProvider>
                <GuidanceCounselorCommunicationsScreen 
                  user={(route.params as any).user}
                  token={(route.params as any).token}
                  onNavigateBack={() => navigation.goBack()}
                  onNavigate={(screen: string, params?: any) => navigation.navigate(screen, params)}
                />
              </GuidanceCounselorProvider>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
