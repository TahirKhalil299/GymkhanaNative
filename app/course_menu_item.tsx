import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Course, FoodItem, getSampleCourses } from '../constants/courses';

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
};

export default function CourseMenuScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<{ id: number; code: string; name: string; price: number }>>(null);

  const orderNumber = params.order_number ?? '';
  const memberId = params.member_id ?? '';
  const memberType = params.member_type ?? '';
  const pax = params.pax ?? '';
  const memberName = params.member_name ?? '';
  const tableNo = params.table_no ?? '';
  const orderType = params.order_type ?? '';
  const waiterId = params.waiter_id ?? '';
  const waiterName = params.waiter_name ?? '';

  // Courses
  const courses: Course[] = useMemo(() => getSampleCourses(), []);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(() => courses[0]?.id ?? 0);
  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId), [courses, selectedCourseId]);

  type Item = { id: number; code: string; name: string; price: number };
  const items: Item[] = useMemo(() => {
    const src: FoodItem[] = selectedCourse?.items ?? [];
    return src.map(i => ({ id: i.id, code: String(i.id), name: i.name, price: i.price }));
  }, [selectedCourse]);

  type SimpleCartItem = { id: number; name: string; price: number; quantity: number };
  const initialItems: SimpleCartItem[] = useMemo(() => {
    try { return params.cart_items ? JSON.parse(String(params.cart_items)) as SimpleCartItem[] : []; } catch { return []; }
  }, [params.cart_items]);
  const [cartItems, setCartItems] = useState<SimpleCartItem[]>(initialItems);
  const [cartCount, setCartCount] = useState(Number(params.cart_count ?? (initialItems.reduce((s, i) => s + i.quantity, 0))));
  const [cartTotal, setCartTotal] = useState(Number(params.cart_total ?? (initialItems.reduce((s, i) => s + i.price * i.quantity, 0))));
  const showBottomCart = cartCount > 0;
  const bottomBarHeight = 50;

  // Sync state when returning from cart with updated params
  useEffect(() => {
    try {
      const parsed: SimpleCartItem[] = params.cart_items ? JSON.parse(String(params.cart_items)) : [];
      setCartItems(parsed);
      const newCount = Number(params.cart_count ?? (parsed.reduce((s, i) => s + i.quantity, 0)));
      const newTotal = Number(params.cart_total ?? (parsed.reduce((s, i) => s + i.price * i.quantity, 0)));
      setCartCount(newCount);
      setCartTotal(newTotal);
    } catch {}
  }, [params.cart_items, params.cart_count, params.cart_total]);

  const addItem = (item: Item) => {
    setCartItems(prev => {
      const next = [...prev];
      const idx = next.findIndex(p => p.id === item.id);
      if (idx === -1) {
        next.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
      } else {
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      }
      const newCount = next.reduce((s, i) => s + i.quantity, 0);
      const newTotal = next.reduce((s, i) => s + i.price * i.quantity, 0);
      setCartCount(newCount);
      setCartTotal(newTotal);
      return next;
    });
    // removed auto scroll to prevent list from jumping when adding items
  };

  const decreaseItem = (id: number) => {
    setCartItems(prev => {
      const next = [...prev];
      const idx = next.findIndex(p => p.id === id);
      if (idx === -1) return prev;
      const curr = next[idx];
      if (curr.quantity <= 1) next.splice(idx, 1); else next[idx] = { ...curr, quantity: curr.quantity - 1 };
      const newCount = next.reduce((s, i) => s + i.quantity, 0);
      const newTotal = next.reduce((s, i) => s + i.price * i.quantity, 0);
      setCartCount(newCount);
      setCartTotal(newTotal);
      return next;
    });
  };

  const getQty = (id: number) => cartItems.find(ci => ci.id === id)?.quantity ?? 0;

  return (
    <SafeAreaView style={styles.scaffold} edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.9} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#D84315" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Menu</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => {
            router.push({
              pathname: '/cart',
              params: {
                order_number: orderNumber,
                member_id: memberId,
                member_type: memberType,
                pax,
                member_name: memberName,
                table_no: tableNo,
                order_type: orderType,
                waiter_id: waiterId,
                waiter_name: waiterName,
                cart_total: String(cartTotal),
                cart_count: String(cartCount),
                cart_items: JSON.stringify(cartItems),
              },
            });
          }}
        >
          <MaterialCommunityIcons name="cart" size={22} color="#ffffff" />
          {cartCount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.infoCols}>
          <View style={styles.infoColLeft}>
            <Text style={styles.infoText} numberOfLines={1}>Order No: {orderNumber}</Text>
            <Text style={styles.infoText} numberOfLines={1}>Member Type: {memberType}</Text>
            <Text style={styles.infoText} numberOfLines={1}>Member Name: {memberName}</Text>
            <Text style={styles.infoText} numberOfLines={1}>Order Type: {orderType}</Text>
          </View>
          <View style={styles.infoColRight}>
            <Text style={[styles.infoText, styles.infoRight]} numberOfLines={1}>PAX: {pax}</Text>
            <Text style={[styles.infoText, styles.infoRight]} numberOfLines={1}>Table No: {tableNo}</Text>
            <Text style={[styles.infoText, styles.infoRight]} numberOfLines={1}>Member ID: {memberId}</Text>
          </View>
        </View>
      </View>

      {/* Select Menu Heading */}
      <View style={styles.selectMenuContainer}>
        <Text style={styles.selectMenuHeading}>Select Menu</Text>
      </View>

      {/* Course Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 20,
          paddingTop: 10,
          paddingBottom: 25  // Different bottom padding
        }}
        style={{ marginTop: 0, marginBottom: 0 }}
      >
        {courses.map(c => {
          const isActive = c.id === selectedCourseId;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCourseId(c.id)}
              style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
            >
              <Text style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]} numberOfLines={1}>
                {c.name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>


        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(i) => String(i.id)}
          style={[styles.listAdjustBase, (items.length <= 2) ? styles.listAdjustLift : undefined]}
          renderItem={({ item }) => {
            const qty = getQty(item.id);
            return (
              <View style={styles.itemCard}>
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="person" size={20} color="#9CA3AF" />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemPrice}>Rs. {item.price.toFixed(0)}</Text>
                </View>
                {qty > 0 ? (
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity style={[styles.qtyBtn, styles.qtyMinusBtn]} onPress={() => decreaseItem(item.id)}>
                      <Ionicons name="remove" size={18} color="#D84315" />
                    </TouchableOpacity>
                    <Text style={styles.qtyCountText}>{qty}</Text>
                    <TouchableOpacity style={[styles.qtyBtn, styles.qtyPlusBtn]} onPress={() => addItem(item)}>
                      <Ionicons name="add" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addButton} onPress={() => addItem(item)}>
                    <Ionicons name="add" size={20} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          contentContainerStyle={{
            paddingHorizontal: 16, 
            paddingTop: 4, 
            paddingBottom: showBottomCart ? bottomBarHeight + insets.bottom + 24 : 24,
            flexGrow: 1
          }}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />

      {showBottomCart && (
        <View style={[styles.bottomCart, { paddingBottom: 8 + insets.bottom, height: bottomBarHeight + insets.bottom + 8 }]}>
          <TouchableOpacity
            style={styles.viewOrderBar}
            activeOpacity={0.9}
            onPress={() => {
              router.push({
                pathname: '/cart',
                params: {
                  order_number: orderNumber,
                  member_id: memberId,
                  member_type: memberType,
                  pax,
                  member_name: memberName,
                  table_no: tableNo,
                  order_type: orderType,
                  waiter_id: waiterId,
                  waiter_name: waiterName,
                  cart_total: String(cartTotal),
                  cart_count: String(cartCount),
                  cart_items: JSON.stringify(cartItems),
                },
              });
            }}
          >
            <View style={styles.viewOrderCountWrap}><Text style={styles.viewOrderCountText}>{cartCount}</Text></View>
            <Text style={styles.viewOrderLabel}>VIEW ORDER</Text>
            <Text style={styles.viewOrderTotal}>{`Rs. ${cartTotal.toFixed(1)}`}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scaffold: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#D84315',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderRadius: 18 },
  title: { color: '#ffffff', fontWeight: '700', fontSize: 18, marginLeft: 8 },
  cartBtn: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: 2, top: 2, backgroundColor: '#E53935', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#ffffff', fontWeight: '700', fontSize: 10 },
  orderInfo: { backgroundColor: '#D84315', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 6 },
  infoCols: { flexDirection: 'row', gap: 16 },
  infoColLeft: { flex: 1 },
  infoColRight: { flex: 1 },
  infoText: { color: '#ffffff', fontSize: 12, marginTop: 4 },
  infoRight: { textAlign: 'left' },
  // Select Menu Heading
  selectMenuContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 0 },
  selectMenuHeading: { fontSize: 18, fontWeight: '700', color: '#111827' },
  // Category tabs styled to match the image
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    height: 32,
  },
  tabActive: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  tabInactive: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  tabText: { fontWeight: '600', fontSize: 12, letterSpacing: 0.3, lineHeight: 14 },
  tabTextActive: { color: '#DC2626' },
  tabTextInactive: { color: '#6B7280' },
  // Menu item cards styled to match the image
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1 },
  itemName: { color: '#111827', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  itemPrice: { color: '#DC2626', fontWeight: '700', fontSize: 14 },
  // List vertical position helpers (do not change FlatList contentContainerStyle)
  listAdjustBase: { marginTop: 0, flex: 0 },
  listAdjustLift: { marginTop: 5, flex: 1 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  qtyMinusBtn: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#D84315' },
  qtyPlusBtn: { backgroundColor: '#D84315' },
  qtyCountText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  // Bottom bar styled to match the image
  bottomCart: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 }
  },
  viewOrderBar: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#D84315',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  viewOrderCountWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewOrderCountText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  viewOrderLabel: { color: '#ffffff', fontWeight: '800', letterSpacing: 0.5 },
  viewOrderTotal: { color: '#ffffff', fontWeight: '800' },
});