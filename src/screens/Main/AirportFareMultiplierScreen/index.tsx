import React, { useState, useEffect } from 'react';
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
import { configService } from '../../../services/api/configService';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';

export default function AirportFareMultiplierScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [multiplier, setMultiplier] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

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

  useEffect(() => {
    fetchCurrentMultiplier();
  }, []);

  const fetchCurrentMultiplier = async () => {
    setIsFetching(true);
    try {
      const val = await configService.getAirportFareMultiplier();
      if (val) {
        setMultiplier(val);
      }
    } catch (err: any) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error',
        description: err.message || 'Failed to fetch current multiplier value',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleApply = async () => {
    const numValue = parseInt(multiplier, 10);
    if (isNaN(numValue) || numValue < 1 || numValue > 30) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Please enter a valid multiplier value between 1 and 30.',
      });
      return;
    }

    if (!authCode.trim()) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Auth code is required to apply changes.',
      });
      return;
    }

    setIsLoading(true);

    try {
      await configService.updateAirportFareMultiplier(multiplier);
      
      setFeedback({
        visible: true,
        type: 'success',
        title: 'Success',
        description: `Airport fare multiplier updated to ${multiplier}% successfully.`,
      });
    } catch (err: any) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Update Failed',
        description: err.message || 'Failed to update multiplier value. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiplierChange = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Validate string length so users don't type huge numbers before pressing submit
    if (cleaned.length > 2) return;

    setMultiplier(cleaned);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.textPrimary, fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Airport Fare Multiplier</Text>
        </View>

        {isFetching ? (
          <View style={[styles.content, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Fetching current value...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.label}>Multiplier Value (%)</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputPrefix}>
                <Text style={styles.inputPrefixText}>%</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="1 - 30"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={2}
                value={multiplier}
                onChangeText={handleMultiplierChange}
              />
            </View>
            <Text style={styles.hintText}>Value must be between 1 and 30</Text>

            <Text style={styles.label}>Auth Code</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputPrefix}>
                <Text style={styles.inputPrefixText}>🔒</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter auth code"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={authCode}
                onChangeText={setAuthCode}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && { opacity: 0.7 }]}
              onPress={handleApply}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <FeedbackBottomSheet
          visible={feedback.visible}
          onClose={() => {
            setFeedback(prev => ({ ...prev, visible: false }));
            if (feedback.type === 'success') {
              navigation.goBack();
            }
          }}
          type={feedback.type}
          title={feedback.title}
          description={feedback.description}
          showActionButton={true}
          onAction={() => {
            setFeedback(prev => ({ ...prev, visible: false }));
            if (feedback.type === 'success') {
              navigation.goBack();
            }
          }}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
