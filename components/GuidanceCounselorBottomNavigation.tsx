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
import { useGuidanceCounselorBadges } from './GuidanceCounselorContext';

const { width } = Dimensions.get('window');

interface Tab {
  id: string;
  label: string;
  icon: string;
  badge?: boolean;
}

interface GuidanceCounselorBottomNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  onFABPress: () => void;
}

const GuidanceCounselorBottomNavigation: React.FC<GuidanceCounselorBottomNavigationProps> = ({
  activeTab,
  onTabPress,
  onFABPress,
}) => {
  const badges = useGuidanceCounselorBadges();

  const tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'students', label: 'Students', icon: '👨‍🎓', badge: badges.students > 0 },
    { id: 'communications', label: 'Messages', icon: '📧', badge: badges.communications > 0 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#9b59b6" />
      
      {/* API Limitation Notice */}
      <View style={styles.apiNotice}>
        <Text style={styles.apiNoticeText}>
          ⚠️ Limited API endpoints available for Guidance Counselor role
        </Text>
      </View>
      
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
                    {tab.id === 'students' && badges.students > 0 ? String(badges.students) :
                     tab.id === 'communications' && badges.communications > 0 ? String(badges.communications) : ''}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Floating Action Button for Emergency/Quick Actions */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onFABPress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>📞</Text>
        {badges.students > 0 && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>!</Text>
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
  apiNotice: {
    backgroundColor: '#f39c12',
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  apiNoticeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
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
    color: '#9b59b6',
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
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9b59b6',
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
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default GuidanceCounselorBottomNavigation; 