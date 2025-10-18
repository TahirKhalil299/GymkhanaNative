import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
// theme colors are set inline for this dialog's light design

export enum MemberType {
  CLUB_MEMBER = 'Club Member',
  GUEST = 'Guest',
}

export enum OrderType {
  DINING_IN = 'Dining In',
  TAKE_AWAY = 'TakeAway',
}

type Props = {
  visible: boolean;
  title?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  iconName?: keyof typeof Ionicons.glyphMap | null; // close icon override
  onConfirmClick?: (payload: {
    memberType: MemberType;
    membershipId: string;
    orderType: OrderType;
    guestName?: string;
    memberName?: string;
    memberDetail?: string;
  }) => void;
  onCancelClick?: () => void;
  isOutsideClickable?: boolean;
  isBackPressEnabled?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  titleColor?: string | null;
  onRequestClose?: () => void; // called on hardware back or system dismiss
};

const DEFAULT_TITLE = 'Enter Number to Continue';

export default function SelectMemberDialog({
  visible,
  title = DEFAULT_TITLE,
  cancelButtonText = 'Cancel',
  confirmButtonText = 'SEARCH',
  iconName = 'close',
  onConfirmClick,
  onCancelClick,
  isOutsideClickable = true,
  isBackPressEnabled = true,
  showCancelButton = true,
  showConfirmButton = true,
  titleColor = null,
  onRequestClose,
}: Props) {
  const colorScheme = useColorScheme();

  const [selectedMemberType, setSelectedMemberType] = useState<MemberType | null>(null);
  const [membershipId, setMembershipId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberDetail, setMemberDetail] = useState('');
  const [idValid, setIdValid] = useState<boolean | null>(null);
  const [guestName, setGuestName] = useState('');
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);
  const [openMemberType, setOpenMemberType] = useState(false);
  const [openOrderType, setOpenOrderType] = useState(false);
  const isConfirmEnabled = !!(
    selectedMemberType &&
    selectedOrderType &&
    membershipId.trim().length > 0 && idValid === true &&
    (selectedMemberType !== MemberType.GUEST || guestName.trim().length > 0) &&
    showConfirmButton
  );

  useEffect(() => {
    if (!visible) {
      setSelectedMemberType(null);
      setSelectedOrderType(null);
      setMembershipId('');
      setMemberName('');
      setMemberDetail('');
      setIdValid(null);
      setGuestName('');
      setOpenMemberType(false);
      setOpenOrderType(false);
    }
  }, [visible]);

  const containerColors = useMemo(
    () => ({
      // Force light design: white backgrounds and black text
      cardBackground: '#FFFFFF',
      appBackground: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#000000',
      buttonBackground: '#E53935', // accent
      buttonText: '#FFFFFF',
      optionDefault: '#FFFFFF',
      optionSelected: '#FFFFFF',
      optionSelectedBorder: '#E53935',
      outline: '#E5E7EB',
    }),
    []
  );

  const closeDialog = () => {
    onRequestClose?.();
  };

  const handleOutsidePress = () => {
    if (isOutsideClickable) {
      onCancelClick?.();
      closeDialog();
    }
  };

  const toggleMemberDropdown = () => {
    Keyboard.dismiss();
    setOpenMemberType(s => !s);
    setOpenOrderType(false);
  };

  const toggleOrderDropdown = () => {
    Keyboard.dismiss();
    setOpenOrderType(s => !s);
    setOpenMemberType(false);
  };

  const evaluateMemberId = (raw: string) => {
    const v = raw.trim().toUpperCase();
    if (v.length < 3) {
      setMemberName('');
      setMemberDetail('');
      setIdValid(null);
      return;
    }
    if (v === 'MEM123') {
      setMemberName('John Smith');
      setGuestName('');
      setMemberDetail('Premium Member');
      setIdValid(true);
      return;
    }
    if (v === 'MEM456') {
      setMemberName('Sarah Johnson');
      setMemberDetail('Standard Member');
      setIdValid(true);
      return;
    }
    if (v === 'AFF789') {
      setMemberName('Robert Brown');
      setMemberDetail('City Club');
      setIdValid(true);
      return;
    }
    setMemberName('');
    setMemberDetail('');
    setIdValid(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (isBackPressEnabled) {
          closeDialog();
        }
      }}
    >
      <Pressable style={styles.backdrop} onPress={handleOutsidePress}>
        <View />
      </Pressable>

      <View style={styles.centered} pointerEvents="box-none">
        <View
          style={[
            styles.card,
            { backgroundColor: containerColors.cardBackground },
          ]}
        >
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.title,
                { color: titleColor ?? containerColors.textPrimary },
              ]}
            >
              {title}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={closeDialog} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={(iconName ?? 'close') as any} size={22} color={containerColors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Member Type */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: containerColors.textPrimary }]}>Member Type</Text>
            <View style={styles.dropdownContainer}>
              <Pressable style={[styles.selectField, { borderColor: containerColors.outline }]} onPress={toggleMemberDropdown}>
                <Text style={[selectedMemberType ? styles.selectText : styles.selectPlaceholder, { color: containerColors.textPrimary }]}>
                  {selectedMemberType ?? 'Please Select'}
                </Text>
                <Ionicons name={openMemberType ? 'chevron-up' : 'chevron-down'} size={18} color={containerColors.textPrimary} />
              </Pressable>
              {openMemberType ? (
                <View style={[styles.dropdownMenuAbsolute, { borderColor: containerColors.outline }]}>
                  {[MemberType.CLUB_MEMBER, MemberType.GUEST].map(opt => (
                    <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => { setSelectedMemberType(opt); setOpenMemberType(false); }}>
                      <Text style={[styles.dropdownText, { color: containerColors.textPrimary }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          </View>

          {/* Membership ID (always shown) */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: containerColors.textPrimary }]}>Membership ID</Text>
            <TextInput
              placeholder="Enter Membership Number"
              placeholderTextColor="#9CA3AF"
              value={membershipId}
              onChangeText={(t) => { const up = t.toUpperCase(); setMembershipId(up); evaluateMemberId(up); }}
              style={styles.inputField}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {idValid === false ? (
              <Text style={styles.helperError}>Invalid ID. Please enter valid ID.</Text>
            ) : null}
          </View>

          {/* Guest Name (only when Guest selected) */}
          {selectedMemberType === MemberType.GUEST ? (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: containerColors.textPrimary }]}>Guest Name</Text>
              <TextInput
                placeholder="Enter Guest Name"
                placeholderTextColor="#9CA3AF"
                value={guestName}
                onChangeText={setGuestName}
                style={styles.inputField}
              />
            </View>
          ) : null}

          {/* Order Type */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: containerColors.textPrimary }]}>Order Type</Text>
            <View style={styles.dropdownContainer}>
              <Pressable style={[styles.selectField, { borderColor: containerColors.outline }]} onPress={toggleOrderDropdown}>
                <Text style={[selectedOrderType ? styles.selectText : styles.selectPlaceholder, { color: containerColors.textPrimary }]}>
                  {selectedOrderType ?? 'Please Select'}
                </Text>
                <Ionicons name={openOrderType ? 'chevron-up' : 'chevron-down'} size={18} color={containerColors.textPrimary} />
              </Pressable>
              {openOrderType ? (
                <View style={[styles.dropdownMenuAbsolute, { borderColor: containerColors.outline }]}>
                  {[OrderType.DINING_IN, OrderType.TAKE_AWAY].map(opt => (
                    <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => { setSelectedOrderType(opt); setOpenOrderType(false); }}>
                      <Text style={[styles.dropdownText, { color: containerColors.textPrimary }]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.buttonsRow}>
            {showCancelButton ? (
              <TouchableOpacity
                style={[styles.buttonOutlined, { borderColor: containerColors.outline }]}
                activeOpacity={0.8}
                onPress={() => {
                  onCancelClick?.();
                  closeDialog();
                }}
              >
                <Text style={[styles.buttonOutlinedText, { color: containerColors.buttonBackground }]}>{cancelButtonText}</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {showConfirmButton ? (
              <TouchableOpacity
                style={[
                  styles.buttonFilled,
                  {
                    backgroundColor: isConfirmEnabled ? containerColors.buttonBackground : '#F2B3AE',
                  },
                ]}
                activeOpacity={0.8}
                disabled={!isConfirmEnabled}
                onPress={() => {
                  if (isConfirmEnabled) {
                    if (selectedMemberType && selectedOrderType) {
                      onConfirmClick?.({
                        memberType: selectedMemberType,
                        membershipId: membershipId.trim(),
                        orderType: selectedOrderType,
                        guestName: selectedMemberType === MemberType.GUEST ? guestName.trim() : undefined,
                        memberName: selectedMemberType === MemberType.GUEST ? guestName.trim() : memberName,
                        memberDetail: selectedMemberType === MemberType.GUEST ? 'Guest' : memberDetail,
                      });
                    }
                    closeDialog();
                  }
                }}
              >
                <Text style={[styles.buttonFilledText, { color: containerColors.buttonText }]}>{showCancelButton || showConfirmButton ? (confirmButtonText ?? 'SEARCH') : 'OK'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  headerRow: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    paddingTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  fieldGroup: {
    marginHorizontal: 6,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  selectField: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectPlaceholder: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownMenuAbsolute: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 999,
    elevation: 8,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputField: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    color: '#000000',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 6,
    gap: 10,
  },
  buttonOutlined: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutlinedText: {
    fontSize: 13,
    fontWeight: '700',
  },
  buttonFilled: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFilledText: {
    fontSize: 13,
    fontWeight: '700',
  },
  helperError: { marginTop: 6, color: '#DC2626', fontSize: 12, fontWeight: '600' },
  helperValid: { marginTop: 6, color: '#059669', fontSize: 12, fontWeight: '600' },
});


