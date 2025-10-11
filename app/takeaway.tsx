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

const OrderItem = ({ name, membership, totalBill, status }) => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderName}>{name}</Text>
        <Text style={styles.membership}>Membership: {membership}</Text>
        <Text style={styles.totalBill}>Total Bill: {totalBill}</Text>
      </View>
      <View style={styles.statusContainer}>
        {status === 'Active' ? (
          <View style={styles.activeStatus}>
            <Text style={styles.activeStatusText}>✓ Active</Text>
          </View>
        ) : (
          <View style={styles.completeStatus}>
            <Text style={styles.completeStatusText}>🎯 Complete</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

export default function Takeaway() {
  const orders = [
    {
      id: 1,
      name: 'Capt Farrukh Atiq Khan. Retd.',
      membership: 'R-0050',
      totalBill: 300,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Capt Farrukh Atiq Khan. Retd.',
      membership: 'R-0050',
      totalBill: 790,
      status: 'Complete',
    },
    {
      id: 3,
      name: 'Capt Farrukh Atiq Khan. Retd.',
      membership: 'R-0050',
      totalBill: 875,
      status: 'Complete',
    },
    {
      id: 4,
      name: 'Capt Farrukh Atiq Khan. Retd.',
      membership: 'R-0050',
      totalBill: 600,
      status: 'Complete',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* View Food Policy Link */}
      <View style={styles.policyContainer}>
        <TouchableOpacity>
          <Text style={styles.policyLink}>View Food Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order) => (
          <OrderItem
            key={order.id}
            name={order.name}
            membership={order.membership}
            totalBill={order.totalBill}
            status={order.status}
          />
        ))}
      </ScrollView>

      {/* New Order Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.newOrderButton}>
          <Text style={styles.newOrderButtonText}>NEW ORDER</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#f5f5f5',
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
  policyContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  policyLink: {
    fontSize: 14,
    color: '#00bcd4',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  membership: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  totalBill: {
    fontSize: 14,
    color: '#999',
  },
  statusContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  activeStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  activeStatusText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
  },
  completeStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  completeStatusText: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
  },
  newOrderButton: {
    backgroundColor: '#00bcd4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newOrderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
});