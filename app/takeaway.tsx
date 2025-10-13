import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OrderItemProps {
  orderNumber: string;
  memberName: string;
  memberId: string;
  totalBill: number;
  status: string;
  restaurantName: string;
  timestamp: string;
}

const OrderItem = ({ orderNumber, memberName, memberId, totalBill, status, restaurantName, timestamp }: OrderItemProps) => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderName}>{memberName || 'Member'}</Text>
        <Text style={styles.membership}>Order: {orderNumber}</Text>
        <Text style={styles.restaurantName}>Restaurant: {restaurantName || 'N/A'}</Text>
        <Text style={styles.totalBill}>Total: Rs. {totalBill}</Text>
        <Text style={styles.timestamp}>{new Date(timestamp).toLocaleString()}</Text>
      </View>
      <View style={styles.statusContainer}>
        {status === 'Pending' ? (
          <View style={styles.activeStatus}>
            <Text style={styles.activeStatusText}>⏳ Pending</Text>
          </View>
        ) : status === 'Complete' ? (
          <View style={styles.completeStatus}>
            <Text style={styles.completeStatusText}>✅ Complete</Text>
          </View>
        ) : (
          <View style={styles.activeStatus}>
            <Text style={styles.activeStatusText}>🔄 {status}</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

interface Order {
  orderNumber: string;
  memberName: string;
  memberId: string;
  grandTotal: number;
  status: string;
  restaurantName: string;
  timestamp: string;
  serviceType: string;
  memberType: string;
}

export default function Takeaway() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('allOrders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        // Filter orders for takeaway/member orders
        const takeawayOrders = parsedOrders.filter((order: Order) => 
          order.serviceType === 'TAKE_AWAY' || order.memberType === 'MEMBER' || order.restaurantName
        );
        setOrders(takeawayOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="#D84315" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadOrders}
        >
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>Place your first order using the NEW ORDER button</Text>
          </View>
        ) : (
           orders.map((order: Order, index: number) => (
            <OrderItem
              key={order.orderNumber || index}
              orderNumber={order.orderNumber}
              memberName={order.memberName}
              memberId={order.memberId}
              totalBill={order.grandTotal}
              status={order.status}
              restaurantName={order.restaurantName}
              timestamp={order.timestamp}
            />
          ))
        )}
      </ScrollView>

      {/* New Order Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.newOrderButton}
          onPress={() => router.push('/restaurant')}
        >
          <Text style={styles.newOrderButtonText}>NEW ORDER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  refreshText: {
    fontSize: 18,
    color: '#D84315',
    fontWeight: 'bold',
  },
  policyContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  policyLink: {
    fontSize: 14,
    color: '#000000',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#D84315',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  membership: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalBill: {
    fontSize: 14,
    color: '#D84315',
    fontWeight: '600',
  },
  statusContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  activeStatus: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  activeStatusText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  completeStatus: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
  },
  completeStatusText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  newOrderButton: {
    backgroundColor: '#D84315',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D84315',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newOrderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  restaurantName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});