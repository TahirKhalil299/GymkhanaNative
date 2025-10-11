import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OrderData = {
  orderNumber: string;
  memberId: string;
  memberType: string;
  pax: string;
  memberName: string;
  tableNo: string;
  waiterId: string;
  waiterName: string;
  serviceType?: 'DINING_IN' | 'TAKE_AWAY';
  cartItems: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }[];
  grandTotal: number;
  itemCount: number;
  timestamp: string;
  status: string;
  outletName?: string;
};

export default function OrderList() {
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('allOrders');
      if (savedOrders) {
        const ordersData: OrderData[] = JSON.parse(savedOrders);
        // Show orders that were processed from KOT or closed
        const processed = ordersData
          .filter(o => o.status === 'Processed' || o.status === 'Closed')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setOrders(processed);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Error loading orders:', e);
      setOrders([]);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const openOrder = (order: OrderData) => {
    router.push({ pathname: '/order_details', params: { orderNumber: order.orderNumber } });
  };

  const renderOrder = ({ item }: { item: OrderData }) => (
    <TouchableOpacity style={styles.card} onPress={() => openOrder(item)} activeOpacity={0.8}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderId}>{item.orderNumber}</Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'Closed' ? '#EF4444' : '#10B981' }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>

      <View style={styles.tagsRow}>
        <View style={styles.tag}><Text style={styles.tagText}>{item.tableNo || 'Table'}</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>{item.outletName || 'Outlet'}</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>{item.cartItems?.length || 0} items</Text></View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{Number(item.grandTotal || 0).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order List</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#6B7280" style={{ opacity: 0.3 }} />
          <Text style={styles.emptyText}>No processed orders yet</Text>
          <Text style={styles.emptySubText}>Process a KOT to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderNumber}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scaffold: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#D84315',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, marginLeft: 12, color: '#ffffff', fontWeight: '800', fontSize: 18 },

  listContainer: { padding: 16, paddingTop: 8 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { color: '#111827', fontWeight: '800', fontSize: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  dateText: { color: '#6B7280', fontSize: 12, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { color: '#374151', fontSize: 12, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#6B7280', fontSize: 14 },
  totalValue: { color: '#111827', fontWeight: '800', fontSize: 16 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyText: { marginTop: 16, color: '#6B7280', fontSize: 16, textAlign: 'center' },
  emptySubText: { marginTop: 6, color: '#9CA3AF', fontSize: 12, textAlign: 'center' },
});