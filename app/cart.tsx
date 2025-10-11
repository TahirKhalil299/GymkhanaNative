import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Params = {
  order_number?: string;
  member_id?: string;
  member_type?: string;
  pax?: string;
  member_name?: string;
  table_no?: string;
  order_type?: string;
  waiter_id?: string;
  waiter_name?: string;
  cart_total?: string;
  cart_count?: string;
  cart_items?: string;
  is_edit_mode?: string;
  restaurant_name?: string;
};

export default function CartScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();

  const tableNo = params.table_no ?? '';
  const pax = params.pax ?? '';
  const memberName = params.member_name ?? '';
  const memberId = params.member_id ?? '';
  const orderType = (params.order_type ?? '').toUpperCase();
  const initialGrand = Number(params.cart_total ?? 0);
  const initialCount = Number(params.cart_count ?? 0);
  const isEditMode = params.is_edit_mode === 'true';
  const restaurantName = params.restaurant_name ?? '';
  
  type SimpleCartItem = { id: number; name: string; price: number; quantity: number; isExisting?: boolean };
  const initialItems: SimpleCartItem[] = (() => {
    try { return params.cart_items ? JSON.parse(String(params.cart_items)) : []; } catch { return []; }
  })();
  
  // Separate existing items from new items in edit mode
  const [existingItems, setExistingItems] = useState<SimpleCartItem[]>(() => {
    try {
      return isEditMode ? (initialItems || []).filter(item => item.isExisting) : [];
    } catch (error) {
      console.error('Error initializing existingItems:', error);
      return [];
    }
  });
  const [cartItems, setCartItems] = useState<SimpleCartItem[]>(() => {
    try {
      return isEditMode ? (initialItems || []).filter(item => !item.isExisting) : (initialItems || []);
    } catch (error) {
      console.error('Error initializing cartItems:', error);
      return [];
    }
  });

  // Delivery type display-only, comes from previous screen
  const deliveryType: 'TAKE_AWAY' | 'DINING_IN' =
    orderType.includes('DINING') ? 'DINING_IN' : 'TAKE_AWAY';

  // Totals (keep simple, tax and delivery fee are zero for now)
  const { itemCount, subTotal, tax, deliveryFee, grandTotal } = useMemo(() => {
    // Add null checks to prevent undefined errors
    const safeExistingItems = existingItems || [];
    const safeCartItems = cartItems || [];
    // Totals should reflect only new items in edit mode to avoid doubling
    const itemsForTotals = isEditMode ? safeCartItems : [...safeExistingItems, ...safeCartItems];
    const hasRuntimeItems = itemsForTotals.length > 0;
    const count = hasRuntimeItems ? itemsForTotals.reduce((s, i) => s + i.quantity, 0) : 0;
    const sub = hasRuntimeItems ? itemsForTotals.reduce((s, i) => s + i.price * i.quantity, 0) : 0;
    const t = 0;
    const d = 0;
    // If there are no runtime items and we navigated in with initial params, prefer zeros for a cleared cart
    const finalCount = hasRuntimeItems ? count : 0;
    const finalSub = hasRuntimeItems ? sub : 0;
    return { itemCount: finalCount, subTotal: finalSub, tax: t, deliveryFee: d, grandTotal: finalSub + t + d };
  }, [existingItems, cartItems]);

  const increaseItem = (id: number) => setCartItems(prev => (prev || []).map(ci => ci.id === id ? { ...ci, quantity: ci.quantity + 1 } : ci));
  const decreaseItem = (id: number) => setCartItems(prev => {
    const safePrev = prev || [];
    const idx = safePrev.findIndex(ci => ci.id === id);
    if (idx === -1) return safePrev;
    const next = [...safePrev];
    const q = next[idx].quantity - 1;
    if (q <= 0) next.splice(idx, 1); else next[idx] = { ...next[idx], quantity: q };
    return next;
  });
  const deleteItem = (id: number) => setCartItems(prev => (prev || []).filter(ci => ci.id !== id));

  const navigateBackToMenu = () => {
    const safeExistingItems = existingItems || [];
    const safeCartItems = cartItems || [];
    // Merge duplicates by id to avoid duplicate rows when returning to menu
    const map = new Map<number, SimpleCartItem>();
    [...safeExistingItems, ...safeCartItems].forEach(it => {
      const prev = map.get(it.id);
      if (prev) {
        map.set(it.id, { ...prev, quantity: prev.quantity + it.quantity, isExisting: prev.isExisting || it.isExisting });
      } else {
        map.set(it.id, { ...it });
      }
    });
    const allItems = Array.from(map.values());
    router.replace({
      pathname: '/course_menu_item',
      params: {
        order_number: params.order_number ?? '',
        member_id: params.member_id ?? '',
        member_type: params.member_type ?? '',
        pax: params.pax ?? '',
        member_name: params.member_name ?? '',
        table_no: params.table_no ?? '',
        waiter_id: params.waiter_id ?? '',
        waiter_name: params.waiter_name ?? '',
        order_type: params.order_type ?? '',
        cart_total: String(grandTotal),
        cart_count: String(itemCount),
        cart_items: JSON.stringify(allItems),
        is_edit_mode: String(isEditMode),
        restaurant_name: restaurantName,
      }
    });
  };

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={navigateBackToMenu}>
          <Ionicons name="chevron-back" size={20} color="#D84315" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSub}>{`${tableNo}  •  pax ${pax}`}</Text>
          <Text style={styles.headerSub}>{`${memberName}  •  ${memberId}`}</Text>
        </View>
      </View>

        {/* Items or empty state */}
        {((existingItems || []).length + (cartItems || []).length) === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 28 }}>
            <Image
              source={require('../assets/images/not_found.png')}
              style={{ width: 160, height: 120, resizeMode: 'contain', marginBottom: 8 }}
              // Fallback: if asset missing, Image will silently fail; UI still fine
            />
            <Text style={styles.emptyTitle}>No Data Found</Text>

            {/* Summary card (empty) */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Sub Total</Text><Text style={styles.summaryValue}>{subTotal.toFixed(0)}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tax</Text><Text style={styles.summaryValue}>{tax.toFixed(0)}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery Fees</Text><Text style={styles.summaryValue}>{deliveryFee.toFixed(0)}</Text></View>
              <View style={styles.dottedDivider} />
              <View style={styles.summaryTotalRow}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotalValue}>{grandTotal.toFixed(0)}</Text></View>
            </View>
          </View>
        ) : (
          <View style={styles.itemsArea}>
            {/* Show existing items section if in edit mode */}
            {isEditMode && (existingItems || []).length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Existing Items (Cannot be removed)</Text>
              </View>
            )}
            <FlatList
              data={isEditMode ? [...(existingItems || []), ...(cartItems || [])] : (cartItems || [])}
              keyExtractor={(item, index) => `${item.id}-${index}-${item.isExisting ? 'existing' : 'new'}`}
              renderItem={({ item }) => (
                <View style={[styles.itemCard, item.isExisting && styles.existingItemCard]}>
                  <View style={styles.itemLeft}>
                    <View style={styles.itemImagePlaceholder}>
                      <Ionicons name="person" size={20} color="#9CA3AF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPriceText}>{`Rs. ${item.price.toFixed(0)}`}</Text>
                      {item.isExisting && (
                        <Text style={styles.existingItemLabel}>Existing Item</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    {!item.isExisting && (
                      <>
                    <TouchableOpacity style={[styles.qtySquareBtn, styles.qtyMinus]} activeOpacity={0.6} onPress={() => decreaseItem(item.id)}>
                      <Ionicons name="remove" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.itemQtyLabel}>{item.quantity}</Text>
                    <TouchableOpacity style={[styles.qtySquareBtn, styles.qtyPlus]} activeOpacity={0.6} onPress={() => increaseItem(item.id)}>
                      <Ionicons name="add" size={16} color="#ffffff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteInlineBtn} activeOpacity={0.6} onPress={() => deleteItem(item.id)}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>
                      </>
                    )}
                    {item.isExisting && (
                      <View style={styles.existingItemControls}>
                        <Text style={styles.itemQtyLabel}>{item.quantity}</Text>
                        <Text style={styles.lockedIcon}>🔒</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
              contentContainerStyle={styles.cartListContainer}
            />
            {/* Summary card (when items exist) */}
            <View style={[styles.summaryCard, { marginTop: 8, width: '100%', alignSelf: 'auto' }]}>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Sub Total</Text><Text style={styles.summaryValue}>{subTotal.toFixed(0)}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tax</Text><Text style={styles.summaryValue}>{tax.toFixed(0)}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery Fees</Text><Text style={styles.summaryValue}>{deliveryFee.toFixed(0)}</Text></View>
              <View style={styles.dottedDivider} />
              <View style={styles.summaryTotalRow}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotalValue}>{grandTotal.toFixed(0)}</Text></View>
            </View>
          </View>
        )}

        {/* Delivery type selection (display-only) */}
        <View style={styles.deliveryRow}>
          <View style={styles.deliveryLeft}>
            <View style={styles.deliveryOption}>
              <View style={[styles.radioOuter, (deliveryType === 'DINING_IN') ? styles.radioOuterActive : undefined]}>
                <View style={[styles.radioInner, (deliveryType === 'DINING_IN') ? styles.radioInnerActive : undefined]} />
              </View>
              <Text style={styles.deliveryLabel}>DiningIn</Text>
            </View>
            <View style={styles.deliveryOption}>
              <View style={[styles.radioOuter, (deliveryType === 'TAKE_AWAY') ? styles.radioOuterActive : undefined]}>
                <View style={[styles.radioInner, (deliveryType === 'TAKE_AWAY') ? styles.radioInnerActive : undefined]} />
              </View>
              <Text style={styles.deliveryLabel}>TakeAway</Text>
            </View>
          </View>
          <View style={styles.itemsCountRight}>
            <Text style={{ color: '#374151', fontWeight: '800' }}>{`Items: ${itemCount}`}</Text>
          </View>
        </View>

      <View style={[styles.bottomBar, { paddingBottom: 12 + insets.bottom }]}>
        <TouchableOpacity
          disabled={(cartItems || []).length === 0}
          style={[styles.checkoutBtn, (cartItems || []).length === 0 ? styles.checkoutBtnDisabled : undefined]}
          onPress={async () => {
            try {
              // Prepare safe arrays up-front to avoid undefined access
              const safeExistingItems = existingItems || [];
              const safeCartItems = cartItems || [];
              // Merge duplicates by id
              const mergedMap = new Map<number, SimpleCartItem>();
              [...safeExistingItems, ...safeCartItems].forEach(it => {
                const prev = mergedMap.get(it.id);
                if (prev) {
                  mergedMap.set(it.id, { ...prev, quantity: prev.quantity + it.quantity, isExisting: prev.isExisting || it.isExisting });
                } else {
                  mergedMap.set(it.id, { ...it });
                }
              });
              const allItems = Array.from(mergedMap.values());

              // Validate required fields
              console.log('Order validation - params:', {
                order_number: params.order_number,
                member_id: params.member_id,
                member_type: params.member_type,
                table_no: params.table_no,
                restaurant_name: restaurantName,
                allItemsLength: allItems.length,
                cartItemsLength: safeCartItems.length,
                existingItemsLength: safeExistingItems.length
              });
              
              if (!params.order_number || params.order_number.trim() === '') {
                console.error('Order number validation failed:', params.order_number);
                Alert.alert('Error', 'Order number is required');
                return;
              }
              
              if (allItems.length === 0) {
                console.error('No items validation failed:', { cartItems: safeCartItems.length, existingItems: safeExistingItems.length });
                Alert.alert('Error', 'Cannot place order with no items');
                return;
              }
              
              // Resolve current outlet name from storage
              let outletName = '';
              try {
                const s1 = await SecureStore.getItemAsync('selectedOutlet');
                if (s1) outletName = s1;
              } catch {}
              if (!outletName) {
                try {
                  const a1 = await AsyncStorage.getItem('selected_outlet_name');
                  const a2 = await AsyncStorage.getItem('selectedOutlet');
                  const a3 = await AsyncStorage.getItem('selected_outlet');
                  const raw = a1 || a2 || a3 || '';
                  if (raw) {
                    try {
                      const parsed = JSON.parse(raw as string);
                      outletName = parsed?.name || parsed?.outletName || parsed || '';
                    } catch {
                      outletName = raw as string;
                    }
                  }
                } catch {}
              }

              console.log('Order validation passed. Proceeding to save...');

              // safeExistingItems, safeCartItems, and allItems are already prepared above
              
              // Validate cart items structure
              console.log('Cart items validation:', {
                existingItems: safeExistingItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
                cartItems: safeCartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
                allItems: allItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price }))
              });
              
              // Validate that all items have required properties
              const invalidItems = allItems.filter(item => 
                !item.id || !item.name || !item.price || !item.quantity || item.quantity <= 0
              );
              
              if (invalidItems.length > 0) {
                console.error('Invalid items found:', invalidItems);
                Alert.alert('Error', `Invalid items found: ${invalidItems.map(item => item.name || 'Unknown').join(', ')}`);
                return;
              }
              
              // Get existing orders first to find the original order in edit mode
              console.log('Fetching existing orders from AsyncStorage...');
              const existingOrders = await AsyncStorage.getItem('allOrders');
              let allOrders = [];
              
              if (existingOrders) {
                try {
                  allOrders = JSON.parse(existingOrders);
                  console.log('Successfully parsed existing orders:', allOrders.length);
                } catch (parseError) {
                  console.error('Error parsing existing orders:', parseError);
                  allOrders = [];
                }
              } else {
                console.log('No existing orders found, starting with empty array');
              }
              
              let finalOrderData; // Declare variable outside the if/else blocks
              
              if (isEditMode) {
                // Find the existing order to preserve its original timestamp
                const existingOrder = allOrders.find(o => o.orderNumber === params.order_number);
                const originalTimestamp = existingOrder ? existingOrder.timestamp : new Date().toISOString();
                
                console.log('Editing existing order:', params.order_number);
                console.log('Original timestamp preserved:', originalTimestamp);
                
                // Update existing order in edit mode - preserve original timestamp and order ID
                finalOrderData = {
                  orderNumber: params.order_number ?? '',
                  memberId: params.member_id ?? '',
                  memberType: params.member_type ?? '',
                  pax: params.pax ?? '',
                  memberName: params.member_name ?? '',
                  tableNo: params.table_no ?? '',
                  waiterId: params.waiter_id ?? '',
                  waiterName: params.waiter_name ?? '',
                  serviceType: deliveryType,
                  cartItems: allItems,
                  grandTotal: grandTotal,
                  itemCount: itemCount,
                  timestamp: originalTimestamp, // Preserve original timestamp
                  status: 'Pending', // Set back to Pending so it appears in KOT
                  outletName: outletName,
                  restaurantName: restaurantName
                };
                
                console.log('Updated order data:', finalOrderData);
                
                const updatedOrders = allOrders.map(o => 
                  o.orderNumber === params.order_number ? finalOrderData : o
                );
                console.log('About to save updated orders to AsyncStorage...');
                await AsyncStorage.setItem('allOrders', JSON.stringify(updatedOrders));
                console.log('Order updated successfully with same ID:', params.order_number);
              } else {
                // Create new order with new timestamp
                console.log('Creating new order:', params.order_number);
                finalOrderData = {
                orderNumber: params.order_number ?? '',
                memberId: params.member_id ?? '',
                memberType: params.member_type ?? '',
                pax: params.pax ?? '',
                memberName: params.member_name ?? '',
                tableNo: params.table_no ?? '',
                waiterId: params.waiter_id ?? '',
                waiterName: params.waiter_name ?? '',
                serviceType: deliveryType,
                  cartItems: allItems,
                grandTotal: grandTotal,
                itemCount: itemCount,
                timestamp: new Date().toISOString(),
                status: 'Pending',
                outletName: outletName,
                restaurantName: restaurantName
              };
              
                console.log('New order data:', finalOrderData);
                allOrders.push(finalOrderData);
                console.log('About to save new order to AsyncStorage...');
                await AsyncStorage.setItem('allOrders', JSON.stringify(allOrders));
                console.log('New order created successfully:', params.order_number);
              }
              
              // Also keep currentOrder for backward compatibility
              await AsyncStorage.setItem('currentOrder', JSON.stringify(finalOrderData));
              
              // Determine where to redirect based on user type
              const isMemberOrder = (params.member_type === 'MEMBER') || restaurantName !== '';
              const redirectPath = isMemberOrder ? '/takeaway' : '/homedashboard';
              
              Alert.alert(
                isEditMode ? 'Order Updated!' : 'Order Placed!',
                isEditMode ? 'Your order has been updated successfully.' : 'Your order has been placed successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace(redirectPath)
                  }
                ]
              );
            } catch (error) {
              console.error('Error saving order:', error);
              console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                params: params,
                isEditMode: isEditMode
              });
              Alert.alert('Error', `Failed to save order. Error: ${error.message || 'Unknown error'}`);
            }
          }}
        >
          <Text style={styles.checkoutText}>{isEditMode ? 'Update Order' : 'Place Order'}</Text>
        </TouchableOpacity>
        {/* Maintain visual space above the bottom bar */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scaffold: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#D84315', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#ffffff', fontWeight: '800', fontSize: 20 },
  headerSub: { color: '#ffffff', marginTop: 2, fontWeight: '600', fontSize: 12 },

  // Items area (scrollable list + summary above bottom area)
  itemsArea: { flex: 1, marginHorizontal: 16, marginTop: 16 },
  card: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 },
  cartListContainer: { paddingBottom: 12 },
  cardTitle: { color: '#B91C1C', fontWeight: '800', fontSize: 18 },
  cardSub: { marginTop: 6, color: '#111827' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  cartRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  itemName: { color: '#111827', fontWeight: '800', fontSize: 16 },
  itemPriceText: { marginTop: 6, color: '#D84315', fontWeight: '800' },
  // Redesigned item card
  itemCard: { borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, padding: 12, marginBottom: 12, position: 'relative' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemImagePlaceholder: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  itemRight: { position: 'absolute', right: 12, top: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtySquareBtn: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  qtyMinus: { backgroundColor: '#E5E7EB' },
  qtyPlus: { backgroundColor: '#D84315' },
  itemQtyLabel: { minWidth: 16, textAlign: 'center', color: '#111827', fontWeight: '800' },
  deleteBtn: { position: 'absolute', right: 12, top: 52, width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2' },
  deleteInlineBtn: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2' },

  // Empty state
  emptyTitle: { marginTop: 6, fontSize: 18, fontWeight: '800', color: '#111827' },
  summaryCard: { marginTop: 16, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, width: '92%' , alignSelf: 'center'},
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { color: '#6B7280' },
  summaryValue: { color: '#374151' },
  dottedDivider: { height: 1, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#E5E7EB', marginVertical: 10 },
  summaryTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  summaryTotalLabel: { color: '#111827', fontWeight: '800' },
  summaryTotalValue: { color: '#D84315', fontWeight: '800' },

  // Delivery selection
  deliveryRow: { marginHorizontal: 16, marginTop: 16, marginBottom: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deliveryLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  deliveryOption: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: '#D84315' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'transparent' },
  radioInnerActive: { backgroundColor: '#D84315' },
  deliveryLabel: { marginLeft: 8, color: '#374151', fontWeight: '700' },
  itemsCountRight: { marginRight: 16 },

  // Bottom checkout bar
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'transparent', paddingHorizontal: 16, paddingTop: 10 },
  checkoutBtn: { backgroundColor: '#D84315', borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center' },
  checkoutBtnDisabled: { opacity: 0.6 },
  checkoutText: { color: '#ffffff', fontWeight: '900', letterSpacing: 0.5 },
  
  // Edit mode styles
  sectionHeader: { marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  existingItemCard: { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' },
  existingItemLabel: { fontSize: 12, color: '#0369A1', fontWeight: '600', marginTop: 2 },
  existingItemControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lockedIcon: { fontSize: 16 },
});


