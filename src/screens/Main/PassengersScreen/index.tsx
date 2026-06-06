import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { passengerService, Passenger } from '../../../services/api/passengerService';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';

const CopyableText = ({ value, textStyle }: { value?: string, textStyle: any }) => {
  if (!value) return <Text style={textStyle}>--</Text>;
  const shortValue = value.length > 20 ? `${value.substring(0, 8)}...${value.substring(value.length - 8)}` : value;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
      <Text style={[textStyle, { flex: 0 }]} selectable={true}>{shortValue}</Text>
    </View>
  );
};

export default function PassengersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [phoneSearch, setPhoneSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [passenger, setPassenger] = useState<Passenger | null>(null);

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
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isBlocked = passenger?.temporarilyBlockedForCancellation || false;

  const handleSearch = async () => {
    if (!phoneSearch || phoneSearch.length < 10) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Invalid Input',
        description: 'Please enter a valid phone number.',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false }))
      });
      return;
    }

    Keyboard.dismiss();
    setIsSearching(true);
    setPassenger(null);
    try {
      const data = await passengerService.getPassengerByMobile(phoneSearch);
      if (data && data.mobileNumber) {
        setPassenger(data);
      } else {
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Not Found',
          description: 'No passenger found with this mobile number.',
          onAction: () => setFeedback(prev => ({ ...prev, visible: false }))
        });
      }
    } catch (error) {
      console.log('Search passenger error', error);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Search Failed',
        description: 'Unable to fetch passenger details.',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false }))
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setPhoneSearch('');
    setPassenger(null);
    Keyboard.dismiss();
  };

  const handleBlockConfirm = async () => {
    if (!passenger) return;
    setIsBlocking(true);
    try {
      await passengerService.blockPassenger(passenger.mobileNumber, !isBlocked);
      setPassenger({ ...passenger, temporarilyBlockedForCancellation: !isBlocked });
      setIsBlockModalVisible(false);
      setTimeout(() => {
        setFeedback({
          visible: true,
          type: 'success',
          title: 'Success',
          description: `Passenger has been successfully ${isBlocked ? 'unblocked' : 'blocked'}.`,
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }, 300);
    } catch (error) {
      console.log("Block error", error);
      setIsBlockModalVisible(false);
      setTimeout(() => {
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Error',
          description: `Failed to ${isBlocked ? 'unblock' : 'block'} passenger.`,
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }, 300);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleResetRideStatus = () => {
    if (!passenger) return;
    setFeedback({
      visible: true,
      type: 'confirm',
      title: 'Confirm Reset',
      description: `Are you sure you want to reset the ride status for ${passenger.firstName}?`,
      actionButtonText: 'Reset',
      cancelButtonText: 'Cancel',
      onCancelAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      onAction: async () => {
        setFeedback(prev => ({ ...prev, visible: false }));
        try {
          await passengerService.resetPassengerRideStatus(passenger.mobileNumber);
          setTimeout(() => {
            setFeedback({
              visible: true,
              type: 'success',
              title: 'Success',
              description: 'Passenger ride status reset successfully.',
              onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
            });
          }, 300);
        } catch (error) {
          console.log("Reset error", error);
          setTimeout(() => {
            setFeedback({
              visible: true,
              type: 'error',
              title: 'Error',
              description: 'Failed to reset ride status.',
              onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
            });
          }, 300);
        }
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!passenger) return;
    setIsDeleting(true);
    try {
      await passengerService.deletePassenger(passenger.id, passenger.partitionKey);
      setIsDeleteModalVisible(false);
      setPassenger(null);
      setTimeout(() => {
        setFeedback({
          visible: true,
          type: 'success',
          title: 'Success',
          description: 'Passenger deleted successfully.',
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }, 300);
    } catch (error) {
      console.log("Delete error", error);
      setIsDeleteModalVisible(false);
      setTimeout(() => {
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Error',
          description: 'Failed to delete passenger.',
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }, 300);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.textPrimary, fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Passengers</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Phone Number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={phoneSearch}
            onChangeText={setPhoneSearch}
            onSubmitEditing={handleSearch}
          />
          {phoneSearch.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.buttonText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isSearching}>
            {isSearching ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Search</Text>}
          </TouchableOpacity>
        </View>

        {passenger && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Overview</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{passenger.firstName} {passenger.lastName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>{passenger.mobileNumber}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{passenger.emailAddress || '--'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Profile Complete</Text>
                <Text style={styles.value}>{passenger.isProfileUpdateComplete ? 'Yes' : 'No'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{isBlocked ? 'Blocked' : 'Active'}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Passenger ID</Text>
                <CopyableText value={passenger.id} textStyle={styles.value} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip & Account Info</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Wallet Amount</Text>
                <Text style={[styles.value, { color: colors.primary }]}>₹{(passenger.currentWalletAmount || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Total Distance</Text>
                <Text style={styles.value}>{passenger.totalKilometersCompleted || 0} km</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Carbon Saved</Text>
                <Text style={styles.value}>{passenger.carbonUsageKg || 0} Kg</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Latest Trip ID</Text>
                <CopyableText value={passenger.latestTripId} textStyle={styles.value} />
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Cancellations Today</Text>
                <Text style={styles.value}>{passenger.rideCancelCountForTheDay}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Total Cancellations</Text>
                <Text style={styles.value}>{passenger.totalRideCancelCount}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danger Zone</Text>
              <View style={styles.dangerZone}>
                <TouchableOpacity
                  style={styles.dangerButton}
                // onPress={() => setIsBlockModalVisible(true)}
                >
                  <Text>🚫</Text>
                  <Text style={styles.dangerButtonText}>{isBlocked ? "Unblock Passenger" : "Block Passenger"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerButton}
                // onPress={handleResetRideStatus}
                >
                  <Text>🔄</Text>
                  <Text style={styles.dangerButtonText}>Reset Passenger</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={() => setIsDeleteModalVisible(true)}
                >
                  <Text>🗑️</Text>
                  <Text style={styles.dangerButtonText}>Delete Passenger</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={isBlockModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBlockModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', backgroundColor: colors.card, borderRadius: 16, padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>{isBlocked ? '✅' : '🚫'}</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
              Confirm {isBlocked ? 'Unblock' : 'Block'}
            </Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
              Are you sure you want to {isBlocked ? 'unblock' : 'block'} {passenger?.firstName}?
            </Text>

            <View style={{ flexDirection: 'row', width: '100%', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center' }}
                onPress={() => setIsBlockModalVisible(false)}
                disabled={isBlocking}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>Cancel</Text>
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

      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', backgroundColor: colors.card, borderRadius: 16, padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>⚠️</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
              Confirm Delete
            </Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
              Are you sure you want to permanently delete {passenger?.firstName}? This action cannot be undone.
            </Text>

            <View style={{ flexDirection: 'row', width: '100%', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center' }}
                onPress={() => setIsDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.danger, alignItems: 'center' }}
                onPress={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
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
