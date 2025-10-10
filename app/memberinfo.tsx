import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}) => (
  <View style={styles.sectionContainer}>
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.headerContent}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {isExpanded ? (
        <Feather name="chevron-up" size={24} color="#0891b2" />
      ) : (
        <Feather name="chevron-down" size={24} color="#0891b2" />
      )}
    </TouchableOpacity>
    {isExpanded && <View style={styles.sectionContent}>{children}</View>}
  </View>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const MemberInfo: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [expandedSections, setExpandedSections] = useState({
    personal: false,
    membership: false,
    family: false,
  });

  const [profile, setProfile] = useState({
    fatherName: "HAIDER ATIQ KHAN",
    dateOfBirth: "1970-01-01",
    cnic: "54400-0539719-5",
    phoneNumber: "0333-3873087",
    email: "Farruhatiq@gmail.com",
    gender: "Male",
    organization: "Services & General Administrative Department",
    address: "123, Shadman, GOR-3",
    name: "Capt Farrukh Atiq Khan. Retd.",
  });

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('profileData');
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    })();

    const sub = DeviceEventEmitter.addListener('profileUpdated', (updated: any) => {
      setProfile((prev) => ({
        ...prev,
        name: updated?.name ?? prev.name,
        phoneNumber: updated?.phoneNumber ?? prev.phoneNumber,
        email: updated?.email ?? prev.email,
        address: updated?.address ?? prev.address,
        organization: updated?.organization ?? prev.organization,
        gender: updated?.gender ?? prev.gender,
      }));
    });
    return () => sub.remove();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <SafeAreaProvider>
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity>
          <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarPlaceholder}>
          <Feather name="user" size={64} color="#0891b2" />
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/editprofile')}>
          <Text style={styles.editButtonText}>✎ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information Section */}
      <CollapsibleSection
        title="Personal Information"
        icon={<Feather name="user" size={20} color="#000" />}
        isExpanded={expandedSections.personal}
        onToggle={() => toggleSection('personal')}
      >
        <InfoRow label="Name" value={profile.name} />
        <InfoRow label="Date of Birth" value={profile.dateOfBirth} />
        <InfoRow label="CNIC" value={profile.cnic} />
        <InfoRow label="Phone Number" value={profile.phoneNumber} />
        <InfoRow label="Email" value={profile.email} />
        <InfoRow label="Gender" value={profile.gender} />
        <InfoRow label="Organization" value={profile.organization} />
        <InfoRow label="Address" value={profile.address} />
      </CollapsibleSection>

      {/* Membership Information Section */}
      <CollapsibleSection
        title="Membership Information"
        icon={<Feather name="users" size={20} color="#000" />}
        isExpanded={expandedSections.membership}
        onToggle={() => toggleSection('membership')}
      >
        <View style={styles.doubleRow}>
          <View style={styles.halfColumn}>
            <Text style={styles.fieldLabel}>Membership Status:</Text>
            <Text style={styles.fieldValue}>Active</Text>
          </View>
          <View style={styles.halfColumn}>
            <Text style={styles.fieldLabel}>Date of Membership:</Text>
            <Text style={styles.fieldValue}>2003-01-01</Text>
          </View>
        </View>
        <View style={styles.doubleRow}>
          <View style={styles.halfColumn}>
            <Text style={styles.fieldLabel}>Membership ID:</Text>
            <Text style={styles.fieldValue}>R-0050</Text>
          </View>
          <View style={styles.halfColumn}>
            <Text style={styles.fieldLabel}>Old Membership ID:</Text>
            <Text style={styles.fieldValue}>P-0894</Text>
          </View>
        </View>
      </CollapsibleSection>

      {/* Family Members Info Section */}
      <CollapsibleSection
        title="Family Members Info"
        icon={<Feather name="heart" size={20} color="#000" />}
        isExpanded={expandedSections.family}
        onToggle={() => toggleSection('family')}
      >
        <View style={styles.familyMemberCard}>
          <View style={styles.familyMemberInfo}>
            <Text style={styles.familyMemberName}>Ali</Text>
            <InfoRow label="Phone" value="03025656565" />
            <InfoRow label="CNIC" value="3120686868686" />
            <InfoRow label="DOB" value="2025-10-06" />
          </View>
          <View style={styles.familyMemberAvatar}>
            <Feather name="user" size={40} color="#0891b2" />
          </View>
          <Text style={styles.familyRelation}>son</Text>
        </View>
        <TouchableOpacity style={styles.addMembersButton}>
          <Text style={styles.addMembersText}>+ Add New Members</Text>
        </TouchableOpacity>
      </CollapsibleSection>

      <View style={{ height: 30 }} />
    </ScrollView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
    marginBottom: 0,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  doubleRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  halfColumn: {
    flex: 1,
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
  },
  familyMemberCard: {
    backgroundColor: '#f9fafb',
    borderLeftWidth: 4,
    borderLeftColor: '#0891b2',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyMemberInfo: {
    flex: 1,
  },
  familyMemberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  familyMemberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  familyRelation: {
    fontSize: 12,
    color: '#0891b2',
    fontWeight: '600',
    marginLeft: 8,
  },
  addMembersButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMembersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MemberInfo;