import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const translateY = useRef(new Animated.Value(-600)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // animate logo similar to Android: drop + fade + scale with overshoot
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3500);
    return () => clearTimeout(timer);
  }, [opacity, scale, translateY]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Animated.Image
        source={require('../assets/images/logo.png')}
        style={[
          styles.logo,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  logo: {
    width: 220,
    height: 220,
  },
});

