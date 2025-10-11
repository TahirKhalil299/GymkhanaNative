import { router, Stack } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MessOption {
  id: number;
  name: string;
  icon: string;
}

interface MessCardProps {
  name: string;
  onPress: () => void;
}

const MessCard = ({ name, onPress }: MessCardProps) => (
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
    { id: 1, name: 'Bar & Lounge', icon: '👤' },
    { id: 2, name: 'Coffee Shop', icon: '👤' },
    { id: 3, name: 'Pro Shop', icon: '👤' },
    { id: 4, name: '12 Oz Coffee Shop', icon: '👤' },
    { id: 5, name: 'CHINESE MENU', icon: '👤' },
    { id: 6, name: 'Banquet Hall', icon: '👤' },
  ];

  const handleMessSelect = (messName: string) => {
    console.log(`Selected: ${messName}`);
    // Generate a unique order number for member orders
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Navigate to menu screen with restaurant name and order number
    router.push({
      pathname: '/course_menu_item',
      params: {
        restaurant_name: messName,
        order_type: 'TAKE_AWAY',
        member_type: 'MEMBER',
        order_number: orderNumber,
        member_id: 'MEMBER-001', // Default member ID for now
        member_name: 'Member',
        pax: '1',
        table_no: 'N/A'
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
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
}``

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#D84315',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  backArrow: {
    fontSize: 20,
    color: '#D84315',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
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
    color: '#111827',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#D84315',
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
    color: '#D84315',
  },
  messName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  arrow: {
    fontSize: 20,
    color: '#D84315',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});