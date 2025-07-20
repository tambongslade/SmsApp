import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import TeacherDashboard from '../dashboards/TeacherDashboard';
import TeacherClassesScreen from './TeacherClassesScreen';
import TeacherExamsScreen from './TeacherExamsScreen';
import TeacherMoreScreen from './TeacherMoreScreen';
import TeacherMessagesScreen from './TeacherMessagesScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTeacherBadges } from '../TeacherContext';
import { User } from '../LoginScreen';

interface TeacherTabNavigatorProps {
  user: User;
  token: string;
  onLogout: () => void;
  route: any;
  navigation: any;
}

const Tab = createBottomTabNavigator();

const TeacherTabNavigator: React.FC<TeacherTabNavigatorProps> = (props) => {
  const { colors } = useTheme();
  const badges = useTeacherBadges();

  const screenCommonProps = {
    user: props.user,
    token: props.token,
    selectedRole: props.route.params.selectedRole,
    onLogout: props.onLogout,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Classes') {
            iconName = focused ? 'google-classroom' : 'google-classroom';
          } else if (route.name === 'Exams') {
            iconName = focused ? 'file-document-edit' : 'file-document-edit-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'message' : 'message-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'dots-horizontal-circle' : 'dots-horizontal-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" options={{title: "Dashboard"}}>
        {navProps => <TeacherDashboard {...navProps} {...screenCommonProps} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Classes"
        options={{ tabBarBadge: badges.attendance > 0 ? badges.attendance : null, title: 'Classes' }}
      >
        {navProps => <TeacherClassesScreen {...navProps} {...screenCommonProps} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Exams" 
        options={{ tabBarBadge: badges.marks > 0 ? badges.marks : null }}
      >
        {navProps => <TeacherExamsScreen {...navProps} {...screenCommonProps} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Messages" 
        options={{ tabBarBadge: badges.messages > 0 ? badges.messages : null }}
      >
        {navProps => <TeacherMessagesScreen {...navProps} {...screenCommonProps} />}
      </Tab.Screen>
      <Tab.Screen name="More">
        {navProps => <TeacherMoreScreen {...navProps} {...screenCommonProps} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default TeacherTabNavigator; 