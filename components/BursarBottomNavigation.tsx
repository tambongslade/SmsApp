import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

interface NavItem {
  id: string;
  icon: string;
  label: string;
  screen: string;
}

interface BursarBottomNavigationProps {
  activeTab: string;
  onTabPress: (screen: string) => void;
}

const BursarBottomNavigation: React.FC<BursarBottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      icon: '📊',
      label: 'Overview',
      screen: 'overview',
    },
    {
      id: 'students',
      icon: '👥',
      label: 'Students',
      screen: 'students',
    },
    {
      id: 'payments',
      icon: '💳',
      label: 'Payments',
      screen: 'payments',
    },
    {
      id: 'reports',
      icon: '📈',
      label: 'Reports',
      screen: 'reports',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              activeTab === item.screen && styles.activeNavItem,
            ]}
            onPress={() => onTabPress(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={[
                styles.icon,
                activeTab === item.screen && styles.activeIcon,
              ]}>
                {item.icon}
              </Text>
            </View>
            <Text style={[
              styles.label,
              activeTab === item.screen && styles.activeLabel,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  navContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeNavItem: {
    backgroundColor: '#f39c1215',
  },
  iconContainer: {
    marginBottom: 4,
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#f39c12',
    fontWeight: '600',
  },
});

export default BursarBottomNavigation; 