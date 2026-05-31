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
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';

export default function OTPScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const phone = route.params?.phone || '';
  const rawPhone = route.params?.rawPhone || '';
  const fcmToken = route.params?.fcmToken || '';
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    description?: string;
    onAction?: () => void;
  }>({
    visible: false,
    type: 'error',
    title: '',
  });

  const handleVerify = async () => {
    if (otp.length < 5) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Please enter a valid 5-digit OTP', // it says 4-digit in text but length check is < 5, so it's a 5-digit OTP
        onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      });
      return;
    }
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
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Error',
          description: 'Authorization token missing in response',
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }
    } catch (err: any) {
      console.log('OTP Verification Error', err);
      setIsLoading(false);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Verification Error',
        description: err.message || 'Verification failed. Please try again.',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                }}
                textAlign="center"
              />
            </View>

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

        <FeedbackBottomSheet
          visible={feedback.visible}
          onClose={() => setFeedback(prev => ({ ...prev, visible: false }))}
          type={feedback.type}
          title={feedback.title}
          description={feedback.description}
          showActionButton={true}
          onAction={feedback.onAction}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
