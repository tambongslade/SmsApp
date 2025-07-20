import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { VPDashboard, VPStudents, VPClasses, VPReportCards, VPBottomNavigation, VPCommunications, VPMessages } from './vp';

const VicePrincipalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <VPDashboard />;
      case 'students':
        return <VPStudents />;
      case 'classes':
        return <VPClasses />;
      case 'reportcards':
        return <VPReportCards />;
      case 'communications':
        return <VPCommunications />;
      case 'messages':
        return <VPMessages />;
      default:
        return <VPDashboard />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      <VPBottomNavigation
        currentScreen={activeTab}
        onNavigate={setActiveTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
  },
});

export default VicePrincipalDashboard; 