// room_book_details.tsx
import { Feather as Icon, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    DeviceEventEmitter,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';


const RoomBookDetailsContent = () => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('Please Select');
  const [showDropdown, setShowDropdown] = useState(false);
  const [bookingFor, setBookingFor] = useState<'Member' | 'Guest'>('Guest');
  const [guestName, setGuestName] = useState('');
  const [guestCNIC, setGuestCNIC] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  const categories = ['Deluxe', 'Suite'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(selectedDate);
      setCheckOutDate(null);
      setSelectingCheckOut(true);
    } else if (selectedDate > checkInDate) {
      setCheckOutDate(selectedDate);
      setSelectingCheckOut(false);
    } else {
      setCheckInDate(selectedDate);
      setCheckOutDate(null);
      setSelectingCheckOut(true);
    }
  };

  const isDateBetween = (day: number): boolean => {
    if (!checkInDate || !checkOutDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date > checkInDate && date < checkOutDate;
  };

  const isDateSelected = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (checkInDate && date.toDateString() === checkInDate.toDateString()) return true;
    if (checkOutDate && date.toDateString() === checkOutDate.toDateString()) return true;
    return false;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D84315" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#D84315" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Booking</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Category Dropdown */}
        <View style={styles.section}>
          <Text style={styles.label}>Room Category</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdown(true)}
          >
            <Text
              style={[
                styles.dropdownText,
                selectedCategory === 'Please Select' && styles.placeholderText,
              ]}
            >
              {selectedCategory}
            </Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Calendar - Show when room type is selected */}
        {selectedCategory !== 'Please Select' && (
          <View style={styles.section}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                    )
                  }
                >
              <Icon name="chevron-left" size={24} color="#D84315" />
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>{monthName}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                    )
                  }
                >
              <Icon name="chevron-right" size={24} color="#D84315" />
                </TouchableOpacity>
              </View>

              {/* Day names */}
              <View style={styles.dayNamesContainer}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <Text key={day} style={styles.dayName}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar days */}
              <View style={styles.daysGrid}>
                {days.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      day === null && styles.emptyCell,
                      isDateSelected(day!) && styles.selectedDay,
                      isDateBetween(day!) && styles.betweenDay,
                    ]}
                    onPress={() => day !== null && handleDateSelect(day)}
                    disabled={day === null}
                  >
                    {day !== null && (
                      <Text
                        style={[
                          styles.dayText,
                          isDateSelected(day) && styles.selectedDayText,
                        ]}
                      >
                        {day}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date selection info */}
              {(checkInDate || checkOutDate) && (
                <View style={styles.dateInfoContainer}>
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Check In:</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(checkInDate)}
                    </Text>
                  </View>
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Check Out:</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(checkOutDate)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Booking For */}
        <View style={styles.section}>
          <Text style={styles.label}>Booking For</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setBookingFor('Member')}
            >
              <View style={styles.radioOuter}>
                {bookingFor === 'Member' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Member</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setBookingFor('Guest')}
            >
              <View style={styles.radioOuter}>
                {bookingFor === 'Guest' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Guest</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guest Fields (shown when Guest is selected) */}
        {bookingFor === 'Guest' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Guest Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Guest Name"
                placeholderTextColor="#ccc"
                value={guestName}
                onChangeText={setGuestName}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Guest CNIC</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Guest CNIC"
                placeholderTextColor="#ccc"
                value={guestCNIC}
                onChangeText={setGuestCNIC}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Guest Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Guest Mobile Number"
                placeholderTextColor="#ccc"
                value={guestMobile}
                onChangeText={setGuestMobile}
                keyboardType="phone-pad"
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>Rs 0</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            if (selectedCategory === 'Please Select' || !checkInDate || !checkOutDate) {
              // minimal guard; in real app show toast/validation
              return;
            }
            const newBooking = {
              id: String(Date.now()),
              roomType: selectedCategory,
              occupancy: bookingFor === 'Member' ? 'Member' : 'Guest',
              dateRange: `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`,
              status: 'Pending' as const,
            };
            DeviceEventEmitter.emit('roomBooked', newBooking);
            router.back();
          }}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderText}>Room Category</Text>
            </View>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const RoomBookDetails = () => {
  return (
    <SafeAreaProvider>
      <RoomBookDetailsContent />
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
    backgroundColor: '#D84315',
    borderBottomWidth: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D84315',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dayNamesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  selectedDay: {
    backgroundColor: '#D84315',
    borderRadius: 6,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  betweenDay: {
    backgroundColor: '#fde7e0',
    borderRadius: 4,
  },
  dateInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D84315',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 40,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D84315',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D84315',
  },
  radioLabel: {
    fontSize: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D84315',
  },
  bookButton: {
    backgroundColor: '#D84315',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  dropdownHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
});

export default RoomBookDetails;