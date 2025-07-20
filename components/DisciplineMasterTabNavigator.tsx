import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import { User } from './LoginScreen';
import { DisciplineMasterProvider } from './DisciplineMasterContext';

// Import screens
import DisciplineMasterDashboard from './dashboards/DisciplineMasterDashboard';
import AttendanceManagementScreen from './dm/AttendanceManagementScreen';
import IncidentManagementScreen from './dm/IncidentManagementScreen';
import StudentProfilesScreen from './dm/StudentProfilesScreen';
import DisciplineReportsScreen from './dm/DisciplineReportsScreen';
import MessagingFAB from './dm/MessagingFAB';

const Tab = createBottomTabNavigator();

interface DisciplineMasterTabNavigatorProps {
  user: User;
  selectedRole: any;
  token: string;
  onLogout: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const DisciplineMasterTabNavigator: React.FC<DisciplineMasterTabNavigatorProps> = ({
  user,
  selectedRole,
  token,
  onLogout,
  onNavigate,
}) => {
  return (
    <DisciplineMasterProvider>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#c0392b',
          tabBarInactiveTintColor: '#6c757d',
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarStyle: styles.tabBar,
        }}
        initialRouteName="Dashboard"
      >
        <Tab.Screen
          name="Dashboard"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={[styles.tabBarIcon, { color }]}>🏠</Text>
            ),
            tabBarLabel: 'Dashboard',
          }}
        >
          {() => (
            <DisciplineMasterDashboard
              user={user}
              selectedRole={selectedRole}
              token={token}
              onLogout={onLogout}
              onNavigate={onNavigate}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="AttendanceManagement"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={[styles.tabBarIcon, { color }]}>📅</Text>
            ),
            tabBarLabel: 'Attendance',
          }}
        >
          {() => (
            <AttendanceManagementScreen
              token={token}
              user={user}
              onNavigateBack={() => onNavigate('Dashboard')}
              onNavigate={onNavigate}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="IncidentManagement"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={[styles.tabBarIcon, { color }]}>⚠️</Text>
            ),
            tabBarLabel: 'Incidents',
          }}
        >
          {() => (
            <IncidentManagementScreen
              token={token}
              user={user}
              onNavigateBack={() => onNavigate('Dashboard')}
              onNavigate={onNavigate}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="StudentProfiles"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={[styles.tabBarIcon, { color }]}>👥</Text>
            ),
            tabBarLabel: 'Students',
          }}
        >
          {() => (
            <StudentProfilesScreen
              token={token}
              user={user}
              onNavigateBack={() => onNavigate('Dashboard')}
              onNavigate={onNavigate}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="DisciplineReports"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={[styles.tabBarIcon, { color }]}>📊</Text>
            ),
            tabBarLabel: 'Reports',
          }}
        >
          {() => (
            <DisciplineReportsScreen
              token={token}
              user={user}
              onNavigateBack={() => onNavigate('Dashboard')}
              onNavigate={onNavigate}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      {/* Floating Action Button for Messaging */}
      <MessagingFAB
        token={token}
        user={user}
        onNavigate={onNavigate}
      />
    </DisciplineMasterProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: -5,
  },
  tabBarIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
});

export default DisciplineMasterTabNavigator; 