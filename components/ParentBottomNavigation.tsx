import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import ParentDashboard from './ParentDashboard';
import { ParentChildrenScreen } from './tabs';
import ParentMessagesScreen from './ParentMessagesScreen';
import ParentAnnouncementsScreen from './ParentAnnouncementsScreen';
import ParentSettingsScreen from './ParentSettingsScreen';

interface ParentBottomNavigationProps {
  route: any;
  navigation: any;
  onLogout: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const ParentBottomNavigation: React.FC<ParentBottomNavigationProps> = ({ 
  route, 
  navigation, 
  onLogout, 
  onNavigate 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'children', label: 'Children', icon: '👨‍👩‍👧‍👦' },
    { id: 'messages', label: 'Messages', icon: '📧' },
    { id: 'announcements', label: 'News', icon: '📢' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const renderActiveScreen = () => {
    const commonProps = {
      route,
      navigation,
      onLogout,
      onNavigate,
    };

    switch (activeTab) {
      case 'dashboard':
        return <ParentDashboard {...commonProps} />;
      case 'children':
        return <ParentChildrenScreen {...commonProps} />;
      case 'messages':
        return <ParentMessagesScreen {...commonProps} />;
      case 'announcements':
        return <ParentAnnouncementsScreen {...commonProps} />;
      case 'settings':
        return <ParentSettingsScreen {...commonProps} onLogout={onLogout} />;
      default:
        return <ParentDashboard {...commonProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderActiveScreen()}
      </View>
      
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              activeTab === tab.id && styles.activeTabItem,
            ]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabIcon,
              activeTab === tab.id && styles.activeTabIcon,
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTabItem: {
    backgroundColor: '#667eea15',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#667eea',
    fontWeight: '600',
  },
});

export default ParentBottomNavigation; 