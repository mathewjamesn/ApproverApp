import React, { useState, useEffect } from 'react';
import { openMessageOptions } from '../../../utils/messaging';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { driverService } from '../../../services/api/driverService';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';

export default function AddOnDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const vehicle = (route.params as any)?.vehicle || {};

  const [isLoadingDriver, setIsLoadingDriver] = useState(false);
  const [driverDetails, setDriverDetails] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [fullScreenImageURI, setFullScreenImageURI] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchDriver = async () => {
      const driverId = vehicle?.driverIdentifier;
      const partitionKey = vehicle?.partitionKey || 'Kerala';
      if (!driverId) return;
      setIsLoadingDriver(true);
      try {
        const details = await driverService.getDriverDetails(driverId, partitionKey);
        setDriverDetails(details);
      } catch (error) {
        console.log('Error fetching driver details for add-on:', error);
      } finally {
        setIsLoadingDriver(false);
      }
    };
    fetchDriver();
  }, [vehicle?.driverIdentifier, vehicle?.partitionKey]);

  const handleApprove = () => {
    setFeedback({
      visible: true,
      type: 'confirm',
      title: 'Confirm Approval',
      description: `Approve add-on vehicle ${vehicle.registrationNumber}? This action cannot be undone.`,
      actionButtonText: 'Approve',
      cancelButtonText: 'Cancel',
      onCancelAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      onAction: async () => {
        setFeedback(prev => ({ ...prev, visible: false }));
        setIsApproving(true);
        try {
          const result = await driverService.approveAddonVehicle(
            vehicle.id,
            vehicle.partitionKey || 'Kerala'
          );
          setTimeout(() => {
            setFeedback({
              visible: true,
              type: result?.addOnVehicleApproved ? 'success' : 'error',
              title: result?.addOnVehicleApproved ? 'Approved!' : 'Failed',
              description: result?.addOnVehicleApproved
                ? 'The add-on vehicle has been successfully approved.'
                : 'Could not approve the vehicle. Please try again.',
              onAction: () => {
                setFeedback(prev => ({ ...prev, visible: false }));
                if (result?.addOnVehicleApproved) navigation.goBack();
              },
            });
          }, 300);
        } catch (error) {
          console.log('Approve add-on error:', error);
          setTimeout(() => {
            setFeedback({
              visible: true,
              type: 'error',
              title: 'Error',
              description: 'Failed to approve the vehicle. Please try again.',
              onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
            });
          }, 300);
        } finally {
          setIsApproving(false);
        }
      },
    });
  };

  const styles = getStyles(colors);

  const driverName =
    [driverDetails?.firstName, driverDetails?.lastName].filter(Boolean).join(' ') || 'N/A';
  const driverPhone = driverDetails?.mobileNumber || driverDetails?.phone;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primaryText, fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add-On Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Vehicle identity card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>VEHICLE INFORMATION</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration No.</Text>
            <Text style={styles.infoValue}>{vehicle.registrationNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Make</Text>
            <Text style={styles.infoValue}>{vehicle.vehicleMake || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Model</Text>
            <Text style={styles.infoValue}>{vehicle.vehicleModel || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{vehicle.vehicleType || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{vehicle.category || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Colour</Text>
            <Text style={styles.infoValue}>{vehicle.colour || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Electric Vehicle</Text>
            <Text style={styles.infoValue}>{vehicle.isElectricVehicle ? 'Yes' : 'No'}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Region</Text>
            <Text style={styles.infoValue}>{vehicle.partitionKey || 'N/A'}</Text>
          </View>
        </View>

        {/* RC Document Image */}
        {vehicle.rcUrl ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>RC DOCUMENT</Text>
            <TouchableOpacity
              onPress={() => setFullScreenImageURI(vehicle.rcUrl)}
              style={{ width: '100%', alignItems: 'center', marginTop: 12 }}
            >
              <Image
                source={{ uri: vehicle.rcUrl }}
                style={styles.rcImage}
                resizeMode="contain"
              />
              <Text style={{ color: colors.primary, marginTop: 8, fontSize: 13 }}>
                Tap to view full size
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Driver Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>DRIVER INFORMATION</Text>
          {isLoadingDriver ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : driverDetails ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{driverName}</Text>
              </View>
              {driverPhone ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.infoValue}>{driverPhone}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(`tel:${driverPhone.replace(/[^\d+]/g, '')}`).catch(
                          err => console.log('Dialer error', err)
                        )
                      }
                      style={{ padding: 4 }}
                    >
                      <Text style={{ fontSize: 16 }}>📞</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        openMessageOptions(driverPhone.replace(/[^\d+]/g, ''))
                      }
                      style={{ padding: 4 }}
                    >
                      <Text style={{ fontSize: 16 }}>💬</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{driverDetails?.verificationStatus || 'N/A'}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Rating</Text>
                <Text style={styles.infoValue}>
                  ⭐{' '}
                  {driverDetails?.overAllRating !== undefined
                    ? Number(driverDetails.overAllRating).toFixed(1)
                    : '0.0'}{' '}
                  ({driverDetails?.totalRatingsReceived || 0} ratings)
                </Text>
              </View>
            </>
          ) : (
            <Text style={{ color: colors.textSecondary, marginTop: 12, marginBottom: 4 }}>
              {vehicle?.driverIdentifier
                ? 'Could not load driver details.'
                : 'No driver linked to this vehicle.'}
            </Text>
          )}
        </View>

        {/* Bottom padding for the sticky button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Approve button — sticky at bottom */}
      <View style={[styles.approveBar, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity
          style={[styles.approveButton, isApproving && { opacity: 0.7 }]}
          onPress={handleApprove}
          disabled={isApproving}
        >
          {isApproving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.approveButtonText}>✓  APPROVE</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Full-screen image viewer */}
      <Modal
        visible={!!fullScreenImageURI}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImageURI(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: (insets.top || 16) + 8, right: 16, zIndex: 10 }}
            onPress={() => setFullScreenImageURI(null)}
          >
            <Text style={{ color: '#fff', fontSize: 28 }}>✕</Text>
          </TouchableOpacity>
          {fullScreenImageURI && (
            <Image
              source={{ uri: fullScreenImageURI }}
              style={{ width: '95%', height: '80%' }}
              resizeMode="contain"
            />
          )}
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

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primaryText,
    },
    content: {
      padding: 20,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      flex: 1.5,
      textAlign: 'right',
    },
    rcImage: {
      width: '100%',
      height: 220,
      borderRadius: 10,
      backgroundColor: colors.background,
    },
    approveBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      paddingHorizontal: 20,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 8,
    },
    approveButton: {
      backgroundColor: colors.success,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    approveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
