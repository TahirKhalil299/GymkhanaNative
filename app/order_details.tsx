 import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
};

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams<{ orderNumber?: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      if (params.orderNumber) {
        console.log('Loading order details for:', params.orderNumber);
        
        // Load specific order from storage
        const savedOrders = await AsyncStorage.getItem('allOrders');
        if (savedOrders) {
          const ordersData: OrderData[] = JSON.parse(savedOrders);
          console.log('Total orders in storage:', ordersData.length);
          console.log('Order numbers in storage:', ordersData.map(o => o.orderNumber));
          
          const foundOrder = ordersData.find(o => o.orderNumber === params.orderNumber);
          if (foundOrder) {
            console.log('Order found:', foundOrder);
            setOrder(foundOrder);
          } else {
            console.log('Order not found in storage. Looking for:', params.orderNumber);
            console.log('Available orders:', ordersData.map(o => ({ number: o.orderNumber, status: o.status })));
          }
        } else {
          console.log('No orders found in AsyncStorage');
        }
      } else {
        console.log('No order number provided in params');
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
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
      hour12: true
    });
  };

  const handlePrintOrder = () => {
    Alert.alert('Print Order', 'Print functionality will be implemented');
  };

  const handleCloseOrder = () => {
    Alert.alert(
      'Close Order',
      'Are you sure you want to close this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Close', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Update order status to closed
              if (order) {
                const updatedOrder = { ...order, status: 'Closed' };
                const savedOrders = await AsyncStorage.getItem('allOrders');
                if (savedOrders) {
                  const ordersData: OrderData[] = JSON.parse(savedOrders);
                  const updatedOrders = ordersData.map(o => 
                    o.orderNumber === order.orderNumber ? updatedOrder : o
                  );
                  await AsyncStorage.setItem('allOrders', JSON.stringify(updatedOrders));
                }
                Alert.alert('Success', 'Order has been closed');
                router.back();
              }
            } catch (error) {
              console.error('Error closing order:', error);
              Alert.alert('Error', 'Failed to close order');
            }
          }
        }
      ]
    );
  };

  const handleEditOrder = () => {
    if (order) {
      router.push({
        pathname: '/course_menu_item',
        params: {
          order_number: order.orderNumber,
          member_id: order.memberId,
          member_type: order.memberType,
          pax: order.pax,
          member_name: order.memberName,
          table_no: order.tableNo,
          order_type: order.serviceType === 'DINING_IN' ? 'Dining In' : 'Take Away',
          waiter_id: order.waiterId,
          waiter_name: order.waiterName,
          cart_total: String(order.grandTotal),
          cart_count: String(order.itemCount),
          cart_items: JSON.stringify(order.cartItems),
          is_edit_mode: 'true'
        }
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={20} color="#D84315" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadOrderDetails}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} color="#D84315" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderId}>{order.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: order.status === 'Open' ? '#F59E0B' : '#10B981' }]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>{formatDate(order.timestamp)}</Text>
        </View>

        {/* Order Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Order Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Table No.</Text>
            <Text style={styles.infoValue}>{order.tableNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Type</Text>
            <Text style={styles.infoValue}>{order.memberType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member ID - Name</Text>
            <Text style={styles.infoValue}>{order.memberId} - {order.memberName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Waiter ID - Name</Text>
            <Text style={styles.infoValue}>{order.waiterId} - {order.waiterName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pax</Text>
            <Text style={styles.infoValue}>{order.pax}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <View style={styles.itemsHeader}>
            <Text style={styles.cardTitle}>Order Items</Text>
            <Text style={styles.itemsCount}>{order.cartItems.length} items</Text>
          </View>
          
          <FlatList
            data={order.cartItems}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price.toFixed(2)} each</Text>
                </View>
                <View style={styles.itemQuantity}>
                  <Text style={styles.quantityText}>{item.quantity}x</Text>
                </View>
                <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>KOT Count</Text>
            <Text style={styles.summaryValue}>{order.itemCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Amount</Text>
            <Text style={styles.summaryValue}>₹{order.grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={handlePrintOrder}>
            <Ionicons name="print" size={24} color="#6B7280" />
            <Text style={styles.actionBtnText}>Print</Text>
          </TouchableOpacity>
          {order.status === 'Processed' && (
            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={handleEditOrder}>
              <Ionicons name="create" size={24} color="#3B82F6" />
              <Text style={[styles.actionBtnText, { color: '#3B82F6' }]}>Edit Order</Text>
            </TouchableOpacity>
          )}
          {order.status !== 'Closed' && (
            <TouchableOpacity style={[styles.actionBtn, styles.closeBtn]} onPress={handleCloseOrder}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Close Order</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scaffold: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#D84315',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#D84315',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  orderHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  orderIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },
  itemsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemQuantity: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 12,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    minWidth: 80,
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  closeBtn: {
    backgroundColor: '#FEF2F2',
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});
