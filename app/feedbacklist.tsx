import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Feedback {
  id: string;
  rating: number;
  category: string;
  date: string;
  remarks?: string;
}

const STORAGE_KEY = 'feedback_list';

const FeedbackList = () => {
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);

  const loadFeedback = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) {
        setFeedbackData([]);
        return;
      }
      const parsed: Feedback[] = JSON.parse(json);
      setFeedbackData(Array.isArray(parsed) ? parsed.reverse() : []);
    } catch (e) {
      setFeedbackData([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeedback();
      return () => {};
    }, [loadFeedback])
  );

  const renderFeedbackItem = ({ item }: { item: Feedback }) => (
    <View style={styles.feedbackCard}>
      <Text style={styles.ratingText}>Rating: {item.rating}</Text>
      <Text style={styles.categoryText}>Category: {item.category}</Text>
      <Text style={styles.dateText}>Date: {item.date}</Text>
      {item.remarks ? (
        <Text style={styles.remarksText}>Remarks: {item.remarks}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#17a2b8" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
      </View>

      {/* Feedback List */}
      <FlatList
        data={feedbackData}
        renderItem={renderFeedbackItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/addfeedback')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#17a2b8',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '400',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  feedbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#999999',
  },
  remarksText: {
    fontSize: 14,
    color: '#555555',
    marginTop: 6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#a0e7f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '300',
  },
});

export default FeedbackList;