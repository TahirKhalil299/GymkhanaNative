// addfeedback.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORAGE_KEY = 'feedback_list';

const AddFeedback = () => {
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [rating, setRating] = useState(0);
  const [remarks, setRemarks] = useState('');

  const categories = ['General', 'Room', 'Food', 'Sports'];

  const handleSubmit = async () => {
    const now = new Date();
    const date = now.toISOString().replace('T', ' ').substring(0, 19);
    const newItem = {
      id: `${now.getTime()}`,
      rating,
      category: selectedCategory,
      date,
      remarks: remarks.trim(),
    };
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.push(newItem);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      router.back();
    } catch (e) {
      // simple fallback: just go back even if storage fails
      router.back();
    }
  };

  const renderStar = (index: number) => {
    const isFilled = index < rating;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => setRating(index + 1)}
        style={styles.starButton}
      >
        <Text style={styles.star}>{isFilled ? '★' : '☆'}</Text>
      </TouchableOpacity>
    );
  };

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

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <View style={styles.categoryGrid}>
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category;
            const isLeft = index % 2 === 0;
            
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  isLeft && styles.categoryButtonLeft,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate Hotel Experience</Text>
          <View style={styles.starsContainer}>
            {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
          </View>
        </View>

        {/* Remarks Section */}
        <View style={styles.remarksSection}>
          <Text style={styles.remarksLabel}>Remarks</Text>
          <TextInput
            style={styles.remarksInput}
            placeholder="Enter Remarks"
            placeholderTextColor="#c0c0c0"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={remarks}
            onChangeText={setRemarks}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  categoryButton: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryButtonLeft: {
    paddingRight: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#17a2b8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#17a2b8',
  },
  categoryText: {
    fontSize: 16,
    color: '#000000',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  ratingTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 15,
    fontWeight: '400',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 36,
    color: '#fbbf24',
  },
  remarksSection: {
    marginBottom: 30,
  },
  remarksLabel: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 10,
    fontWeight: '400',
  },
  remarksInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#000000',
    minHeight: 150,
  },
  submitButton: {
    backgroundColor: '#17a2b8',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddFeedback;