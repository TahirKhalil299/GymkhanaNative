import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboard } from '../hooks/use-keyboard';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  keyboardVerticalOffset?: number;
  enableOnAndroid?: boolean;
}

export const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
  children,
  keyboardVerticalOffset = 0,
  enableOnAndroid = true,
  style,
  contentContainerStyle,
  ...props
}) => {
  const { isVisible: isKeyboardVisible, height: keyboardHeight } = useKeyboard();
  const insets = useSafeAreaInsets();

  const behavior = Platform.OS === 'ios' ? 'padding' : enableOnAndroid ? 'height' : undefined;
  const offset = Platform.OS === 'ios' ? keyboardVerticalOffset : 0;

  return (
    <KeyboardAvoidingView
      behavior={behavior}
      keyboardVerticalOffset={offset}
      style={[styles.container, style]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
          isKeyboardVisible
            ? { paddingBottom: Math.max(0, keyboardHeight - insets.bottom) }
            : { paddingBottom: 0 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
        scrollEnabled
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

