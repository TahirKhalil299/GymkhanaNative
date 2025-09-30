import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORAGE = {
  selectedLocation: 'selectedLocation',
  selectedOutlet: 'selectedOutlet',
  selectedFinancialYear: 'selectedFinancialYear',
  lastLogoutTime: 'lastLogoutTime',
  userId: 'userId',
} as const;

export default function HomeDashboardScreen() {
  const [userName, setUserName] = useState('Guest User');
  const [location, setLocation] = useState('');
  const [outlet, setOutlet] = useState('');
  const [year, setYear] = useState('');

  const load = async () => {
    const [uid, loc, out, fy] = await Promise.all([
      SecureStore.getItemAsync(STORAGE.userId),
      SecureStore.getItemAsync(STORAGE.selectedLocation),
      SecureStore.getItemAsync(STORAGE.selectedOutlet),
      SecureStore.getItemAsync(STORAGE.selectedFinancialYear),
    ]);
    setUserName(uid || 'Guest User');
    setLocation(loc || '');
    setOutlet(out || '');
    setYear(fy || '');
  };

  useEffect(() => {
    load();
  }, []);

  const onLogout = async () => {
    const now = new Date();
    const formatted = now.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    await SecureStore.setItemAsync(STORAGE.lastLogoutTime, formatted);
    await SecureStore.setItemAsync('isLoggedIn', 'false');
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE.userId),
      SecureStore.deleteItemAsync(STORAGE.selectedLocation),
      SecureStore.deleteItemAsync(STORAGE.selectedOutlet),
      SecureStore.deleteItemAsync(STORAGE.selectedFinancialYear),
      SecureStore.deleteItemAsync('is_info_selected'),
    ]);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.scaffold} edges={['top','left','right']}>
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.userName}>Hi, {userName}</Text>
            <View style={styles.inlineRow}>
              <Text style={styles.outlet}>{outlet || '—'}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.location}>{location || '—'}</Text>
            </View>
            <Text style={styles.year}>{year || '—'}</Text>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <MaterialIcons name="logout" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <DashboardCard
          color="#7460EE"
          gradient={["#EEF0FF", "#F4F5FF"]}
          iconName="apartment"
          title="Select Outlet"
          titleColor="#7460EE"
          onPress={() => router.push({ pathname: '/select_outlet', params: { is_from_dashboard: 'true' } })}
        />

        <DashboardCard
          color="#87C06B"
          gradient={["#ECF8EA", "#F4FFF0"]}
          iconName="fact-check"
          title="Book Order"
          titleColor="#87C06B"
          onPress={() => Alert.alert('Book Order', 'Implement navigation to Book Order screen.')}
        />

        <DashboardCard
          color="#EF6D6E"
          gradient={["#FFE9EB", "#FFF4F5"]}
          iconName="assignment"
          title="Order Details"
          titleColor="#EF6D6E"
          onPress={() => Alert.alert('Order Details', 'Implement navigation to Order List screen.')}
        />

        <DashboardCard
          color="#4798E8"
          gradient={["#E9F3FF", "#F2F8FF"]}
          iconName="kitchen"
          title="Kitchen Display System"
          titleColor="#4798E8"
          onPress={() => Alert.alert('KDS', 'Implement navigation to KDS screen.')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type CardProps = { color: string; gradient: [string, string]; iconName: keyof typeof MaterialIcons.glyphMap; title: string; titleColor: string; onPress: () => void };

function DashboardCard({ color, gradient, iconName, title, titleColor, onPress }: CardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.cardSide, { backgroundColor: color }]} />
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardInner}>
        <View style={[styles.iconBadge, { borderColor: color }]}>
          <MaterialIcons name={iconName} size={20} color={color} />
        </View>
        <Text style={[styles.cardTitle, { color: titleColor }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scaffold: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#D84315',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  outlet: {
    color: '#ffffff',
    fontWeight: '600',
  },
  arrow: {
    color: '#ffffff',
    marginHorizontal: 6,
  },
  location: {
    color: '#ffffff',
    fontWeight: '700',
  },
  year: {
    marginTop: 2,
    color: '#ffffff',
    fontWeight: '700',
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    height: 85,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardSide: {
    width: 10,
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 15,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginLeft: 8,
  },
});

