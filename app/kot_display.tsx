import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function KotDisplayScreen() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  // Reload orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('allOrders');
      if (savedOrders) {
        const ordersData = JSON.parse(savedOrders);
        // Only show orders that are not processed (still pending)
        const pendingOrders = ordersData.filter((order: OrderData) => 
          order.status !== 'Processed' && order.status !== 'Closed'
        );
        setOrders(pendingOrders);
      } else {
        // Fallback to check for single order (for backward compatibility)
        const savedOrder = await AsyncStorage.getItem('currentOrder');
        if (savedOrder) {
          const orderData = JSON.parse(savedOrder);
          setOrders([orderData]);
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
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

  const openOrderDialog = (order: OrderData) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const closeOrderDialog = () => {
    setShowOrderDialog(false);
    setSelectedOrder(null);
  };

  const handleTickPress = async (order: OrderData) => {
    try {
      // Get all orders from AsyncStorage first
      const savedOrders = await AsyncStorage.getItem('allOrders');
      let allOrders: OrderData[] = [];
      
      if (savedOrders) {
        allOrders = JSON.parse(savedOrders);
      }
      
      // Update the specific order in the complete list
      const updatedAllOrders = allOrders.map(o => 
        o.orderNumber === order.orderNumber 
          ? { ...o, status: 'Processed' }
          : o
      );
      
      // Update AsyncStorage with the complete list
      await AsyncStorage.setItem('allOrders', JSON.stringify(updatedAllOrders));
      
      // Update local state with filtered orders (only pending ones)
      const pendingOrders = updatedAllOrders.filter(o => 
        o.status !== 'Processed' && o.status !== 'Closed'
      );
      setOrders(pendingOrders);
      
      // Close the dialog
      closeOrderDialog();
      
      // Navigate to order details screen
      router.push({
        pathname: '/order_details',
        params: { orderNumber: order.orderNumber }
      });
    } catch (error) {
      console.error('Error processing order:', error);
    }
  };

  const renderOrder = ({ item }: { item: OrderData }) => (
    <TouchableOpacity 
      style={styles.orderCard} 
      onPress={() => openOrderDialog(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.orderId}>{item.orderNumber}</Text>
      <Text style={styles.orderDate}>{formatDate(item.timestamp)}</Text>
      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>Table {item.tableNo}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>Coffee Shop</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#D84315" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KOT Display</Text>
      </View>

     

       {orders.length === 0 ? (
         <View style={styles.emptyContainer}>
           <Ionicons name="receipt-outline" size={64} color="#6B7280" style={{ opacity: 0.3 }} />
           <Text style={styles.emptyText}>No pending orders</Text>
         </View>
       ) : (
         <FlatList
           data={orders}
           keyExtractor={(item) => item.orderNumber}
           renderItem={renderOrder}
           contentContainerStyle={styles.listContainer}
           showsVerticalScrollIndicator={true}
           scrollEnabled={true}
           nestedScrollEnabled={true}
         />
       )}

       <Modal
         visible={showOrderDialog}
         transparent={true}
         animationType="fade"
         onRequestClose={closeOrderDialog}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.dialogContainer}>
             <View style={styles.dialogHeader}>
               <Text style={styles.dialogTitle}>Table {selectedOrder?.tableNo} Order Details</Text>
               <TouchableOpacity onPress={closeOrderDialog} style={styles.closeBtn}>
                 <Ionicons name="close" size={24} color="#000000" />
               </TouchableOpacity>
             </View>

             <View style={styles.dialogContent}>
               <View style={styles.orderInfoRow}>
                 <View style={styles.orderIdField}>
                   <Text style={styles.orderIdText}>{selectedOrder?.orderNumber}</Text>
                 </View>
                 <View style={styles.venueField}>
                   <Text style={styles.venueText}>Coffee Shop</Text>
                 </View>
               </View>
               
               <Text style={styles.orderDateTime}>{formatDate(selectedOrder?.timestamp || '')}</Text>

               <View style={styles.orderItemsSection}>
                 <Text style={styles.orderItemsTitle}>Order Items</Text>
                 <Text style={styles.orderItemsCount}>{selectedOrder?.cartItems.length}x</Text>
               </View>

               <ScrollView 
                 style={styles.itemsScrollView}
                 showsVerticalScrollIndicator={selectedOrder ? selectedOrder.cartItems.length > 4 : false}
                 scrollEnabled={true}
                 nestedScrollEnabled={true}
                 bounces={true}
                 alwaysBounceVertical={false}
                 contentContainerStyle={styles.itemsContainer}
               >
                 {selectedOrder?.cartItems.map((item, index) => (
                   <View key={index} style={styles.orderItem}>
                     <Text style={styles.itemName}>{item.name}</Text>
                     <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                   </View>
                 ))}
                 
                 {selectedOrder && selectedOrder.cartItems.length > 4 && (
                   <View style={styles.scrollIndicator}>
                     <Ionicons name="chevron-down" size={20} color="#6B7280" />
                     <Text style={styles.scrollText}>Scroll for more items</Text>
                   </View>
                 )}
               </ScrollView>

               <View style={styles.actionButtons}>
                 <TouchableOpacity 
                   style={styles.actionBtn} 
                   onPress={() => selectedOrder && handleTickPress(selectedOrder)}
                 >
                   <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
                   <Ionicons name="close-circle" size={24} color="#EF4444" />
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
                   <Ionicons name="print" size={24} color="#6B7280" />
                 </TouchableOpacity>
               </View>
             </View>
           </View>
         </View>
       </Modal>
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

  pendingBanner: {
    backgroundColor: '#DC2626',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pendingText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },

  listContainer: { 
    padding: 16, 
    paddingTop: 8,
    flexGrow: 1,
  },
  orderCard: {
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
  orderId: { color: '#111827', fontWeight: '800', fontSize: 16, marginBottom: 4 },
  orderDate: { color: '#6B7280', fontSize: 14, marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', gap: 8 },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: { color: '#374151', fontSize: 12, fontWeight: '600' },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: { marginTop: 16, color: '#6B7280', fontSize: 16, textAlign: 'center' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    flex: 1,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  dialogContent: {
    padding: 20,
    flex: 1,
  },
  orderInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  orderIdField: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  orderIdText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  venueField: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  venueText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  orderDateTime: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'right',
  },
  orderItemsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  orderItemsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  itemsScrollView: {
    maxHeight: 200,
    marginBottom: 20,
    flex: 1,
  },
  itemsContainer: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  scrollText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
