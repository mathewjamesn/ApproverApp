import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import ScreenHeader from '../../../components/common/ScreenHeader';
import { placeName, reservationService, ReservationView } from '../../../services/api/reservationService';
import { ASSIGNABLE, STATUS_META, formatRelative, formatWhen, historyOf, toneColor } from '../../../utils/reservationHelpers';

/**
 * One reservation: trip, passenger, driver, and its history (driver changes, reminders, broadcast rounds,
 * cancels, no-show). Assign / reassign a driver while it's still open for one.
 */
export default function ReservationDetailsScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const reservationId: string = route.params?.reservationId;
  const [view, setView] = useState<ReservationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setView(await reservationService.getReservation(reservationId));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  // Fresh after coming back from Assign driver.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const r = view?.reservation;
  const meta = r ? STATUS_META[r.status] ?? { label: r.status, tone: 'muted' as const } : null;
  const card = [styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }];

  const Row = ({ label, value, onPress }: { label: string; value?: string | null; onPress?: () => void }) => (
    <View style={styles.row}>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</Text>
      <Text onPress={onPress} style={{ color: onPress ? colors.info : colors.textPrimary, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>
        {value || '--'}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Reservation" subtitle={reservationId} onBack={() => navigation.goBack()} onRefresh={load} refreshing={loading} />
      {loading && !r ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : !r || !meta ? (
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          {failed ? 'Couldn’t load this reservation.' : 'Reservation not found.'}
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}>
          {view!.needsAttention ? (
            <View style={[styles.alert, { backgroundColor: colors.danger }]}>
              <Text style={styles.alertTitle}>No driver · pickup {formatRelative(view!.minutesToPickup)}</Text>
              <Text style={styles.alertText}>Assign a driver now, or it fails 10 minutes after pickup.</Text>
            </View>
          ) : null}

          <View style={card}>
            <View style={styles.row}>
              <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '800' }}>{formatWhen(r.pickupAtUtc)}</Text>
              <View style={[styles.badge, { backgroundColor: toneColor(colors, meta.tone) + '1F' }]}>
                <Text style={{ color: toneColor(colors, meta.tone), fontSize: 12, fontWeight: '700' }}>{meta.label}</Text>
              </View>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>Pickup {formatRelative(view!.minutesToPickup)}</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 13 }}>🔵  {placeName(r.rideRequest?.passengerFromAddress) || '--'}</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 13, marginTop: 6, marginBottom: 6 }}>🔴  {placeName(r.rideRequest?.passengerToAddress) || '--'}</Text>
            <Row label="Vehicle" value={r.vehicleCategory} />
            <Row label="Ride fare" value={r.fareEstimate ? `₹${Math.round(r.fareEstimate)}` : null} />
            <Row label="Total (with charge)" value={r.totalEstimate ? `₹${Math.round(r.totalEstimate)}` : null} />
            {r.incentiveAmount ? <Row label="Bonus (late cancel)" value={`₹${r.incentiveAmount}`} /> : null}
            <Row label="Navigate from" value={formatWhen(r.confirmAtUtc)} />
          </View>

          <View style={card}>
            <Text style={[styles.section, { color: colors.textPrimary }]}>Passenger</Text>
            <Row label="Id" value={r.passengerId} />
            <Row
              label="Mobile"
              value={r.passengerMobileNumber}
              onPress={r.passengerMobileNumber ? () => Linking.openURL(`tel:${r.passengerMobileNumber}`) : undefined}
            />
          </View>

          <View style={card}>
            <Text style={[styles.section, { color: colors.textPrimary }]}>Driver</Text>
            {r.assignedDriver ? (
              <>
                <Row label="Name" value={r.assignedDriver.name || r.assignedDriver.driverId} />
                <Row
                  label="Mobile"
                  value={r.assignedDriver.mobileNumber}
                  onPress={r.assignedDriver.mobileNumber ? () => Linking.openURL(`tel:${r.assignedDriver!.mobileNumber}`) : undefined}
                />
                <Row label="Vehicle" value={[r.assignedDriver.vehicleMake, r.assignedDriver.vehicleModel, r.assignedDriver.vehicleNumber].filter(Boolean).join(' ')} />
              </>
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No driver holds this reservation.</Text>
            )}
            {ASSIGNABLE.has(r.status) ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('AssignReservationDriver', { reservationId: r.id, hasDriver: !!r.assignedDriver })}
              >
                <Text style={{ color: colors.primaryText, fontWeight: '700' }}>{r.assignedDriver ? 'Reassign driver' : 'Assign a driver'}</Text>
              </TouchableOpacity>
            ) : r.status === 'AwaitingConfirmation' ? (
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 10 }}>The driver is starting this trip now.</Text>
            ) : null}
          </View>

          <View style={card}>
            <Text style={[styles.section, { color: colors.textPrimary }]}>History</Text>
            {historyOf(r).map((h, i) => (
              <View key={`${h.at}-${i}`} style={styles.history}>
                <View style={[styles.dot, { backgroundColor: toneColor(colors, h.tone) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 13 }}>{h.text}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{formatWhen(h.at)}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  section: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  alert: { borderRadius: 18, padding: 14 },
  alertTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  alertText: { color: '#FFFFFF', fontSize: 13, marginTop: 2 },
  button: { marginTop: 12, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  history: { flexDirection: 'row', gap: 10, paddingVertical: 7 },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
});
