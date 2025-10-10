// room_details.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    DeviceEventEmitter,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

interface BookingItem {
  id: string;
  roomType: string;
  roomNumber?: string;
  occupancy: string;
  dateRange: string;
  status: 'Pending' | 'Booked';
}

const RoomDetailsContent = () => {
  const insets = useSafeAreaInsets();

  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: '1',
      roomType: 'Deluxe',
      occupancy: 'Double Person',
      dateRange: '2025-10-08 - 2025-10-09',
      status: 'Pending',
    },
    {
      id: '2',
      roomType: 'Suite',
      occupancy: 'Double Person',
      dateRange: '2025-10-06 - 2025-10-07',
      status: 'Pending',
    },
    {
      id: '3',
      roomType: 'Suite',
      occupancy: 'Double Person',
      dateRange: '2025-10-09 - 2025-10-10',
      status: 'Pending',
    },
    {
      id: '4',
      roomType: 'Deluxe',
      roomNumber: 'Room C-6',
      occupancy: 'Double Person',
      dateRange: '2025-10-14 - 2025-10-23',
      status: 'Booked',
    },
    {
      id: '5',
      roomType: 'Suite',
      roomNumber: 'Room A-202',
      occupancy: 'null Person',
      dateRange: '04-10-2024 - 05-10-2024',
      status: 'Booked',
    },
  ]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('roomBooked', (booking: BookingItem) => {
      setBookings((prev) => [booking, ...prev]);
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header with safe area */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Booking</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabTextActive}>Room Booking Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Delux/Suite Details</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 } // Extra space for button
        ]}
        showsVerticalScrollIndicator={false}
      >
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.roomType}>{booking.roomType}</Text>
              <View style={[
                styles.statusBadge,
                booking.status === 'Booked' ? styles.bookedBadge : styles.pendingBadge
              ]}>
                <Icon 
                  name="file-text" 
                  size={14} 
                  color={booking.status === 'Booked' ? '#00a8cc' : '#ff9500'} 
                />
                <Text style={[
                  styles.statusText,
                  booking.status === 'Booked' ? styles.bookedText : styles.pendingText
                ]}>
                  {booking.status}
                </Text>
              </View>
            </View>

            {booking.roomNumber && (
              <Text style={styles.roomNumber}>{booking.roomNumber}</Text>
            )}

            <View style={styles.occupancyRow}>
              <Icon name="users" size={16} color="#00a8cc" />
              <Text style={styles.occupancy}>{booking.occupancy}</Text>
            </View>

            <Text style={styles.dateRange}>{booking.dateRange}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Book Now Button with safe area */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.bookButton} onPress={() => router.push('/room_book_details')}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RoomDetails = () => {
  return (
    <SafeAreaProvider>
      <RoomDetailsContent />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerPlaceholder: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tab: {
    marginRight: 24,
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00a8cc',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#00a8cc',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  pendingBadge: {
    backgroundColor: '#fff5e6',
  },
  bookedBadge: {
    backgroundColor: '#e6f7ff',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingText: {
    color: '#ff9500',
  },
  bookedText: {
    color: '#00a8cc',
  },
  roomNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  occupancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  occupancy: {
    fontSize: 14,
    color: '#00a8cc',
    fontWeight: '500',
  },
  dateRange: {
    fontSize: 13,
    color: '#999',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bookButton: {
    backgroundColor: '#00a8cc',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default RoomDetails;