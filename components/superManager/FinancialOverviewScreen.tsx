import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';

interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

interface ClassWiseCollection {
  className: string;
  expected: number;
  collected: number;
  collectionRate: number;
  outstanding: number;
}

interface MonthlyTrend {
  month: string;
  collected: number;
  target: number;
}

interface FinancialData {
  financialSummary: {
    totalExpected: number;
    totalCollected: number;
    collectionRate: number;
    thisMonthCollection: number;
    outstanding: number;
    currency: string;
  };
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  classWiseCollection: ClassWiseCollection[];
  monthlyTrend: MonthlyTrend[];
}

interface FinancialOverviewProps {
  token: string;
  onNavigateBack: () => void;
}

const FinancialOverviewScreen: React.FC<FinancialOverviewProps> = ({ token, onNavigateBack }) => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for fallback
  const mockFinancialData: FinancialData = {
    financialSummary: {
      totalExpected: 95500000,
      totalCollected: 75200000,
      collectionRate: 78.7,
      thisMonthCollection: 12500000,
      outstanding: 20300000,
      currency: "FCFA"
    },
    paymentMethodBreakdown: [
      {
        method: "EXPRESS_UNION",
        amount: 45200000,
        percentage: 60,
        transactionCount: 892
      },
      {
        method: "CCA",
        amount: 20500000,
        percentage: 27,
        transactionCount: 405
      },
      {
        method: "3DC",
        amount: 9500000,
        percentage: 13,
        transactionCount: 187
      }
    ],
    classWiseCollection: [
      {
        className: "FORM 1",
        expected: 18000000,
        collected: 15300000,
        collectionRate: 85,
        outstanding: 2700000
      },
      {
        className: "FORM 2",
        expected: 19200000,
        collected: 15744000,
        collectionRate: 82,
        outstanding: 3456000
      },
      {
        className: "FORM 3",
        expected: 17500000,
        collected: 13125000,
        collectionRate: 75,
        outstanding: 4375000
      },
      {
        className: "FORM 4",
        expected: 16800000,
        collected: 11760000,
        collectionRate: 70,
        outstanding: 5040000
      },
      {
        className: "FORM 5",
        expected: 15000000,
        collected: 10200000,
        collectionRate: 68,
        outstanding: 4800000
      }
    ],
    monthlyTrend: [
      { month: "2024-01", collected: 8500000, target: 10000000 },
      { month: "2024-02", collected: 9200000, target: 10000000 },
      { month: "2024-03", collected: 11800000, target: 12000000 },
      { month: "2024-04", collected: 10500000, target: 11000000 },
      { month: "2024-05", collected: 12500000, target: 12000000 }
    ]
  };

  // Fetch financial data from API
  const fetchFinancialData = async () => {
    try {
      console.log('💰 Fetching financial overview...');
      console.log('Using token:', token);
      
      const response = await fetch('https://sms.sniperbuisnesscenter.com/api/v1/bursar/financial-overview?includeBreakdown=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Financial Overview API Response Status:', response.status);

      if (response.ok) {
        const apiData = await response.json();
        console.log('Financial Overview API Response:', JSON.stringify(apiData, null, 2));
        
        if (apiData.success && apiData.data) {
          setFinancialData(apiData.data);
          console.log('✅ Successfully loaded real financial data');
          return;
        } else {
          console.log('API returned success=false or missing data:', apiData);
        }
      } else {
        const errorData = await response.text();
        console.log('Financial Overview API Error:', response.status, errorData);
      }
    } catch (error) {
      console.log('Financial Overview API call failed:', error);
    }

    // Fallback to mock data
    console.log('📋 Using mock financial data as fallback');
    setFinancialData(mockFinancialData);
  };

  useEffect(() => {
    fetchFinancialData().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFinancialData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const getCollectionRateColor = (rate: number) => {
    if (rate >= 85) return '#2ecc71';
    if (rate >= 70) return '#f39c12';
    return '#e74c3c';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'EXPRESS_UNION': return '🏦';
      case 'CCA': return '💳';
      case '3DC': return '🔢';
      default: return '💰';
    }
  };

  const handleExportReport = () => {
    Alert.alert(
      'Export Report',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => Alert.alert('Info', 'PDF export feature coming soon') },
        { text: 'Excel', onPress: () => Alert.alert('Info', 'Excel export feature coming soon') },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text style={styles.loadingText}>Loading Financial Overview...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!financialData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load financial data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFinancialData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Overview</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
          <Text style={styles.exportIcon}>📊</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Financial Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { backgroundColor: '#3498db' }]}>
              <Text style={styles.summaryNumber}>{formatCurrency(financialData.financialSummary.totalExpected)}</Text>
              <Text style={styles.summaryLabel}>Total Expected</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: '#2ecc71' }]}>
              <Text style={styles.summaryNumber}>{formatCurrency(financialData.financialSummary.totalCollected)}</Text>
              <Text style={styles.summaryLabel}>Total Collected</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: '#f39c12' }]}>
              <Text style={styles.summaryNumber}>{financialData.financialSummary.collectionRate.toFixed(1)}%</Text>
              <Text style={styles.summaryLabel}>Collection Rate</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: '#e74c3c' }]}>
              <Text style={styles.summaryNumber}>{formatCurrency(financialData.financialSummary.outstanding)}</Text>
              <Text style={styles.summaryLabel}>Outstanding</Text>
            </View>
          </View>

          <View style={styles.monthlyHighlight}>
            <Text style={styles.monthlyTitle}>📈 This Month: {formatCurrency(financialData.financialSummary.thisMonthCollection)}</Text>
          </View>
        </View>

        {/* Payment Methods Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Methods Breakdown</Text>
          
          {financialData.paymentMethodBreakdown.map((method, index) => (
            <View key={index} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentIcon}>{getPaymentMethodIcon(method.method)}</Text>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentMethod}>{method.method}</Text>
                  <Text style={styles.paymentTransactions}>{method.transactionCount} transactions</Text>
                </View>
                <Text style={styles.paymentPercentage}>{method.percentage}%</Text>
              </View>
              
              <Text style={styles.paymentAmount}>{formatCurrency(method.amount)}</Text>
              
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${method.percentage}%`, backgroundColor: '#3498db' }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Class-wise Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏫 Class-wise Collection Status</Text>
          
          {financialData.classWiseCollection.map((classData, index) => (
            <View key={index} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{classData.className}</Text>
                <Text style={[styles.classRate, { color: getCollectionRateColor(classData.collectionRate) }]}>
                  {classData.collectionRate}%
                </Text>
              </View>
              
              <View style={styles.classFinancials}>
                <View style={styles.classFinancialItem}>
                  <Text style={styles.financialLabel}>Expected:</Text>
                  <Text style={styles.financialValue}>{formatCurrency(classData.expected)}</Text>
                </View>
                <View style={styles.classFinancialItem}>
                  <Text style={styles.financialLabel}>Collected:</Text>
                  <Text style={[styles.financialValue, { color: '#2ecc71' }]}>{formatCurrency(classData.collected)}</Text>
                </View>
                <View style={styles.classFinancialItem}>
                  <Text style={styles.financialLabel}>Outstanding:</Text>
                  <Text style={[styles.financialValue, { color: '#e74c3c' }]}>{formatCurrency(classData.outstanding)}</Text>
                </View>
              </View>
              
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { 
                    width: `${classData.collectionRate}%`, 
                    backgroundColor: getCollectionRateColor(classData.collectionRate) 
                  }
                ]} />
              </View>
            </View>
          ))}
        </View>

        {/* Monthly Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Monthly Collection Trends</Text>
          
          {financialData.monthlyTrend.map((month, index) => (
            <View key={index} style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendMonth}>{month.month}</Text>
                <Text style={styles.trendPercentage}>
                  {((month.collected / month.target) * 100).toFixed(1)}%
                </Text>
              </View>
              
              <View style={styles.trendDetails}>
                <Text style={styles.trendLabel}>Collected: {formatCurrency(month.collected)}</Text>
                <Text style={styles.trendLabel}>Target: {formatCurrency(month.target)}</Text>
              </View>
              
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { 
                    width: `${(month.collected / month.target) * 100}%`, 
                    backgroundColor: month.collected >= month.target ? '#2ecc71' : '#f39c12'
                  }
                ]} />
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleExportReport}>
            <Text style={styles.actionButtonText}>📊 Export Detailed Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Info', 'Financial analytics feature coming soon')}
          >
            <Text style={styles.secondaryButtonText}>📈 View Analytics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
  monthlyHighlight: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  paymentTransactions: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  paymentPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classRate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  classFinancials: {
    marginBottom: 10,
  },
  classFinancialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  financialLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  trendCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendMonth: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  trendPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  trendDetails: {
    marginBottom: 10,
  },
  trendLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  actionsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FinancialOverviewScreen; 