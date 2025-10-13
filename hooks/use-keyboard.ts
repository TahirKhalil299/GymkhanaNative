import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  duration: number;
  easing: string;
}

export const useKeyboard = () => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    duration: 0,
    easing: 'keyboard',
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardState({
          isVisible: true,
          height: e.endCoordinates.height,
          duration: e.duration || 250,
          easing: e.easing || 'keyboard',
        });
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e: KeyboardEvent) => {
        setKeyboardState({
          isVisible: false,
          height: 0,
          duration: e.duration || 250,
          easing: e.easing || 'keyboard',
        });
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  return keyboardState;
};

