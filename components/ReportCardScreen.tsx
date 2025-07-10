import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface Subject {
  id: string;
  name: string;
  grade: string;
  score: number;
  maxScore: number;
  teacherComment: string;
  improvement: 'up' | 'down' | 'same';
}

interface Term {
  id: string;
  name: string;
  year: string;
  isActive: boolean;
}

interface ReportCardScreenProps {
  onBack: () => void;
  childName: string;
}

const ReportCardScreen: React.FC<ReportCardScreenProps> = ({ onBack, childName }) => {
  const [selectedTerm, setSelectedTerm] = useState(0);

  const terms: Term[] = [
    { id: '1', name: 'Term 1', year: '2024', isActive: false },
    { id: '2', name: 'Term 2', year: '2024', isActive: true },
    { id: '3', name: 'Term 3', year: '2024', isActive: false },
  ];

  const subjects: Subject[] = [
    {
      id: '1',
      name: 'Mathematics',
      grade: 'A',
      score: 92,
      maxScore: 100,
      teacherComment: 'Excellent problem-solving skills. Keep up the great work!',
      improvement: 'up',
    },
    {
      id: '2',
      name: 'English Language',
      grade: 'A-',
      score: 88,
      maxScore: 100,
      teacherComment: 'Good writing skills. Work on reading comprehension.',
      improvement: 'same',
    },
    {
      id: '3',
      name: 'Science',
      grade: 'B+',
      score: 85,
      maxScore: 100,
      teacherComment: 'Shows good understanding of concepts. More practice needed.',
      improvement: 'up',
    },
    {
      id: '4',
      name: 'Social Studies',
      grade: 'A',
      score: 90,
      maxScore: 100,
      teacherComment: 'Outstanding knowledge of current events and history.',
      improvement: 'up',
    },
    {
      id: '5',
      name: 'Physical Education',
      grade: 'B',
      score: 80,
      maxScore: 100,
      teacherComment: 'Good participation. Encourage more sports activities.',
      improvement: 'down',
    },
    {
      id: '6',
      name: 'Art',
      grade: 'A',
      score: 95,
      maxScore: 100,
      teacherComment: 'Very creative and artistic. Exceptional talent!',
      improvement: 'up',
    },
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return '#2ecc71';
    if (grade.startsWith('B')) return '#3498db';
    if (grade.startsWith('C')) return '#f39c12';
    return '#e74c3c';
  };

  const getImprovementIcon = (improvement: string) => {
    switch (improvement) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '📊';
    }
  };

  const calculateOverallGrade = () => {
    const totalScore = subjects.reduce((sum, subject) => sum + subject.score, 0);
    const maxTotal = subjects.reduce((sum, subject) => sum + subject.maxScore, 0);
    const percentage = (totalScore / maxTotal) * 100;
    
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    return 'D';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Report Card</Text>
          <Text style={styles.headerSubtitle}>{childName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Term Selector */}
      <View style={styles.termSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {terms.map((term, index) => (
            <TouchableOpacity
              key={term.id}
              style={[
                styles.termCard,
                selectedTerm === index && styles.selectedTermCard,
                term.isActive && styles.activeTermCard,
              ]}
              onPress={() => setSelectedTerm(index)}
            >
              <Text style={[
                styles.termText,
                selectedTerm === index && styles.selectedTermText,
              ]}>
                {term.name}
              </Text>
              <Text style={[
                styles.termYear,
                selectedTerm === index && styles.selectedTermYear,
              ]}>
                {term.year}
              </Text>
              {term.isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Performance */}
        <View style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <Text style={styles.overallTitle}>Overall Performance</Text>
            <View style={[styles.overallGrade, { backgroundColor: getGradeColor(calculateOverallGrade()) }]}>
              <Text style={styles.overallGradeText}>{calculateOverallGrade()}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {subjects.reduce((sum, s) => sum + s.score, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round((subjects.reduce((sum, s) => sum + s.score, 0) / subjects.reduce((sum, s) => sum + s.maxScore, 0)) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{subjects.length}</Text>
              <Text style={styles.statLabel}>Subjects</Text>
            </View>
          </View>
        </View>

        {/* Subjects */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Subject Performance</Text>
        </View>

        {subjects.map((subject) => (
          <View key={subject.id} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectScore}>
                  {subject.score}/{subject.maxScore}
                </Text>
              </View>
              <View style={styles.subjectGradeContainer}>
                <Text style={styles.improvementIcon}>
                  {getImprovementIcon(subject.improvement)}
                </Text>
                <View style={[styles.gradeCircle, { backgroundColor: getGradeColor(subject.grade) }]}>
                  <Text style={styles.gradeText}>{subject.grade}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(subject.score / subject.maxScore) * 100}%`,
                    backgroundColor: getGradeColor(subject.grade),
                  }
                ]} 
              />
            </View>
            
            <Text style={styles.teacherComment}>
              💬 {subject.teacherComment}
            </Text>
          </View>
        ))}

        {/* Teacher's General Comment */}
        <View style={styles.generalCommentCard}>
          <Text style={styles.commentTitle}>📝 Class Teacher's Comment</Text>
          <Text style={styles.commentText}>
            {childName} has shown excellent progress this term. She demonstrates strong academic abilities 
            and positive attitude towards learning. Continue to encourage reading at home and 
            participation in extracurricular activities.
          </Text>
          <View style={styles.teacherSignature}>
            <Text style={styles.teacherName}>Mrs. Elizabeth Thompson</Text>
            <Text style={styles.teacherRole}>Class Teacher</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.buttonText}>📄 Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.buttonText}>📤 Share Report</Text>
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
  termSelector: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  termCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
    position: 'relative',
  },
  selectedTermCard: {
    backgroundColor: '#3498db',
  },
  activeTermCard: {
    borderWidth: 2,
    borderColor: '#2ecc71',
  },
  termText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  selectedTermText: {
    color: '#fff',
  },
  termYear: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  selectedTermYear: {
    color: '#ecf0f1',
  },
  activeDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  overallCard: {
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
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  overallGrade: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallGradeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  subjectScore: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  subjectGradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  improvementIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  gradeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  teacherComment: {
    fontSize: 14,
    color: '#34495e',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  generalCommentCard: {
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
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  commentText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 22,
    marginBottom: 15,
  },
  teacherSignature: {
    alignItems: 'flex-end',
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  teacherRole: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportCardScreen; 