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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { configService } from '../../../services/api/configService';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';

export default function FareMultiplierScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [vehicleType, setVehicleType] = useState<'Car' | 'Auto'>('Car');
  const [actionType, setActionType] = useState<'Increase' | 'Decrease'>('Increase');
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [multiplier, setMultiplier] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingLocations, setIsFetchingLocations] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

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
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsFetchingLocations(true);
    try {
      const fetchedLocations = await configService.getConfigurationPartitionKeys();
      setLocations(fetchedLocations || []);
      // Pre-select the first location if available
      if (fetchedLocations && fetchedLocations.length > 0) {
        setSelectedLocation(fetchedLocations[0]);
      }
    } catch (err: any) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Fetch Error',
        description: err.message || 'Failed to fetch locations list.',
      });
    } finally {
      setIsFetchingLocations(false);
    }
  };

  const handleApply = async () => {
    if (!selectedLocation) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Please select a location.',
      });
      return;
    }

    const numValue = parseInt(multiplier, 10);
    if (isNaN(numValue) || numValue < 0 || numValue > 99) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Please enter a valid multiplier value between 0 and 80.',
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

    const calculatedValue = actionType === 'Increase' ? 1 + numValue / 100 : 1 - numValue / 100;
    const percentageSelected = parseFloat(calculatedValue.toFixed(2)).toString();

    try {
      await configService.updateOverallMultiplier(
        vehicleType,
        percentageSelected,
        selectedLocation,
        authCode
      );

      setFeedback({
        visible: true,
        type: 'success',
        title: 'Success',
        description: `${vehicleType} fare multiplier updated by ${actionType === 'Increase' ? '+' : '-'}${multiplier}% (${percentageSelected}) for ${selectedLocation} successfully.`,
      });
    } catch (err: any) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Update Failed',
        description: err.message || 'Failed to update overall multiplier. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiplierChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Limit string length (max 2 digits for 0-80 range)
    if (cleaned.length > 2) return;

    setMultiplier(cleaned);
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setIsDropdownOpen(false);
    }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.textPrimary, fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fare Multiplier</Text>
        </View>

        {isFetchingLocations ? (
          <View style={[styles.content, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading locations...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Vehicle Type Selection */}
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.selectorContainer}>
              <TouchableOpacity
                style={[
                  styles.selectorOption,
                  vehicleType === 'Car' && styles.selectorOptionActive,
                ]}
                onPress={() => setVehicleType('Car')}
              >
                <Text
                  style={[
                    styles.selectorOptionText,
                    vehicleType === 'Car' && styles.selectorOptionTextActive,
                  ]}
                >
                  🚙 Car
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectorOption,
                  vehicleType === 'Auto' && styles.selectorOptionActive,
                ]}
                onPress={() => setVehicleType('Auto')}
              >
                <Text
                  style={[
                    styles.selectorOptionText,
                    vehicleType === 'Auto' && styles.selectorOptionTextActive,
                  ]}
                >
                  🛺 Auto
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Selection (Increase / Decrease) */}
            <Text style={styles.label}>Action</Text>
            <View style={styles.selectorContainer}>
              <TouchableOpacity
                style={[
                  styles.selectorOption,
                  actionType === 'Increase' && styles.selectorOptionActive,
                ]}
                onPress={() => setActionType('Increase')}
              >
                <Text
                  style={[
                    styles.selectorOptionText,
                    actionType === 'Increase' && styles.selectorOptionTextActive,
                  ]}
                >
                  📈 Increase
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectorOption,
                  actionType === 'Decrease' && styles.selectorOptionActive,
                ]}
                onPress={() => setActionType('Decrease')}
              >
                <Text
                  style={[
                    styles.selectorOptionText,
                    actionType === 'Decrease' && styles.selectorOptionTextActive,
                  ]}
                >
                  📉 Decrease
                </Text>
              </TouchableOpacity>
            </View>

            {/* Location Selection Dropdown */}
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <View style={styles.dropdownTriggerContent}>
                <Text
                  style={
                    selectedLocation
                      ? styles.dropdownTriggerText
                      : styles.dropdownTriggerPlaceholder
                  }
                >
                  {selectedLocation || 'Select Location'}
                </Text>
                <Text style={styles.dropdownChevron}>{isDropdownOpen ? '▲' : '▼'}</Text>
              </View>
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownListContainer}>
                <ScrollView
                  style={styles.dropdownScroll}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {locations.map((loc, idx) => {
                    const isActive = selectedLocation === loc;
                    const isLast = idx === locations.length - 1;
                    return (
                      <TouchableOpacity
                        key={loc}
                        style={[
                          styles.dropdownOption,
                          isActive && styles.dropdownOptionActive,
                          isLast && styles.dropdownOptionLast,
                        ]}
                        onPress={() => {
                          setSelectedLocation(loc);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            isActive && styles.dropdownOptionTextActive,
                          ]}
                        >
                          📍 {loc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {locations.length === 0 && (
                    <View style={styles.dropdownOption}>
                      <Text style={{ color: colors.textSecondary }}>No locations found</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            {/* Multiplier Value */}
            <Text style={styles.label}>Multiplier Value (%)</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputPrefix}>
                <Text style={styles.inputPrefixText}>%</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="0 - 99"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={2}
                value={multiplier}
                onChangeText={handleMultiplierChange}
              />
            </View>
            <Text style={styles.hintText}>Value must be between 0 and 80</Text>

            {/* Auth Code */}
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

            {/* Apply Button */}
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
          </ScrollView>
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
