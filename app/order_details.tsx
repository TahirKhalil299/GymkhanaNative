 import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams<{ orderNumber?: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Cash' | 'Card' | 'Account' | null>(null);
  const [directPrint, setDirectPrint] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Function to update all orders to Open status
  const updateAllOrdersToOpen = useCallback(async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('allOrders');
      if (savedOrders) {
        const ordersData: OrderData[] = JSON.parse(savedOrders);
        const updatedOrdersData = ordersData.map(o => 
          o.status === 'Closed' ? { ...o, status: 'Open' } : o
        );
        await AsyncStorage.setItem('allOrders', JSON.stringify(updatedOrdersData));
        console.log('Updated all closed orders to open status');
      }
    } catch (error) {
      console.error('Error updating orders to open status:', error);
    }
  }, []);

  const loadOrderDetails = useCallback(async () => {
    try {
      // First update all orders to Open status
      await updateAllOrdersToOpen();
      
      if (params.orderNumber) {
        console.log('Loading order details for:', params.orderNumber);
        
        // Load specific order from storage
        const savedOrders = await AsyncStorage.getItem('allOrders');
        let foundOrder: OrderData | null = null;
        
        if (savedOrders) {
          const ordersData: OrderData[] = JSON.parse(savedOrders);
          console.log('Total orders in storage:', ordersData.length);
          console.log('Order numbers in storage:', ordersData.map(o => o.orderNumber));
          
          // Update any closed orders to open status
          const updatedOrdersData = ordersData.map(o => 
            o.status === 'Closed' ? { ...o, status: 'Open' } : o
          );
          
          // Save the updated orders back to storage
          await AsyncStorage.setItem('allOrders', JSON.stringify(updatedOrdersData));
          
          foundOrder = updatedOrdersData.find(o => o.orderNumber === params.orderNumber) || null;
        }
        
        // If not found in storage, check if it's a demo order
        if (!foundOrder) {
          const demoOrders: OrderData[] = [
            {
              orderNumber: 'ORD20241201120000',
              memberId: 'M001',
              memberType: 'Club Member',
              pax: '4',
              memberName: 'John Smith',
              tableNo: 'Table 3',
              waiterId: 'W01',
              waiterName: 'Alice Johnson',
              serviceType: 'DINING_IN',
              cartItems: [
                { id: 1, name: 'Chicken Biryani', price: 250, quantity: 2 },
                { id: 2, name: 'Mutton Curry', price: 180, quantity: 1 },
                { id: 999, name: 'Service Charge', price: 50, quantity: 1 },
                { id: 998, name: 'GST', price: 25, quantity: 1 }
              ],
              grandTotal: 705,
              itemCount: 4,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              status: 'Open',
              outletName: 'Main Restaurant'
            },
            {
              orderNumber: 'ORD20241201110000',
              memberId: 'M002',
              memberType: 'Guest',
              pax: '2',
              memberName: 'Sarah Wilson',
              tableNo: 'Table 1',
              waiterId: 'W02',
              waiterName: 'Bob Brown',
              serviceType: 'TAKE_AWAY',
              cartItems: [
                { id: 3, name: 'Fish Fry', price: 200, quantity: 1 },
                { id: 4, name: 'Rice', price: 80, quantity: 2 },
                { id: 999, name: 'Service Charge', price: 50, quantity: 1 },
                { id: 998, name: 'GST', price: 25, quantity: 1 }
              ],
              grandTotal: 355,
              itemCount: 4,
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              status: 'Open',
              outletName: 'Main Restaurant'
            }
          ];
          
          foundOrder = demoOrders.find(o => o.orderNumber === params.orderNumber) || null;
        }
        
        if (foundOrder) {
          console.log('Order found:', foundOrder);
          setOrder(foundOrder);
        } else {
          console.log('Order not found in storage or demo orders. Looking for:', params.orderNumber);
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
  }, [params.orderNumber, updateAllOrdersToOpen]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  // Update all orders to Open status when component mounts
  useEffect(() => {
    updateAllOrdersToOpen();
  }, [updateAllOrdersToOpen]);

  const totals = useMemo(() => {
    if (!order) {
      return { subTotal: 0, gst: 0, grandTotal: 0 };
    }
    const subTotal = order.cartItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const gst = subTotal * 0.16; // 16% GST
    const grandTotal = subTotal + gst;
    return { subTotal, gst, grandTotal };
  }, [order]);

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
    setShowPrintModal(true);
  };


  const handleEditOrder = () => {
    if (order && totals) {
      console.log('Edit Order - Order Data:', order);
      console.log('Edit Order - Totals:', totals);
      
      const params = {
        order_number: order.orderNumber || '',
        member_id: order.memberId || '',
        member_type: order.memberType || '',
        pax: order.pax || '',
        member_name: order.memberName || '',
        table_no: order.tableNo || '',
        order_type: order.serviceType === 'DINING_IN' ? 'Dining In' : 'Take Away',
        waiter_id: order.waiterId || '',
        waiter_name: order.waiterName || '',
        cart_total: String(totals.grandTotal || 0),
        cart_count: String(order.itemCount || 0),
        cart_items: JSON.stringify(order.cartItems || []),
        is_edit_mode: 'true'
      };
      
      console.log('Edit Order - Params:', params);
      
      router.push({
        pathname: '/course_menu_item',
        params: params
      });
    } else {
      console.log('Edit Order - Missing order or totals:', { order: !!order, totals: !!totals });
    }
  };

  const closeOrderAndSave = async () => {
    if (!order) return;
    
    // Validate payment method selection
    if (!selectedPaymentMethod) {
      Alert.alert('Payment Required', 'Please select a payment method before closing the order.');
      return;
    }
    
    try {
      const saved = await AsyncStorage.getItem('allOrders');
      if (saved) {
        const ordersData: OrderData[] = JSON.parse(saved);
        const updated = ordersData.map(o => o.orderNumber === order.orderNumber ? { ...o, status: 'Open' } : o);
        await AsyncStorage.setItem('allOrders', JSON.stringify(updated));
      }
      Alert.alert('Success', `Order processed successfully with ${selectedPaymentMethod} payment${directPrint ? ' and direct print enabled' : ''}.`);
      router.push('/order_list');
    } catch {
      Alert.alert('Error', 'Failed to close order');
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

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
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
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(order.timestamp)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Member:</Text>
                <Text style={styles.infoValue}>{order.memberName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Outlet:</Text>
                <Text style={styles.infoValue}>{order.outletName || 'Main Restaurant'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Table No:</Text>
            <Text style={styles.infoValue}>{order.tableNo}</Text>
          </View>
            </View>
            
            <View style={styles.infoColumn}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Order No:</Text>
                <Text style={styles.infoValue}>{order.orderNumber}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{order.memberType}</Text>
          </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>PAX:</Text>
                <Text style={styles.infoValue}>{order.pax}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Waiter:</Text>
                <Text style={styles.infoValue}>{order.waiterName}</Text>
          </View>
          </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <View style={styles.itemsHeader}>
            <Text style={styles.cardTitle}>Order Items</Text>
            <Text style={styles.itemsCount}>{order.cartItems.length} items</Text>
          </View>
          
          <View style={styles.scrollContainer}>
            <ScrollView 
              style={styles.itemsList} 
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
              scrollEventThrottle={16}
            >
              {order.cartItems.map((item, index) => (
                <View 
                  key={`${item.id}-${index}`} 
                  style={[
                    styles.itemRow,
                    index === order.cartItems.length - 1 && styles.lastItemRow
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price.toFixed(2)} each</Text>
                  </View>
                  <View style={styles.itemQuantity}>
                    <Text style={styles.quantityText}>{item.quantity}x</Text>
                  </View>
                  <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </ScrollView>
            {order.cartItems.length > 3 && (
              <View style={styles.scrollIndicator}>
                <Text style={styles.scrollIndicatorText}>↓ Scroll to see more items</Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>₹{totals.subTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (16%):</Text>
            <Text style={styles.summaryValue}>₹{totals.gst.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Grand Total:</Text>
            <Text style={[styles.summaryValue, styles.grandTotalValue]}>₹{totals.grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Options */}
        <View style={styles.paymentCard}>
          <Text style={styles.cardTitle}>Billing Option</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'Cash' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod('Cash')}
            >
              <View style={styles.radioButton}>
                {selectedPaymentMethod === 'Cash' && <View style={styles.radioButtonSelected} />}
              </View>
              <Text style={[
                styles.paymentOptionText,
                selectedPaymentMethod === 'Cash' && styles.paymentOptionTextSelected
              ]}>Cash</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'Card' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod('Card')}
            >
              <View style={styles.radioButton}>
                {selectedPaymentMethod === 'Card' && <View style={styles.radioButtonSelected} />}
              </View>
              <Text style={[
                styles.paymentOptionText,
                selectedPaymentMethod === 'Card' && styles.paymentOptionTextSelected
              ]}>Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'Account' && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod('Account')}
            >
              <View style={styles.radioButton}>
                {selectedPaymentMethod === 'Account' && <View style={styles.radioButtonSelected} />}
              </View>
              <Text style={[
                styles.paymentOptionText,
                selectedPaymentMethod === 'Account' && styles.paymentOptionTextSelected
              ]}>Account</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.directPrintOption}
            onPress={() => setDirectPrint(!directPrint)}
          >
            <View style={[styles.checkbox, directPrint && styles.checkboxSelected]}>
              {directPrint && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </View>
            <Text style={styles.directPrintText}>Direct Print</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={handlePrintOrder}>
            <Ionicons name="print" size={24} color="#6B7280" />
            <Text style={styles.actionBtnText}>Print</Text>
          </TouchableOpacity>
          {order.status === 'Open' && (
            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={handleEditOrder}>
              <Ionicons name="create" size={24} color="#3B82F6" />
              <Text style={[styles.actionBtnText, { color: '#3B82F6' }]}>Edit Order</Text>
            </TouchableOpacity>
          )}
          {order.status !== 'Closed' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.closeBtn]}
              onPress={closeOrderAndSave}
            >
              <Ionicons name="checkmark-done" size={24} color="#ffffff" />
              <Text style={[styles.actionBtnText, { color: '#ffffff' }]}>Process Order</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 8 }} />
      </ScrollView>

      {/* Print Modal */}
      <Modal
        visible={showPrintModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrintModal(false)}
      >
        <SafeAreaView style={styles.printModalContainer}>
          <View style={styles.printHeader}>
            <TouchableOpacity 
              style={styles.closePrintBtn} 
              onPress={() => setShowPrintModal(false)}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.printHeaderTitle}>Print Preview</Text>
            <TouchableOpacity 
              style={styles.printBtn} 
              onPress={() => {
                Alert.alert('Print', 'Print functionality will be implemented');
                setShowPrintModal(false);
              }}
            >
              <Ionicons name="print" size={20} color="#ffffff" />
              <Text style={styles.printBtnText}>Print</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.printContent} showsVerticalScrollIndicator={false}>
            {/* Receipt Content */}
            <View style={styles.receiptContainer}>
              {/* Header */}
              <Text style={styles.gymName}>LAHORE GYMKHANA</Text>
              
              {/* Order Information */}
              <View style={styles.receiptInfoSection}>
                <View style={styles.receiptInfoColumn}>
                  <Text style={styles.receiptInfoText}>P-{order?.memberId || ''}</Text>
                  <Text style={styles.receiptInfoText}>Bill Date: {order ? formatDate(order.timestamp) : ''}</Text>
                  <Text style={styles.receiptInfoText}>Waiter: {order?.waiterId}-{order?.waiterName}</Text>
                </View>
                <View style={styles.receiptInfoColumn}>
                  <Text style={styles.receiptInfoText}>COVER: {order?.pax || ''}</Text>
                  <Text style={styles.receiptInfoText}>Bill No: {order?.orderNumber || ''}</Text>
                  <Text style={styles.receiptInfoText}>Outlet: {order?.outletName || 'MAIN RESTAURANT'}</Text>
                </View>
              </View>

              {/* Separator Line */}
              <View style={styles.separatorLine} />

              {/* Items Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.srNoColumn]}>Sr No</Text>
                <Text style={[styles.tableHeaderText, styles.codeColumn]}>Code</Text>
                <Text style={[styles.tableHeaderText, styles.itemsColumn]}>Items</Text>
                <Text style={[styles.tableHeaderText, styles.rateColumn]}>Rate</Text>
                <Text style={[styles.tableHeaderText, styles.qtyColumn]}>Qty</Text>
                <Text style={[styles.tableHeaderText, styles.amountColumn]}>Amount</Text>
              </View>

              {/* Items Rows */}
              {order?.cartItems.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.tableRow}>
                  <Text style={[styles.tableCellText, styles.srNoColumn]}>{index + 1}</Text>
                  <Text style={[styles.tableCellText, styles.codeColumn]}>{item.id}</Text>
                  <Text style={[styles.tableCellText, styles.itemsColumn]}>{item.name}</Text>
                  <Text style={[styles.tableCellText, styles.rateColumn]}>{item.price}</Text>
                  <Text style={[styles.tableCellText, styles.qtyColumn]}>{item.quantity}</Text>
                  <Text style={[styles.tableCellText, styles.amountColumn]}>{(item.price * item.quantity).toFixed(0)}</Text>
                </View>
              ))}

              {/* Separator Line */}
              <View style={styles.separatorLine} />

              {/* Totals Section */}
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total :</Text>
                  <Text style={styles.totalValue}>{totals.subTotal.toFixed(0)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>GST 16% :</Text>
                  <Text style={styles.totalValue}>{totals.gst.toFixed(0)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Bill Total :</Text>
                  <Text style={styles.totalValue}>{totals.grandTotal.toFixed(0)}</Text>
                </View>
              </View>

              {/* Separator Line */}
              <View style={styles.separatorLine} />

              {/* Footer */}
              <View style={styles.footerSection}>
                <Text style={styles.memberInfo}>(P-{order?.memberId} - {order?.memberName})</Text>
                <Text style={styles.thankYouText}>WE HOPE YOU HAVE ENJOYED YOUR VISIT. WE WELCOME YOUR COMMENTS AND SUGGESTIONS</Text>
                <Text style={styles.printDateText}>Print Date: {new Date().toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    padding: 8,
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
    marginBottom: 4,
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoColumn: {
    flex: 1,
    paddingRight: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
  itemsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    height: 250,
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  itemsList: {
    flex: 1,
    maxHeight: 200,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 5,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 4,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scrollIndicatorText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastItemRow: {
    paddingBottom: 15,
    borderBottomWidth: 0,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 1,
  },
  itemPrice: {
    fontSize: 11,
    color: '#6B7280',
  },
  itemQuantity: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    minWidth: 70,
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
    paddingVertical: 4,
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
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  paymentOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  paymentOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  paymentOptionTextSelected: {
    color: '#3B82F6',
  },
  directPrintOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  directPrintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  closeBtn: {
    backgroundColor: '#10B981',
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Print Modal Styles
  printModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  printHeader: {
    backgroundColor: '#D84315',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closePrintBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  printHeaderTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
  },
  printBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  printBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  printContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  receiptContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  gymName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  receiptInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  receiptInfoColumn: {
    flex: 1,
  },
  receiptInfoText: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 3,
    fontWeight: '500',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#000000',
    width: '100%',
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 5,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 3,
  },
  tableCellText: {
    fontSize: 10,
    color: '#000000',
    textAlign: 'left',
  },
  srNoColumn: {
    width: '12%',
    textAlign: 'center',
  },
  codeColumn: {
    width: '15%',
  },
  itemsColumn: {
    width: '33%',
  },
  rateColumn: {
    width: '12%',
    textAlign: 'right',
  },
  qtyColumn: {
    width: '8%',
    textAlign: 'right',
  },
  amountColumn: {
    width: '18%',
    textAlign: 'right',
  },
  totalsSection: {
    width: '100%',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  totalLabel: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '700',
  },
  footerSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  memberInfo: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 8,
  },
  thankYouText: {
    fontSize: 10,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  printDateText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '500',
  },
});
