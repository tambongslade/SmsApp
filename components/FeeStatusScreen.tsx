import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';

interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  receipt: string;
  description: string;
}

interface FeeItem {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  paidAmount: number;
}

interface FeeStatusScreenProps {
  onBack: () => void;
  childName: string;
}

const FeeStatusScreen: React.FC<FeeStatusScreenProps> = ({ onBack, childName }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'upload'>('overview');

  const academicYear = '2024-2025';
  const totalFees = 15000;
  const paidAmount = 12500;
  const pendingAmount = 2500;

  const feeItems: FeeItem[] = [
    {
      id: '1',
      name: 'Tuition Fee - Term 1',
      amount: 5000,
      dueDate: '2024-03-15',
      status: 'paid',
      paidAmount: 5000,
    },
    {
      id: '2',
      name: 'Tuition Fee - Term 2',
      amount: 5000,
      dueDate: '2024-06-15',
      status: 'paid',
      paidAmount: 5000,
    },
    {
      id: '3',
      name: 'Tuition Fee - Term 3',
      amount: 5000,
      dueDate: '2024-09-15',
      status: 'pending',
      paidAmount: 0,
    },
    {
      id: '4',
      name: 'Activity Fee',
      amount: 1000,
      dueDate: '2024-03-01',
      status: 'paid',
      paidAmount: 1000,
    },
    {
      id: '5',
      name: 'Exam Fee',
      amount: 800,
      dueDate: '2024-05-20',
      status: 'paid',
      paidAmount: 800,
    },
    {
      id: '6',
      name: 'Library Fee',
      amount: 500,
      dueDate: '2024-04-10',
      status: 'paid',
      paidAmount: 500,
    },
    {
      id: '7',
      name: 'Sports Fee',
      amount: 700,
      dueDate: '2024-08-30',
      status: 'pending',
      paidAmount: 200,
    },
  ];

  const paymentHistory: PaymentRecord[] = [
    {
      id: '1',
      amount: 5000,
      date: '2024-03-10',
      method: 'Bank Transfer',
      status: 'completed',
      receipt: 'RCP001',
      description: 'Tuition Fee - Term 1',
    },
    {
      id: '2',
      amount: 1000,
      date: '2024-02-28',
      method: 'Online Payment',
      status: 'completed',
      receipt: 'RCP002',
      description: 'Activity Fee',
    },
    {
      id: '3',
      amount: 5000,
      date: '2024-06-10',
      method: 'Cash',
      status: 'completed',
      receipt: 'RCP003',
      description: 'Tuition Fee - Term 2',
    },
    {
      id: '4',
      amount: 800,
      date: '2024-05-18',
      method: 'Bank Transfer',
      status: 'completed',
      receipt: 'RCP004',
      description: 'Exam Fee',
    },
    {
      id: '5',
      amount: 200,
      date: '2024-08-25',
      method: 'Online Payment',
      status: 'pending',
      receipt: 'RCP005',
      description: 'Sports Fee - Partial',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return '#2ecc71';
      case 'pending':
        return '#f39c12';
      case 'overdue':
      case 'failed':
        return '#e74c3c';
      case 'partial':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'overdue':
      case 'failed':
        return '❌';
      case 'partial':
        return '🔄';
      default:
        return '📋';
    }
  };

  const handlePayNow = (feeItem: FeeItem) => {
    Alert.alert(
      'Payment Options',
      `Pay ${feeItem.name}\nAmount: $${feeItem.amount - feeItem.paidAmount}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Bank Transfer', onPress: () => Alert.alert('Redirecting to bank transfer...') },
        { text: 'Online Payment', onPress: () => Alert.alert('Redirecting to payment gateway...') },
      ]
    );
  };

  const handleUploadReceipt = () => {
    Alert.alert('Upload Receipt', 'Select payment receipt from gallery or camera', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Camera', onPress: () => Alert.alert('Opening camera...') },
      { text: 'Gallery', onPress: () => Alert.alert('Opening gallery...') },
    ]);
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#2ecc71' }]}>
          <Text style={styles.summaryAmount}>${paidAmount.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Paid</Text>
          <Text style={styles.summaryIcon}>✅</Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: '#e74c3c' }]}>
          <Text style={styles.summaryAmount}>${pendingAmount.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={styles.summaryIcon}>⏳</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Payment Progress</Text>
          <Text style={styles.progressPercentage}>
            {Math.round((paidAmount / totalFees) * 100)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(paidAmount / totalFees) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          ${paidAmount.toLocaleString()} of ${totalFees.toLocaleString()} paid
        </Text>
      </View>

      {/* Fee Breakdown */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fee Breakdown</Text>
        <Text style={styles.academicYear}>{academicYear}</Text>
      </View>

      {feeItems.map((item) => (
        <View key={item.id} style={styles.feeCard}>
          <View style={styles.feeHeader}>
            <View style={styles.feeInfo}>
              <Text style={styles.feeName}>{item.name}</Text>
              <Text style={styles.feeDueDate}>Due: {item.dueDate}</Text>
            </View>
            <View style={styles.feeStatus}>
              <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.feeAmount}>
            <Text style={styles.totalAmount}>${item.amount}</Text>
            {item.paidAmount > 0 && item.paidAmount < item.amount && (
              <Text style={styles.paidAmount}>Paid: ${item.paidAmount}</Text>
            )}
          </View>

          {(item.status === 'pending' || item.status === 'partial') && (
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => handlePayNow(item)}
            >
              <Text style={styles.payButtonText}>
                Pay ${item.amount - item.paidAmount} Now
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>Download Statement</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📧</Text>
          <Text style={styles.actionText}>Email Receipt</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPayments = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        <Text style={styles.totalPaid}>${paidAmount.toLocaleString()} Total</Text>
      </View>

      {paymentHistory.map((payment) => (
        <View key={payment.id} style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentDescription}>{payment.description}</Text>
              <Text style={styles.paymentDate}>{payment.date}</Text>
              <Text style={styles.paymentMethod}>{payment.method}</Text>
            </View>
            <View style={styles.paymentAmountContainer}>
              <Text style={styles.paymentAmount}>${payment.amount}</Text>
              <View style={[styles.paymentStatus, { backgroundColor: getStatusColor(payment.status) }]}>
                <Text style={styles.paymentStatusText}>{payment.status}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.receiptRow}>
            <Text style={styles.receiptText}>Receipt: {payment.receipt}</Text>
            <TouchableOpacity style={styles.downloadReceiptButton}>
              <Text style={styles.downloadReceiptText}>📄 Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderUpload = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.uploadContainer}>
        <Text style={styles.uploadTitle}>Upload Payment Proof</Text>
        <Text style={styles.uploadSubtitle}>
          Submit your payment receipt or bank transfer proof for verification
        </Text>

        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadReceipt}>
          <Text style={styles.uploadIcon}>📁</Text>
          <Text style={styles.uploadButtonText}>Choose File</Text>
          <Text style={styles.uploadHint}>PNG, JPG, PDF (Max 5MB)</Text>
        </TouchableOpacity>

        <View style={styles.uploadForm}>
          <Text style={styles.formLabel}>Payment Details</Text>
          
          <View style={styles.formRow}>
            <Text style={styles.formField}>Amount Paid</Text>
            <Text style={styles.formValue}>$_____</Text>
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.formField}>Payment Date</Text>
            <Text style={styles.formValue}>Select Date</Text>
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.formField}>Payment Method</Text>
            <Text style={styles.formValue}>Bank Transfer</Text>
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.formField}>Reference Number</Text>
            <Text style={styles.formValue}>Enter Reference</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit for Verification</Text>
        </TouchableOpacity>

        <View style={styles.uploadInfo}>
          <Text style={styles.infoTitle}>📋 Important Notes:</Text>
          <Text style={styles.infoText}>• Receipt will be verified within 1-2 business days</Text>
          <Text style={styles.infoText}>• You'll receive confirmation once verified</Text>
          <Text style={styles.infoText}>• Contact admin if verification takes longer</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Fee Status</Text>
          <Text style={styles.headerSubtitle}>{childName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
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
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
            Payments
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => setActiveTab('upload')}
        >
          <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
            Upload
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'upload' && renderUpload()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#bdc3c7',
    fontSize: 14,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
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
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    position: 'relative',
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  summaryIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    fontSize: 20,
  },
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  academicYear: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  totalPaid: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  feeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  feeInfo: {
    flex: 1,
  },
  feeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  feeDueDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  feeStatus: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  feeAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  paidAmount: {
    fontSize: 14,
    color: '#2ecc71',
  },
  payButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  paymentDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  paymentAmountContainer: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  paymentStatus: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  paymentStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
  },
  receiptText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  downloadReceiptButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  downloadReceiptText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  uploadContainer: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 5,
  },
  uploadHint: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  uploadForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  formField: {
    fontSize: 14,
    color: '#34495e',
  },
  formValue: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default FeeStatusScreen; 