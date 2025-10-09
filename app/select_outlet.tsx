import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORAGE = {
  selectedLocation: 'selectedLocation',
  selectedOutlet: 'selectedOutlet',
  selectedFinancialYear: 'selectedFinancialYear',
  lastLogoutTime: 'lastLogoutTime',
  userId: 'userId',
  isInfoSelected: 'is_info_selected',
} as const;

const LOCATION_OPTIONS = [
  'LGK - Club House',
  'LGK - Main Dining',
];

const OUTLET_OPTIONS = [
  'Restaurant',
  'Bar & Lounge',
  'Coffee Shop',
  'Pro Shop',
  'Spa & Wellness',
  'Banquet Hall',
  'Restaurant',
  'Bar & Lounge',
  'Coffee Shop',
  'Pro Shop',
  'Spa & Wellness',
  'Banquet Hall',
  'Restaurant',
  'Bar & Lounge',
  'Coffee Shop',
  'Pro Shop',
  'Spa & Wellness',
  'Banquet Hall',
];

const FY_OPTIONS = [
  'FY 2024 - 2025',
  'FY 2023 - 2024',
  'FY 2022 - 2023',
  'FY 2021 - 2022',
];

export default function SelectOutletScreen() {
  const { is_from_dashboard } = useLocalSearchParams<{ is_from_dashboard?: string }>();
  const isFromDashboard = is_from_dashboard === 'true';

  const [userName, setUserName] = useState('');
  const [location, setLocation] = useState('');
  const [outlet, setOutlet] = useState('');
  const [financialYear, setFinancialYear] = useState(FY_OPTIONS[0]);
  const [lastLogoutTime, setLastLogoutTime] = useState('Never logged out');
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const buttonShake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const [uid, savedLoc, savedOut, savedFy, lastLogout] = await Promise.all([
        SecureStore.getItemAsync(STORAGE.userId),
        SecureStore.getItemAsync(STORAGE.selectedLocation),
        SecureStore.getItemAsync(STORAGE.selectedOutlet),
        SecureStore.getItemAsync(STORAGE.selectedFinancialYear),
        SecureStore.getItemAsync(STORAGE.lastLogoutTime),
      ]);
      setUserName(uid || 'Guest User');
      if (savedLoc) setLocation(savedLoc);
      if (savedOut) setOutlet(savedOut);
      setFinancialYear(savedFy || FY_OPTIONS[0]);
      if (lastLogout) setLastLogoutTime(lastLogout); else setLastLogoutTime('Never logged out');
    })();
  }, []);

  const isValid = useMemo(() => {
    return LOCATION_OPTIONS.includes(location) && OUTLET_OPTIONS.includes(outlet) && FY_OPTIONS.includes(financialYear);
  }, [financialYear, location, outlet]);

  const showError = () => {
    Animated.sequence([
      Animated.timing(buttonShake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(buttonShake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(buttonShake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const onContinue = async () => {
    if (!isValid) {
      showError();
      return;
    }
    setLoading(true);
    await Promise.all([
      SecureStore.setItemAsync(STORAGE.selectedLocation, location),
      SecureStore.setItemAsync(STORAGE.selectedOutlet, outlet),
      SecureStore.setItemAsync(STORAGE.selectedFinancialYear, financialYear),
      SecureStore.setItemAsync(STORAGE.isInfoSelected, 'true'),
    ]);
    setTimeout(() => {
      setLoading(false);
      router.replace('/homedashboard');
    }, 600);
  };

  const onLogout = async () => {
    const now = new Date();
    const formatted = now.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    await SecureStore.setItemAsync(STORAGE.lastLogoutTime, formatted);
    await Promise.all([
      SecureStore.setItemAsync('isLoggedIn', 'false'),
      SecureStore.deleteItemAsync(STORAGE.userId),
      SecureStore.deleteItemAsync(STORAGE.selectedLocation),
      SecureStore.deleteItemAsync(STORAGE.selectedOutlet),
      SecureStore.deleteItemAsync(STORAGE.selectedFinancialYear),
      SecureStore.deleteItemAsync(STORAGE.isInfoSelected),
    ]);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TouchableWithoutFeedback onPress={() => setOpenDropdown(null)}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.topBar}>
          {!isFromDashboard ? (
            <View />
          ) : (
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Image source={require('../assets/images/ic_back_red.png')} style={{ width: 50, height: 50 }} resizeMode="contain" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Outlet Selection</Text>
          {!isFromDashboard ? (
            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Image source={require('../assets/images/logout.png')}  style={{ width: 25, height: 25, tintColor: 'red' }}  resizeMode="contain" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 30 }} />
          )}
        </View>

        <View style={styles.card}>
          <LinearGradient colors={["#F97316", "#FB923C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
            <Text style={styles.welcome}>Dear {userName}!</Text>
            <Text style={styles.systemTitle}>Welcome to LAHORE GYMKHANA POS System</Text>
            <View style={styles.infoStrip}>
              <Text style={styles.infoLabel}>Last Login Date/Time:</Text>
              <Text style={styles.infoValue}>{lastLogoutTime}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.cardWhite}>
          <Text style={styles.fieldLabel}>Location</Text>
          <Dropdown 
            id="location"
            value={location} 
            onChange={setLocation} 
            options={LOCATION_OPTIONS} 
            placeholder="Select Location"
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />

          <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Outlet</Text>
          <Dropdown 
            id="outlet"
            value={outlet} 
            onChange={setOutlet} 
            options={OUTLET_OPTIONS} 
            placeholder="---Please Select---"
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />

          <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Financial Year</Text>
          <Dropdown 
            id="financialYear"
            value={financialYear} 
            onChange={setFinancialYear} 
            options={FY_OPTIONS} 
            placeholder="FY 2024 - 2025"
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />

          <Animated.View style={{ transform: [{ translateX: buttonShake }] }}>
            <TouchableOpacity disabled={loading} style={styles.continueBtn} onPress={onContinue}>
              <Text style={styles.continueText}>{loading ? 'Loading...' : 'CONTINUE'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

type DropdownProps = { 
  id: string;
  value: string; 
  onChange: (v: string) => void; 
  options: string[]; 
  placeholder: string;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
};

function Dropdown({ id, value, onChange, options, placeholder, openDropdown, setOpenDropdown }: DropdownProps) {
  const isOpen = openDropdown === id;
  const selected = value || '';
  
  const handleToggle = () => {
    if (isOpen) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(id);
    }
  };

  const handleSelect = (item: string) => {
    onChange(item);
    setOpenDropdown(null);
  };

  return (
    <View style={styles.dropdownRoot}>
      <TouchableOpacity
        style={styles.dropdownField}
        activeOpacity={0.8}
        onPress={handleToggle}
      >
        <Text style={selected ? styles.dropdownText : styles.dropdownPlaceholder}>
          {selected || placeholder}
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownList}>
          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            {options.map((item, idx) => (
              <TouchableOpacity 
                key={`${item}-${idx}`}
                style={styles.dropdownItem} 
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scaffold: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#fff',
  },
  headerGradient: {
    padding: 24,
  },
  welcome: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  systemTitle: {
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  infoStrip: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#fff',
    opacity: 0.85,
    fontWeight: '600',
  },
  infoValue: {
    color: '#fff',
    fontWeight: '700',
  },
  cardWhite: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    padding: 24,
  },
  fieldLabel: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  dropdownRoot: {
    position: 'relative',
  },
  dropdownField: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  dropdownText: {
    color: '#111827',
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: '#6B7280',
    fontSize: 16,
  },
  dropdownList: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 20,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#111827',
  },
  continueBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FF5722',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

