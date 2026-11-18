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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { driverService } from '../../../services/api/driverService';

export default function DriverViewDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const routeDriverName = (route.params as any)?.driverName || 'Driver Details';
  const driverStatus = (route.params as any)?.status || 'Approved';
  const driverId = (route.params as any)?.id;
  const partitionKey = (route.params as any)?.partitionKey || 'Kerala';

  const [isLoading, setIsLoading] = useState(true);
  const [driverDetails, setDriverDetails] = useState<any>(null);
  const [driverDocuments, setDriverDocuments] = useState<any>(null);
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);
  const [fullScreenImageURI, setFullScreenImageURI] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllDetails = async () => {
      if (!driverId) {
        setIsLoading(false);
        return;
      }
      try {
        const [details, docs] = await Promise.all([
          driverService.getDriverDetails(driverId, partitionKey),
          driverService.getDriverDocuments(driverId, partitionKey),
        ]);
        setDriverDetails(details);
        setDriverDocuments(docs);

        const vehicleId = details?.currentAssociatedVehicleIdentifier;
        if (vehicleId) {
          try {
            const vDetails = await driverService.getVehicleDetails(vehicleId, partitionKey);
            setVehicleDetails(vDetails);
          } catch (vErr) {
            console.log('Error fetching vehicle details in DriverViewDetailsScreen:', vErr);
          }
        }
      } catch (err) {
        console.log('Error fetching driver details in DriverViewDetailsScreen:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDetails();
  }, [driverId, partitionKey]);

  const formatDate = (dateValue?: string | null) => {
    if (!dateValue) return 'N/A';
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return dateValue;
      return d.toISOString().split('T')[0];
    } catch {
      return dateValue;
    }
  };

  const formatInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .trim()
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const displayName =
    (driverDetails?.firstName || driverDetails?.lastName)
      ? `${driverDetails?.firstName || ''} ${driverDetails?.lastName || ''}`.trim()
      : driverDetails?.driverName || routeDriverName;

  const phone = driverDetails?.mobileNumber || driverDetails?.phone;

  const plateNo =
    vehicleDetails?.plateNumber ||
    vehicleDetails?.registrationNumber ||
    vehicleDetails?.registrationNo ||
    driverDetails?.plateNumber ||
    'N/A';

  const vehicleModel =
    vehicleDetails?.vehicleModel ||
    'N/A';

  const vehicleMake =
    vehicleDetails?.vehicleMake ||
    vehicleDetails?.make ||
    driverDetails?.vehicleMake ||
    'N/A';

  const vehicleType =
    vehicleDetails?.vehicleType ||
    driverDetails?.associatedVehicleType ||
    'N/A';

  const rawDob =
    driverDetails?.dateOfBirth ||
    driverDetails?.dob ||
    driverDetails?.birthDate;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primaryText, fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Overview Card */}
          <View style={styles.profileSection}>
            <TouchableOpacity
              onPress={() => {
                if (driverDocuments?.profilePhoto) {
                  setFullScreenImageURI(driverDocuments.profilePhoto);
                }
              }}
              activeOpacity={driverDocuments?.profilePhoto ? 0.8 : 1}
            >
              {driverDocuments?.profilePhoto ? (
                <Image
                  source={{ uri: driverDocuments.profilePhoto }}
                  style={styles.avatarPhoto}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{formatInitials(displayName)}</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.driverName}>{displayName}</Text>

            <View style={[styles.statusBadge, { backgroundColor: colors.success + '1A' }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>
                {driverDetails?.verificationStatus || driverStatus}
              </Text>
            </View>

            {phone && (
              <View style={styles.contactRow}>
                <Text style={styles.contactPhone}>{phone}</Text>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => {
                    const cleanPhone = phone.replace(/[^\d+]/g, '');
                    Linking.openURL(`tel:${cleanPhone}`).catch(err =>
                      console.log('Error opening dialer', err),
                    );
                  }}
                >
                  <Text style={{ fontSize: 16 }}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => {
                    const cleanPhone = phone.replace(/[^\d+]/g, '');
                    openMessageOptions(cleanPhone);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>💬</Text>
                </TouchableOpacity>
              </View>
            )}

            {driverDetails?.overAllRating !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 }}>
                <Text style={{ fontSize: 16 }}>⭐</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>
                  {Number(driverDetails.overAllRating).toFixed(1)}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  ({driverDetails.totalRatingsReceived || 0} {driverDetails.totalRatingsReceived === 1 ? 'rating' : 'ratings'})
                </Text>
              </View>
            )}
          </View>

          {/* Section 1: Personal Information */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First Name</Text>
              <Text style={styles.infoValue}>{driverDetails?.firstName || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Name</Text>
              <Text style={styles.infoValue}>{driverDetails?.lastName || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{formatDate(rawDob)}</Text>
            </View>

            {/* <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{driverDetails?.gender || 'N/A'}</Text>
            </View> */}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{phone || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>
                {driverDetails?.email || driverDetails?.emailAddress || 'N/A'}
              </Text>
            </View>

            {/* <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {driverDetails?.address || driverDetails?.residentialAddress || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>{driverDetails?.city || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>State</Text>
              <Text style={styles.infoValue}>{driverDetails?.state || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pincode</Text>
              <Text style={styles.infoValue}>
                {driverDetails?.pincode || driverDetails?.postalCode || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRowLast}>
              <Text style={styles.infoLabel}>Blood Group</Text>
              <Text style={styles.infoValue}>{driverDetails?.bloodGroup || 'N/A'}</Text>
            </View> */}
          </View>

          {/* Section 2: Driving License Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Driving License Details</Text>

            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => {
                if (driverDocuments?.driverLicense) {
                  setFullScreenImageURI(driverDocuments.driverLicense);
                }
              }}
              activeOpacity={driverDocuments?.driverLicense ? 0.8 : 1}
            >
              {driverDocuments?.driverLicense ? (
                <Image
                  source={{ uri: driverDocuments.driverLicense }}
                  style={styles.docImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholderEmoji}>🪪</Text>
              )}
            </TouchableOpacity>
            {driverDocuments?.driverLicense && (
              <Text style={styles.imageHintText}>Tap image to view full screen</Text>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License Number</Text>
              <Text style={styles.infoValue}>{driverDetails?.licenseNumber || 'N/A'}</Text>
            </View>

            <View style={styles.infoRowLast}>
              <Text style={styles.infoLabel}>Expiry Date</Text>
              <Text style={styles.infoValue}>{formatDate(driverDetails?.licenseExpiryDate)}</Text>
            </View>
          </View>

          {/* Section 3: Vehicle Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>

            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => {
                if (driverDocuments?.vehicleRegistration) {
                  setFullScreenImageURI(driverDocuments.vehicleRegistration);
                }
              }}
              activeOpacity={driverDocuments?.vehicleRegistration ? 0.8 : 1}
            >
              {driverDocuments?.vehicleRegistration ? (
                <Image
                  source={{ uri: driverDocuments.vehicleRegistration }}
                  style={styles.docImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholderEmoji}>🚗</Text>
              )}
            </TouchableOpacity>
            {driverDocuments?.vehicleRegistration && (
              <Text style={styles.imageHintText}>Tap image to view full screen</Text>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plate Number</Text>
              <Text style={styles.infoValue}>{plateNo}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Make</Text>
              <Text style={styles.infoValue}>{vehicleMake}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Model</Text>
              <Text style={styles.infoValue}>{vehicleModel}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle Type</Text>
              <Text style={styles.infoValue}>{vehicleType}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Insurance Expiry</Text>
              <Text style={styles.infoValue}>
                {formatDate(driverDetails?.insuranceValidTillDate)}
              </Text>
            </View>

            <View style={styles.infoRowLast}>
              <Text style={styles.infoLabel}>Permit Expiry</Text>
              <Text style={styles.infoValue}>
                {formatDate(driverDetails?.vehiclePermitValidTillDate)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Full-screen image viewer */}
      <Modal
        visible={!!fullScreenImageURI}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImageURI(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.92)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 }}
            onPress={() => setFullScreenImageURI(null)}
          >
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>
          {fullScreenImageURI && (
            <Image
              source={{ uri: fullScreenImageURI }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
