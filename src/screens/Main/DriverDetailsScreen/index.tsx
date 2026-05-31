import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { driverService } from '../../../services/api/driverService';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';

export default function DriverDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const driverName = (route.params as any)?.driverName || 'Unknown Driver';
  const driverStatus = (route.params as any)?.status || 'Pending';
  const driverId = (route.params as any)?.id;
  const partitionKey = (route.params as any)?.partitionKey || 'Kerala';

  const [isLoading, setIsLoading] = useState(true);
  const [driverDetails, setDriverDetails] = useState<any>(null);
  const [driverDocuments, setDriverDocuments] = useState<any>(null);

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    description?: string;
    onAction?: () => void;
    actionButtonText?: string;
    cancelButtonText?: string;
    onCancelAction?: () => void;
  }>({
    visible: false,
    type: 'success',
    title: '',
  });

  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const isBlocked = driverDetails?.temporarilyBlockedForCancellation || false;

  const handleBlockConfirm = async () => {
    const phone = driverDetails?.mobileNumber || driverDetails?.phone;
    if (!phone) {
      setIsBlockModalVisible(false);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error',
        description: 'Driver phone number not found.',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    setIsBlocking(true);
    try {
      await driverService.blockDriver(phone, !isBlocked);
      setDriverDetails({ ...driverDetails, temporarilyBlockedForCancellation: !isBlocked });
      setIsBlockModalVisible(false);
      setTimeout(() => {
        setFeedback({
          visible: true,
          type: 'success',
          title: 'Success',
          description: `Driver has been successfully ${isBlocked ? 'unblocked' : 'blocked'}.`,
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }, 300);
    } catch (error) {
      console.log("Block driver error:", error);
      setIsBlockModalVisible(false);
      setTimeout(() => {
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Error',
          description: `Failed to ${isBlocked ? 'unblock' : 'block'} driver. Please try again.`,
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }, 300);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleResetRideStatus = () => {
    const phone = driverDetails?.mobileNumber || driverDetails?.phone;
    if (!phone) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error',
        description: 'Driver phone number not found.',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    setFeedback({
      visible: true,
      type: 'confirm',
      title: 'Confirm Reset',
      description: `Are you sure you want to reset the ride status for ${driverName}? This will reset any active rides they are stuck on.`,
      actionButtonText: 'Reset',
      cancelButtonText: 'Cancel',
      onCancelAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      onAction: async () => {
        setFeedback(prev => ({ ...prev, visible: false }));
        try {
          await driverService.resetDriverRideStatus(phone);
          setTimeout(() => {
            setFeedback({
              visible: true,
              type: 'success',
              title: 'Success',
              description: 'Driver ride status has been reset successfully.',
              onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
            });
          }, 300);
        } catch (error) {
          console.log("Reset ride status error:", error);
          setTimeout(() => {
            setFeedback({
              visible: true,
              type: 'error',
              title: 'Error',
              description: 'Failed to reset driver ride status. Please try again.',
              onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
            });
          }, 300);
        }
      }
    });
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!driverId) {
        setIsLoading(false);
        return;
      }
      try {
        const [details, docs] = await Promise.all([
          driverService.getDriverDetails(driverId, partitionKey),
          driverService.getDriverDocuments(driverId, partitionKey)
        ]);
        setDriverDetails(details);
        setDriverDocuments(docs);
      } catch (error) {
        console.log("Error fetching driver data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [driverId, partitionKey]);

  const formatInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const actions = [
    { id: 'verification', title: 'View Details', icon: '🔍' },
    { id: 'locate', title: 'Locate Driver', icon: '📍' },
    { id: 'test_ride', title: 'Test Ride', icon: '🚗' },
    { id: 'change_rc', title: 'Change RC', icon: '📄' },
    { id: 'payment', title: 'Approve Payment', icon: '💳' },
    { id: 'preference', title: 'Driver Preference', icon: '⚙️' },
    { id: 'reset', title: 'Reset Driver', icon: '🔄' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: colors.primaryText, fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Details</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileSection}>
            {driverDocuments?.profilePhoto ? (
              <Image
                source={{ uri: driverDocuments.profilePhoto }}
                style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 16 }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{formatInitials(driverName)}</Text>
              </View>
            )}
            <Text style={styles.driverName}>{driverName}</Text>
            <Text style={styles.driverStatus}>{driverStatus}</Text>
          </View>

          <Text style={styles.sectionTitle}>Management Actions</Text>
          <View style={styles.actionsGrid}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionButton}
                onPress={() => {
                  if (action.id === 'verification') {
                    (navigation.navigate as any)('DriverVerificationDetails', {
                      driverName: driverName,
                      status: driverStatus,
                      id: driverId,
                      partitionKey: partitionKey
                    });
                  } else if (action.id === 'reset') {
                    handleResetRideStatus();
                  }
                }}
              >
                <View style={styles.actionIconBox}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.dangerZone}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => setIsBlockModalVisible(true)}
            >
              <Text>🚫</Text>
              <Text style={styles.dangerButtonText}>{isBlocked ? "Unblock Driver" : "Block Driver"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dangerButton, { marginBottom: 40 }]}>
              <Text>🗑️</Text>
              <Text style={styles.dangerButtonText}>Delete Driver</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}

      <Modal
        visible={isBlockModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBlockModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', backgroundColor: colors.card, borderRadius: 16, padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>{isBlocked ? '✅' : '🚫'}</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
              Confirm {isBlocked ? 'Unblock' : 'Block'}
            </Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
              Are you sure you want to {isBlocked ? 'unblock' : 'block'} {driverName}? {isBlocked ? 'This action will allow them to accept new trips.' : 'This action will prevent them from accepting new trips.'}
            </Text>

            <View style={{ flexDirection: 'row', width: '100%', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center' }}
                onPress={() => setIsBlockModalVisible(false)}
                disabled={isBlocking}
              >
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: isBlocked ? colors.success : colors.danger, alignItems: 'center' }}
                onPress={handleBlockConfirm}
                disabled={isBlocking}
              >
                {isBlocking ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isBlocked ? 'Unblock' : 'Block'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FeedbackBottomSheet
        visible={feedback.visible}
        onClose={() => setFeedback(prev => ({ ...prev, visible: false }))}
        type={feedback.type}
        title={feedback.title}
        description={feedback.description}
        showActionButton={true}
        onAction={feedback.onAction}
        actionButtonText={feedback.actionButtonText}
        cancelButtonText={feedback.cancelButtonText}
        onCancelAction={feedback.onCancelAction}
      />
    </View>
  );
}
