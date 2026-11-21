import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import ScreenHeader from '../../../components/common/ScreenHeader';
import { placeName, reservationService, ReservationView } from '../../../services/api/reservationService';
import { STATUS_META, formatRelative, formatWhen, toneColor } from '../../../utils/reservationHelpers';

type Filter = 'attention' | 'upcoming' | 'all' | 'ended';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'attention', label: 'Needs attention' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'all', label: 'All' },
  { key: 'ended', label: 'Ended' },
];

const ENDED = new Set(['ConvertedToTrip', 'Failed', 'CancelledByRider']);

/**
 * Reservations dashboard: everything from a day ago to a week ahead for the approver's region, with the
 * ones that have no driver inside an hour of pickup flagged in red and listed first.
 */
export default function ReservationsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [items, setItems] = useState<ReservationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await reservationService.getReservations(7);
      setItems(res.reservations);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const attention = items.filter(v => v.needsAttention);
  const upcoming = items.filter(v => !ENDED.has(v.reservation.status) && v.minutesToPickup > -15);
  const ended = items.filter(v => ENDED.has(v.reservation.status));
  const withDriver = upcoming.filter(v => v.reservation.assignedDriver).length;
  // Start on what needs doing.
  const active: Filter = filter ?? (attention.length ? 'attention' : 'upcoming');
  const shown = useMemo(
    () => ({ attention, upcoming, all: items, ended })[active],
    [active, attention, upcoming, items, ended],
  );

  const Header = (
    <View>
      <View style={styles.kpis}>
        <TouchableOpacity style={[styles.kpi, { backgroundColor: attention.length ? colors.danger : colors.card }]} onPress={() => setFilter('attention')}>
          <Text style={[styles.kpiNumber, { color: attention.length ? '#FFFFFF' : colors.textPrimary }]}>{attention.length}</Text>
          <Text style={[styles.kpiLabel, { color: attention.length ? '#FFFFFF' : colors.textSecondary }]}>No driver{'\n'}within 1 h</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.kpi, { backgroundColor: colors.card }]} onPress={() => setFilter('upcoming')}>
          <Text style={[styles.kpiNumber, { color: colors.textPrimary }]}>{upcoming.length}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Upcoming{'\n'}{withDriver} with driver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.kpi, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('ReservationCancellations')}>
          <Text style={[styles.kpiNumber, { color: colors.textPrimary }]}>⟶</Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Cancellations{'\n'}& no-shows</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filters}>
        {FILTERS.map(f => {
          const on = f.key === active;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.pill, { backgroundColor: on ? colors.primary : colors.card, borderColor: on ? colors.primary : colors.border }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: on ? colors.primaryText : colors.textSecondary }}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Reservations" subtitle="A day ago to a week ahead" onBack={() => navigation.goBack()} onRefresh={load} refreshing={loading} />
      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={v => v.reservation.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} colors={[colors.primary]} tintColor={colors.primary} />}
          ListHeaderComponent={Header}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 30 }}>
              <Text style={{ fontSize: 38 }}>{failed ? '🔌' : '🎉'}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 10, textAlign: 'center' }}>
                {failed ? 'Couldn’t load reservations. Pull down to try again.' : active === 'attention' ? 'Every reservation within the hour has a driver.' : 'No reservations here.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const r = item.reservation;
            const meta = STATUS_META[r.status] ?? { label: r.status, tone: 'muted' as const };
            const tone = toneColor(colors, meta.tone);
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('ReservationDetails', { reservationId: r.id })}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, shadowColor: colors.cardShadow },
                  item.needsAttention ? { borderLeftWidth: 4, borderLeftColor: colors.danger } : null,
                ]}
              >
                <View style={styles.row}>
                  <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>{formatWhen(r.pickupAtUtc)}</Text>
                  <View style={[styles.badge, { backgroundColor: tone + '1F' }]}>
                    <Text style={{ color: tone, fontSize: 12, fontWeight: '700' }}>{meta.label}</Text>
                  </View>
                </View>
                <Text style={{ color: item.needsAttention ? colors.danger : colors.textSecondary, fontSize: 12, marginTop: 2, fontWeight: item.needsAttention ? '700' : '400' }}>
                  {item.needsAttention ? `No driver · pickup ${formatRelative(item.minutesToPickup)}` : `Pickup ${formatRelative(item.minutesToPickup)}`}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 13, marginTop: 10 }} numberOfLines={1}>🔵  {placeName(r.rideRequest?.passengerFromAddress) || '--'}</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 13, marginTop: 6 }} numberOfLines={1}>🔴  {placeName(r.rideRequest?.passengerToAddress) || '--'}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 10 }}>
                  {r.vehicleCategory}
                  {r.assignedDriver ? `  ·  ${r.assignedDriver.name || r.assignedDriver.driverId}` : ''}
                  {(r.releases?.length ?? 0) > 0 ? `  ·  ${r.releases!.length} driver change${r.releases!.length > 1 ? 's' : ''}` : ''}
                  {r.incentiveAmount ? `  ·  ₹${r.incentiveAmount} bonus` : ''}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kpis: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  kpi: { flex: 1, borderRadius: 18, padding: 12, minHeight: 86, justifyContent: 'space-between' },
  kpiNumber: { fontSize: 28, fontWeight: '800' },
  kpiLabel: { fontSize: 11.5, fontWeight: '600' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  card: { borderRadius: 20, padding: 16, marginBottom: 12, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
});

