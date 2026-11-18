import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import DriverPhoneMenu from '../DriverPhoneMenu';
import {
  TRIP_KIND_META,
  buildTrackDriverParams,
  formatTimeDisplay,
  getCancelledDate,
  getEffectiveFare,
  getEffectiveTripStatus,
  getRentalPackage,
  getReservationTime,
  getStatusColor,
  getTripKind,
  hasUsablePhone,
  isAcceptedTrip,
  isCancelledTrip,
  openRouteInGoogleMaps,
} from '../../../utils/tripHelpers';

interface Props {
  trip: any;
  /** Hide the driver row (used on a single driver's history screen) */
  hideDriver?: boolean;
  /** Highlight the trip the user came from */
  highlight?: boolean;
}

export default function TripCard({ trip, hideDriver, highlight }: Props) {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const effectiveStatus = getEffectiveTripStatus(trip);
  const statusColor = getStatusColor(colors, effectiveStatus);
  const isCancelled = isCancelledTrip(effectiveStatus);
  const isAccepted = isAcceptedTrip(effectiveStatus) || isAcceptedTrip(trip?.tripStatus);
  const cancelledDate = getCancelledDate(trip);
  const fare = getEffectiveFare(trip);
  const pickupDistance = trip.totalPickupDistance ?? trip.pickupDistance ?? trip.driverToPassengerDistance;
  const kind = getTripKind(trip);
  const kindMeta = TRIP_KIND_META[kind];
  const rentalPackage = getRentalPackage(trip);
  const reservationTime = getReservationTime(trip);

  const onTrack = () => {
    if (!hasUsablePhone(trip.driverMobileNumber)) return;
    navigation.navigate('DriverLocation', buildTrackDriverParams(trip));
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.cardShadow },
        highlight && { borderWidth: 2, borderColor: colors.accent },
      ]}
      onPress={() => navigation.navigate('TripDetails', { tripData: trip })}
    >
      <View style={styles.topRow}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: statusColor + '1F' }]}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.badgeText, { color: statusColor }]}>{effectiveStatus}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: kindMeta.color + '1F' }]}>
            <Text style={[styles.badgeText, { color: kindMeta.color }]}>
              {kindMeta.icon} {kind}
            </Text>
          </View>
        </View>
        <Text style={[styles.fare, { color: colors.textPrimary }]}>₹{fare.toFixed(2)}</Text>
      </View>

      {/* Route timeline */}
      <View style={styles.timeline}>
        <View style={styles.rail}>
          <View style={[styles.railDot, { borderColor: colors.info }]} />
          <View style={[styles.railLine, { backgroundColor: colors.border }]} />
          <View style={[styles.railDot, { backgroundColor: colors.danger, borderColor: colors.danger }]} />
        </View>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <Text style={[styles.loc, { color: colors.textPrimary }]} numberOfLines={1}>{trip.fromLocation}</Text>
          <Text style={[styles.loc, { color: colors.textPrimary, marginTop: 14 }]} numberOfLines={1}>{trip.toLocation}</Text>
        </View>
      </View>

      {kind === 'Rental' && rentalPackage ? (
        <View style={[styles.note, { backgroundColor: colors.tabActiveBg }]}>
          <Text style={[styles.noteText, { color: colors.textPrimary }]}>⏱️ Rental package: {rentalPackage}</Text>
        </View>
      ) : null}
      {kind === 'Reservation' && reservationTime ? (
        <View style={[styles.note, { backgroundColor: colors.tabActiveBg }]}>
          <Text style={[styles.noteText, { color: colors.textPrimary }]}>📅 Reserved pickup: {formatTimeDisplay(reservationTime)}</Text>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.primary }]}>
          🚕 Pick-up {pickupDistance !== undefined && pickupDistance !== null ? `${pickupDistance} km` : 'N/A'}
        </Text>
        <Text style={[styles.meta, { color: colors.primary }]}>
          Final {trip.finalDistanceInKilometers !== undefined && trip.finalDistanceInKilometers !== null ? `${trip.finalDistanceInKilometers} km` : 'N/A'}
        </Text>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          Accepted: {trip.tripAcceptDate ? formatTimeDisplay(trip.tripAcceptDate) : formatTimeDisplay(trip.createdOn)}
        </Text>
        {isCancelled ? (
          <Text style={[styles.date, { color: colors.danger, fontWeight: '600' }]}>
            Cancelled: {cancelledDate ? formatTimeDisplay(cancelledDate) : 'Cancelled'}
          </Text>
        ) : trip.tripStartDate ? (
          <Text style={[styles.date, { color: colors.info }]}>Started: {formatTimeDisplay(trip.tripStartDate)}</Text>
        ) : null}
      </View>

      {!hideDriver && (
        <View style={[styles.driverRow, { borderTopColor: colors.border }]}>
          <Text style={{ fontSize: 14 }}>🧑‍✈️</Text>
          <Text style={[styles.driverName, { color: colors.textSecondary }]} numberOfLines={1}>
            {trip.driverName || 'Driver'}
          </Text>
          <DriverPhoneMenu
            pill
            phone={trip.driverMobileNumber}
            driverName={trip.driverName}
            textStyle={{ fontSize: 12 }}
          />
        </View>
      )}

      <View style={styles.actions}>
        {isAccepted && hasUsablePhone(trip.driverMobileNumber) && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={onTrack} activeOpacity={0.8}>
            <Text style={styles.btnText}>📍  Track Driver</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: isAccepted ? colors.tabActiveBg : colors.primary }]}
          onPress={() => Linking.openURL(openRouteInGoogleMaps(trip))}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, isAccepted && { color: colors.accent }]}>🗺️  Route Info</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  fare: { fontSize: 18, fontWeight: '800' },
  timeline: { flexDirection: 'row', marginTop: 14, gap: 12 },
  rail: { alignItems: 'center', paddingTop: 4, width: 12 },
  railDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  railLine: { width: 2, flex: 1, marginVertical: 3, minHeight: 14 },
  loc: { fontSize: 13, fontWeight: '500' },
  note: { marginTop: 12, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  noteText: { fontSize: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  meta: { fontSize: 12, fontWeight: '600' },
  footer: { borderTopWidth: 1, marginTop: 12, paddingTop: 10, gap: 2 },
  date: { fontSize: 12 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  driverName: { fontSize: 12, flexShrink: 1 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
