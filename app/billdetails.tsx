import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
// removed unused Feather Icon import

interface BillItem {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Unpaid';
}

const BillDetailsContent = () => {
  const insets = useSafeAreaInsets();

  const bills: BillItem[] = [
    { id: '1', title: 'Room Charges', date: '10-10-2025', amount: 'Rs 2,500', status: 'Paid' },
    { id: '2', title: 'Dining', date: '09-10-2025', amount: 'Rs 1,200', status: 'Unpaid' },
    { id: '3', title: 'TakeAway', date: '05-10-2025', amount: 'Rs 3,000', status: 'Paid' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#D84315" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {bills.map((bill) => (
          <View key={bill.id} style={styles.billCard}>
            <View style={styles.billHeader}>
              <Text style={styles.billTitle}>{bill.title}</Text>
              <View style={[styles.badge, bill.status === 'Paid' ? styles.paidBadge : styles.unpaidBadge]}>
                <Text style={[styles.badgeText, bill.status === 'Paid' ? styles.paidText : styles.unpaidText]}>
                  {bill.status}
                </Text>
              </View>
            </View>
            <Text style={styles.billDate}>{bill.date}</Text>
            <Text style={styles.billAmount}>{bill.amount}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const BillDetails = () => {
  return (
    <SafeAreaProvider>
      <BillDetailsContent />
    </SafeAreaProvider>
  );
};

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
    paddingBottom: 12,
    backgroundColor: '#D84315',
    borderBottomWidth: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidBadge: {
    backgroundColor: '#fde7e0',
  },
  unpaidBadge: {
    backgroundColor: '#fff5e6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  paidText: {
    color: '#D84315',
  },
  unpaidText: {
    color: '#ff9500',
  },
  billDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D84315',
  },
});

export default BillDetails;


