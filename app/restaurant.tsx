import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MessOption {
  id: number;
  name: string;
  icon: string;
}

const MessCard = ({ name, onPress }) => (
  <TouchableOpacity style={styles.messCard} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>👤</Text>
    </View>
    <Text style={styles.messName}>{name}</Text>
    <Text style={styles.arrow}>→</Text>
  </TouchableOpacity>
);

export default function Restaurant() {
  const messOptions: MessOption[] = [
    { id: 1, name: 'Officers Mess', icon: '👤' },
    { id: 2, name: 'Executive Cafe', icon: '👤' },
    { id: 3, name: 'Bonsai Bite Resturant', icon: '👤' },
    { id: 4, name: '12 Oz Coffee Shop', icon: '👤' },
    { id: 5, name: 'CHINESE MENU', icon: '👤' },
    { id: 6, name: 'Buffet', icon: '👤' },
  ];

  const handleMessSelect = (messName: string) => {
    console.log(`Selected: ${messName}`);
    // Navigate to menu screen or handle selection
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Order</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Select Mess</Text>
        
        <View style={styles.messContainer}>
          {messOptions.map((mess) => (
            <MessCard
              key={mess.id}
              name={mess.name}
              onPress={() => handleMessSelect(mess.name)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  messContainer: {
    gap: 12,
  },
  messCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  messName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  arrow: {
    fontSize: 20,
    color: '#333',
    marginLeft: 8,
  },
});