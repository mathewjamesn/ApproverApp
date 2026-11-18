import { Alert, Linking } from 'react-native';

/** Asks whether to message a number over SMS or WhatsApp, then opens the chosen app. */
export const openMessageOptions = (phone: string) => {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  if (!digits) return;
  const wa = digits.replace(/^\+/, '').length === 10 ? `91${digits}` : digits.replace(/^\+/, '');
  Alert.alert('Send message', 'Choose how to message this number', [
    { text: 'SMS', onPress: () => Linking.openURL(`sms:${digits}`).catch(() => Alert.alert('No SMS app found')) },
    { text: 'WhatsApp', onPress: () => Linking.openURL(`https://wa.me/${wa}`).catch(() => Alert.alert('WhatsApp is not available')) },
    { text: 'Cancel', style: 'cancel' },
  ]);
};
