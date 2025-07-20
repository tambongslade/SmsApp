import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useManagerBadges } from './ManagerContext';

const { width } = Dimensions.get('window');

interface Tab {
  id: string;
  label: string;
  icon: string;
  badge?: boolean;
}

interface ManagerBottomNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  onFABPress: () => void;
}

const ManagerBottomNavigation: React.FC<ManagerBottomNavigationProps> = ({
  activeTab,
  onTabPress,
  onFABPress,
}) => {
  const badges = useManagerBadges();

  const tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'users', label: 'Users', icon: '👥', badge: badges.users > 0 },
    { id: 'system', label: 'System', icon: '🖥️', badge: badges.system > 0 },
    { id: 'tasks', label: 'Tasks', icon: '✅', badge: badges.tasks > 0 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabIcon,
                  activeTab === tab.id && styles.activeTabIcon,
                ]}
              >
                {tab.icon}
              </Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
              {tab.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.id === 'users' && badges.users > 0 ? String(badges.users) :
                     tab.id === 'system' && badges.system > 0 ? String(badges.system) :
                     tab.id === 'tasks' && badges.tasks > 0 ? String(badges.tasks) : ''}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Floating Action Button for Communications */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onFABPress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>📧</Text>
        {badges.communications > 0 && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{String(badges.communications)}</Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 44, // Minimum touch target
  },
  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#3498db',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 24,
    color: '#fff',
  },
  fabBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  fabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ManagerBottomNavigation; 