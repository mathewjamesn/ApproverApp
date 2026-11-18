import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, StatusBar } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import DriverPhoneMenu from '../../../components/common/DriverPhoneMenu';
import {
  TRIP_KIND_META,
  buildTrackDriverParams,
  formatTimeDisplay,
  getCancelledDate,
  getEffectiveFare,
  getEffectiveTripStatus,
  getRentalPackage,
  getReservationTime,
  getStatusColor as resolveStatusColor,
  getTripKind,
  isAcceptedTrip,
  isCancelledTrip,
} from '../../../utils/tripHelpers';

const CopyableId = ({ value, textStyle }: { value?: string, textStyle: any }) => {
  if (!value) return <Text style={textStyle}>--</Text>;
  const shortId = value.length > 12 ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` : value;

  const handleCopy = () => {
    Clipboard.setString(value);
    Alert.alert('Copied', 'ID copied to clipboard');
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={textStyle} selectable={true}>{shortId}</Text>
      <TouchableOpacity onPress={handleCopy} style={{ marginLeft: 6, padding: 2 }}>
        <Text style={{ fontSize: 16, includeFontPadding: false }}>📋</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function TripDetailsScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { tripData } = route.params || {};

  if (!tripData) return <View style={styles.container}><Text>No data</Text></View>;

  const effectiveStatus = getEffectiveTripStatus(tripData);
  const isCancelled = isCancelledTrip(effectiveStatus);
  const isAccepted = isAcceptedTrip(effectiveStatus) || isAcceptedTrip(tripData?.tripStatus);
  const cancelledDate = getCancelledDate(tripData);
  const fareAmount = getEffectiveFare(tripData);
  const pickupDistance = tripData.totalPickupDistance ?? tripData.pickupDistance ?? tripData.driverToPassengerDistance;

  const handleTrackDriverLocation = () => {
    const rawPhone = tripData.driverMobileNumber;
    if (!rawPhone || rawPhone === '--' || rawPhone.trim() === '') {
      Alert.alert('Location Unavailable', 'Driver phone number is not available to track location.');
      return;
    }

    (navigation.navigate as any)('DriverLocation', buildTrackDriverParams(tripData));
  };

  const formatStatusDisplay = (status?: string) => {
    return status || 'Unknown';
  };

  const statusColor = resolveStatusColor(colors, effectiveStatus);
  const kind = getTripKind(tripData);
  const kindMeta = TRIP_KIND_META[kind];
  const rentalPackage = getRentalPackage(tripData);
  const reservationTime = getReservationTime(tripData);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.header, { paddingTop: (insets.top || 0) + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Trip Record Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Trip ID</Text>
            <CopyableId value={tripData.id} textStyle={styles.value} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Request ID</Text>
            <CopyableId value={tripData.rideRequestIdentifier} textStyle={styles.value} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Created On</Text>
            <Text style={styles.value}>{formatTimeDisplay(tripData.createdOn)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Current Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A', borderColor: statusColor + '33', borderWidth: 1 }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{formatStatusDisplay(effectiveStatus)}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trip Type</Text>
            <View style={[styles.statusBadge, { backgroundColor: kindMeta.color + '1A', borderColor: kindMeta.color + '33', borderWidth: 1 }]}>
              <Text style={[styles.statusText, { color: kindMeta.color }]}>{kindMeta.icon} {kind}</Text>
            </View>
          </View>
          {kind === 'Rental' && rentalPackage ? (
            <View style={styles.row}>
              <Text style={styles.label}>Rental Package</Text>
              <Text style={styles.value}>{rentalPackage}</Text>
            </View>
          ) : null}
          {kind === 'Reservation' && reservationTime ? (
            <View style={styles.row}>
              <Text style={styles.label}>Reserved Pickup</Text>
              <Text style={styles.value}>{formatTimeDisplay(reservationTime)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route & Timeline</Text>
          <View style={styles.routeItem}>
            <Text style={{ fontSize: 16, includeFontPadding: false }}>🔵</Text>
            <Text style={styles.locText}>{tripData.fromLocation}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
            <Text style={{ fontSize: 16, includeFontPadding: false }}>🔴</Text>
            <Text style={styles.locText}>{tripData.toLocation}</Text>
          </View>
          <View style={{ marginTop: 16 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Inital Distance</Text>
              <Text style={styles.value}>{tripData.distanceInKilometers || 0} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Final Distance (Trip)</Text>
              <Text style={styles.value}>{tripData.finalDistanceInKilometers || 0} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Pick-Up Distance</Text>
              <Text style={[styles.value, { color: colors.primary, fontWeight: 'bold' }]}>
                {pickupDistance !== undefined && pickupDistance !== null ? `${pickupDistance} km` : '--'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>OTP</Text>
              <Text style={styles.value}>{tripData.otp || '--'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Accepted</Text>
              <Text style={styles.value}>{tripData.tripAcceptDate ? formatTimeDisplay(tripData.tripAcceptDate) : formatTimeDisplay(tripData.createdOn)}</Text>
            </View>

            {isCancelled ? (
              <View style={styles.row}>
                <Text style={styles.label}>Cancelled Time</Text>
                <Text style={[styles.value, { color: colors.danger, fontWeight: 'bold' }]}>
                  {cancelledDate ? formatTimeDisplay(cancelledDate) : 'Cancelled'}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Started</Text>
                  <Text style={styles.value}>{tripData.tripStartDate ? formatTimeDisplay(tripData.tripStartDate) : '--'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Ended</Text>
                  <Text style={styles.value}>{tripData.tripEndDate ? formatTimeDisplay(tripData.tripEndDate) : '--'}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financials</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Initial Fare Estimate</Text>
            <Text style={styles.value}>₹{(tripData.initialFareAmount || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pick-Up Charges</Text>
            <Text style={styles.value}>₹{(tripData.pickupCharges || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Final / Effective Fare</Text>
            <Text style={[styles.value, { color: colors.accent, fontSize: 16, fontWeight: 'bold' }]}>₹{fareAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Mode</Text>
            <Text style={styles.value}>{tripData.passengerOptedPaymentMode || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Driver Earnings</Text>
            <Text style={styles.value}>₹{(tripData.driverEarningsForTrip || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Platform Charges</Text>
            <Text style={styles.value}>₹{(tripData.totalPlatformCharges || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>GST Collected</Text>
            <Text style={styles.value}>₹{(tripData.gstCollectedForTrip || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{tripData.driverName || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <DriverPhoneMenu
                pill
                phone={tripData.driverMobileNumber}
                driverName={tripData.driverName}
                textStyle={styles.value}
              />
              {tripData.driverMobileNumber && tripData.driverMobileNumber !== '--' && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = tripData.driverMobileNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`tel:${cleanPhone}`).catch(err => console.log('Error opening dialer', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = tripData.driverMobileNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`sms:${cleanPhone}`).catch(err => console.log('Error opening SMS', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>💬</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vehicle Type</Text>
            <Text style={styles.value}>{tripData.vehicleType || '--'} ({tripData.vehicleCategory || '--'})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Driver ID</Text>
            <CopyableId value={tripData.driverIdentifier} textStyle={styles.value} />
          </View>
          {isAccepted && (
            <TouchableOpacity
              onPress={handleTrackDriverLocation}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: colors.tabActiveBg,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                alignSelf: 'flex-start',
                marginTop: 4,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 16 }}>📍</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>Track Driver Location</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passenger Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{tripData.passengerName || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.value}>{tripData.passengerMobileNumber || '--'}</Text>
              {tripData.passengerMobileNumber && tripData.passengerMobileNumber !== '--' && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = tripData.passengerMobileNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`tel:${cleanPhone}`).catch(err => console.log('Error opening dialer', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = tripData.passengerMobileNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`sms:${cleanPhone}`).catch(err => console.log('Error opening SMS', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>💬</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Passenger ID</Text>
            <CopyableId value={tripData.passengerIdentifier} textStyle={styles.value} />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: (insets.bottom || 0) + 8,
          gap: 10,
          backgroundColor: colors.background,
        }}
      >
        {isAccepted && (
          <TouchableOpacity
            style={{
              backgroundColor: colors.success,
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              shadowColor: colors.cardShadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 3,
            }}
            onPress={handleTrackDriverLocation}
          >
            <Text style={{ fontSize: 20 }}>📍</Text>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Track Driver Location</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
          onPress={() => {
            const fromLat = tripData.fromAddress?.latitude;
            const fromLng = tripData.fromAddress?.longitude;
            const toLat = tripData.toAddress?.latitude;
            const toLng = tripData.toAddress?.longitude;
            const origin = (fromLat && fromLng) ? `${fromLat},${fromLng}` : encodeURIComponent(tripData.fromLocation || '');
            const dest = (toLat && toLng) ? `${toLat},${toLng}` : encodeURIComponent(tripData.toLocation || '');
            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
            Linking.openURL(url);
          }}
        >
          <Text style={{ fontSize: 20 }}>🗺️</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Route Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
