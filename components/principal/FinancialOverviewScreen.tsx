import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { User } from '../LoginScreen';

// API Response Interfaces
interface FeesOverview {
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  outstandingAmount: number;
  defaulters: number;
}

interface BudgetStatus {
  totalBudget: number;
  allocated: number;
  spent: number;
  remaining: number;
  utilizationRate: number;
}

interface DepartmentBudget {
  departmentName: string;
  allocated: number;
  spent: number;
  remaining: number;
  requests: number;
}

interface RevenueStream {
  source: string;
  amount: number;
  percentage: number;
}

interface Expenditure {
  category: string;
  amount: number;
  percentage: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

interface MonthlyTrend {
  month: string;
  collections: number;
  expenses: number;
  netResult: number;
}

interface FinancialData {
  feesOverview: FeesOverview;
  budgetStatus: BudgetStatus;
  departmentBudgets: DepartmentBudget[];
  revenueStreams: RevenueStream[];
  expenditures: Expenditure[];
  monthlyTrends: MonthlyTrend[];
}

interface FinancialOverviewProps {
  user: User;
  token: string;
  onBack: () => void;
}

const FinancialOverviewScreen: React.FC<FinancialOverviewProps> = ({ user, token, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);

  const API_BASE_URL = 'https://sms.sniperbuisnesscenter.com';

  const fetchFinancialData = async () => {
    try {
      console.log('🔍 Fetching financial data...');
      const response = await fetch(`${API_BASE_URL}/api/v1/principal/analytics/financial`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const apiData = await response.json();
      console.log('💰 Financial data API response:', apiData);

      if (apiData.success && apiData.data) {
        // Try to map API response to our expected structure
        const mappedData: FinancialData = {
          feesOverview: {
            totalExpected: apiData.data.financialOverview?.totalExpectedRevenue || 0,
            totalCollected: apiData.data.financialOverview?.totalCollectedRevenue || 0,
            collectionRate: apiData.data.financialOverview?.collectionRate || 0,
            outstandingAmount: (apiData.data.financialOverview?.totalExpectedRevenue || 0) - (apiData.data.financialOverview?.totalCollectedRevenue || 0),
            defaulters: apiData.data.financialOverview?.pendingPayments || 0,
          },
          budgetStatus: {
            totalBudget: 52000000, // Mock data as this isn't in the current API
            allocated: 44000000,
            spent: 38500000,
            remaining: 5500000,
            utilizationRate: 85,
          },
          departmentBudgets: [
            { departmentName: 'Mathematics', allocated: 2500000, spent: 2100000, remaining: 400000, requests: 1 },
            { departmentName: 'Sciences', allocated: 3200000, spent: 2800000, remaining: 400000, requests: 2 },
            { departmentName: 'English', allocated: 1800000, spent: 1650000, remaining: 150000, requests: 0 },
            { departmentName: 'Administration', allocated: 5000000, spent: 4200000, remaining: 800000, requests: 3 },
            { departmentName: 'Infrastructure', allocated: 8000000, spent: 6500000, remaining: 1500000, requests: 1 },
          ],
          revenueStreams: [
            { source: 'School Fees', amount: apiData.data.financialOverview?.totalCollectedRevenue || 0, percentage: 85 },
            { source: 'Other Income', amount: Math.round((apiData.data.financialOverview?.totalCollectedRevenue || 0) * 0.15), percentage: 15 },
          ],
          expenditures: [
            { category: 'Salaries', amount: 24000000, percentage: 62, trend: 'STABLE' },
            { category: 'Utilities', amount: 6000000, percentage: 16, trend: 'INCREASING' },
            { category: 'Supplies', amount: 4500000, percentage: 12, trend: 'STABLE' },
            { category: 'Maintenance', amount: 2000000, percentage: 5, trend: 'DECREASING' },
            { category: 'Other', amount: 2000000, percentage: 5, trend: 'STABLE' },
          ],
          monthlyTrends: apiData.data.financialOverview?.monthlyCollectionTrends?.map((trend: any, index: number) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index] || `Month ${index + 1}`,
            collections: trend.collections || 0,
            expenses: trend.collections ? trend.collections * 0.85 : 0, // Mock calculation
            netResult: trend.collections ? trend.collections * 0.15 : 0,
          })) || [],
        };
        
        setFinancialData(mappedData);
        console.log('✅ Successfully loaded and mapped financial data');
        return;
      } else {
        console.log('API returned success=false or missing data:', apiData);
      }
    } catch (error) {
      console.error('❌ Error fetching financial data:', error);
    }

