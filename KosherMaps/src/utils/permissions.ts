import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
} from 'react-native-permissions';
import { PermissionStatus } from '../types';

export class PermissionsService {
  private static mapPermissionResult(result: string): PermissionStatus {
    switch (result) {
      case RESULTS.GRANTED:
        return 'granted';
      case RESULTS.DENIED:
        return 'denied';
      case RESULTS.BLOCKED:
        return 'blocked';
      case RESULTS.UNAVAILABLE:
        return 'unavailable';
      default:
        return 'denied';
    }
  }

  static async checkLocationPermission(): Promise<PermissionStatus> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      const result = await check(permission);
      return this.mapPermissionResult(result);
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'denied';
    }
  }

  static async requestLocationPermission(): Promise<PermissionStatus> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      const result = await request(permission);
      return this.mapPermissionResult(result);
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return 'denied';
    }
  }

  static async requestBackgroundLocationPermission(): Promise<PermissionStatus> {
    try {
      // First ensure we have basic location permission
      const basicPermission = await this.requestLocationPermission();
      if (basicPermission !== 'granted') {
        return basicPermission;
      }

      // Request background location permission
      if (Platform.OS === 'android') {
        const result = await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
        return this.mapPermissionResult(result);
      } else if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
        return this.mapPermissionResult(result);
      }

      return 'unavailable';
    } catch (error) {
      console.error('Error requesting background location permission:', error);
      return 'denied';
    }
  }

  static async ensureLocationPermission(): Promise<boolean> {
    const currentStatus = await this.checkLocationPermission();
    
    if (currentStatus === 'granted') {
      return true;
    }

    if (currentStatus === 'denied') {
      const requestedStatus = await this.requestLocationPermission();
      return requestedStatus === 'granted';
    }

    if (currentStatus === 'blocked') {
      // Permission is blocked, need to guide user to settings
      return false;
    }

    return false;
  }

  static async openLocationSettings(): Promise<void> {
    try {
      await openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }

  static getLocationPermissionRationale(): string {
    return Platform.select({
      android: 
        'KosherMaps needs location access to show your position on the map and provide navigation directions.',
      ios: 
        'KosherMaps would like to access your location to show your position on the map and provide navigation directions.',
      default: 
        'Location access is required for navigation features.',
    });
  }

  static getBackgroundLocationRationale(): string {
    return Platform.select({
      android: 
        'KosherMaps needs background location access to continue navigation when the app is not in the foreground.',
      ios: 
        'KosherMaps would like to access your location always to provide continuous navigation even when the app is in the background.',
      default: 
        'Background location access allows continuous navigation.',
    });
  }
}