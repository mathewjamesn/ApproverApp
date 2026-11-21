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
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { authService } from '../../../services/api/authService';
import messaging from '@react-native-firebase/messaging';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';
import { useEnvironment } from '../../../context/EnvironmentContext';
import { EnvironmentType } from '../../../config/environment';

export default function LoginScreen({ navigation }: any) {

  const { colors } = useTheme();
  const { environment, setEnvironment, isEnvironmentReady } = useEnvironment();
  const styles = getStyles(colors);

  const [phone, setPhone] = useState('');
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

  const handleProceed = async () => {
    if (!isEnvironmentReady) {
      return;
    }

    if (phone.length < 10) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Please enter a valid 10-digit phone number',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    setIsLoading(true);

    try {
      await setEnvironment(environment);

      // Request FCM permission and get token
      let fcmToken = '';
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          // getToken can hang when the device can't reach Google's servers, so give up after 20 seconds.
          fcmToken = await Promise.race([
            messaging().getToken(),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error('Timed out getting the notification token')), 20000),
            ),
          ]);
        }
      } catch (e) {
        console.log('FCM Token error:', e);
      }

      if (!fcmToken) {
        setIsLoading(false);
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Notifications Unavailable',
          description:
            'Could not register this device for notifications. Check your internet connection and that notifications are allowed, then try again.',
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
        return;
      }

      // Trigger API Call
      const res = await authService.loginUser({
        mobileNumber: phone,
        countryCode: "91"
      });
      setIsLoading(false);

      // Navigate to OTP Screen
      navigation.navigate('OTP', { phone: `+91 ${phone}`, rawPhone: phone, fcmToken });
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Login Error',
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.innerContainer}>
          {/* Background Textures */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          <Text style={styles.branding}>GMTApprover</Text>

          <View style={styles.formContainer}>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter your phone number to login</Text>

            <View style={styles.environmentSection}>
              <Text style={styles.environmentLabel}>Select application type</Text>
              <View style={styles.environmentToggle}>
                {(['PRODUCTION', 'STAGING'] as EnvironmentType[]).map((item) => {
                  const isSelected = environment === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.environmentOption,
                        isSelected && styles.environmentOptionSelected,
                      ]}
                      onPress={() => setEnvironment(item)}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.environmentOptionText,
                          isSelected && styles.environmentOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, ''));
                }}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && { opacity: 0.7 }]}
              onPress={handleProceed}
              disabled={isLoading || !isEnvironmentReady}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Proceed</Text>
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
