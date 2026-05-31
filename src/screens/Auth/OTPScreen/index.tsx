import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { authService } from '../../../services/api/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OTPScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const phone = route.params?.phone || '';
  const rawPhone = route.params?.rawPhone || '';
  const fcmToken = route.params?.fcmToken || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 5) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        MobileNumber: rawPhone,
        DevicePlatform: "fcmv1",
        CountryCode: "91",
        DevicePnsHandle: fcmToken, // Passed from LoginScreen via Firebase Messaging
        Otp: otp,
        PartitionKey: "Kerala"
      };

      const res = await authService.verifyOtp(payload);

      // Extract headers from response (the backend returns them inside the data object)
      const headers = res?.headers || [];
      const authHeader = headers.find((h: any) => h.key === 'Authorization');
      const tokenString = authHeader?.value?.[0]; // e.g. "Bearer eyJhbG..."
      const token = tokenString ? tokenString.replace('Bearer ', '') : null;

      const signInUniqueIdHeader = headers.find((h: any) => h.key === 'SignInUniqueId');
      const signInUniqueId = signInUniqueIdHeader?.value?.[0];

      const customerCareUserIdHeader = headers.find((h: any) => h.key === 'CustomerCareUserId');
      const customerCareUserId = customerCareUserIdHeader?.value?.[0];

      setIsLoading(false);

      if (token) {
        // Save the extracted tokens to AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userPhone', rawPhone);
        if (signInUniqueId) await AsyncStorage.setItem('signInUniqueId', signInUniqueId);
        if (customerCareUserId) await AsyncStorage.setItem('customerCareUserId', customerCareUserId);

        // Reset stack and go to Main Tabs
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      } else {
        setError('Authorization token missing in response');
      }
    } catch (err: any) {
      console.log('OTP Verification Error', err);
      setIsLoading(false);
      setError(err.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.innerContainer}>
          {/* Background Textures */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          <Text style={styles.branding}>GMTApprover</Text>

          <View style={styles.formContainer}>
            <Text style={styles.headerTitle}>Verification</Text>
            <Text style={styles.subtitle}>Enter the 5-digit OTP sent to {phone}</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={5}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                textAlign="center"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && { opacity: 0.7 }]}
              onPress={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Verify & Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
