import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoodItem, getSampleCourses } from './data/courses';

type Params = {
  order_number?: string;
  member_id?: string;
  member_type?: string;
  pax?: string;
  member_name?: string;
  table_no?: string;
  waiter_id?: string;
  waiter_name?: string;
  course_id?: string;
  course_name?: string;
  cart_total?: string;
  cart_count?: string;
  cart_items?: string;
};
 type Item = { id: number; code: string; name: string; price: number };
 type OrderItem = Item & { quantity: number; uid: string };

export default function CourseItemsScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();

  const courseName = params.course_name ?? 'Items';

  const allItems: Item[] = useMemo(() => {
    const cid = Number(params.course_id ?? 0);
    const course = getSampleCourses().find(c => c.id === cid);
    const items: FoodItem[] = course?.items ?? [];
    return items.map(i => ({ id: i.id, code: String(i.id), name: i.name, price: i.price }));
  }, [params.course_id]);

  const [query, setQuery] = useState('');
  const [currentItems, setCurrentItems] = useState<OrderItem[]>([]);
  const listRef = useRef<FlatList<Item>>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(i => i.name.toLowerCase().includes(q) || i.code.includes(q));
  }, [query, allItems]);

  const itemCount = currentItems.reduce((sum, i) => sum + i.quantity, 0);
  const total = currentItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const showBottom = itemCount > 0;

  const addItem = (item: Item) => {
    setCurrentItems(prev => {
      const wasEmpty = prev.length === 0;
      const next = [...prev, { ...item, quantity: 1, uid: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2,7)}` }];
      if (wasEmpty) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      return next;
    });
  };

  const decreaseItem = (uid: string) => {
    setCurrentItems(prev => {
      const idx = prev.findIndex(p => p.uid === uid);
      if (idx === -1) return prev;
      const curr = prev[idx];
      if (curr.quantity <= 1) {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      }
      const next = [...prev];
      next[idx] = { ...curr, quantity: curr.quantity - 1 };
      return next;
    });
  };

  const removeItem = (uid: string) => {
    setCurrentItems(prev => prev.filter(p => p.uid !== uid));
  };

  const increaseItem = (uid: string) => {
    setCurrentItems(prev => {
      const idx = prev.findIndex(p => p.uid === uid);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      return next;
    });
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.itemMeta}>Code: {item.code}</Text>
          <Text style={styles.itemPrice}>{item.price.toFixed(1)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item)}>
        <Ionicons name="add" size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerLight}>
        <TouchableOpacity style={styles.backBtnRed} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#E53935" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{courseName}</Text>
        <View style={{ width: 35 }} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search items..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionLabel}>Available Items</Text>

       <FlatList
         ref={listRef}
         data={filtered}
         keyExtractor={(i) => i.id}
         renderItem={renderItem}
         contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: showBottom ? 70 + insets.bottom : 16, paddingTop: 8, rowGap: 12 }}
         showsVerticalScrollIndicator={false}
         ListFooterComponent={() => (
           <View>
             <View style={styles.currentOrderHeaderRow}>
               <Text style={styles.currentOrderTitle}>Current Order</Text>
               <Text style={styles.currentOrderCount}>Items: {itemCount}</Text>
             </View>
      {currentItems.map(oi => (
        <View key={oi.uid} style={styles.currentCard}>
                 <View style={{ flex: 1 }}>
                   <Text style={styles.currentName}>{oi.name}</Text>
                   <Text style={styles.currentPrice}>Price: {oi.price.toFixed(1)}</Text>
                   <Text style={styles.currentSubtotal}>Subtotal: {(oi.price * oi.quantity).toFixed(1)}</Text>
                 </View>
                 <View style={styles.qtyRow}>
                   <TouchableOpacity style={styles.iconEdit}>
                     <Ionicons name="create-outline" size={16} color="#D84315" />
                   </TouchableOpacity>
             <TouchableOpacity style={styles.qtyBtn} onPress={() => decreaseItem(oi.uid)}>
                     <Ionicons name="remove" size={16} color="#ffffff" />
                   </TouchableOpacity>
                   <Text style={styles.qtyText}>{oi.quantity}</Text>
             <TouchableOpacity style={styles.qtyBtn} onPress={() => increaseItem(oi.uid)}>
                     <Ionicons name="add" size={16} color="#ffffff" />
                   </TouchableOpacity>
             <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(oi.uid)}>
                     <Ionicons name="close" size={16} color="#EF4444" />
                   </TouchableOpacity>
                 </View>
                 <View style={{ marginTop: 8 }}>
                   <TextInput placeholder="Remarks..." placeholderTextColor="#9CA3AF" style={styles.remarks} />
                 </View>
               </View>
             ))}
           </View>
         )}
       />

      {showBottom && (
        <View style={[styles.bottomBar, { paddingBottom: 12 + insets.bottom }] }>
          <View>
            <Text style={styles.bottomLabel}>Item Total:</Text>
             <Text style={styles.bottomTotal}>{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => {
              const existingTotal = Number(params.cart_total ?? 0);
              const existingCount = Number(params.cart_count ?? 0);
              const newTotal = existingTotal + total;
              const newCount = existingCount + itemCount;
              // Merge cart items
              type SimpleCartItem = { id: number; name: string; price: number; quantity: number };
              let existingItems: SimpleCartItem[] = [];
              try { existingItems = params.cart_items ? JSON.parse(String(params.cart_items)) : []; } catch {}
              const added: SimpleCartItem[] = currentItems.map(ci => ({ id: ci.id, name: ci.name, price: ci.price, quantity: ci.quantity }));
              const merged = existingItems.concat(added);
              router.replace({
                pathname: '/course_menu_item',
                params: {
                  order_number: String(params.order_number ?? ''),
                  member_id: String(params.member_id ?? ''),
                  member_type: String(params.member_type ?? ''),
                  pax: String(params.pax ?? ''),
                  member_name: String(params.member_name ?? ''),
                  table_no: String(params.table_no ?? ''),
                  waiter_id: String(params.waiter_id ?? ''),
                  waiter_name: String(params.waiter_name ?? ''),
                  cart_total: String(newTotal),
                  cart_count: String(newCount),
                  cart_items: JSON.stringify(merged),
                },
              });
            }}
          >
            <Text style={styles.bottomBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scaffold: { flex: 1, backgroundColor: '#F9FAFB' },
  headerLight: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  backBtnRed: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDECEC', borderRadius: 18 },
  headerTitle: { flex: 1, marginLeft: 12, color: '#1F2937', fontWeight: '700', fontSize: 18 },

  searchWrap: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { marginLeft: 8, flex: 1, color: '#111827', fontSize: 14 },

  sectionLabel: { marginTop: 14, marginHorizontal: 16, color: '#111827', fontWeight: '800', fontSize: 18 },

  card: {
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: { color: '#111827', fontSize: 16, fontWeight: '700', flexShrink: 1 },
  metaRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemMeta: { color: '#6B7280', fontSize: 12 },
  itemPrice: { color: '#E53935', fontWeight: '700', marginLeft: 12 },
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },

  currentOrderHeaderRow: { marginTop: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  currentOrderTitle: { color: '#1F2937', fontWeight: '800', fontSize: 18 },
  currentOrderCount: { color: '#6B7280', fontSize: 14 },
  currentCard: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  currentName: { color: '#111827', fontSize: 16, fontWeight: '700' },
  currentPrice: { marginTop: 4, color: '#6B7280', fontSize: 12 },
  currentSubtotal: { marginTop: 2, color: '#D84315', fontSize: 12, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: -28 },
  iconEdit: { marginRight: 6, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDECEC' },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#D84315', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  qtyText: { marginLeft: 10, marginRight: 10, minWidth: 18, textAlign: 'center', color: '#1F2937', fontWeight: '700' },
  removeBtn: { marginLeft: 10, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2' },
  remarks: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#111827' },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#D84315', paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 8,
  },
  bottomLabel: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  bottomTotal: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  bottomBtn: { backgroundColor: '#ffffff', height: 32, paddingHorizontal: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bottomBtnText: { color: '#D84315', fontWeight: '800' },
});


