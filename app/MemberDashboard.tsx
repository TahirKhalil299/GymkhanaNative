import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DashboardCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </TouchableOpacity>
  );
};

const STORAGE = {
  selectedLocation: 'selectedLocation',
  selectedOutlet: 'selectedOutlet',
  selectedFinancialYear: 'selectedFinancialYear',
  lastLogoutTime: 'lastLogoutTime',
  userId: 'userId',
  isInfoSelected: 'is_info_selected',
  accountType: 'accountType',
} as const;

const MemberDashboard: React.FC = () => {
  const handleCardPress = (cardName: string) => {
    if (cardName === 'Room Booking') {
      router.push('/room_details');
      return;
    }
    if (cardName === 'View Bill') {
      router.push('/billdetails');
      return;
    }
    if (cardName === 'Profile') {
      router.push('/memberinfo');
      return;
    }
    if (cardName === 'Take Away') {
      router.push('/takeaway');
      return;
    }
    if (cardName === 'Feedback') {
      router.push('/feedbacklist');
      return;
    }
    console.log(`${cardName} pressed`);
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
      SecureStore.deleteItemAsync(STORAGE.accountType),
    ]);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
       <View style={styles.header}>
              <Text style={styles.headerTitle}>GymKhana</Text>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <MaterialIcons name="logout" size={25} color="#9c1c1cff" />
          </TouchableOpacity>
        </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
  source={require('../assets/images/main.jpg')}
  style={styles.heroImage}
/>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>Welcome To</Text>
            <Text style={styles.heroTitle}>GymKhana</Text>
          </View>
        </View>

        {/* Dashboard Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.row}>
            <DashboardCard
              icon="🛏️"
              title="Room Booking"
              description="Effortlessly book your preferred room"
              onPress={() => handleCardPress('Room Booking')}
            />
            <DashboardCard
              icon="🧾"
              title="View Bill"
              description="Track, manage, and organize your bills"
              onPress={() => handleCardPress('View Bill')}
            />
          </View>

          <View style={styles.row}>
            <DashboardCard
              icon="🏢"
              title="Facilities"
              description="Discover and utilize available amenities"
              onPress={() => handleCardPress('Facilities')}
            />
            <DashboardCard
              icon="🥡"
              title="Take Away"
              description="Convenient grab-and-go dining options"
              onPress={() => handleCardPress('Take Away')}
            />
          </View>

          <View style={styles.row}>
            <DashboardCard
              icon="👤"
              title="Profile"
              description="Customize and manage your personal preferences"
              onPress={() => handleCardPress('Profile')}
            />
            <DashboardCard
              icon="💬"
              title="Feedback"
              description="Share your thoughts and help us improve"
              onPress={() => handleCardPress('Feedback')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

   logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  powerIcon: {
    fontSize: 28,
    color: '#ff4444',
  },
  scrollView: {
    flex: 1,
  },
  heroBanner: {
    height: 200,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    paddingLeft: 24,
    top:110
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '400',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  cardsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },

  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MemberDashboard;