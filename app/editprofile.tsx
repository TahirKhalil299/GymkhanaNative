import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

interface DropdownOption {
  label: string;
  value: string;
}

const genderOptions: DropdownOption[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

// removed unused Dropdown interface

const EditProfileInner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const [formData, setFormData] = useState({
    name: 'Tahir',
    phoneNumber: '03333873087',
    email: 'tahir@gmail.com',
    address: '123, Model Town',
    organization: 'Soft Consults',
    gender: 'Male',
  });

  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('profileData');
        if (stored) {
          const parsed = JSON.parse(stored);
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    })();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenderSelect = (option: DropdownOption) => {
    setFormData((prev) => ({
      ...prev,
      gender: option.label,
    }));
    setDropdownVisible(false);
  };

  // removed unused handleViewOrder

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', default: 'height' })}
      keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 }) as number}
    >
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header with back and placeholder icon */}
      <View style={[styles.headerRow, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#D84315" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={36} color="#fff" />
          </View>
        </View>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        {/* Name Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            editable
            onFocus={() => setTimeout(() => scrollRef.current?.scrollTo({ y: 120, animated: true }), 50)}
          />
        </View>

        {/* Phone Number Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor="#999"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            keyboardType="phone-pad"
            onFocus={() => setTimeout(() => scrollRef.current?.scrollTo({ y: 200, animated: true }), 50)}
          />
        </View>

        {/* Email Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            onFocus={() => setTimeout(() => scrollRef.current?.scrollTo({ y: 280, animated: true }), 50)}
          />
        </View>

        {/* Address Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter address"
            placeholderTextColor="#999"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            onFocus={() => setTimeout(() => scrollRef.current?.scrollTo({ y: 360, animated: true }), 50)}
          />
        </View>

        {/* Organization Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Organization</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter organization"
            placeholderTextColor="#999"
            value={formData.organization}
            onChangeText={(value) => handleInputChange('organization', value)}
            editable={false}
            onFocus={() => setTimeout(() => scrollRef.current?.scrollTo({ y: 420, animated: true }), 50)}
          />
        </View>

        {/* Gender Dropdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownVisible(!dropdownVisible)}
            activeOpacity={0.7}
            onPressIn={() => setTimeout(() => scrollRef.current?.scrollTo({ y: 480, animated: true }), 50)}
          >
            <Text style={styles.dropdownText}>{formData.gender}</Text>
            <Feather
              name="chevron-down"
              size={20}
              color="#D84315"
              style={{ transform: [{ rotate: dropdownVisible ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {dropdownVisible && (
            <View style={styles.dropdownMenu}>
              {genderOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownMenuItem,
                    index !== genderOptions.length - 1 &&
                      styles.dropdownMenuItemBorder,
                  ]}
                  onPress={() => handleGenderSelect(option)}
                >
                  <Text style={styles.dropdownMenuItemText}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Save Profile Button */}
        <TouchableOpacity
          style={styles.viewOrderButton}
          onPress={() => {
            DeviceEventEmitter.emit('profileUpdated', formData);
            // persist for next open
            SecureStore.setItemAsync('profileData', JSON.stringify(formData)).catch(() => {});
            router.back();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.viewOrderButtonText}>SAVE PROFILE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const EditProfile: React.FC = () => {
  return (
    <SafeAreaProvider>
      <EditProfileInner />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#D84315',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    backgroundColor: '#D84315',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D84315',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 0,
    backgroundColor: '#e8eef4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownButton: {
    backgroundColor: '#e8eef4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D84315',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D84315',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  dropdownMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownMenuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownMenuItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  viewOrderButton: {
    backgroundColor: '#D84315',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#D84315',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default EditProfile;