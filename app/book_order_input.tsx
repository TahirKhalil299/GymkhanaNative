import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MemberType = 'Club Member' | 'Guest' | 'Affiliated Club' | '';

export default function BookOrderInputScreen() {
  const params = useLocalSearchParams<{ member_type?: string; member_id?: string; order_type?: string; guest_name?: string; member_name?: string; member_detail?: string }>();
  const memberType = (params.member_type as MemberType) || '';
  const prefilledMemberId = (params.member_id as string) || '';
  const prefilledGuestName = (params.guest_name as string) || (params.member_name as string) || '';
  const orderType = (params.order_type as string) || '';
  const memberDetail = (params.member_detail as string) || memberType;

  const labels = useMemo(() => {
    return {
      subtitle: `New Order → ${orderType || 'Member Information'}`,
      sectionTitle: 'Member Info',
      leftLabel: 'Member ID',
      leftHint: 'Member ID',
      rightLabel: 'Member Name',
      guestDetailsLabel: 'Member Type',
    };
  }, [orderType]);

  const [pax, setPax] = useState('');
  const [tableNo, setTableNo] = useState('Table 2');
  const tableOptions = useMemo(
    () => [
      'Select Table', 
      'Table 1', 'Table 2', 'Table 3', 'Table 4'
    ],
    []
  );
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [leftField, setLeftField] = useState(prefilledMemberId);
  const [rightField, setRightField] = useState(prefilledGuestName);
  const [guestDetails, setGuestDetails] = useState(memberDetail);
  const [waiterId, setWaiterId] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);

  // Input refs for focusing/opening keyboard
  const paxRef = useRef<TextInput>(null);
  const tableRef = useRef<any>(null);
  const leftRef = useRef<TextInput>(null);
  const rightRef = useRef<TextInput>(null);
  const detailsRef = useRef<TextInput>(null);
  const waiterIdRef = useRef<TextInput>(null);
  const waiterNameRef = useRef<TextInput>(null);
  const remarksRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const leftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waiterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => paxRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  // Prefill waiter ID if saved from Staff login
  useEffect(() => {
    (async () => {
      try {
        const wid = await SecureStore.getItemAsync('waiter_id');
        if (wid) {
          setWaiterId(wid);
        }
      } catch {}
    })();
  }, []);

  const sanitize = (text: string, toUpper = false) => {
    // Block ~ # ^ | $ % & * ! @ + = : ; \ [ ] { } < > ? / " '
    const blocked = /[~#^|$%&*!@+=:;\\\[\]{}<>\?\/\"'\.]/g;
    const cleaned = text.replace(blocked, '');
    return toUpper ? cleaned.toUpperCase() : cleaned;
  };

  // Mapping handled in dialog; keep noop for interface parity
  const simulateMemberAutoFill = (_val: string) => {};

  const simulateWaiterAutoFill = (val: string) => {
    const v = val.trim().toUpperCase();
    if (v.length < 2) {
      setWaiterName('');
      return;
    }
    if (v === 'W01') return setWaiterName('Joe Smith');
    if (v === 'W02') return setWaiterName('John Doe');
    if (v === 'W03') return setWaiterName('Alice Johnson');
    setWaiterName('');
  };

  const onChangeLeft = (text: string) => {
    const cleaned = sanitize(text, true);
    setLeftField(cleaned);
    if (leftTimerRef.current) clearTimeout(leftTimerRef.current);
    leftTimerRef.current = setTimeout(() => simulateMemberAutoFill(cleaned), 600);
  };

  const onChangeWaiterId = (text: string) => {
    const cleaned = sanitize(text, true);
    setWaiterId(cleaned);
    if (waiterTimerRef.current) clearTimeout(waiterTimerRef.current);
    waiterTimerRef.current = setTimeout(() => simulateWaiterAutoFill(cleaned), 600);
  };

  const validate = (): boolean => {
    // Table No
    if (!tableNo || tableNo.trim() === '' || tableNo === 'Select Table') {
      Alert.alert('Validation', 'Please select a table');
      return false;
    }
    // PAX
    if (!pax.trim()) {
      Alert.alert('Validation', 'Number of guests is required');
      paxRef.current?.focus();
      return false;
    }
    const paxNum = Number(pax.trim());
    if (!Number.isInteger(paxNum) || paxNum <= 0) {
      Alert.alert('Validation', 'Number of guests must be greater than 0');
      paxRef.current?.focus();
      return false;
    }
    // Member info read-only; rely on dialog for validation. Ensure present.
    if (!leftField.trim() || !rightField.trim()) {
      Alert.alert('Validation', 'Please enter valid ID');
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Caffe9</Text>
          <Text style={styles.subtitle}>{labels.subtitle}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', default: 'height' })}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 }) as number}
      >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        scrollEnabled={outerScrollEnabled}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Order Details Card */}
        <View style={[styles.card, { overflow: 'visible', zIndex: 1000, elevation: 1000 }]}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="calendar" size={24} color="#E53935" />
            <Text style={styles.cardHeaderText}>Order Details</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.dateText}>{new Date().toISOString().slice(0, 10)}</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.inputWrap, { marginRight: 8 }]}> 
              <Text style={styles.label}>PAX</Text>
              <TextInput
                ref={paxRef}
                value={pax}
                onChangeText={setPax}
                placeholder="Number of guests"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                keyboardType="number-pad"
                returnKeyType="done"
                blurOnSubmit={true}
                enterKeyHint="done"
                onSubmitEditing={() => Keyboard.dismiss()}
               />
            </View>
            <View style={[styles.inputWrap, styles.tableFieldWrap, { marginLeft: 8 }]}> 
              <Text style={styles.label}>Table No</Text>
              <DropdownMini
                value={tableNo}
                onChange={(v) => { setTableNo(v); setShowTablePicker(false); setTimeout(() => leftRef.current?.focus(), 50); }}
                options={tableOptions}
                placeholder="Select Table"
                open={showTablePicker}
                setOpen={(v) => { setShowTablePicker(v); setOuterScrollEnabled(!v); }}
              />
            </View>
          </View>
        </View>

        {/* Member Info Card */}
        <View style={[styles.card, { zIndex: 1, elevation: 1 }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="person" size={24} color="#E53935" />
            <Text style={styles.cardHeaderText}>{labels.sectionTitle}</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.inputWrap, { marginRight: 8 }]}> 
              <Text style={styles.label}>{labels.leftLabel}</Text>
              <TextInput
                ref={leftRef}
                value={leftField}
                onChangeText={() => {}}
                placeholder={labels.leftHint}
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.inputReadOnly]}
                autoCapitalize="none"
                editable={false}
                selectTextOnFocus={false}
              />
            </View>
            <View style={[styles.inputWrap, { marginLeft: 8 }]}> 
              <Text style={styles.label}>{labels.rightLabel}</Text>
              <TextInput
                ref={rightRef}
                value={rightField}
                onChangeText={() => {}}
                placeholder={labels.rightLabel}
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.inputReadOnly]}
                editable={false}
                selectTextOnFocus={false}
              />
            </View>
          </View>
          <View style={styles.inputWrap}> 
            <Text style={styles.label}>{labels.guestDetailsLabel}</Text>
            <TextInput
              ref={detailsRef}
              value={guestDetails}
              onChangeText={() => {}}
              placeholder={labels.guestDetailsLabel}
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.inputReadOnly]}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>
        </View>

        {/* Waiter Info Card hidden */}

        {/* Remarks removed as requested */}

        {/* Buttons */}
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => router.back()}>
            <Text style={[styles.btnText, { color: '#E53935' }]}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity
            style={[styles.btn, styles.btnFilled]}
            onPress={() => {
              if (!validate()) return;
              const orderNumber = `ORD${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`;
              router.push({
                pathname: '/course_menu_item',
                params: {
                  order_number: orderNumber,
                  member_id: leftField,
                  member_type: memberType,
                  pax,
                  member_name: rightField,
                  table_no: tableNo,
                  order_type: orderType,
                },
              });
            }}
          >
            <Text style={[styles.btnText, { color: '#ffffff' }]}>Continue</Text>
          </TouchableOpacity>
        </View>
      <View style={{ height: 24 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Inline dropdown only; no dialog */}
    </SafeAreaView>
  );
}

