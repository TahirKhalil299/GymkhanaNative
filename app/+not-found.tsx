import { Stack, router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Not found', headerShown: false }} />
      <Text style={styles.title}>Unmatched Route</Text>
      <Text style={styles.subtitle}>Page could not be found.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/homedashboard')}>
        <Text style={styles.buttonText}>Go Home to mine</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F14', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#94A3B8', marginTop: 8 },
  button: { marginTop: 16, backgroundColor: '#D84315', paddingHorizontal: 18, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' }
});



