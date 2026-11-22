import { Platform } from 'react-native';

const fallback = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';
export const API_URL = process.env.EXPO_PUBLIC_API_URL || fallback;
