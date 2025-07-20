import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useHOD } from '../HODContext';

interface ResourceRequest {
  itemName: string;
  category: string;
  quantity: string;
  justification: string;
  priority: string;
}

const HODResourcesScreen: React.FC = () => {
  const { resourceStatus, submitResourceRequest } = useHOD();
  const [refreshing, setRefreshing] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [priorityModal, setPriorityModal] = useState(false);
  const [request, setRequest] = useState<ResourceRequest>({
    itemName: '',
    category: 'TEXTBOOKS',
    quantity: '',
    justification: '',
    priority: 'MEDIUM'
  });

  const categories = [
    { label: 'Textbooks', value: 'TEXTBOOKS' },
    { label: 'Equipment', value: 'EQUIPMENT' },
    { label: 'Supplies', value: 'SUPPLIES' },
    { label: 'Digital Resources', value: 'DIGITAL_RESOURCES' },
  ];

  const priorities = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const budgetPercentage = (resourceStatus.spent / resourceStatus.allocated) * 100;
  const remainingPercentage = (resourceStatus.remaining / resourceStatus.allocated) * 100;

  const submitRequest = () => {
    if (!request.itemName.trim() || !request.quantity.trim() || !request.justification.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    submitResourceRequest(request);
    setRequestModal(false);
    setRequest({
      itemName: '',
      category: 'TEXTBOOKS',
      quantity: '',
      justification: '',
      priority: 'MEDIUM'
    });
    Alert.alert('Success', 'Resource request submitted successfully');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const getBudgetColor = () => {
    if (budgetPercentage >= 90) return '#e74c3c';
    if (budgetPercentage >= 75) return '#f39c12';
    return '#27ae60';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const mockInventory = [
    { item: 'Scientific Calculators', category: 'EQUIPMENT', quantity: 45, condition: 'GOOD' },
    { item: 'Mathematics Textbooks Form 1', category: 'TEXTBOOKS', quantity: 120, condition: 'NEW' },
    { item: 'Geometric Tool Sets', category: 'SUPPLIES', quantity: 30, condition: 'FAIR' },
    { item: 'Digital Projector', category: 'EQUIPMENT', quantity: 2, condition: 'NEEDS_REPLACEMENT' },
  ];

  const mockRequests = [
    { item: 'Advanced Calculators', status: 'PENDING', priority: 'HIGH', date: '2024-01-15' },
    { item: 'Geometry Software License', status: 'APPROVED', priority: 'MEDIUM', date: '2024-01-10' },
    { item: 'Whiteboard Markers', status: 'PENDING', priority: 'LOW', date: '2024-01-12' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Budget Status</Text>
          
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetTitle}>Annual Budget</Text>
              <Text style={styles.budgetAmount}>{formatCurrency(resourceStatus.allocated)}</Text>
            </View>
            
            <View style={styles.budgetProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${budgetPercentage}%`, backgroundColor: getBudgetColor() }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{budgetPercentage.toFixed(1)}% used</Text>
            </View>
            
            <View style={styles.budgetDetails}>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Spent</Text>
                <Text style={[styles.budgetValue, { color: '#e74c3c' }]}>
                  {formatCurrency(resourceStatus.spent)}
                </Text>
              </View>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Remaining</Text>
                <Text style={[styles.budgetValue, { color: '#27ae60' }]}>
                  {formatCurrency(resourceStatus.remaining)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Resource Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Current Inventory</Text>
          
          {mockInventory.map((item, index) => (
            <View key={index} style={styles.inventoryCard}>
              <View style={styles.inventoryHeader}>
                <Text style={styles.itemName}>{item.item}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <View style={styles.inventoryDetails}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={[
                  styles.conditionBadge,
                  { backgroundColor: item.condition === 'NEW' ? '#27ae60' : 
                    item.condition === 'GOOD' ? '#f39c12' : '#e74c3c' }
                ]}>
                  <Text style={styles.conditionText}>{item.condition}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pending Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Recent Requests</Text>
          
          {mockRequests.map((req, index) => (
            <View key={index} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestItem}>{req.item}</Text>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(req.priority) }
                ]}>
                  <Text style={styles.priorityText}>{req.priority}</Text>
                </View>
              </View>
              <View style={styles.requestDetails}>
                <Text style={styles.requestDate}>{req.date}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: req.status === 'APPROVED' ? '#27ae60' : '#f39c12' }
                ]}>
                  <Text style={styles.statusText}>{req.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.requestButton}
            onPress={() => setRequestModal(true)}
          >
            <Text style={styles.requestButtonText}>+ Request Resources</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Request Modal */}
      <Modal visible={requestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Resources</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Item name *"
              value={request.itemName}
              onChangeText={(text) => setRequest(prev => ({ ...prev, itemName: text }))}
            />
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setCategoryModal(true)}
              >
                <Text style={styles.dropdownText}>
                  {categories.find(c => c.value === request.category)?.label}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Quantity *"
              value={request.quantity}
              onChangeText={(text) => setRequest(prev => ({ ...prev, quantity: text }))}
              keyboardType="numeric"
            />
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Priority:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setPriorityModal(true)}
              >
                <Text style={styles.dropdownText}>
                  {priorities.find(p => p.value === request.priority)?.label}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Justification *"
              value={request.justification}
              onChangeText={(text) => setRequest(prev => ({ ...prev, justification: text }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRequestModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitRequest}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal visible={categoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <Text style={styles.optionsTitle}>Select Category</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={styles.optionItem}
                onPress={() => {
                  setRequest(prev => ({ ...prev, category: category.value }));
                  setCategoryModal(false);
                }}
              >
                <Text style={styles.optionText}>{category.label}</Text>
                {request.category === category.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelOption}
              onPress={() => setCategoryModal(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Priority Selection Modal */}
      <Modal visible={priorityModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <Text style={styles.optionsTitle}>Select Priority</Text>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={styles.optionItem}
                onPress={() => {
                  setRequest(prev => ({ ...prev, priority: priority.value }));
                  setPriorityModal(false);
                }}
              >
                <Text style={styles.optionText}>{priority.label}</Text>
                {request.priority === priority.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelOption}
              onPress={() => setPriorityModal(false)}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  budgetCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  budgetProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  inventoryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  inventoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'capitalize',
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  conditionText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestItem: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  requestButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 12,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  optionsModal: {
    backgroundColor: '#fff',
    margin: 40,
    borderRadius: 12,
    padding: 20,
    maxHeight: '60%',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  checkmark: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  cancelOption: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HODResourcesScreen; 