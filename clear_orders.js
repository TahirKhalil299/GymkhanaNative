// Script to clear existing orders with doubled quantities
// Run this in your React Native app to clear the corrupted data

import AsyncStorage from '@react-native-async-storage/async-storage';

const clearCorruptedOrders = async () => {
  try {
    console.log('Clearing corrupted orders...');
    
    // Clear all orders
    await AsyncStorage.removeItem('allOrders');
    await AsyncStorage.removeItem('currentOrder');
    
    console.log('✅ All orders cleared successfully!');
    console.log('You can now create new orders without quantity doubling issues.');
    
  } catch (error) {
    console.error('❌ Error clearing orders:', error);
  }
};

// Uncomment the line below to run the clear function
// clearCorruptedOrders();

export default clearCorruptedOrders;

