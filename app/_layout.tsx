import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="splash">
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
        <Stack.Screen name="select_outlet" options={{ title: 'Select Outlet', headerShown: false }} />
        <Stack.Screen name="homedashboard" options={{ title: 'Home', headerShown: false }} />
        <Stack.Screen name="book_order_input" options={{ title: 'Book Order', headerShown: false }} />
        <Stack.Screen name="course_menu_item" options={{ title: 'Course Menu', headerShown: false }} />


      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
