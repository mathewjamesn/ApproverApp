import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import ScreenHeader from '../../../components/common/ScreenHeader';
import { DriverCancelStats, PassengerCancellation, reservationService } from '../../../services/api/reservationService';
import { beforePickup, formatWhen } from '../../../utils/reservationHelpers';

type Tab = 'drivers' | 'passengers';

const thisMonth = (s: DriverCancelStats) => {
  const now = new Date();
  return (s.recentCancelsUtc ?? []).filter(at => {
    const d = new Date(at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
};

/**
 * Reservation cancellations. Drivers: cancel counts (late ones, and ones that went to someone else
 * because the driver didn't start), most first. Passengers: cancels and no-shows from the last 30 days,
 * with how long before pickup they happened.
 */
export default function ReservationCancellationsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('drivers');
  const [drivers, setDrivers] = useState<DriverCancelStats[]>([]);
  const [passengers, setPassengers] = useState<PassengerCancellation[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await reservationService.getCancellations(30);
      setDrivers(res.drivers);
      setPassengers(res.passengers);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const card = [styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }];

  const Tabs = (
    <View style={styles.tabs}>
      {(['drivers', 'passengers'] as Tab[]).map(k => {
        const on = k === tab;
        return (
          <TouchableOpacity
            key={k}
            onPress={() => setTab(k)}
            style={[styles.pill, { backgroundColor: on ? colors.primary : colors.card, borderColor: on ? colors.primary : colors.border }]}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: on ? colors.primaryText : colors.textSecondary }}>
              {k === 'drivers' ? `Drivers (${drivers.length})` : `Passengers (${passengers.length})`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const empty = (
    <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 30 }}>
      {failed ? 'Couldn’t load cancellations. Pull down to try again.' : tab === 'drivers' ? 'No driver has cancelled a reservation.' : 'No passenger cancels or no-shows in the last 30 days.'}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Cancellations" subtitle="Reservations · drivers and passengers" onBack={() => navigation.goBack()} onRefresh={load} refreshing={loading} />
      {loading && !drivers.length && !passengers.length ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : tab === 'drivers' ? (
        <FlatList
          data={drivers}
          keyExtractor={d => d.driverId}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} colors={[colors.primary]} tintColor={colors.primary} />}
          ListHeaderComponent={Tabs}
          ListEmptyComponent={empty}
          renderItem={({ item }) => (
            <View style={card}>
              <View style={styles.row}>
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700', flex: 1 }} numberOfLines={1}>{item.driverId}</Text>
                <Text style={{ color: colors.danger, fontSize: 20, fontWeight: '800' }}>{item.cancelCount}</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                {thisMonth(item)} this month · {item.lateCancelCount} late · {item.notStartedCount} not started in time
              </Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={passengers}
          keyExtractor={(p, i) => `${p.reservationId}-${p.kind}-${i}`}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} colors={[colors.primary]} tintColor={colors.primary} />}
          ListHeaderComponent={Tabs}
          ListEmptyComponent={empty}
          renderItem={({ item }) => (
            <TouchableOpacity style={card} onPress={() => navigation.navigate('ReservationDetails', { reservationId: item.reservationId })}>
              <View style={styles.row}>
                <View style={[styles.badge, { backgroundColor: (item.kind === 'NoShow' ? colors.danger : colors.textSecondary) + '1F' }]}>
                  <Text style={{ color: item.kind === 'NoShow' ? colors.danger : colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                    {item.kind === 'NoShow' ? 'No-show' : 'Cancelled'}
                  </Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{beforePickup(item.minutesBeforePickup)}</Text>
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: 13, marginTop: 8 }}>
                {item.passengerMobileNumber || item.passengerId} · pickup {formatWhen(item.pickupAtUtc)}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                {formatWhen(item.atUtc)}
                {item.reason ? ` · "${item.reason}"` : ''}
                {item.cancellationFee ? ` · fee ₹${item.cancellationFee}` : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  card: { borderRadius: 18, padding: 16, marginBottom: 10, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
});
