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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { notificationService } from '../../../services/api/notificationService';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';

export default function SendNotificationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [userType, setUserType] = useState<'Driver' | 'Passenger'>('Driver');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleSend = async () => {
    if (!title.trim()) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Please enter a notification title.',
      });
      return;
    }

    if (!message.trim()) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Please enter a notification message.',
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      Message: message,
      Title: title,
      ViewName: 'TOKNotification',
      // UserType: userType,
      // ImageForNotification: '',
      Tags: userType === 'Driver' ? ['AllTOKDrivers'] : ['AllTOKPassengers'],
      // DevicePlatform: 'fcmv1',
    };

    try {
      await notificationService.sendNotification(payload);

      setFeedback({
        visible: true,
        type: 'success',
        title: 'Success',
        description: 'Notification sent successfully.',
      });
    } catch (err: any) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Send Failed',
        description: err.message || 'Failed to send notification. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.textPrimary, fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Notification</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User Type Selection */}
          <Text style={styles.label}>Recipient Type</Text>
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              style={[
                styles.selectorOption,
                userType === 'Driver' && styles.selectorOptionActive,
              ]}
              onPress={() => setUserType('Driver')}
            >
              <Text
                style={[
                  styles.selectorOptionText,
                  userType === 'Driver' && styles.selectorOptionTextActive,
                ]}
              >
                🧑‍✈️ Driver
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectorOption,
                userType === 'Passenger' && styles.selectorOptionActive,
              ]}
              onPress={() => setUserType('Passenger')}
            >
              <Text
                style={[
                  styles.selectorOptionText,
                  userType === 'Passenger' && styles.selectorOptionTextActive,
                ]}
              >
                👥 Passenger
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <Text style={styles.label}>Title</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.inputPrefix}>
              <Text style={styles.inputPrefixText}>✏️</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter notification title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Message Textarea */}
          <Text style={styles.label}>Message</Text>
          <View style={styles.textAreaWrapper}>
            <View style={styles.inputPrefix}>
              <Text style={styles.inputPrefixText}>💬</Text>
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Enter notification message"
              placeholderTextColor={colors.textSecondary}
              multiline={true}
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            onPress={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send Notification</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

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
