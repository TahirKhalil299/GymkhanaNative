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
        <Stack.Screen name="MemberDashboard" options={{ title: 'Member', headerShown: false }} />
        <Stack.Screen name="book_order_input" options={{ title: 'Book Order', headerShown: false }} />
        <Stack.Screen name="course_menu_item" options={{ title: 'Course Menu', headerShown: false }} />
        <Stack.Screen name="cart" options={{ title: 'Cart', headerShown: false }} />
        <Stack.Screen name="room_details" options={{ title: 'Room Details', headerShown: false }} />
        <Stack.Screen name="room_book_details" options={{ title: 'Room Book Details', headerShown: false }} />
        <Stack.Screen name="billdetails" options={{ title: 'Bill Details', headerShown: false }} />
        <Stack.Screen name="memberinfo" options={{ title: 'Member Info', headerShown: false }} />
        <Stack.Screen name="editprofile" options={{ title: 'Edit Profile', headerShown: false }} />


      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
