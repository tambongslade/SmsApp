import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen, { User } from './components/LoginScreen';
import ParentDashboard from './components/ParentDashboard';
import ChildDetailsScreen from './components/ChildDetailsScreen';
import ParentMessagesScreen from './components/ParentMessagesScreen';
import ParentAnnouncementsScreen from './components/ParentAnnouncementsScreen';
import ParentSettingsScreen from './components/ParentSettingsScreen';

// Define the navigation stack and its screens
export type RootStackParamList = {
  Login: undefined;
  ParentDashboard: { user: User };
  ChildDetails: { studentId: number };
  ParentMessages: undefined;
  ParentAnnouncements: undefined;
  ParentSettings: undefined;
  // Add other roles' dashboards here as needed
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- Mock User for demonstration ---
const mockUser: User = {
  username: 'parent.demo',
  role: 'PARENT',
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn && currentUser ? (
          // Screens available after login
          <>
            <Stack.Screen name="ParentDashboard">
              {(props) => (
                <ParentDashboard
                  {...props}
                  // @ts-ignore
                  onNavigate={(screen, params) => props.navigation.navigate(screen, params)}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ChildDetails" component={ChildDetailsScreen} />
            <Stack.Screen name="ParentMessages" component={ParentMessagesScreen} />
            <Stack.Screen name="ParentAnnouncements" component={ParentAnnouncementsScreen} />
            <Stack.Screen name="ParentSettings" component={ParentSettingsScreen} />
          </>
        ) : (
          // Login screen
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
            initialParams={{ onLoginSuccess: handleLoginSuccess }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
