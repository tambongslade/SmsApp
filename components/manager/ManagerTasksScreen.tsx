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
import { useManager } from '../ManagerContext';

interface NewTask {
  title: string;
  description: string;
  assignedTo: string;
  priority: string;
  dueDate: string;
  category: string;
}

const ManagerTasksScreen: React.FC = () => {
  const { taskSummary, assignTask } = useManager();
  const [refreshing, setRefreshing] = useState(false);
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [priorityModal, setPriorityModal] = useState(false);
  const [assigneeModal, setAssigneeModal] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    assignedTo: 'Assistant Manager',
    priority: 'MEDIUM',
    dueDate: '',
    category: 'ADMINISTRATIVE'
  });

  const priorities = [
    { label: 'Low', value: 'LOW', color: '#95a5a6' },
    { label: 'Medium', value: 'MEDIUM', color: '#f39c12' },
    { label: 'High', value: 'HIGH', color: '#e74c3c' },
  ];

  const assignees = [
    { label: 'Assistant Manager', value: 'Assistant Manager' },
    { label: 'IT Coordinator', value: 'IT Coordinator' },
    { label: 'Office Manager', value: 'Office Manager' },
    { label: 'HR Coordinator', value: 'HR Coordinator' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      Alert.alert('Error', 'Please fill in title and description fields');
      return;
    }

    assignTask(newTask);
    setCreateTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: 'Assistant Manager',
      priority: 'MEDIUM',
      dueDate: '',
      category: 'ADMINISTRATIVE'
    });
    Alert.alert('Success', 'Task assigned successfully');
  };

  const mockHighPriorityTasks = [
    {
      id: 1,
      title: 'Monthly compliance report',
      status: 'OVERDUE',
      priority: 'HIGH',
      progress: 80,
      dueDate: 'Jan 20',
      assignee: 'Me'
    },
    {
      id: 2,
      title: 'Staff meeting preparation',
      status: 'DUE_TODAY',
      priority: 'HIGH',
      progress: 60,
      dueDate: 'Today 5:00 PM',
      assignee: 'Me'
    },
    {
      id: 3,
      title: 'User account audit',
      status: 'DUE_TODAY',
      priority: 'MEDIUM',
      progress: 90,
      dueDate: 'Today EOD',
      assignee: 'IT Coordinator'
    },
  ];

  const mockTeamPerformance = [
    { name: 'Assistant Manager', tasks: 5, status: 'ON_SCHEDULE', statusIcon: '✅' },
    { name: 'IT Coordinator', tasks: 3, status: 'DELAYED', statusIcon: '⚠️' },
    { name: 'Office Manager', tasks: 4, status: 'AHEAD', statusIcon: '🚀' },
    { name: 'HR Coordinator', tasks: 3, status: 'ON_SCHEDULE', statusIcon: '✅' },
  ];

  const mockUpcomingDeadlines = [
    { title: 'Board presentation preparation', dueDate: 'Jan 25', daysLeft: 3, priority: 'HIGH' },
    { title: 'Monthly financial reconciliation', dueDate: 'Jan 28', daysLeft: 6, priority: 'MEDIUM' },
    { title: 'Parent committee meeting agenda', dueDate: 'Jan 30', daysLeft: 8, priority: 'MEDIUM' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OVERDUE': return '#e74c3c';
      case 'DUE_TODAY': return '#f39c12';
      case 'ON_SCHEDULE': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Task Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Task Overview</Text>
          
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>My Tasks</Text>
              <Text style={styles.overallProgress}>{taskSummary.overallProgress}% Complete</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${taskSummary.overallProgress}%` }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.taskStats}>
              <View style={styles.taskStat}>
                <Text style={[styles.taskStatNumber, { color: '#e74c3c' }]}>{taskSummary.myTasks.overdue}</Text>
                <Text style={styles.taskStatLabel}>Overdue</Text>
              </View>
              <View style={styles.taskStat}>
                <Text style={[styles.taskStatNumber, { color: '#f39c12' }]}>{taskSummary.myTasks.dueToday}</Text>
                <Text style={styles.taskStatLabel}>Due Today</Text>
              </View>
              <View style={styles.taskStat}>
                <Text style={[styles.taskStatNumber, { color: '#3498db' }]}>{taskSummary.myTasks.upcoming}</Text>
                <Text style={styles.taskStatLabel}>Upcoming</Text>
              </View>
              <View style={styles.taskStat}>
                <Text style={[styles.taskStatNumber, { color: '#27ae60' }]}>{taskSummary.teamTasks.completedThisMonth}</Text>
                <Text style={styles.taskStatLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* High Priority Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Priority Tasks</Text>
          
          {mockHighPriorityTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskMeta}>
                    {task.assignee} • Due: {task.dueDate}
                  </Text>
                </View>
                <View style={styles.taskActions}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                    <Text style={styles.priorityText}>{task.priority}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <Text style={styles.statusText}>
                      {task.status === 'OVERDUE' ? 'OVERDUE' : 
                       task.status === 'DUE_TODAY' ? 'DUE TODAY' : task.status}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.taskProgress}>
                <Text style={styles.progressLabel}>Progress: {task.progress}%</Text>
                <View style={styles.taskProgressBar}>
                  <View 
                    style={[
                      styles.taskProgressFill, 
                      { width: `${task.progress}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Team Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Team Performance</Text>
          
          <View style={styles.teamCard}>
            <Text style={styles.teamTitle}>Active Team Tasks: {taskSummary.teamTasks.active}</Text>
            
            {mockTeamPerformance.map((member, index) => (
              <View key={index} style={styles.teamMember}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberTasks}>{member.tasks} tasks assigned</Text>
                </View>
                <View style={styles.memberStatus}>
                  <Text style={styles.statusIcon}>{member.statusIcon}</Text>
                  <Text style={[
                    styles.memberStatusText,
                    { color: member.status === 'DELAYED' ? '#e74c3c' : '#27ae60' }
                  ]}>
                    {member.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Deadlines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Upcoming Deadlines</Text>
          
          {mockUpcomingDeadlines.map((deadline, index) => (
            <View key={index} style={styles.deadlineCard}>
              <View style={styles.deadlineInfo}>
                <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                <Text style={styles.deadlineDate}>Due: {deadline.dueDate}</Text>
              </View>
              <View style={styles.deadlineMeta}>
                <Text style={[
                  styles.daysLeft,
                  { color: deadline.daysLeft <= 3 ? '#e74c3c' : '#3498db' }
                ]}>
                  {deadline.daysLeft} days
                </Text>
                <View style={[styles.deadlinePriority, { backgroundColor: getPriorityColor(deadline.priority) }]}>
                  <Text style={styles.deadlinePriorityText}>{deadline.priority}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.createTaskButton}
            onPress={() => setCreateTaskModal(true)}
          >
            <Text style={styles.createTaskButtonText}>+ Assign New Task</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Task Modal */}
      <Modal visible={createTaskModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign New Task</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task title *"
              value={newTask.title}
              onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task description *"
              value={newTask.description}
              onChangeText={(text) => setNewTask(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Assign to:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setAssigneeModal(true)}
              >
                <Text style={styles.dropdownText}>{newTask.assignedTo}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Priority:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setPriorityModal(true)}
              >
                <Text style={styles.dropdownText}>
                  {priorities.find(p => p.value === newTask.priority)?.label}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Due date (optional)"
              value={newTask.dueDate}
              onChangeText={(text) => setNewTask(prev => ({ ...prev, dueDate: text }))}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateTaskModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.assignButton]}
                onPress={handleCreateTask}
              >
                <Text style={styles.assignButtonText}>Assign Task</Text>
              </TouchableOpacity>
            </View>
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
                  setNewTask(prev => ({ ...prev, priority: priority.value }));
                  setPriorityModal(false);
                }}
              >
                <Text style={styles.optionText}>{priority.label}</Text>
                {newTask.priority === priority.value && (
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

      {/* Assignee Selection Modal */}
      <Modal visible={assigneeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <Text style={styles.optionsTitle}>Assign To</Text>
            {assignees.map((assignee) => (
              <TouchableOpacity
                key={assignee.value}
                style={styles.optionItem}
                onPress={() => {
                  setNewTask(prev => ({ ...prev, assignedTo: assignee.value }));
                  setAssigneeModal(false);
                }}
              >
                <Text style={styles.optionText}>{assignee.label}</Text>
                {newTask.assignedTo === assignee.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelOption}
              onPress={() => setAssigneeModal(false)}
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
  overviewCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  overallProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  taskStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskStat: {
    alignItems: 'center',
  },
  taskStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskStatLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 4,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  taskMeta: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  taskActions: {
    alignItems: 'flex-end',
    gap: 4,
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
  taskProgress: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  taskProgressBar: {
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 2,
  },
  teamCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  teamMember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  memberTasks: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  memberStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deadlineCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  deadlineDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  deadlineMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  daysLeft: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deadlinePriority: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  deadlinePriorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  createTaskButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createTaskButtonText: {
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
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
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
  assignButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  assignButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    color: '#3498db',
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
});

export default ManagerTasksScreen; 