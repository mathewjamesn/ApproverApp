import { Platform, PermissionsAndroid } from 'react-native';

export interface PermissionResult {
  granted: boolean;
  neverAskAgain: boolean;
}

/**
 * Checks if CAMERA permission is already granted.
 * If not enabled, it requests the permission from the Android system to show the native prompt.
 * Returns granted status and whether it's permanently denied (neverAskAgain).
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') {
    return { granted: true, neverAskAgain: false };
  }

  try {
    const isGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    if (isGranted) {
      return { granted: true, neverAskAgain: false };
    }

    // Permission is not enabled - trigger the Android runtime permission popup
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return { granted: true, neverAskAgain: false };
    }

    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return { granted: false, neverAskAgain: true };
    }

    return { granted: false, neverAskAgain: false };
  } catch (error) {
    console.log('Camera permission request error:', error);
    return { granted: false, neverAskAgain: false };
  }
}

/**
 * Checks and requests gallery/photo permissions if needed.
 * Note: Android 13+ (API 33+) PhotoPicker does not require storage permissions.
 */
export async function requestGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const androidVersion = parseInt(String(Platform.Version), 10);
  if (androidVersion >= 33) {
    // Android 13+ PhotoPicker does not require permissions
    return true;
  }

  try {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );

    if (hasPermission) {
      return true;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.log('Gallery permission request error:', error);
    return true; // Let the picker attempt anyway
  }
}