type MiniProps = { value: string; onChange: (v: string) => void; options: string[]; placeholder: string; open: boolean; setOpen: (v: boolean) => void };

function DropdownMini({ value, onChange, options, placeholder, open, setOpen }: MiniProps) {
  const selected = value || '';
  const itemHeight = 48;
  const maxVisibleItems = 6;
  const dropdownMaxHeight = itemHeight * maxVisibleItems;
  
  return (
    <View style={styles.dropdownRootMini}>
      <TouchableOpacity
        style={styles.dropdownFieldMini}
        activeOpacity={0.8}
        onPress={() => setOpen(!open)}
      >
        <Text style={selected ? styles.dropdownTextMini : styles.dropdownPlaceholderMini} numberOfLines={1}>
          {selected || placeholder}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
      </TouchableOpacity>
      {open && (
        <View style={[styles.dropdownListMini, { maxHeight: dropdownMaxHeight }]}>
          <FlatList
            data={options}
            keyExtractor={(item, idx) => `${item}-${idx}`}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.dropdownItemMini, { height: itemHeight }]} 
                onPress={() => { onChange(item); setOpen(false); }}
              >
                <Text style={styles.dropdownItemTextMini}>{item}</Text>
              </TouchableOpacity>
            )}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            getItemLayout={(data, index) => ({
              length: itemHeight,
              offset: itemHeight * index,
              index,
            })}
          />
        </View>
      )}
    </View>
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
  backBtn: {
    width: 35, height: 35, alignItems: 'center', justifyContent: 'center'
  },
  title: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  subtitle: { color: '#ffffff', fontWeight: '600', fontSize: 12, marginTop: 2 },
  content: { padding: 16 },
  card: {
    backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 16, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardHeaderText: { marginLeft: 12, fontSize: 18, color: '#1F2937', fontWeight: '700' },
  dateText: { color: '#374151', fontWeight: '700', fontSize: 12 },
  row: { flexDirection: 'row' },
  label: { color: '#374151', fontWeight: '700', fontSize: 12, marginBottom: 6 },
  inputWrap: { flex: 1, marginTop: 6 },
  input: {
    backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 12, color: '#111827', fontSize: 14,
  },
  inputReadOnly: { backgroundColor: '#ffffff' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center' },
  readOnlyText: { color: '#111827', fontSize: 14 },
  tableFieldWrap: { position: 'relative', zIndex: 1000, elevation: 1000 },
  count: { alignSelf: 'flex-end', marginTop: 4, color: '#6B7280', fontSize: 12 },
  btn: { flex: 1, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnOutline: { borderWidth: 1, borderColor: '#E53935', backgroundColor: '#ffffff' },
  btnFilled: { backgroundColor: '#E53935' },
  btnText: { fontWeight: '700', fontSize: 14 },
  dropdownFieldBook: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  dropdownListBook: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    marginTop: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    elevation: 16,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    zIndex: 60,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 14, color: '#111827' },

  // Mini dropdown styled like select_outlet
  dropdownRootMini: { position: 'relative', zIndex: 1000 },
  dropdownFieldMini: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownTextMini: { color: '#111827', fontSize: 14, flex: 1 },
  dropdownPlaceholderMini: { color: '#6B7280', fontSize: 14, flex: 1 },
  dropdownListMini: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    marginTop: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    elevation: 1000,
    shadowColor: '#000', 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownItemMini: { 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9',
    justifyContent: 'center',
  },
  dropdownItemTextMini: { fontSize: 14, color: '#111827' },
});