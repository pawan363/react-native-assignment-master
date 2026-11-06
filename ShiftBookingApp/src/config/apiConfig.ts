import { Platform } from 'react-native';

/**
 * Single source of truth for API base URL configuration.
 *
 * - Android Emulator: 10.0.2.2 routes to the host machine's localhost.
 * - iOS Simulator / Web: localhost routes directly.
 * - Physical Device: Change to your machine's LAN IP, e.g. 'http://192.168.1.100:8080'.
 */
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080';
