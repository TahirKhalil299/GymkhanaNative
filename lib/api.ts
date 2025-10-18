import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL || '';

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {}
  return config;
});

export const isApiConfigured = () => Boolean(baseURL);

export default api;


