import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VPBottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const VPBottomNavigation: React.FC<VPBottomNavigationProps> = ({ 
  currentScreen, 
  onNavigate 
}) => {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { key: 'students', label: 'Students', icon: 'people-outline' },
    { key: 'classes', label: 'Classes', icon: 'school-outline' },
    { key: 'reportcards', label: 'Reports', icon: 'document-text-outline' },
    { key: 'communications', label: 'Announce', icon: 'megaphone-outline' },
    { key: 'messages', label: 'Messages', icon: 'chatbubbles-outline' },
  ];

  const renderTab = (tab: typeof tabs[0]) => (
    <TouchableOpacity
      key={tab.key}
      style={[
        styles.tab,
        currentScreen === tab.key && styles.activeTab,
      ]}
      onPress={() => onNavigate(tab.key)}
    >
      <Ionicons
        name={tab.icon as any}
        size={20}
        color={currentScreen === tab.key ? '#007AFF' : '#8E8E93'}
      />
      <Text
        style={[
          styles.tabLabel,
          currentScreen === tab.key && styles.activeTabLabel,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {tabs.map(renderTab)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 34, // Safe area padding for iOS
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default VPBottomNavigation; 