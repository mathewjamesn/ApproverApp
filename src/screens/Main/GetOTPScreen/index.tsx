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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { authService } from '../../../services/api/authService';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';

type UserType = 'Driver' | 'Passenger';

export default function GetOTPScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [phone, setPhone] = useState('');
  const [selectedType, setSelectedType] = useState<UserType>('Driver');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    description?: string;
  }>({
    visible: false,
    type: 'error',
    title: '',
  });

  const handleProceed = async () => {
    if (phone.length < 10) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Please enter a valid 10-digit phone number',
      });
      return;
    }

    setIsLoading(true);

    try {
      setGeneratedOtp(null);
      // Trigger API Call
      const res = await authService.getDriverPassengerOtp(phone, selectedType);
      
      let otpValue = null;
      if (res?.data?.otp) {
        otpValue = String(res.data.otp);
      } else if (res?.otp) {
        otpValue = String(res.otp);
      }

      if (otpValue) {
        setGeneratedOtp(otpValue);
      }
      
      setFeedback({
        visible: true,
        type: 'success',
        title: 'OTP Generated',
        description: otpValue 
          ? `Successfully generated OTP for ${selectedType}.`
          : `Successfully requested OTP for ${selectedType} with phone number +91 ${phone}`,
      });
    } catch (err: any) {
      console.log('error', err);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Invalid User',
        description: err.message || 'Failed to get OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.textPrimary, fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Get OTP</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentButton, selectedType === 'Driver' && styles.segmentButtonActive]}
              onPress={() => setSelectedType('Driver')}
            >
              <Text style={[styles.segmentText, selectedType === 'Driver' && styles.segmentTextActive]}>
                Driver
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, selectedType === 'Passenger' && styles.segmentButtonActive]}
              onPress={() => setSelectedType('Passenger')}
            >
              <Text style={[styles.segmentText, selectedType === 'Passenger' && styles.segmentTextActive]}>
                Passenger
              </Text>
            </TouchableOpacity>
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
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            onPress={handleProceed}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Get OTP</Text>
            )}
          </TouchableOpacity>

          {generatedOtp && (
            <View style={{ marginTop: 24, padding: 20, backgroundColor: colors.success + '15', borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.success + '40' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Generated OTP</Text>
              <Text selectable={true} style={{ fontSize: 36, fontWeight: '800', color: colors.success, letterSpacing: 8 }}>
                {generatedOtp}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 12 }}>Long press the number to copy</Text>
            </View>
          )}
        </View>

        <FeedbackBottomSheet
          visible={feedback.visible}
          onClose={() => setFeedback(prev => ({ ...prev, visible: false }))}
          type={feedback.type}
          title={feedback.title}
          description={feedback.description}
          showActionButton={true}
          onAction={() => setFeedback(prev => ({ ...prev, visible: false }))}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
