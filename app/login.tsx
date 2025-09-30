import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Image, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const STORAGE_KEYS = {
  isLoggedIn: 'isLoggedIn',
  rememberMe: 'rememberMe',
  savedUserId: 'savedUserId',
  savedPassword: 'savedPassword',
  userId: 'userId',
} as const;

export default function LoginScreen() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateUserId = useCallback((value: string) => {
    if (!value || value.trim().length === 0) return 'User ID cannot be empty';
    if (value.length < 3) return 'Please enter a valid user ID';
    if (value.length > 20) return 'Please enter a valid user ID';
    if (!/^[_A-Za-z][_A-Za-z0-9]*$/.test(value)) return 'Please enter a valid user ID';
    return null;
  }, []);

  const validatePassword = useCallback((value: string) => {
    if (!value || value.trim().length === 0) return 'Password cannot be empty';
    if (value.length < 3) return 'Password must be at least 3 characters';
    return null;
  }, []);

  const loadPrefs = useCallback(async () => {
    const [isLoggedIn, isInfoSelected, remember, savedUid, savedPwd] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.isLoggedIn),
      SecureStore.getItemAsync('is_info_selected'),
      SecureStore.getItemAsync(STORAGE_KEYS.rememberMe),
      SecureStore.getItemAsync(STORAGE_KEYS.savedUserId),
      SecureStore.getItemAsync(STORAGE_KEYS.savedPassword),
    ]);

    if (isLoggedIn === 'true') {
      if (isInfoSelected === 'true') {
        router.replace('/homedashboard');
      } else {
        router.replace('/select_outlet');
      }
      return;
    }

    if (remember === 'true') {
      setRememberMe(true);
      setUserId(savedUid ?? '');
      setPassword(savedPwd ?? '');
    }
  }, []);

  useEffect(() => {
    loadPrefs();
  }, [loadPrefs]);

  const onToggleRemember = useCallback(async () => {
    const next = !rememberMe;
    setRememberMe(next);
    await SecureStore.setItemAsync(STORAGE_KEYS.rememberMe, String(next));
  }, [rememberMe]);

  const simulateLogin = useCallback(async (uid: string, pwd: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    await SecureStore.setItemAsync(STORAGE_KEYS.isLoggedIn, 'true');
    await SecureStore.setItemAsync(STORAGE_KEYS.userId, uid);
    if (rememberMe) {
      await SecureStore.setItemAsync(STORAGE_KEYS.savedUserId, uid);
      await SecureStore.setItemAsync(STORAGE_KEYS.savedPassword, pwd);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.savedUserId);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.savedPassword);
    }
  }, [rememberMe]);

  const onLogin = useCallback(async () => {
    setEmailError(null);
    setPasswordError(null);

    const e = validateUserId(userId.trim());
    const p = validatePassword(password.trim());
    if (e || p) {
      setEmailError(e);
      setPasswordError(p);
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      await simulateLogin(userId.trim(), password.trim());
      router.replace('/select_outlet');
    } catch (err) {
      Alert.alert('Login failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [password, simulateLogin, userId, validatePassword, validateUserId]);

  const canSubmit = useMemo(() => !loading, [loading]);

  return (
    <View style={styles.root}>
      <Image source={require('../assets/images/android-icon-background.png')} style={styles.background} resizeMode="cover" />

      <View style={styles.contentWrapper}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.loginTitle}>Log In</Text>

        <FloatingLabelInput
          label="Enter user ID"
          value={userId}
          onChangeText={setUserId}
          leftIcon="person"
          errorText={emailError ?? undefined}
          autoCapitalize="none"
        />

        <FloatingLabelInput
          label="Enter password"
          value={password}
          onChangeText={setPassword}
          leftIcon="lock"
          rightIconToggle={true}
          secureEntry={!showPassword}
          onToggleSecure={() => setShowPassword(s => !s)}
          errorText={passwordError ?? undefined}
        />

        {/* Biometric toggle hidden to match Android layout (visibility="gone") */}
        <View style={styles.hiddenRow}>
          <Text style={styles.biometricText}>Enable Biometric Login</Text>
          <View style={styles.switchPlaceholder} />
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity disabled={!canSubmit} onPress={onLogin} style={[styles.primaryButton, !canSubmit && styles.disabledButton]}>
            <Text style={styles.primaryButtonText}>Log In</Text>
          </TouchableOpacity>
          {/* Sign Up is hidden in original layout */}
        </View>

        {/* Remember Me hidden in layout but kept for behavior */}
        <View style={styles.hiddenRow}>
          <Pressable onPress={onToggleRemember} style={styles.checkboxRow}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>Remember Me</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => { /* optional forgot password */ }} style={styles.forgotRow}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.06,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  logo: {
    width: 130,
    height: 90,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  welcome: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  loginTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  inputWrapper: {
    marginTop: 10,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 6,
    fontSize: 12,
  },
  biometricText: {
    color: '#666666',
  },
  switchPlaceholder: {
    width: 50,
    height: 28,
    backgroundColor: 'transparent',
  },
  hiddenRow: {
    display: 'none',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF5722',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#FF5722',
  },
  checkboxLabel: {
    color: '#1f2937',
  },
  forgotRow: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  forgotText: {
    color: '#666666',
    fontSize: 14,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type FloatingLabelInputProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIconToggle?: boolean;
  secureEntry?: boolean;
  onToggleSecure?: () => void;
  errorText?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function FloatingLabelInput(props: FloatingLabelInputProps) {
  const { label, value, onChangeText, leftIcon, rightIconToggle, secureEntry, onToggleSecure, errorText, autoCapitalize } = props;

  const [focused, setFocused] = useState(false);
  const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: focused || value.length > 0 ? 1 : 0,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [animated, focused, value]);

  const labelTop = animated.interpolate({ inputRange: [0, 1], outputRange: [14, -10] });
  const labelFontSize = animated.interpolate({ inputRange: [0, 1], outputRange: [14, 12] });
  const baseLeft = leftIcon ? 40 : 12;
  const labelLeft = animated.interpolate({ inputRange: [0, 1], outputRange: [baseLeft, 12] });
  const outlineColor = errorText ? '#ef4444' : focused ? '#FF5722' : '#d1d5db';
  const labelColor = errorText ? '#ef4444' : focused ? '#FF5722' : '#6b7280';

  return (
    <View style={{ marginTop: 10 }}>
      <View style={[stylesField.container, { borderColor: outlineColor }]}>        
        {leftIcon ? (
          <MaterialIcons name={leftIcon} size={20} color={errorText ? '#ef4444' : '#6b7280'} style={stylesField.leftIcon} />
        ) : null}
        <Animated.Text style={[stylesField.label, { top: labelTop, left: labelLeft as unknown as number, fontSize: labelFontSize as unknown as number, color: labelColor }]}>{label}</Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize={autoCapitalize}
          style={[stylesField.input, leftIcon ? { paddingLeft: 40 } : null, rightIconToggle ? { paddingRight: 44 } : null]}
        />
        {rightIconToggle ? (
          <Pressable onPress={onToggleSecure} hitSlop={8} style={stylesField.rightIconBtn}>
            <MaterialIcons name={secureEntry ? 'visibility' : 'visibility-off'} size={22} color={'#6b7280'} />
          </Pressable>
        ) : null}
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

const stylesField = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 52,
    justifyContent: 'center',
    overflow: 'visible',
  },
  label: {
    position: 'absolute',
    left: 12,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
    zIndex: 2,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    color: '#000000',
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -10,
  },
  rightIconBtn: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
});

