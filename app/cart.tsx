import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Params = {
  order_number?: string;
  member_id?: string;
  member_type?: string;
  pax?: string;
  member_name?: string;
  table_no?: string;
  waiter_id?: string;
  waiter_name?: string;
  cart_total?: string;
  cart_count?: string;
  cart_items?: string;
};

export default function CartScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();

  const tableNo = params.table_no ?? '';
  const pax = params.pax ?? '';
  const memberName = params.member_name ?? '';
  const memberId = params.member_id ?? '';
  const grandTotal = Number(params.cart_total ?? 0);
  const itemCount = Number(params.cart_count ?? 0);
  type SimpleCartItem = { id: number; name: string; price: number; quantity: number };
  let items: SimpleCartItem[] = [];
  try { items = params.cart_items ? JSON.parse(String(params.cart_items)) : []; } catch {}

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSub}>{`${tableNo}  •  pax ${pax}`}</Text>
          <Text style={styles.headerSub}>{`${memberName}  •  ${memberId}`}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cart</Text>
        <Text style={styles.cardSub}>{`${itemCount} items - Total: ${grandTotal.toFixed(1)}`}</Text>
        <View style={styles.divider} />
        {items.length === 0 ? (
          <Text style={{ color: '#6B7280' }}>Your cart is empty.</Text>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.cartRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>Price: {item.price.toFixed(1)}</Text>
                </View>
                <View style={styles.qtyBadge}><Text style={styles.qtyText}>{item.quantity}</Text></View>
                <Text style={styles.rowTotal}>{(item.price * item.quantity).toFixed(1)}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.cartListContainer}
          />
        )}
      </View>

      <View style={[styles.bottomBar, { paddingBottom: 12 + insets.bottom }]}>
        <View>
          <Text style={styles.bottomLabel}>Grand Total:</Text>
          <Text style={styles.bottomTotal}>{grandTotal.toFixed(1)}</Text>
        </View>
        <TouchableOpacity
          style={styles.placeBtn}
          onPress={async () => {
            try {
              const orderData = {
                orderNumber: params.order_number ?? '',
                memberId: params.member_id ?? '',
                memberType: params.member_type ?? '',
                pax: params.pax ?? '',
                memberName: params.member_name ?? '',
                tableNo: params.table_no ?? '',
                waiterId: params.waiter_id ?? '',
                waiterName: params.waiter_name ?? '',
                cartItems: items,
                grandTotal: grandTotal,
                itemCount: itemCount,
                timestamp: new Date().toISOString(),
                status: 'Pending'
              };
              
              // Get existing orders
              const existingOrders = await AsyncStorage.getItem('allOrders');
              let allOrders = [];
              
              if (existingOrders) {
                allOrders = JSON.parse(existingOrders);
              }
              
              // Add new order to the list
              allOrders.push(orderData);
              
              // Save updated orders list
              await AsyncStorage.setItem('allOrders', JSON.stringify(allOrders));
              
              // Also keep currentOrder for backward compatibility
              await AsyncStorage.setItem('currentOrder', JSON.stringify(orderData));
              
              Alert.alert(
                'Order Placed!',
                'Your order has been placed successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/homedashboard')
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to save order. Please try again.');
            }
          }}
        >
          <Text style={styles.placeText}>Place Order</Text>
        </TouchableOpacity>
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

  card: { margin: 16, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, flex: 1 },
  cartListContainer: { paddingBottom: 20 },
  cardTitle: { color: '#B91C1C', fontWeight: '800', fontSize: 18 },
  cardSub: { marginTop: 6, color: '#111827' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  cartRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  itemName: { color: '#111827', fontWeight: '800', fontSize: 16 },
  itemMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  qtyBadge: { marginHorizontal: 12, width: 32, height: 32, borderRadius: 6, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: '#111827', fontWeight: '700' },
  rowTotal: { color: '#D84315', fontWeight: '800', width: 60, textAlign: 'right' },

  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#D84315', paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomLabel: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  bottomTotal: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  placeBtn: { backgroundColor: '#ffffff', height: 36, paddingHorizontal: 22, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  placeText: { color: '#D84315', fontWeight: '800' },
});


