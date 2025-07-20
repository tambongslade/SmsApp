import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { usePrincipalBadges } from './PrincipalContext'; // Correct path

const { width } = Dimensions.get('window');

interface NavItem {
  id: string;
  icon: string;
  label: string;
  screen: string;
  badge?: number;
}

interface PrincipalBottomNavigationProps {
  activeTab: string;
  onTabPress: (screen: string) => void;
}

const PrincipalBottomNavigation: React.FC<PrincipalBottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const badges = usePrincipalBadges();

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', screen: 'PrincipalDashboard' },
    { id: 'staff', icon: '👨‍🏫', label: 'Staff', screen: 'StaffManagement', badge: badges.staff },
    { id: 'students', icon: '👥', label: 'Students', screen: 'StudentAffairs', badge: badges.students },
    { id: 'communicate', icon: '📢', label: 'Communicate', screen: 'CommunicationCenter', badge: badges.messages },
    { id: 'reports', icon: '📊', label: 'Reports', screen: 'ReportsAnalytics', badge: badges.reports },
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
            <Text style={[styles.icon, activeTab === item.screen && styles.activeIcon]}>
              {item.icon}
            </Text>
            {item.badge !== undefined && item.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.label, activeTab === item.screen && styles.activeLabel]}>
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
    paddingBottom: 20, 
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
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
    transform: [{ scale: 1.15 }],
  },
  label: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#0056b3', // A more professional blue
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#dc3545', // A standard red for notifications
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default PrincipalBottomNavigation; 