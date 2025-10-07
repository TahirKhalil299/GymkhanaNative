import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Course, getSampleCourses } from './data/courses';

type Params = {
  order_number?: string;
  member_id?: string;
  member_type?: string;
  pax?: string;
  member_name?: string;
  table_no?: string;
  order_type?: string;
  cart_total?: string;
  cart_count?: string;
  cart_items?: string;
};

export default function CourseMenuScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();

  const orderNumber = params.order_number ?? '';
  const memberId = params.member_id ?? '';
  const memberType = params.member_type ?? '';
  const pax = params.pax ?? '';
  const memberName = params.member_name ?? '';
  const tableNo = params.table_no ?? '';
  const orderType = params.order_type ?? '';

  // Mock courses data (replace when API available)
  const courses: Course[] = useMemo(() => getSampleCourses(), []);

  type SimpleCartItem = { id: number; name: string; price: number; quantity: number };
  const initialItems: SimpleCartItem[] = useMemo(() => {
    try { return params.cart_items ? JSON.parse(String(params.cart_items)) as SimpleCartItem[] : []; } catch { return []; }
  }, [params.cart_items]);
  const [cartItems, setCartItems] = useState<SimpleCartItem[]>(initialItems);
  const [cartCount, setCartCount] = useState(Number(params.cart_count ?? (initialItems.reduce((s,i)=>s+i.quantity,0))));
  const [cartTotal, setCartTotal] = useState(Number(params.cart_total ?? (initialItems.reduce((s,i)=>s+i.price*i.quantity,0))));
  const showBottomCart = cartCount > 0;
  const bottomBarHeight = 50;

  const renderCourse = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: '/course_items',
          params: {
            order_number: orderNumber,
            member_id: memberId,
            member_type: memberType,
            pax,
            member_name: memberName,
            table_no: tableNo,
            waiter_id: waiterId,
            waiter_name: waiterName,
            course_id: item.id,
            course_name: item.name,
             cart_total: String(cartTotal),
             cart_count: String(cartCount),
             cart_items: JSON.stringify(cartItems),
          },
        });
      }}
    >
      <Text style={styles.courseName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemsCount}>{`${item.items.length} items`}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.9} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#D84315" />
        </TouchableOpacity>
        <Text style={styles.title}>Caffe9</Text>
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

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={styles.sectionTitle}>COURSES</Text>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(c) => c.id}
        renderItem={renderCourse}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 10 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: showBottomCart ? bottomBarHeight + insets.bottom + 16 : 16, rowGap: 10 }}
        showsVerticalScrollIndicator={false}
      />

      {showBottomCart && (
        <View style={[styles.bottomCart, { paddingBottom: 10 + insets.bottom, height: bottomBarHeight + insets.bottom }] }>
          <Text style={styles.bottomCartText}>Cart Total: {cartTotal}</Text>
          <TouchableOpacity
            style={styles.viewCartBtn}
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
                  waiter_id: waiterId,
                  waiter_name: waiterName,
                  cart_total: String(cartTotal),
                  cart_count: String(cartCount),
                  cart_items: JSON.stringify(cartItems),
                },
              });
            }}
          >
            <Text style={styles.viewCartText}>View Cart ({cartCount})</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scaffold: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#D84315',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderRadius: 18 },
  title: { color: '#ffffff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  cartBtn: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: 2, top: 2, backgroundColor: '#E53935', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#ffffff', fontWeight: '700', fontSize: 10 },
  orderInfo: { backgroundColor: '#D84315', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 6 },
  infoCols: { flexDirection: 'row', gap: 16 },
  infoColLeft: { flex: 1 },
  infoColRight: { flex: 1 },
  infoText: { color: '#ffffff', fontSize: 12, marginTop: 4 },
  infoRight: { textAlign: 'left' },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  courseCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E53935',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  courseName: { textAlign: 'center', color: '#111827', fontWeight: '600', fontSize: 14 },
  itemsCount: { marginTop: 4, textAlign: 'center', color: '#2563EB', fontWeight: '600', fontSize: 11 },
  bottomCart: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#D84315',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
  },
  bottomCartText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  viewCartBtn: { backgroundColor: '#ffffff', paddingHorizontal: 16, height: 30, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  viewCartText: { color: '#D84315', fontWeight: '800', fontSize: 12 },
});


