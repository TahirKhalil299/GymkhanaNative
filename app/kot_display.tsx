import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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

export default function KotDisplayScreen() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [outletName, setOutletName] = useState<string>('');

  useEffect(() => {
    loadOrders();
    (async () => {
      try {
        // Try a few common keys; fallback to empty
        const v1 = await AsyncStorage.getItem('selected_outlet');
        const v2 = await AsyncStorage.getItem('selectedOutlet');
        const v3 = await AsyncStorage.getItem('selected_outlet_name');
        let v = v3 || v2 || v1;
        // Also check secure storage where Select Outlet screen saves it
        if (!v) {
          try {
            v = await SecureStore.getItemAsync('selectedOutlet');
          } catch {}
        }
        if (v) {
          try {
            const parsed = JSON.parse(v);
            // Accept either object with name or plain string
            setOutletName(parsed?.name || parsed?.outletName || parsed || '');
          } catch {
            setOutletName(v);
          }
        }
      } catch {}
    })();
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
      
      // Close the dialog; do not navigate away
      closeOrderDialog();
    } catch (error) {
      console.error('Error processing order:', error);
    }
  };

  const getTotalQuantity = (items: OrderData['cartItems']) => {
    try {
      return items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    } catch {
      return items?.length || 0;
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
          <Text style={styles.tagText}> {item.tableNo}</Text>
        </View> 
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.outletName || 'Outlet'}</Text>
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
        <Text style={styles.headerTitle}>KOT Display{outletName ? ` - ${outletName}` : ''}</Text>
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
        <TouchableWithoutFeedback onPress={closeOrderDialog}>
          <View style={styles.modalOverlay} pointerEvents="box-none">
           <View 
             style={styles.dialogContainer} 
             onStartShouldSetResponder={() => true}
             onMoveShouldSetResponderCapture={() => true}
           >
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Order Details</Text>
              {selectedOrder && (
                <View style={[styles.servicePill, selectedOrder.serviceType === 'DINING_IN' ? styles.serviceDining : styles.serviceTakeaway]}>
                  <Text style={styles.serviceText}>{selectedOrder.serviceType === 'DINING_IN' ? 'DiningIn' : 'TakeAway'}</Text>
                </View>
              )}
              <TouchableOpacity onPress={closeOrderDialog} style={styles.closeBtn}>
                 <Ionicons name="close" size={24} color="#000000" />
               </TouchableOpacity>
             </View>

             <View style={styles.dialogContent}>
              {/* Row 1: Order No  |  Outlet */}
              <View style={styles.orderInfoRow}>
                <View style={styles.orderIdField}>
                  <Text style={styles.orderIdText}>{selectedOrder?.orderNumber}</Text>
                </View>
                <View style={styles.venueFieldPlain}>
                  <Text style={styles.venueText}>{selectedOrder?.outletName || 'Outlet'}</Text>
                </View>
              </View>

              {/* Row 2: Table No  |  Date & time */}
              <View style={[styles.orderInfoRow, { alignItems: 'center' }]}>
                <View style={styles.orderIdField}>
                  <Text style={styles.orderIdText}>{` ${selectedOrder?.tableNo ?? ''}`}</Text>
                </View>
                <View style={[styles.venueField, { backgroundColor: '#F3F4F6' }]}>
                  <Text style={[styles.venueText, { color: '#374151' }]}>{selectedOrder ? formatDate(selectedOrder.timestamp) : ''}</Text>
                </View>
              </View>

              {/* Service type moved next to the title in header */}

              <View style={styles.orderItemsSection}>
                <Text style={styles.orderItemsTitle}>Order Items</Text>
                <Text style={styles.orderItemsCount}>{selectedOrder ? getTotalQuantity(selectedOrder.cartItems) : 0}x</Text>
              </View>

              <View style={styles.itemsWrapper}>
              <FlatList
                data={selectedOrder ? selectedOrder.cartItems : []}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => (
                  <View style={styles.orderItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  </View>
                )}
                style={styles.itemsList}
                showsVerticalScrollIndicator={selectedOrder ? selectedOrder.cartItems.length > 4 : false}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                bounces={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.itemsContent}
                removeClippedSubviews={true}
              />
              </View>

               <View style={styles.actionButtons}>
                 <TouchableOpacity 
                   style={[styles.actionBtn, styles.actionBtnGreen]} 
                   onPress={() => selectedOrder && handleTickPress(selectedOrder)}
                 >
                   <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.actionBtn, styles.actionBtnRed]} onPress={() => {}}>
                   <Ionicons name="close" size={24} color="#FFFFFF" />
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGray]} onPress={() => {}}>
                   <Ionicons name="print" size={22} color="#FFFFFF" />
                 </TouchableOpacity>
               </View>
             </View>
           </View>
         </View>
        </TouchableWithoutFeedback>
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
    width: '96%',
    maxWidth: 480,
    maxHeight: '86%',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    alignSelf: 'center',
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
    marginRight: 4,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 'auto',
  },
  dialogContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  venueFieldPlain: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  outletPill: { backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
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
  orderItemsSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  itemsBadge: { display: 'none' },
  orderItemsCount: { fontSize: 13, fontWeight: '800', color: '#374151' },
  servicePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  serviceDining: { backgroundColor: '#3B82F6' },
  serviceTakeaway: { backgroundColor: '#EF4444' },
  serviceText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  itemsWrapper: { maxHeight: 340 },
  itemsList: { maxHeight: 340, marginBottom: 16 },
  itemsContent: { paddingBottom: 8, paddingTop: 2 },
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 16,
    paddingRight: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  actionBtnGreen: {
    backgroundColor: '#10B981',
  },
  actionBtnRed: {
    backgroundColor: '#EF4444',
  },
  actionBtnGray: {
    backgroundColor: '#9CA3AF',
  },
});