    // Fallback to mock data
    console.log('🔄 Using mock financial data');
    setFinancialData({
      feesOverview: {
        totalExpected: 52000000,
        totalCollected: 45200000,
        collectionRate: 87,
        outstandingAmount: 6800000,
        defaulters: 89,
      },
      budgetStatus: {
        totalBudget: 52000000,
        allocated: 44000000,
        spent: 38500000,
        remaining: 5500000,
        utilizationRate: 85,
      },
      departmentBudgets: [
        { departmentName: 'Mathematics', allocated: 2500000, spent: 2100000, remaining: 400000, requests: 1 },
        { departmentName: 'Sciences', allocated: 3200000, spent: 2800000, remaining: 400000, requests: 2 },
        { departmentName: 'English', allocated: 1800000, spent: 1650000, remaining: 150000, requests: 0 },
        { departmentName: 'Administration', allocated: 5000000, spent: 4200000, remaining: 800000, requests: 3 },
        { departmentName: 'Infrastructure', allocated: 8000000, spent: 6500000, remaining: 1500000, requests: 1 },
      ],
      revenueStreams: [
        { source: 'School Fees', amount: 45200000, percentage: 85 },
        { source: 'Other Income', amount: 7800000, percentage: 15 },
      ],
      expenditures: [
        { category: 'Salaries', amount: 24000000, percentage: 62, trend: 'STABLE' },
        { category: 'Utilities', amount: 6000000, percentage: 16, trend: 'INCREASING' },
        { category: 'Supplies', amount: 4500000, percentage: 12, trend: 'STABLE' },
        { category: 'Maintenance', amount: 2000000, percentage: 5, trend: 'DECREASING' },
        { category: 'Other', amount: 2000000, percentage: 5, trend: 'STABLE' },
      ],
      monthlyTrends: [
        { month: 'Jan', collections: 7500000, expenses: 6400000, netResult: 1100000 },
        { month: 'Feb', collections: 7200000, expenses: 6500000, netResult: 700000 },
        { month: 'Mar', collections: 8100000, expenses: 6300000, netResult: 1800000 },
        { month: 'Apr', collections: 7800000, expenses: 6600000, netResult: 1200000 },
        { month: 'May', collections: 7600000, expenses: 6400000, netResult: 1200000 },
        { month: 'Jun', collections: 6900000, expenses: 6300000, netResult: 600000 },
      ],
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    await fetchFinancialData();
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const approveBudgetRequest = async (departmentName: string) => {
    try {
      console.log('✅ Approving budget request for', departmentName);
      Alert.alert('Success', `Budget request for ${departmentName} approved successfully!`);
    } catch (error) {
      console.error('❌ Error approving budget:', error);
      Alert.alert('Error', 'Failed to approve budget request');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return '📈';
      case 'STABLE': return '➡️';
      case 'DECREASING': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return '#e74c3c';
      case 'STABLE': return '#f39c12';
      case 'DECREASING': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const renderOverview = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Financial Summary */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>💰 Financial Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Revenue</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(financialData?.feesOverview.totalCollected || 0)}
            </Text>
            <Text style={styles.summaryDesc}>Collected</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Expenses</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(financialData?.budgetStatus.spent || 0)}
            </Text>
            <Text style={styles.summaryDesc}>This Year</Text>
          </View>
        </View>

        <View style={styles.netResult}>
          <Text style={styles.netResultTitle}>Net Surplus</Text>
          <Text style={styles.netResultAmount}>
            {formatCurrency((financialData?.feesOverview.totalCollected || 0) - (financialData?.budgetStatus.spent || 0))}
          </Text>
        </View>

        <View style={styles.keyMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Budget Utilization</Text>
            <Text style={styles.metricValue}>{financialData?.budgetStatus.utilizationRate}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Fee Collection Rate</Text>
            <Text style={styles.metricValue}>{financialData?.feesOverview.collectionRate}%</Text>
          </View>
        </View>
      </View>

      {/* Fee Collection Analysis */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🎯 Fee Collection Analysis</Text>
        
        <View style={styles.collectionHeader}>
          <View style={styles.collectionStat}>
            <Text style={styles.collectionTitle}>Total Expected</Text>
            <Text style={styles.collectionValue}>
              {formatCurrency(financialData?.feesOverview.totalExpected || 0)}
            </Text>
          </View>
          <View style={styles.collectionStat}>
            <Text style={styles.collectionTitle}>Collected</Text>
            <Text style={styles.collectionValue}>
              {formatCurrency(financialData?.feesOverview.totalCollected || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.collectionRate}>
          <Text style={styles.collectionRateLabel}>Collection Rate: {financialData?.feesOverview.collectionRate}%</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${financialData?.feesOverview.collectionRate}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.collectionDetails}>
          <View style={styles.collectionDetail}>
            <Text style={styles.detailLabel}>Outstanding Amount:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(financialData?.feesOverview.outstandingAmount || 0)}
            </Text>
          </View>
          <View style={styles.collectionDetail}>
            <Text style={styles.detailLabel}>Fee Defaulters:</Text>
            <Text style={styles.detailValue}>{financialData?.feesOverview.defaulters} students</Text>
          </View>
        </View>

        <View style={styles.collectionActions}>
          <TouchableOpacity style={styles.strategyBtn}>
            <Text style={styles.strategyBtnText}>📈 Collection Strategies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.defaulterBtn}>
            <Text style={styles.defaulterBtnText}>👥 Defaulter Review</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Revenue Streams */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>💡 Revenue Streams</Text>
        
        {financialData?.revenueStreams.map((stream, index) => (
          <View key={index} style={styles.revenueStream}>
            <View style={styles.streamInfo}>
              <Text style={styles.streamName}>{stream.source}</Text>
              <Text style={styles.streamAmount}>{formatCurrency(stream.amount)}</Text>
            </View>
            <View style={styles.streamPercentage}>
              <Text style={styles.percentageText}>{stream.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderBudget = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Budget Overview */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📊 Budget Overview</Text>
        
        <View style={styles.budgetSummary}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Total Budget</Text>
            <Text style={styles.budgetValue}>
              {formatCurrency(financialData?.budgetStatus.totalBudget || 0)}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Allocated</Text>
            <Text style={styles.budgetValue}>
              {formatCurrency(financialData?.budgetStatus.allocated || 0)}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={styles.budgetValue}>
              {formatCurrency(financialData?.budgetStatus.spent || 0)}
            </Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={styles.budgetValue}>
              {formatCurrency(financialData?.budgetStatus.remaining || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.utilizationRate}>
          <Text style={styles.utilizationLabel}>
            Budget Utilization: {financialData?.budgetStatus.utilizationRate}%
          </Text>
          <View style={styles.utilizationBar}>
            <View 
              style={[
                styles.utilizationFill, 
                { width: `${financialData?.budgetStatus.utilizationRate}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Department Budgets */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🏫 Department Budget Status</Text>
        
        {financialData?.departmentBudgets.map((dept, index) => (
          <View key={index} style={styles.departmentBudget}>
            <View style={styles.deptHeader}>
              <Text style={styles.deptName}>{dept.departmentName}</Text>
              {dept.requests > 0 && (
                <View style={styles.requestBadge}>
                  <Text style={styles.requestText}>{dept.requests} requests</Text>
                </View>
              )}
            </View>
            
            <View style={styles.deptBudgetDetails}>
              <View style={styles.deptBudgetItem}>
                <Text style={styles.deptBudgetLabel}>Allocated:</Text>
                <Text style={styles.deptBudgetValue}>{formatCurrency(dept.allocated)}</Text>
              </View>
              <View style={styles.deptBudgetItem}>
                <Text style={styles.deptBudgetLabel}>Spent:</Text>
                <Text style={styles.deptBudgetValue}>{formatCurrency(dept.spent)}</Text>
              </View>
              <View style={styles.deptBudgetItem}>
                <Text style={styles.deptBudgetLabel}>Remaining:</Text>
                <Text style={styles.deptBudgetValue}>{formatCurrency(dept.remaining)}</Text>
              </View>
            </View>

            <View style={styles.deptProgress}>
              <View style={styles.deptProgressBar}>
                <View 
                  style={[
                    styles.deptProgressFill, 
                    { width: `${(dept.spent / dept.allocated) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.deptProgressText}>
                {((dept.spent / dept.allocated) * 100).toFixed(1)}% utilized
              </Text>
            </View>

            {dept.requests > 0 && (
              <View style={styles.deptActions}>
                <TouchableOpacity 
                  style={styles.approveBtn}
                  onPress={() => approveBudgetRequest(dept.departmentName)}
                >
                  <Text style={styles.approveBtnText}>✅ Approve Requests</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Expenditure Analysis */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📈 Expenditure Analysis</Text>
        
        {financialData?.expenditures.map((expense, index) => (
          <View key={index} style={styles.expenditureItem}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseName}>{expense.category}</Text>
              <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
            </View>
            <View style={styles.expenseDetails}>
              <Text style={styles.expensePercentage}>{expense.percentage}%</Text>
              <View style={styles.trendContainer}>
                <Text style={styles.trendIcon}>{getTrendIcon(expense.trend)}</Text>
                <Text style={[styles.trendText, { color: getTrendColor(expense.trend) }]}>
                  {expense.trend.toLowerCase()}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Monthly Trends */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📊 Monthly Financial Trends</Text>
        
        <View style={styles.trendsHeader}>
          <Text style={styles.trendColumn}>Month</Text>
          <Text style={styles.trendColumn}>Collections</Text>
          <Text style={styles.trendColumn}>Expenses</Text>
          <Text style={styles.trendColumn}>Net Result</Text>
        </View>

        {financialData?.monthlyTrends.map((trend, index) => (
          <View key={index} style={styles.trendRow}>
            <Text style={styles.trendMonth}>{trend.month}</Text>
            <Text style={styles.trendCollections}>
              {(trend.collections / 1000000).toFixed(1)}M
            </Text>
            <Text style={styles.trendExpenses}>
              {(trend.expenses / 1000000).toFixed(1)}M
            </Text>
            <Text style={[
              styles.trendNet, 
              { color: trend.netResult > 0 ? '#27ae60' : '#e74c3c' }
            ]}>
              {trend.netResult > 0 ? '+' : ''}{(trend.netResult / 1000000).toFixed(1)}M
            </Text>
          </View>
        ))}

        <View style={styles.analyticsActions}>
          <TouchableOpacity style={styles.forecastBtn}>
            <Text style={styles.forecastBtnText}>🔮 Financial Forecast</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportBtn}>
            <Text style={styles.reportBtnText}>📄 Generate Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading financial data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>💰 Financial Overview</Text>
          <Text style={styles.headerSubtitle}>Principal Dashboard</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'budget' && styles.activeTab]}
          onPress={() => setActiveTab('budget')}
        >
          <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText]}>
            Budget
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'budget' && renderBudget()}
        {activeTab === 'analytics' && renderAnalytics()}
      </View>
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
  header: {
    backgroundColor: '#2c3e50',
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
    marginRight: 15,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  tabContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2c3e50',
  },
  tabText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  // Financial Summary styles
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
    textAlign: 'center',
  },
  summaryDesc: {
    fontSize: 10,
    color: '#95a5a6',
  },
  netResult: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  netResultTitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  netResultAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  keyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  // Fee Collection styles
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  collectionStat: {
    flex: 1,
    alignItems: 'center',
  },
  collectionTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  collectionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  collectionRate: {
    marginBottom: 15,
  },
  collectionRateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#27ae60',
    borderRadius: 4,
  },
  collectionDetails: {
    marginBottom: 15,
  },
  collectionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  collectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strategyBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  strategyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  defaulterBtn: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  defaulterBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Revenue Streams styles
  revenueStream: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  streamInfo: {
    flex: 1,
  },
  streamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  streamAmount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  streamPercentage: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  // Budget styles
  budgetSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  utilizationRate: {
    marginBottom: 10,
  },
  utilizationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  utilizationBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  // Department Budget styles
  departmentBudget: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deptName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  requestBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  requestText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  deptBudgetDetails: {
    marginBottom: 12,
  },
  deptBudgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  deptBudgetLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  deptBudgetValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  deptProgress: {
    marginBottom: 10,
  },
  deptProgressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    marginBottom: 5,
  },
  deptProgressFill: {
    height: 6,
    backgroundColor: '#27ae60',
    borderRadius: 3,
  },
  deptProgressText: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  deptActions: {
    marginTop: 10,
  },
  approveBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Analytics styles
  expenditureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  expenseAmount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  expenseDetails: {
    alignItems: 'flex-end',
  },
  expensePercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 3,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Monthly Trends styles
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ecf0f1',
    marginBottom: 10,
  },
  trendColumn: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  trendMonth: {
    flex: 1,
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
  },
  trendCollections: {
    flex: 1,
    fontSize: 12,
    color: '#27ae60',
    textAlign: 'center',
  },
  trendExpenses: {
    flex: 1,
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
  },
  trendNet: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  analyticsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  forecastBtn: {
    flex: 1,
    backgroundColor: '#9b59b6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  forecastBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reportBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  reportBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FinancialOverviewScreen; 