import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigationBadges } from './DisciplineMasterContext';

const { width } = Dimensions.get('window');

interface NavItem {
  id: string;
  icon: string;
  label: string;
  screen: string;
  badge?: number;
}

interface DMBottomNavigationProps {
  activeTab: string;
  onTabPress: (screen: string) => void;
}

const DMBottomNavigation: React.FC<DMBottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  // Get dynamic badge counts from context
  const badges = useNavigationBadges();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      icon: '🏠',
      label: 'Dashboard',
      screen: 'Dashboard',
    },
    {
      id: 'attendance',
      icon: '📅',
      label: 'Attendance',
      screen: 'AttendanceManagement',
      badge: badges.attendance,
    },
    {
      id: 'incidents',
      icon: '⚠️',
      label: 'Incidents',
      screen: 'IncidentManagement',
      badge: badges.incidents,
    },
    {
      id: 'students',
      icon: '👥',
      label: 'Students',
      screen: 'StudentProfiles',
      badge: badges.students,
    },
    {
      id: 'reports',
      icon: '📊',
      label: 'Reports',
      screen: 'DisciplineReports',
      badge: badges.reports,
    },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={() => onTabPress(item.screen)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={[
              styles.icon,
              activeTab === item.screen && styles.activeIcon
            ]}>
              {item.icon}
            </Text>
            {item.badge && item.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.badge > 99 ? '99+' : item.badge}
                </Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.label,
            activeTab === item.screen && styles.activeLabel
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingBottom: 20, // Safe area for iPhone home indicator
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  icon: {
    fontSize: 24,
    textAlign: 'center',
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#c0392b',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default DMBottomNavigation; 