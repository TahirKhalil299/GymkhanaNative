import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
  icon: React.ReactNode;
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
      <View style={styles.iconWrap}>{icon}</View>
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
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />
      
      {/* Header */}
       <View style={styles.header}>
              <Text style={styles.headerTitle}>GymKhana</Text>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <MaterialIcons name="logout" size={20} color="#D84315" />
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
              icon={<Ionicons name="bed-outline" size={26} color="#D84315" />}
              title="Room Booking"
              description="Effortlessly book your preferred room"
              onPress={() => handleCardPress('Room Booking')}
            />
            <DashboardCard
              icon={<Ionicons name="receipt-outline" size={26} color="#D84315" />}
              title="View Bill"
              description="Track, manage, and organize your bills"
              onPress={() => handleCardPress('View Bill')}
            />
          </View>

          <View style={styles.row}>
            <DashboardCard
              icon={<Ionicons name="business-outline" size={26} color="#D84315" />}
              title="Facilities"
              description="Discover and utilize available amenities"
              onPress={() => handleCardPress('Facilities')}
            />
            <DashboardCard
              icon={<Ionicons name="fast-food-outline" size={26} color="#D84315" />}
              title="Take Away"
              description="Convenient grab-and-go dining options"
              onPress={() => handleCardPress('Take Away')}
            />
          </View>

          <View style={styles.row}>
            <DashboardCard
              icon={<Ionicons name="person-outline" size={26} color="#D84315" />}
              title="Profile"
              description="Customize and manage your personal preferences"
              onPress={() => handleCardPress('Profile')}
            />
            <DashboardCard
              icon={<Ionicons name="chatbubbles-outline" size={26} color="#D84315" />}
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
    backgroundColor: '#F8FAFC',
  },

   logoutBtn: {
   width: 36,
   height: 36,
   borderRadius: 18,
   backgroundColor: '#ffffff',
   alignItems: 'center',
   justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#D84315',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  powerIcon: {
    fontSize: 28,
    color: '#ff4444',
  },
  scrollView: {
    flex: 1,
  },
  heroBanner: {
    height: 150,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingLeft: 24,
    top:90
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  cardsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
    marginTop: 12,
  },

  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconWrap: { marginBottom: 8 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default MemberDashboard;